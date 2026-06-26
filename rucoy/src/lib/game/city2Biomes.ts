// @ts-nocheck
// ─────────────────────────────────────────────────────────────────────────────
//  CIDADE 2 + 10 NOVOS BIOMAS (cada um com 2 andares de profundidade)
//  Hub central com 10 portais ao redor, cada portal leva ao andar 1 do bioma.
//  Andar 1 tem 1 portal de descida (crystal_portal) → andar 2.
//  Andar 2 tem 1 portal de retorno (portal) → Cidade 2.
// ─────────────────────────────────────────────────────────────────────────────
import type { GameMap, Tile, TileType, Monster, MonsterType, EliteTier } from './types'
import { createMonster, rollEliteTier } from './data'

const NON_WALKABLE: TileType[] = [
  'water', 'deepwater', 'wall', 'dungeon_wall', 'dungeon_brick', 'lava', 'tree', 'rock',
  'house_wall', 'house_roof', 'fountain', 'lamp_post', 'market_stall', 'fence',
  'ice', 'frozen_tree', 'ice_rock', 'volcanic_rock', 'obsidian', 'volcanic_vent',
  'crystal_wall', 'ruin_wall', 'sky_void', 'cobweb',
  'abyss_wall', 'void',
  'pine_tree', 'snowy_peak', 'mountain_rock', 'ice_crystal_node',
  'ruin_pillar', 'vine_wall', 'sarcophagus', 'rune_stone', 'ancient_brazier',
]
function tile(type: TileType): Tile {
  return { type, walkable: !NON_WALKABLE.includes(type), transparent: true }
}
function rng(seed: number) {
  let r = seed >>> 0 || 1
  return () => { r = (r * 1664525 + 1013904223) >>> 0; return r / 0xffffffff }
}
function clearArea(tiles: Tile[][], cx: number, cy: number, radius: number, type: TileType) {
  const H = tiles.length, W = tiles[0].length
  for (let dy = -radius; dy <= radius; dy++) for (let dx = -radius; dx <= radius; dx++) {
    const nx = cx + dx, ny = cy + dy
    if (nx > 0 && ny > 0 && nx < W - 1 && ny < H - 1) tiles[ny][nx] = tile(type)
  }
}

// ─── BIOME DEFINITIONS ───────────────────────────────────────────────────────
interface BiomeDef {
  id: string
  name: string
  baseLvl: number
  ambience: string
  // floor 1 palette
  f1: { base: TileType; accents: [TileType, number][]; wall: TileType; mobs: MonsterType[] }
  // floor 2 palette (mais sombrio/perigoso)
  f2: { base: TileType; accents: [TileType, number][]; wall: TileType; mobs: MonsterType[] }
  bossF2: MonsterType
}

export const CITY2_BIOMES: BiomeDef[] = [
  { id: 'pantanal',   name: 'Pântano Místico',   baseLvl: 15, ambience: 'swamp',
    f1: { base: 'grass', accents: [['water',0.18],['mushroom',0.06],['tree',0.08]], wall: 'tree',         mobs: ['spider','witch','zombie','treant','plague_toad','bog_witch'] },
    f2: { base: 'mossy_stone', accents: [['dark_water',0.20],['mushroom',0.08],['root',0.05]], wall: 'mossy_stone', mobs: ['ghost','witch','treant','vampire','hydra_spawn','mire_lurker','plague_doctor'] },
    bossF2: 'wb_swamp_witch' },
  { id: 'redsand',    name: 'Deserto Escarlate', baseLvl: 16, ambience: 'desert',
    f1: { base: 'sand', accents: [['rock',0.10],['ash',0.05]], wall: 'rock',                 mobs: ['skeleton','goblin','orc','spider','sand_wraith','scorpion_king','sun_scarab'] },
    f2: { base: 'ash',  accents: [['magma_crust',0.15],['lava',0.05]], wall: 'obsidian',     mobs: ['demon','witch','skeleton','dragon','dune_serpent','mirage_djinn','mummy_lord'] },
    bossF2: 'wb_pharaoh_eternal' },
  { id: 'fungal',     name: 'Caverna Fungal',    baseLvl: 17, ambience: 'cave',
    f1: { base: 'cave_floor', accents: [['mushroom',0.18],['mossy_stone',0.08]], wall: 'stone', mobs: ['spider','slime','goblin','treant','mushroom_zealot','plague_toad'] },
    f2: { base: 'mossy_stone', accents: [['mushroom',0.25],['dark_water',0.10]], wall: 'stone', mobs: ['witch','ghost','spider','treant','crystal_spider','rock_worm','flesh_construct'] },
    bossF2: 'treant' },
  { id: 'windpeak',   name: 'Picos Ventosos',    baseLvl: 18, ambience: 'mountain',
    f1: { base: 'snow', accents: [['snow_rock',0.10],['pine_tree',0.06]], wall: 'mountain_rock', mobs: ['wolf','troll','skeleton','knight_enemy','snow_stalker','ice_revenant'] },
    f2: { base: 'ice',  accents: [['snow_rock',0.10],['snowy_peak',0.05]], wall: 'snowy_peak',    mobs: ['troll','demon','dragon','knight_enemy','frost_wyrm','yeti_brawler','glacial_warden'] },
    bossF2: 'wb_glacier_queen' },
  { id: 'darkjungle', name: 'Selva Sombria',     baseLvl: 19, ambience: 'forest',
    f1: { base: 'grass', accents: [['tall_grass',0.15],['canopy',0.10],['tree',0.10]], wall: 'tree',     mobs: ['spider','wolf','treant','archer_enemy','forest_sprite','thorn_lurker','shadow_panther'] },
    f2: { base: 'mossy_stone', accents: [['canopy',0.15],['root',0.08],['dark_water',0.05]], wall: 'tree', mobs: ['treant','witch','vampire','spider','moss_giant','shadow_panther','verdant_wisp'] },
    bossF2: 'treant' },
  { id: 'sunkcrypt',  name: 'Cripta Submersa',   baseLvl: 20, ambience: 'haunted',
    f1: { base: 'ruin_floor', accents: [['water',0.18],['cobweb',0.05]], wall: 'ruin_wall',    mobs: ['ghost','zombie','skeleton','vampire','wight','banshee','tomb_guardian'] },
    f2: { base: 'ruin_floor', accents: [['deepwater',0.20],['sarcophagus',0.04]], wall: 'ruin_wall', mobs: ['vampire','ghost','demon','witch','bone_colossus','lich_acolyte','banshee'] },
    bossF2: 'wb_lich_king' },
  { id: 'crystcliff', name: 'Falésia Cristalina', baseLvl: 21, ambience: 'crystal',
    f1: { base: 'crystal_floor', accents: [['crystal',0.10],['gem_node',0.04]], wall: 'crystal_wall', mobs: ['mage_enemy','ghost','spider','crystal_spider','gem_golem','prism_wraith'] },
    f2: { base: 'crystal_floor', accents: [['dark_crystal',0.15],['gem_node',0.06]], wall: 'crystal_wall', mobs: ['demon','mage_enemy','dragon','gem_golem','drow_mage','mind_flayer'] },
    bossF2: 'dragon' },
  { id: 'graysteppe', name: 'Estepe Cinzenta',   baseLvl: 22, ambience: 'tundra',
    f1: { base: 'ash', accents: [['stone',0.10],['rock',0.08]], wall: 'rock',                 mobs: ['wolf','troll','orc','skeleton','snow_stalker','ice_revenant'] },
    f2: { base: 'stone', accents: [['ash',0.12],['obsidian',0.06]], wall: 'obsidian',         mobs: ['demon','troll','knight_enemy','yeti_brawler','iron_maiden','dread_knight'] },
    bossF2: 'troll' },
  { id: 'glowood',    name: 'Bosque Bioluminescente', baseLvl: 23, ambience: 'forest',
    f1: { base: 'grass', accents: [['flower',0.15],['mushroom',0.10],['tree',0.06]], wall: 'tree',    mobs: ['wolf','spider','treant','witch','forest_sprite','verdant_wisp'] },
    f2: { base: 'mossy_stone', accents: [['mushroom',0.18],['crystal',0.06]], wall: 'tree',           mobs: ['ghost','witch','mage_enemy','treant','prism_wraith','shadow_panther'] },
    bossF2: 'witch' },
  { id: 'magmapit',   name: 'Fosso Vulcânico',   baseLvl: 24, ambience: 'volcano',
    f1: { base: 'magma_crust', accents: [['lava',0.12],['volcanic_rock',0.10]], wall: 'volcanic_rock', mobs: ['demon','skeleton','orc','magma_imp','flame_serpent','phoenix_chick'] },
    f2: { base: 'obsidian', accents: [['lava',0.20],['magma_crust',0.10]], wall: 'volcanic_rock',     mobs: ['demon','dragon','witch','lava_golem','obsidian_juggernaut','flame_serpent'] },
    bossF2: 'wb_ember_titan' },
]

// ─── BIOME GENERATOR ─────────────────────────────────────────────────────────
function genBiome(def: BiomeDef, floor: 1 | 2): GameMap {
  const W = 180, H = 180
  const seed = (def.id.charCodeAt(0) * 977 + def.id.length * 31 + floor * 7919)
  const rand = rng(seed)
  const palette = floor === 1 ? def.f1 : def.f2
  const tiles: Tile[][] = []
  for (let y = 0; y < H; y++) {
    tiles[y] = []
    for (let x = 0; x < W; x++) {
      let t: TileType = palette.base
      const r = rand()
      let cum = 0
      for (const [tt, p] of palette.accents) {
        cum += p
        if (r < cum) { t = tt; break }
      }
      tiles[y][x] = tile(t)
    }
  }
  // bordas com wall
  for (let x = 0; x < W; x++) { tiles[0][x] = tile(palette.wall); tiles[H-1][x] = tile(palette.wall) }
  for (let y = 0; y < H; y++) { tiles[y][0] = tile(palette.wall); tiles[y][W-1] = tile(palette.wall) }

  // praça de spawn no canto NO
  const sx = 12, sy = 12
  clearArea(tiles, sx, sy, 4, palette.base)
  tiles[sy][sx] = tile('portal')  // portal de volta para Cidade 2 (ou descida no f1 abaixo)

  // floor 1: portal de descida no SE; floor 2: nada (só o de volta no NO)
  if (floor === 1) {
    const dx = W - 13, dy = H - 13
    clearArea(tiles, dx, dy, 4, palette.base)
    tiles[dy][dx] = tile('crystal_portal')
  }

  // caminho central pra ajudar travessia
  for (let x = sx; x < W - sx; x++) {
    if (!tiles[Math.floor(H/2)][x].walkable) tiles[Math.floor(H/2)][x] = tile(palette.base)
  }
  for (let y = sy; y < H - sy; y++) {
    if (!tiles[y][Math.floor(W/2)].walkable) tiles[y][Math.floor(W/2)] = tile(palette.base)
  }

  // monstros
  const monsters: Monster[] = []
  const baseLvl = def.baseLvl + (floor - 1) * 10
  const count = 60 + floor * 20
  for (let i = 0; i < count; i++) {
    const x = 4 + Math.floor(rand() * (W - 8))
    const y = 4 + Math.floor(rand() * (H - 8))
    if (!tiles[y][x].walkable) continue
    const t = palette.mobs[Math.floor(rand() * palette.mobs.length)]
    const lvl = baseLvl + Math.floor(rand() * 5)
    const tier: EliteTier = rand() < 0.06 ? 'elite' : 'normal'
    monsters.push(createMonster(t, lvl, x * 32, y * 32, tier))
  }
  if (floor === 2) {
    monsters.push(createMonster(def.bossF2, baseLvl + 8, Math.floor(W/2)*32, Math.floor(H/2)*32, 'boss'))
  }

  return {
    id: `c2_${def.id}_${floor}`,
    name: `${def.name} — Andar ${floor}`,
    width: W, height: H, tiles, monsters,
    spawnPoints: [{ x: sx * 32 + 64, y: sy * 32 + 64 }],
    ambience: def.ambience as any, musicTheme: def.ambience as any,
    minLevel: baseLvl,
  }
}

// ─── CITY 2 HUB ──────────────────────────────────────────────────────────────
// 10 portais dispostos em círculo ao redor de uma fonte central. Cada um
// aponta para o andar 1 de um bioma diferente (a detecção exata é feita pela
// `engine.ts` via coordenadas conhecidas — ver CITY2_PORTAL_COORDS).
export const CITY2_W = 60
export const CITY2_H = 60
export const CITY2_CX = 30
export const CITY2_CY = 30

export const CITY2_PORTAL_COORDS: { x: number; y: number; biome: string }[] = CITY2_BIOMES.map((b, i) => {
  const angle = (i / CITY2_BIOMES.length) * Math.PI * 2
  const r = 22
  return {
    x: Math.round(CITY2_CX + Math.cos(angle) * r),
    y: Math.round(CITY2_CY + Math.sin(angle) * r),
    biome: b.id,
  }
})

function generateCity2Map(): GameMap {
  const W = CITY2_W, H = CITY2_H
  const tiles: Tile[][] = []
  for (let y = 0; y < H; y++) {
    tiles[y] = []
    for (let x = 0; x < W; x++) {
      const garden = (x + y) % 8 === 0
      tiles[y][x] = tile(garden ? 'garden' : 'cobblestone')
    }
  }
  // muralhas
  for (let x = 0; x < W; x++) { tiles[0][x] = tile('wall'); tiles[H-1][x] = tile('wall') }
  for (let y = 0; y < H; y++) { tiles[y][0] = tile('wall'); tiles[y][W-1] = tile('wall') }

  // praça central com fonte
  clearArea(tiles, CITY2_CX, CITY2_CY, 4, 'cobblestone')
  tiles[CITY2_CY][CITY2_CX] = tile('fountain')
  // 4 lamparinas
  tiles[CITY2_CY-3][CITY2_CX-3] = tile('lamp_post')
  tiles[CITY2_CY-3][CITY2_CX+3] = tile('lamp_post')
  tiles[CITY2_CY+3][CITY2_CX-3] = tile('lamp_post')
  tiles[CITY2_CY+3][CITY2_CX+3] = tile('lamp_post')

  // portal de volta pra Cidade principal (NO da praça)
  tiles[CITY2_CY - 6][CITY2_CX] = tile('portal') // sai e volta

  // 10 portais dos biomas
  for (const p of CITY2_PORTAL_COORDS) {
    clearArea(tiles, p.x, p.y, 2, 'cobblestone')
    tiles[p.y][p.x] = tile('portal')
  }

  // estrada radial até cada portal
  for (const p of CITY2_PORTAL_COORDS) {
    const steps = 30
    for (let i = 1; i <= steps; i++) {
      const xi = Math.round(CITY2_CX + (p.x - CITY2_CX) * (i / steps))
      const yi = Math.round(CITY2_CY + (p.y - CITY2_CY) * (i / steps))
      if (xi > 0 && yi > 0 && xi < W-1 && yi < H-1 && tiles[yi][xi].type !== 'fountain') {
        tiles[yi][xi] = tile('cobblestone')
      }
    }
  }

  return {
    id: 'city2', name: 'Cidade 2 — Hub dos Confins',
    width: W, height: H, tiles, monsters: [],
    spawnPoints: [{ x: CITY2_CX * 32, y: (CITY2_CY - 5) * 32 }],
    ambience: 'city' as any, musicTheme: 'city' as any,
    minLevel: 15,
  }
}

// ─── DISPATCHER ──────────────────────────────────────────────────────────────
export function generateCity2Map_(): GameMap { return generateCity2Map() }

export function generateC2Biome(id: string): GameMap | null {
  if (id === 'city2') return generateCity2Map()
  const m = id.match(/^c2_([a-z]+)_(1|2)$/)
  if (!m) return null
  const def = CITY2_BIOMES.find(b => b.id === m[1])
  if (!def) return null
  return genBiome(def, parseInt(m[2], 10) as 1 | 2)
}
