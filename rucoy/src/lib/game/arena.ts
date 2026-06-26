// ─── Coliseu Eterno — Arena de Ondas ──────────────────────────────────────
// Mapa fechado expandido (100×72) com 4 portões dinâmicos, decoração rica,
// 5 temas elementais que se desbloqueiam a cada 100 ondas, mini-bosses,
// boss-rush a cada 25 ondas, partículas dos portões "abrindo" e recompensas
// crescentes até a onda 1000.

import type { GameMap, GameState, Monster, MonsterType, EliteTier, Tile, TileType, Particle, Item } from './types'
import { createMonster, ITEMS } from './data'

export const ARENA_W = 100
export const ARENA_H = 72
export const ARENA_MAX_WAVES = 1000

// 4 portões (norte, sul, oeste, leste) — em coordenadas de tile.
export const ARENA_GATES = [
  { id: 'north', x: 50, y: 1,           dirX: 0,  dirY: 1,  cx: 50, cy: 4 },
  { id: 'south', x: 50, y: ARENA_H - 2, dirX: 0,  dirY: -1, cx: 50, cy: ARENA_H - 5 },
  { id: 'west',  x: 1,  y: 36,          dirX: 1,  dirY: 0,  cx: 4,  cy: 36 },
  { id: 'east',  x: ARENA_W - 2, y: 36, dirX: -1, dirY: 0,  cx: ARENA_W - 5, cy: 36 },
] as const

export interface ArenaState {
  wave: number              // onda atual (1..1000)
  status: 'ready' | 'intermission' | 'active' | 'complete'
  spawnQueue: number        // monstros que ainda faltam spawnar nesta onda
  spawnedThisWave: number   // total alvo desta onda
  monstersAlive: number     // monstros vivos no mapa (atualizado a cada tick)
  spawnTimer: number        // ticks até próximo spawn
  intermissionTimer: number // ticks até iniciar próxima onda
  gatePulse: number[]       // intensidade luminosa atual de cada portão (0..1)
  gateOpening: number[]     // timer de animação de abertura (ticks restantes)
  bestWave: number          // melhor onda alcançada nesta sessão
  totalKills: number        // monstros mortos na sessão da arena
  totalGoldEarned: number
  totalXpEarned: number
  countdownAnnounced: number // último número de countdown anunciado (3..2..1..0)
}

export function createArenaState(): ArenaState {
  return {
    wave: 0,
    status: 'ready',
    spawnQueue: 0,
    spawnedThisWave: 0,
    monstersAlive: 0,
    spawnTimer: 0,
    intermissionTimer: 300, // 5s para começar a primeira onda
    gatePulse: [0, 0, 0, 0],
    gateOpening: [0, 0, 0, 0],
    bestWave: 0,
    totalKills: 0,
    totalGoldEarned: 0,
    totalXpEarned: 0,
    countdownAnnounced: -1,
  }
}

function mk(type: TileType): Tile {
  // Mantém em sync com NON_WALKABLE em data.ts
  const nonWalk: TileType[] = [
    'dungeon_wall', 'ruin_pillar', 'ancient_brazier', 'rune_stone',
    'sarcophagus', 'crystal_wall', 'lamp_post', 'fountain', 'fence',
    'lava', 'ice', 'volcanic_rock', 'crystal', 'tower_wall',
  ]
  return { type, walkable: !nonWalk.includes(type), transparent: true }
}

// Tema da arena varia conforme a onda atual (a cada 100 ondas muda).
export type ArenaTheme = 'stone' | 'fire' | 'ice' | 'void' | 'crystal'
export function themeForWave(wave: number): ArenaTheme {
  if (wave <= 100) return 'stone'
  if (wave <= 250) return 'fire'
  if (wave <= 500) return 'ice'
  if (wave <= 750) return 'void'
  return 'crystal'
}
const THEME_FLOOR: Record<ArenaTheme, TileType> = {
  stone: 'ancient_tile', fire: 'volcanic_rock', ice: 'snow', void: 'dungeon_brick', crystal: 'crystal_floor' as TileType,
}
const THEME_ACCENT: Record<ArenaTheme, TileType> = {
  stone: 'broken_tile', fire: 'lava', ice: 'ice', void: 'void' as TileType, crystal: 'crystal',
}
const THEME_GATE_COLOR: Record<ArenaTheme, string[]> = {
  stone:   ['#ffaa00', '#ff7733', '#ffee99'],
  fire:    ['#ff3300', '#ffaa00', '#ffee44'],
  ice:     ['#88ddff', '#33aaff', '#ffffff'],
  void:    ['#aa33ff', '#5500aa', '#ff66ff'],
  crystal: ['#33ffcc', '#88ffff', '#aaffee'],
}

export function generateArenaMap(): GameMap {
  // O mapa é gerado neutro (tema "stone"); efeitos elementais por wave são
  // sobrepostos como partículas em tempo real para evitar trocar tiles a cada onda.
  const W = ARENA_W, H = ARENA_H
  const tiles: Tile[][] = []
  for (let y = 0; y < H; y++) {
    tiles[y] = []
    for (let x = 0; x < W; x++) {
      // Padrão xadrez 2x2 para visual de coliseu antigo
      const checker = ((x >> 1) + (y >> 1)) % 2 === 0
      tiles[y][x] = mk(checker ? 'ancient_tile' : 'broken_tile')
    }
  }

  // ─── Paredes externas grossas (2 tiles) ────────────────────────────────
  for (let x = 0; x < W; x++) {
    tiles[0][x] = mk('dungeon_wall')
    tiles[1][x] = mk('dungeon_wall')
    tiles[H - 1][x] = mk('dungeon_wall')
    tiles[H - 2][x] = mk('dungeon_wall')
  }
  for (let y = 0; y < H; y++) {
    tiles[y][0] = mk('dungeon_wall')
    tiles[y][1] = mk('dungeon_wall')
    tiles[y][W - 1] = mk('dungeon_wall')
    tiles[y][W - 2] = mk('dungeon_wall')
  }

  // ─── 4 portões (aberturas de 7 tiles) ──────────────────────────────────
  const GATE_HALF = 3
  for (let dx = -GATE_HALF; dx <= GATE_HALF; dx++) {
    tiles[0][50 + dx] = mk('cobblestone')
    tiles[1][50 + dx] = mk('cobblestone')
    tiles[H - 1][50 + dx] = mk('cobblestone')
    tiles[H - 2][50 + dx] = mk('cobblestone')
  }
  for (let dy = -GATE_HALF; dy <= GATE_HALF; dy++) {
    tiles[36 + dy][0] = mk('cobblestone')
    tiles[36 + dy][1] = mk('cobblestone')
    tiles[36 + dy][W - 1] = mk('cobblestone')
    tiles[36 + dy][W - 2] = mk('cobblestone')
  }

  // Braseiros monumentais ladeando cada portão
  const flank: Array<[number, number]> = [
    [50 - 4, 2], [50 + 4, 2], [50 - 4, 3], [50 + 4, 3],
    [50 - 4, H - 3], [50 + 4, H - 3], [50 - 4, H - 4], [50 + 4, H - 4],
    [2, 36 - 4], [2, 36 + 4], [3, 36 - 4], [3, 36 + 4],
    [W - 3, 36 - 4], [W - 3, 36 + 4], [W - 4, 36 - 4], [W - 4, 36 + 4],
  ]
  for (const [x, y] of flank) tiles[y][x] = mk('ancient_brazier')

  // ─── Anel decorativo de pilares (formando o coliseu) ───────────────────
  const pillarPositions: Array<[number, number]> = []
  const ringRX = W / 2 - 8
  const ringRY = H / 2 - 7
  const cx = W / 2, cy = H / 2
  for (let a = 0; a < 32; a++) {
    const t = (a / 32) * Math.PI * 2
    const px = Math.round(cx + Math.cos(t) * ringRX)
    const py = Math.round(cy + Math.sin(t) * ringRY)
    if (px > 4 && px < W - 5 && py > 4 && py < H - 5) pillarPositions.push([px, py])
  }
  for (const [px, py] of pillarPositions) tiles[py][px] = mk('ruin_pillar')

  // ─── Segundo anel exterior de braseiros pequenos ───────────────────────
  for (let a = 0; a < 24; a++) {
    const t = (a / 24) * Math.PI * 2 + Math.PI / 24
    const px = Math.round(cx + Math.cos(t) * (ringRX + 2))
    const py = Math.round(cy + Math.sin(t) * (ringRY + 2))
    if (px > 3 && px < W - 4 && py > 3 && py < H - 4 && tiles[py][px].type !== 'ruin_pillar') {
      tiles[py][px] = mk('ancient_brazier')
    }
  }

  // ─── Cantos decorados com sarcófagos, cristais e fogos sombrios ────────
  const corners: Array<[number, number]> = [
    [6, 6], [W - 7, 6], [6, H - 7], [W - 7, H - 7],
  ]
  for (const [cxn, cyn] of corners) {
    for (let dy = -3; dy <= 3; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        const px = cxn + dx, py = cyn + dy
        if (px < 3 || px >= W - 3 || py < 3 || py >= H - 3) continue
        const r = Math.random()
        if (Math.abs(dx) === 3 && Math.abs(dy) === 3) tiles[py][px] = mk('ancient_brazier')
        else if (r < 0.18) tiles[py][px] = mk('sarcophagus')
        else if (r < 0.32) tiles[py][px] = mk('rune_stone')
        else if (r < 0.42) tiles[py][px] = mk('crystal')
        else if (r < 0.5) tiles[py][px] = mk('cobblestone')
      }
    }
  }

  // ─── Círculo rúnico central + fonte de regeneração + portal de saída ───
  // Anel exterior de runas
  for (let a = 0; a < 24; a++) {
    const t = (a / 24) * Math.PI * 2
    const px = Math.round(cx + Math.cos(t) * 8)
    const py = Math.round(cy + Math.sin(t) * 6)
    tiles[py][px] = mk('rune_stone')
  }
  // Plataforma central de ancient_tile (sobrescreve qualquer pilar)
  for (let dy = -4; dy <= 4; dy++) {
    for (let dx = -5; dx <= 5; dx++) {
      if (Math.abs(dx) + Math.abs(dy) <= 7) {
        tiles[Math.floor(cy) + dy][Math.floor(cx) + dx] = mk('ancient_tile')
      }
    }
  }
  // Braseiros nos 4 cantos da plataforma
  tiles[Math.floor(cy) - 3][Math.floor(cx) - 4] = mk('ancient_brazier')
  tiles[Math.floor(cy) - 3][Math.floor(cx) + 4] = mk('ancient_brazier')
  tiles[Math.floor(cy) + 3][Math.floor(cx) - 4] = mk('ancient_brazier')
  tiles[Math.floor(cy) + 3][Math.floor(cx) + 4] = mk('ancient_brazier')
  // Cristais decorativos
  tiles[Math.floor(cy) - 2][Math.floor(cx) - 2] = mk('crystal')
  tiles[Math.floor(cy) - 2][Math.floor(cx) + 2] = mk('crystal')
  tiles[Math.floor(cy) + 2][Math.floor(cx) - 2] = mk('crystal')
  tiles[Math.floor(cy) + 2][Math.floor(cx) + 2] = mk('crystal')
  // Fonte de regeneração no centro
  tiles[Math.floor(cy)][Math.floor(cx)] = mk('fountain')
  // Portal de saída — logo ao sul da fonte (longe do spawn norte do jogador)
  tiles[Math.floor(cy) + 5][Math.floor(cx)] = mk('portal')

  // ─── Trilhas de cobblestone ligando portões ao centro ──────────────────
  for (let y = 2; y < H - 2; y++) {
    const t = tiles[y][50]?.type
    if (t === 'broken_tile' || t === 'ancient_tile') tiles[y][50] = mk('cobblestone')
  }
  for (let x = 2; x < W - 2; x++) {
    const t = tiles[36][x]?.type
    if (t === 'broken_tile' || t === 'ancient_tile') tiles[36][x] = mk('cobblestone')
  }
  // Mantém centro e portal sempre acessíveis
  tiles[Math.floor(cy)][Math.floor(cx)] = mk('fountain')
  tiles[Math.floor(cy) + 5][Math.floor(cx)] = mk('portal')

  // Decorações dispersas (cristais, ossos, lâmpadas) entre o anel e a parede
  for (let i = 0; i < 110; i++) {
    const px = 4 + Math.floor(Math.random() * (W - 8))
    const py = 4 + Math.floor(Math.random() * (H - 8))
    const cur = tiles[py][px].type
    if (cur !== 'ancient_tile' && cur !== 'broken_tile') continue
    if (Math.abs(px - cx) < 8 && Math.abs(py - cy) < 6) continue
    const r = Math.random()
    if (r < 0.25) tiles[py][px] = mk('crystal')
    else if (r < 0.40) tiles[py][px] = mk('sarcophagus')
    else if (r < 0.55) tiles[py][px] = mk('rune_stone')
    else if (r < 0.70) tiles[py][px] = mk('lamp_post')
    else if (r < 0.82) tiles[py][px] = mk('ancient_brazier')
    else tiles[py][px] = mk('cobblestone')
  }

  // Spawn do jogador: norte-interno, logo abaixo do portão norte (longe do portal central)
  const spawnX = 50 * 32
  const spawnY = 8 * 32

  return {
    id: 'arena',
    name: 'Coliseu Eterno — Arena de Ondas',
    width: W, height: H, tiles,
    monsters: [],
    spawnPoints: [{ x: spawnX, y: spawnY }],
    ambience: 'dungeon', musicTheme: 'dungeon',
    minLevel: 1,
  }
}

// ─── Configuração de Ondas ─────────────────────────────────────────────────

function pickMonsterTypeForWave(wave: number): MonsterType {
  // Pool gradual — vai liberando tipos mais perigosos com o tempo.
  const pools: MonsterType[][] = [
    ['slime', 'goblin'],                                       // 1-9
    ['slime', 'goblin', 'wolf', 'skeleton'],                   // 10-24
    ['goblin', 'wolf', 'skeleton', 'spider', 'orc'],           // 25-49
    ['skeleton', 'orc', 'spider', 'zombie', 'witch', 'ghost'], // 50-99
    ['orc', 'zombie', 'troll', 'witch', 'ghost', 'archer_enemy', 'mage_enemy'], // 100-199
    ['troll', 'demon', 'vampire', 'treant', 'knight_enemy', 'mage_enemy'],      // 200-399
    ['demon', 'dragon', 'vampire', 'treant', 'knight_enemy'],                   // 400-699
    ['dragon', 'demon', 'vampire', 'troll', 'knight_enemy'],                    // 700-999
    ['dragon', 'demon', 'vampire'],                                              // 1000
  ]
  const idx =
    wave < 10 ? 0 : wave < 25 ? 1 : wave < 50 ? 2 : wave < 100 ? 3 :
    wave < 200 ? 4 : wave < 400 ? 5 : wave < 700 ? 6 : wave < 1000 ? 7 : 8
  const pool = pools[idx]
  return pool[Math.floor(Math.random() * pool.length)]
}

function pickEliteForWave(wave: number): EliteTier {
  // ARENA HARDCORE — bosses/champions muito mais frequentes
  if (wave % 100 === 0) return 'boss'
  if (wave % 25 === 0)  return 'boss'
  if (wave % 10 === 0)  return 'boss'
  if (wave % 5 === 0)   return 'boss'           // antes: champion
  if (wave % 3 === 0)   return 'champion'       // novo: a cada 3 ondas
  const r = Math.random()
  const eliteChance = Math.min(0.70, 0.20 + wave * 0.008)
  const champChance = Math.min(0.35, 0.05 + wave * 0.005)
  if (r < champChance) return 'champion'
  if (r < champChance + eliteChance) return 'elite'
  return 'normal'
}

function monsterCountForWave(wave: number): number {
  // ARENA HARDCORE — muito mais inimigos por onda
  if (wave % 25 === 0) return 10                 // boss-rush maior
  const base = Math.min(120, 10 + Math.floor(wave * 1.2))
  return wave % 10 === 0 ? Math.min(120, base + 14) : base
}

function monsterLevelForWave(wave: number): number {
  // ARENA HARDCORE — escala de level mais agressiva
  return Math.max(1, Math.floor(3 + wave * 1.6))
}

function spawnAtGate(state: GameState, wave: number, gateIdx: number): Monster | null {
  const gate = ARENA_GATES[gateIdx]
  // Boss-rush waves spawn apenas bosses
  const type = pickMonsterTypeForWave(wave)
  const elite: EliteTier = (wave % 25 === 0) ? 'boss' : pickEliteForWave(wave)
  const level = monsterLevelForWave(wave)
  const px = gate.cx * 32
  const py = gate.cy * 32
  try {
    const m = createMonster(type, level, px, py, elite)
    ;(m as any)._noRespawn = true
    ;(m as any)._arenaWave = wave
    m.isAggrod = true
    // ARENA: monstros sempre perseguem o jogador, sem perder aggro
    m.aggroRange = 999999
    return m
  } catch {
    return null
  }
}

function addGateParticles(particles: Particle[], gateIdx: number, theme: ArenaTheme, intensity = 1): Particle[] {
  const gate = ARENA_GATES[gateIdx]
  const colors = THEME_GATE_COLOR[theme]
  const count = Math.round(8 * intensity)
  // Pilares de chama nos dois lados da abertura (perpendicular à parede)
  const isHorizontalGate = gate.id === 'north' || gate.id === 'south'
  for (let i = 0; i < count; i++) {
    const offset = (Math.random() - 0.5) * (isHorizontalGate ? 110 : 30)
    const offsetPerp = (Math.random() - 0.5) * (isHorizontalGate ? 30 : 110)
    particles.push({
      id: `gp_${Date.now()}_${Math.random()}`,
      x: gate.x * 32 + 16 + (isHorizontalGate ? offset : offsetPerp),
      y: gate.y * 32 + 16 + (isHorizontalGate ? offsetPerp : offset),
      vx: (Math.random() - 0.5) * 1.2,
      vy: -1.5 - Math.random() * 2.5,
      life: 35 + Math.random() * 25,
      maxLife: 60,
      size: 2 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      type: 'fire',
    })
  }
  // Faíscas adicionais
  for (let i = 0; i < Math.round(3 * intensity); i++) {
    particles.push({
      id: `gs_${Date.now()}_${Math.random()}`,
      x: gate.x * 32 + 16 + (Math.random() - 0.5) * 80,
      y: gate.y * 32 + 16 + (Math.random() - 0.5) * 80,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      life: 20,
      maxLife: 20,
      size: 1.5,
      color: colors[2],
      type: 'spark',
    })
  }
  return particles
}

// Explosão grande no centro do portão quando ele "explode aberto"
function gateOpenBurst(particles: Particle[], gateIdx: number, theme: ArenaTheme): Particle[] {
  const gate = ARENA_GATES[gateIdx]
  const colors = THEME_GATE_COLOR[theme]
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2
    const s = 2 + Math.random() * 5
    particles.push({
      id: `gob_${Date.now()}_${i}_${Math.random()}`,
      x: gate.x * 32 + 16, y: gate.y * 32 + 16,
      vx: Math.cos(a) * s, vy: Math.sin(a) * s,
      life: 50, maxLife: 50,
      size: 3 + Math.random() * 3,
      color: colors[i % colors.length],
      type: 'fire',
    })
  }
  return particles
}

// Partículas ambiente do tema (chovendo do alto) — chamadas esporadicamente
function addThemeAmbience(particles: Particle[], theme: ArenaTheme, mapW: number, mapH: number): Particle[] {
  if (theme === 'stone') return particles
  const colors = THEME_GATE_COLOR[theme]
  for (let i = 0; i < 2; i++) {
    particles.push({
      id: `amb_${Date.now()}_${Math.random()}`,
      x: Math.random() * mapW * 32,
      y: Math.random() * mapH * 32,
      vx: theme === 'ice' ? (Math.random() - 0.5) * 0.5 : 0,
      vy: theme === 'ice' ? 0.8 : -0.6 - Math.random() * 0.5,
      life: 80, maxLife: 80,
      size: 1.5 + Math.random(),
      color: colors[Math.floor(Math.random() * colors.length)],
      type: theme === 'ice' ? 'water' : theme === 'fire' ? 'fire' : 'magic',
    })
  }
  return particles
}

// Item de recompensa para milestones
function milestoneReward(wave: number): Item | null {
  try {
    if (wave % 100 === 0) return { ...(ITEMS as any).legendary_chest ?? (ITEMS as any).mythic_orb ?? (ITEMS as any).potion, quantity: 1 }
    if (wave % 25 === 0)  return { ...(ITEMS as any).rare_chest ?? (ITEMS as any).great_potion ?? (ITEMS as any).potion, quantity: 3 }
    if (wave % 10 === 0)  return { ...(ITEMS as any).potion, quantity: 5 }
    if (wave % 5 === 0)   return { ...(ITEMS as any).potion, quantity: 2 }
  } catch { /* ignore — milestone reward é cosmético */ }
  return null
}

function giveItem(player: any, item: Item): any {
  const inv = [...(player.inventory ?? [])]
  // Tenta stackar
  const stack = inv.findIndex((s: any) => s && s.stackable && s.id === item.id && (s.quantity ?? 0) < 99)
  if (stack >= 0) {
    inv[stack] = { ...inv[stack], quantity: (inv[stack].quantity ?? 0) + (item.quantity ?? 1) }
  } else {
    const empty = inv.findIndex((s: any) => s === null)
    if (empty >= 0) inv[empty] = item
    else return player
  }
  return { ...player, inventory: inv }
}

export function updateArena(state: GameState): GameState {
  if (!state.currentMap || state.currentMap.id !== 'arena' || !state.player) return state
  const arena: ArenaState = (state as any)._arena ?? createArenaState()
  const theme = themeForWave(Math.max(1, arena.wave || 1))

  let newParticles = state.particles
  let newNotifications = state.notifications
  let newMonsters = state.currentMap.monsters
  let newChat = state.chatMessages
  let newPlayer = state.player

  // Conta vivos
  const alive = newMonsters.filter(m => (m as any)._noRespawn && !m.isDead).length
  if (alive < arena.monstersAlive) {
    arena.totalKills += (arena.monstersAlive - alive)
  }
  arena.monstersAlive = alive

  // Decai pulsos dos portões
  for (let i = 0; i < 4; i++) {
    if (arena.gateOpening[i] > 0) {
      arena.gateOpening[i] -= 1
      arena.gatePulse[i] = Math.min(1, arena.gatePulse[i] + 0.06)
      // Partículas contínuas enquanto o portão está aberto
      if ((state.tick % 3) === 0) newParticles = addGateParticles([...newParticles], i, theme, 1)
    } else {
      arena.gatePulse[i] = Math.max(0, arena.gatePulse[i] - 0.02)
      // Mesmo "fechado", braseiros dos portões emitem brasa fraca
      if (arena.status === 'active' && (state.tick % 12) === 0) {
        newParticles = addGateParticles([...newParticles], i, theme, 0.3)
      }
    }
  }

  // Partículas de ambiente do tema (suaves)
  if (arena.status !== 'ready' && (state.tick % 4) === 0) {
    newParticles = addThemeAmbience([...newParticles], theme, ARENA_W, ARENA_H)
  }

  // Countdown 3-2-1-GO antes de cada onda
  if (arena.status === 'intermission' && arena.intermissionTimer > 0 && arena.intermissionTimer <= 240) {
    const secs = Math.ceil(arena.intermissionTimer / 60)
    if (secs !== arena.countdownAnnounced && secs >= 1 && secs <= 4) {
      arena.countdownAnnounced = secs
      newNotifications = [...newNotifications, {
        id: `arena_cd_${secs}_${arena.wave}_${Date.now()}`,
        text: secs === 1 ? '⚔ PREPARE-SE!' : `Próxima onda em ${secs - 1}...`,
        type: 'achievement', timer: 60,
      }]
    }
  }

  if (arena.status === 'ready') {
    arena.intermissionTimer -= 1
    if (arena.intermissionTimer === 180) {
      newNotifications = [...newNotifications, {
        id: `arena_intro_${Date.now()}`,
        text: '⚔ Coliseu Eterno — Sobreviva até a onda 1000',
        type: 'achievement', timer: 300,
      }]
      newChat = [...newChat, {
        id: `arena_chat_intro_${Date.now()}`,
        text: 'Os antigos despertam... 4 portões guardam suas almas. Boa sorte, campeão.',
        type: 'system', timestamp: Date.now(),
      }]
    }
    if (arena.intermissionTimer <= 0) {
      arena.status = 'intermission'
      arena.intermissionTimer = 0
    }
  }

  if (arena.status === 'intermission' || arena.status === 'complete') {
    if (arena.intermissionTimer > 0) {
      arena.intermissionTimer -= 1
    } else if (arena.wave < ARENA_MAX_WAVES) {
      // Inicia próxima onda
      arena.wave += 1
      arena.countdownAnnounced = -1
      const count = monsterCountForWave(arena.wave)
      arena.spawnQueue = count
      arena.spawnedThisWave = count
      arena.spawnTimer = 30
      arena.status = 'active'
      arena.gateOpening = [120, 120, 120, 120]
      arena.bestWave = Math.max(arena.bestWave, arena.wave)
      // Explosão dos 4 portões abrindo
      for (let g = 0; g < 4; g++) newParticles = gateOpenBurst([...newParticles], g, theme)
      const isBoss     = arena.wave % 10 === 0
      const isBossRush = arena.wave % 25 === 0
      const isSupreme  = arena.wave % 100 === 0
      const label = isSupreme   ? '👑 ONDA SUPREMA — TEMA MUDOU!'
                  : isBossRush  ? '🔥 BOSS RUSH — 6 CHEFES!'
                  : isBoss      ? '💀 ONDA DE CHEFE'
                  : `Onda ${arena.wave}`
      newNotifications = [...newNotifications, {
        id: `arena_wave_${arena.wave}`,
        text: `${label} — ${count} inimigos`,
        type: 'achievement', timer: 220,
      }]
      // Anúncio de mudança de tema
      if (isSupreme) {
        const newTheme = themeForWave(arena.wave)
        newNotifications = [...newNotifications, {
          id: `arena_theme_${arena.wave}`,
          text: `🌌 Tema ${newTheme.toUpperCase()} ativado!`,
          type: 'achievement', timer: 280,
        }]
      }
      newChat = [...newChat, {
        id: `arenamsg_${arena.wave}_${Date.now()}`,
        text: `Os portões se abrem... Onda ${arena.wave} começou!`,
        type: 'system', timestamp: Date.now(),
      }]
    } else {
      // Vitória final
      arena.status = 'complete'
      newNotifications = [...newNotifications, {
        id: `arena_master_${Date.now()}`,
        text: '🏆 MESTRE DO COLISEU — 1000 ondas conquistadas!',
        type: 'achievement', timer: 600,
      }]
    }
  } else if (arena.status === 'active') {
    // Spawna em intervalos
    if (arena.spawnQueue > 0) {
      arena.spawnTimer -= 1
      if (arena.spawnTimer <= 0) {
        // Spawna em rajada crescente com a onda; distribui pelos 4 portões
        const burstSize = arena.wave % 25 === 0 ? 2  // boss-rush devagar
                       : Math.min(6, 2 + Math.floor(arena.wave / 30))
        const burst = Math.min(arena.spawnQueue, 1 + Math.floor(Math.random() * burstSize))
        const ms = [...newMonsters]
        for (let b = 0; b < burst; b++) {
          // Boss-rush: usa todos os 4 portões em ordem
          const gateIdx = arena.wave % 25 === 0
            ? (arena.spawnedThisWave - arena.spawnQueue + b) % 4
            : Math.floor(Math.random() * 4)
          const m = spawnAtGate(state, arena.wave, gateIdx)
          if (m) {
            ms.push(m)
            arena.gateOpening[gateIdx] = Math.max(arena.gateOpening[gateIdx], 80)
            // Mini-explosão no portão usado
            newParticles = addGateParticles([...newParticles], gateIdx, theme, 0.8)
          }
        }
        newMonsters = ms
        arena.spawnQueue -= burst
        // Intervalo entre rajadas diminui com a onda; boss-rush mais lento
        const interval = arena.wave % 25 === 0
          ? 90
          : Math.max(8, 45 - Math.floor(arena.wave * 0.4))
        arena.spawnTimer = interval
      }
    } else if (alive === 0) {
      // Onda completa
      // Recompensas escalonadas — milestones multiplicam.
      const isBoss     = arena.wave % 10 === 0
      const isBossRush = arena.wave % 25 === 0
      const isSupreme  = arena.wave % 100 === 0
      let mult = 1
      if (isBoss)     mult *= 3
      if (isBossRush) mult *= 2
      if (isSupreme)  mult *= 5
      const baseXp = 80 + arena.wave * 50
      const baseGold = 30 + arena.wave * 25
      const xpGain = baseXp * mult
      const goldGain = baseGold * mult
      arena.totalXpEarned += xpGain
      arena.totalGoldEarned += goldGain
      let xp = newPlayer.xp + xpGain
      let level = newPlayer.level
      let xpToNext = newPlayer.xpToNext
      while (xp >= xpToNext) {
        xp -= xpToNext
        level += 1
        xpToNext = Math.round(xpToNext * 1.15)
        newNotifications = [...newNotifications, {
          id: `arena_lvl_${level}_${Date.now()}`,
          text: `Level ${level}!`, type: 'level', timer: 180,
        }]
      }
      const maxHp = (newPlayer as any).maxHp ?? newPlayer.hp
      const maxMp = (newPlayer as any).maxMp ?? newPlayer.mp ?? 0
      newPlayer = {
        ...newPlayer,
        xp, xpToNext, level,
        gold: newPlayer.gold + goldGain,
        // Cura total em milestones, parcial em ondas comuns
        hp: isBoss ? maxHp : Math.min(maxHp, newPlayer.hp + Math.round(maxHp * 0.30)),
        mp: isBoss ? maxMp : Math.min(maxMp, (newPlayer.mp ?? 0) + Math.round(maxMp * 0.40)),
      }
      // Item de recompensa em milestones
      const reward = milestoneReward(arena.wave)
      if (reward) {
        newPlayer = giveItem(newPlayer, reward)
        newNotifications = [...newNotifications, {
          id: `arena_loot_${arena.wave}_${Date.now()}`,
          text: `🎁 Recompensa: ${reward.name} x${reward.quantity ?? 1}`,
          type: 'achievement', timer: 240,
        }]
      }
      newNotifications = [...newNotifications, {
        id: `arena_clear_${arena.wave}_${Date.now()}`,
        text: `Onda ${arena.wave} concluída! +${xpGain} XP, +${goldGain} ouro`,
        type: 'achievement', timer: 220,
      }]
      newChat = [...newChat, {
        id: `arenacl_${arena.wave}_${Date.now()}`,
        text: `Onda ${arena.wave} concluída! Próxima em breve...`,
        type: 'level', timestamp: Date.now(),
      }]
      arena.status = 'intermission'
      // Intermissões mais longas em milestones para dar tempo de respirar
      arena.intermissionTimer = isSupreme ? 600 : isBossRush ? 480 : isBoss ? 360 : 240
      arena.countdownAnnounced = -1
    }
  }

  return {
    ...state,
    player: newPlayer,
    currentMap: { ...state.currentMap, monsters: newMonsters },
    particles: newParticles,
    notifications: newNotifications,
    chatMessages: newChat.slice(-200),
    _arena: arena,
  } as GameState
}

// Reseta o estado da arena quando o jogador sai/entra novamente.
export function resetArenaIfLeft(state: GameState): GameState {
  if (!state.currentMap || state.currentMap.id !== 'arena') {
    if ((state as any)._arena) {
      return { ...state, _arena: undefined } as GameState
    }
  } else if (!(state as any)._arena) {
    return { ...state, _arena: createArenaState() } as GameState
  }
  return state
}