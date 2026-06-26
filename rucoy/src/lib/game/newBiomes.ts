// @ts-nocheck
// ─────────────────────────────────────────────────────────────────────────────
//  NEW BIOMES (10 biomas × 2 andares cada)
//  Cada bioma tem um gerador procedural exclusivo, com layout, paleta e
//  monstros próprios. Não são "reskins" — usam padrões geométricos únicos.
// ─────────────────────────────────────────────────────────────────────────────
import type { GameMap, Tile, TileType, Monster, MonsterType, EliteTier } from './types'
import { createMonster } from './data'

const NON_WALKABLE: TileType[] = [
  'water', 'deepwater', 'wall', 'dungeon_wall', 'dungeon_brick', 'lava', 'tree', 'rock',
  'house_wall', 'house_roof', 'fountain', 'lamp_post', 'market_stall', 'fence',
  'ice', 'frozen_tree', 'ice_rock', 'volcanic_rock', 'obsidian', 'volcanic_vent',
  'crystal_wall', 'ruin_wall', 'sky_void', 'cobweb',
  'abyss_wall', 'void',
  'pine_tree', 'snowy_peak', 'mountain_rock', 'ice_crystal_node',
  'ruin_pillar', 'vine_wall', 'sarcophagus', 'rune_stone', 'ancient_brazier',
  'tower_wall',
]

const T = (type: TileType): Tile => ({ type, walkable: !NON_WALKABLE.includes(type), transparent: true })

function blank(W: number, H: number, base: TileType): Tile[][] {
  const t: Tile[][] = []
  for (let y = 0; y < H; y++) { t[y] = []; for (let x = 0; x < W; x++) t[y][x] = T(base) }
  return t
}
function border(t: Tile[][], W: number, H: number, type: TileType) {
  for (let x = 0; x < W; x++) { t[0][x] = T(type); t[H-1][x] = T(type) }
  for (let y = 0; y < H; y++) { t[y][0] = T(type); t[y][W-1] = T(type) }
}
function rngOf(seed: number) { let r = seed>>>0||1; return () => { r = (r*1664525+1013904223)>>>0; return r/0xffffffff } }
function disc(t: Tile[][], cx: number, cy: number, r: number, type: TileType, p = 1) {
  const H = t.length, W = t[0].length
  for (let dy=-r; dy<=r; dy++) for (let dx=-r; dx<=r; dx++) {
    if (dx*dx+dy*dy <= r*r) {
      const x=cx+dx, y=cy+dy
      if (x>0&&y>0&&x<W-1&&y<H-1 && Math.random()<p) t[y][x] = T(type)
    }
  }
}
function ring(t: Tile[][], cx: number, cy: number, r: number, type: TileType) {
  const H = t.length, W = t[0].length
  for (let a=0; a<360; a+=2) {
    const rd=a*Math.PI/180, x=Math.round(cx+Math.cos(rd)*r), y=Math.round(cy+Math.sin(rd)*r)
    if (x>0&&y>0&&x<W-1&&y<H-1) t[y][x] = T(type)
  }
}
function path(t: Tile[][], x1: number, y1: number, x2: number, y2: number, type: TileType, w = 1) {
  const dx=x2-x1, dy=y2-y1, steps=Math.max(Math.abs(dx), Math.abs(dy))
  const H=t.length, W=t[0].length
  for (let i=0; i<=steps; i++) {
    const x=Math.round(x1+dx*i/steps), y=Math.round(y1+dy*i/steps)
    for (let a=-w; a<=w; a++) for (let b=-w; b<=w; b++) {
      const nx=x+a, ny=y+b
      if (nx>0&&ny>0&&nx<W-1&&ny<H-1) t[ny][nx] = T(type)
    }
  }
}
function portalAt(t: Tile[][], x: number, y: number, kind: TileType, pad: TileType) {
  const H=t.length, W=t[0].length
  for (let dy=-2; dy<=2; dy++) for (let dx=-2; dx<=2; dx++) {
    const nx=x+dx, ny=y+dy
    if (nx>0&&ny>0&&nx<W-1&&ny<H-1) t[ny][nx] = T(pad)
  }
  t[y][x] = T(kind)
}
function spawnPack(t: Tile[][], rand: () => number, n: number, baseLvl: number, pool: MonsterType[], eliteChance = 0.05): Monster[] {
  const out: Monster[] = []
  const H=t.length, W=t[0].length
  for (let i=0; i<n; i++) {
    const x=4+Math.floor(rand()*(W-8)), y=4+Math.floor(rand()*(H-8))
    if (!t[y][x].walkable) continue
    const m = pool[Math.floor(rand()*pool.length)]
    const lvl = baseLvl + Math.floor(rand()*6)
    out.push(createMonster(m, lvl, x*32, y*32, (rand()<eliteChance?'elite':'normal') as EliteTier))
  }
  return out
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. RECIFE DE CORAL — praia tropical com recifes e ilhotas de coral
// ═══════════════════════════════════════════════════════════════════════════════
function genCoralReef(f: 1 | 2): GameMap {
  const W=260, H=260, rand=rngOf(5100+f*37)
  const t = blank(W, H, f===1 ? 'sand' : 'water')
  // Wavefield: alternating tide bands
  for (let y=0; y<H; y++) for (let x=0; x<W; x++) {
    const wave = Math.sin(x*0.07) + Math.cos(y*0.09)
    if (f===1) {
      if (wave > 0.9) t[y][x] = T('water')
      else if (wave < -0.9) t[y][x] = T('flower')
      else if ((x*7+y*3) % 19 === 0) t[y][x] = T('crystal')
    } else {
      if (wave > 0.6) t[y][x] = T('deepwater')
      else if (wave < -0.7) t[y][x] = T('dark_crystal')
      else if ((x+y*5) % 13 === 0) t[y][x] = T('gem_node')
    }
  }
  // Coral atolls (rings of sand+crystal)
  for (let i=0; i<14; i++) {
    const cx=20+Math.floor(rand()*(W-40)), cy=20+Math.floor(rand()*(H-40)), rr=6+Math.floor(rand()*9)
    disc(t, cx, cy, rr, f===1?'sand':'crystal_floor', 1)
    ring(t, cx, cy, rr+1, f===1?'crystal':'gem_node')
    if (f===2) disc(t, cx, cy, Math.max(2, rr-3), 'crystal_floor', 0.8)
  }
  border(t, W, H, f===1?'rock':'crystal_wall')
  path(t, 8, 8, W/2, H/2, f===1?'sand':'crystal_floor', 1)
  path(t, W/2, H/2, W-9, H-9, f===1?'sand':'crystal_floor', 1)
  portalAt(t, 8, 8, 'portal', f===1?'sand':'crystal_floor')
  if (f===1) portalAt(t, W-9, H-9, 'crystal_portal', 'sand')
  const pool: MonsterType[] = f===1 ? ['slime','spider','goblin','wolf'] : ['ghost','witch','demon','mage_enemy']
  const monsters = spawnPack(t, rand, 80+f*20, f===1?5:14, pool, 0.05)
  if (f===2) monsters.push(createMonster('dragon', 28, (W/2)*32, (H/2)*32, 'boss'))
  return { id: `coral${f}`, name: `Recife de Coral — Andar ${f}`, width: W, height: H, tiles: t, monsters,
    spawnPoints: [{x:10*32, y:10*32}], ambience: f===1?'forest':'abyss', musicTheme: f===1?'forest':'abyss',
    minLevel: f===1?5:14 }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. CÂNION ESCARLATE — mesas e platôs em camadas
// ═══════════════════════════════════════════════════════════════════════════════
function genScarletCanyon(f: 1 | 2): GameMap {
  const W=270, H=270, rand=rngOf(5200+f*41)
  const t = blank(W, H, f===1?'sand':'magma_crust')
  // Stratified plateaus (horizontal bands)
  for (let y=0; y<H; y++) {
    const band = Math.floor(y/22) % 3
    for (let x=0; x<W; x++) {
      if (band === 0 && (x+y)%5 < 2) t[y][x] = T(f===1?'rock':'volcanic_rock')
      else if (band === 2 && (x*2+y)%7 === 0) t[y][x] = T(f===1?'dirt':'ash')
    }
  }
  // Slot canyons (snake-shaped clear paths)
  for (let i=0; i<5; i++) {
    let cx = 20 + Math.floor(rand()*(W-40)), cy = 20
    while (cy < H-20) {
      for (let dx=-2; dx<=2; dx++) for (let dy=0; dy<=2; dy++) {
        const x=cx+dx, y=cy+dy
        if (x>1&&y>1&&x<W-1&&y<H-1) t[y][x] = T(f===1?'dirt':'magma_crust')
      }
      cx += Math.floor(rand()*5)-2
      cy += 2
    }
  }
  // Mesa tops
  for (let i=0; i<10; i++) {
    const cx=30+Math.floor(rand()*(W-60)), cy=30+Math.floor(rand()*(H-60))
    disc(t, cx, cy, 8, f===1?'rock':'volcanic_rock', 1)
    disc(t, cx, cy, 5, f===1?'sand':'obsidian', 1)
    if (rand()<0.4) t[cy][cx] = T(f===1?'gold_ore_node':'mythril_ore_node')
  }
  border(t, W, H, f===1?'rock':'volcanic_rock')
  portalAt(t, 8, 8, 'portal', f===1?'dirt':'magma_crust')
  if (f===1) portalAt(t, W-9, H-9, 'haunted_portal', 'sand')
  const pool: MonsterType[] = f===1?['orc','goblin','spider','wolf']:['demon','troll','witch','dragon']
  const monsters = spawnPack(t, rand, 100+f*25, f===1?7:18, pool, 0.06)
  if (f===2) monsters.push(createMonster('dragon', 32, (W/2)*32, (H/2)*32, 'boss'))
  return { id: `canyon${f}`, name: `Cânion Escarlate — Andar ${f}`, width: W, height: H, tiles: t, monsters,
    spawnPoints: [{x:10*32, y:10*32}], ambience: f===1?'desert':'volcano', musicTheme: f===1?'desert':'volcano',
    minLevel: f===1?7:18 }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. TUNDRA POLAR — geleiras com fendas e icebergs
// ═══════════════════════════════════════════════════════════════════════════════
function genPolarTundra(f: 1 | 2): GameMap {
  const W=280, H=280, rand=rngOf(5300+f*47)
  const t = blank(W, H, f===1?'snow':'ice')
  // Hexagonal ice fields
  for (let y=0; y<H; y++) for (let x=0; x<W; x++) {
    const hex = (x*2 + (y%2)*1) % 12
    if (hex === 0 && (y%4)===0) t[y][x] = T(f===1?'ice':'ice_rock')
    if ((x+y*3) % 31 === 0) t[y][x] = T(f===1?'frozen_tree':'ice_crystal_node')
  }
  // Crevasses (long deep cracks)
  for (let i=0; i<8; i++) {
    let x1 = 10+Math.floor(rand()*(W-20)), y1 = 10+Math.floor(rand()*(H-20))
    const ang = rand()*Math.PI*2, len = 40+Math.floor(rand()*60)
    for (let s=0; s<len; s++) {
      const x = Math.round(x1+Math.cos(ang)*s), y = Math.round(y1+Math.sin(ang)*s)
      if (x>1&&y>1&&x<W-1&&y<H-1) {
        t[y][x] = T(f===1?'deepwater':'void')
        if (rand()<0.3 && t[y+1]?.[x]) t[y+1][x] = T(f===1?'deepwater':'void')
      }
    }
  }
  // Iceberg discs
  for (let i=0; i<12; i++) {
    const cx=30+Math.floor(rand()*(W-60)), cy=30+Math.floor(rand()*(H-60)), rr=5+Math.floor(rand()*8)
    disc(t, cx, cy, rr, f===1?'ice':'crystal_wall', 1)
    disc(t, cx, cy, Math.max(2, rr-2), f===1?'snow':'crystal_floor', 1)
  }
  border(t, W, H, f===1?'frozen_tree':'crystal_wall')
  path(t, 8, 8, W-9, H-9, f===1?'snow_path':'crystal_floor', 1)
  portalAt(t, 8, 8, 'portal', f===1?'snow':'crystal_floor')
  if (f===1) portalAt(t, W-9, H-9, 'mountain_portal', 'snow')
  const pool: MonsterType[] = f===1?['wolf','spider','skeleton','goblin']:['ghost','witch','troll','dragon']
  const monsters = spawnPack(t, rand, 90+f*25, f===1?9:20, pool, 0.06)
  if (f===2) monsters.push(createMonster('dragon', 34, (W/2)*32, (H/2)*32, 'boss'))
  return { id: `polar${f}`, name: `Tundra Polar — Andar ${f}`, width: W, height: H, tiles: t, monsters,
    spawnPoints: [{x:10*32, y:10*32}], ambience: 'tundra', musicTheme: 'tundra',
    minLevel: f===1?9:20 }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. PÂNTANO VELADO — labirinto de bog com cogumelos gigantes
// ═══════════════════════════════════════════════════════════════════════════════
function genVeiledBog(f: 1 | 2): GameMap {
  const W=260, H=260, rand=rngOf(5400+f*53)
  const t = blank(W, H, f===1?'dirt':'mossy_stone')
  // Bog cells (large overlapping water/mud blobs)
  for (let i=0; i<60; i++) {
    const cx=10+Math.floor(rand()*(W-20)), cy=10+Math.floor(rand()*(H-20)), rr=4+Math.floor(rand()*6)
    disc(t, cx, cy, rr, f===1?'dark_water':'deepwater', 0.85)
  }
  // Mushroom forests
  for (let i=0; i<40; i++) {
    const cx=10+Math.floor(rand()*(W-20)), cy=10+Math.floor(rand()*(H-20)), rr=2+Math.floor(rand()*4)
    disc(t, cx, cy, rr, f===1?'mushroom':'crystal', 0.7)
    if (t[cy]?.[cx]) t[cy][cx] = T(f===1?'tree':'gem_node')
  }
  // Twisted boardwalks (snake paths)
  for (let i=0; i<6; i++) {
    let cx = 15+Math.floor(rand()*(W-30)), cy = 15
    while (cy < H-15) {
      for (let dx=-1; dx<=1; dx++) {
        const x=cx+dx
        if (x>0&&x<W-1&&t[cy]?.[x]) t[cy][x] = T(f===1?'bridge':'ancient_tile')
      }
      cx += Math.floor(rand()*5)-2; cy += 1
    }
  }
  border(t, W, H, f===1?'tree':'ruin_wall')
  portalAt(t, 8, 8, 'portal', f===1?'bridge':'ancient_tile')
  if (f===1) portalAt(t, W-9, H-9, 'haunted_portal', 'mossy_stone')
  const pool: MonsterType[] = f===1?['spider','witch','zombie','treant']:['ghost','demon','troll','witch']
  const monsters = spawnPack(t, rand, 100+f*25, f===1?11:22, pool, 0.07)
  if (f===2) monsters.push(createMonster('vampire', 36, (W/2)*32, (H/2)*32, 'boss'))
  return { id: `mire${f}`, name: `Pântano Velado — Andar ${f}`, width: W, height: H, tiles: t, monsters,
    spawnPoints: [{x:10*32, y:10*32}], ambience: 'swamp', musicTheme: 'swamp',
    minLevel: f===1?11:22 }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. CAVERNA GEODE — câmaras hexagonais de cristal puro
// ═══════════════════════════════════════════════════════════════════════════════
function genGeodeCavern(f: 1 | 2): GameMap {
  const W=240, H=240, rand=rngOf(5500+f*59)
  const t = blank(W, H, f===1?'dungeon_wall':'abyss_wall')
  // Carve hexagonal chambers in a honeycomb pattern
  const hexR = 14
  const stepX = Math.round(hexR*1.7), stepY = Math.round(hexR*1.5)
  for (let row=0; row*stepY < H-15; row++) {
    for (let col=0; col*stepX < W-15; col++) {
      const cx = 15 + col*stepX + (row%2)*Math.floor(stepX/2)
      const cy = 15 + row*stepY
      if (cx >= W-15 || cy >= H-15) continue
      disc(t, cx, cy, hexR-2, f===1?'crystal_floor':'abyss_floor', 1)
      // 6 connectors
      for (let a=0; a<6; a++) {
        const ang = a*Math.PI/3
        const ex = cx + Math.round(Math.cos(ang)*hexR), ey = cy + Math.round(Math.sin(ang)*hexR)
        path(t, cx, cy, ex, ey, f===1?'crystal_floor':'abyss_floor', 1)
      }
      // Center gem
      if (rand() < 0.5) t[cy][cx] = T(f===1?'gem_node':'soul_fire')
    }
  }
  // Scattered crystal clusters
  for (let i=0; i<60; i++) {
    const x = 10+Math.floor(rand()*(W-20)), y = 10+Math.floor(rand()*(H-20))
    if (t[y][x].walkable) t[y][x] = T(f===1?'crystal':'dark_crystal')
  }
  border(t, W, H, f===1?'crystal_wall':'abyss_wall')
  portalAt(t, 20, 20, 'portal', f===1?'crystal_floor':'abyss_floor')
  if (f===1) portalAt(t, W-20, H-20, 'crystal_portal', 'crystal_floor')
  const pool: MonsterType[] = f===1?['skeleton','spider','witch','mage_enemy']:['ghost','demon','dragon','vampire']
  const monsters = spawnPack(t, rand, 120+f*25, f===1?13:24, pool, 0.08)
  if (f===2) monsters.push(createMonster('dragon', 38, (W/2)*32, (H/2)*32, 'boss'))
  return { id: `geode${f}`, name: `Caverna Geode — Andar ${f}`, width: W, height: H, tiles: t, monsters,
    spawnPoints: [{x:20*32, y:20*32}], ambience: 'abyss', musicTheme: 'abyss',
    minLevel: f===1?13:24 }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. NECRÓPOLE — grade ordenada de mausoléus e sepulturas
// ═══════════════════════════════════════════════════════════════════════════════
function genNecropolis(f: 1 | 2): GameMap {
  const W=260, H=260, rand=rngOf(5600+f*61)
  const t = blank(W, H, f===1?'ancient_tile':'ruin_floor')
  // Grid of mausoleums
  const cell = 22
  for (let row=0; row*cell < H-cell; row++) {
    for (let col=0; col*cell < W-cell; col++) {
      const x0 = 10+col*cell, y0 = 10+row*cell
      if (x0>W-12||y0>H-12) continue
      // 8x8 mausoleum
      for (let y=y0; y<y0+8 && y<H-1; y++) for (let x=x0; x<x0+8 && x<W-1; x++) {
        if (y===y0||y===y0+7||x===x0||x===x0+7) t[y][x] = T(f===1?'ruin_wall':'wall')
        else t[y][x] = T(f===1?'ruin_floor':'ancient_tile')
      }
      // Door
      t[y0+7]?.[x0+4] && (t[y0+7][x0+4] = T(f===1?'ruin_floor':'ancient_tile'))
      // Sarcophagus inside
      if (rand()<0.6 && t[y0+3]?.[x0+3]) t[y0+3][x0+3] = T('sarcophagus')
    }
  }
  // Avenue grids
  for (let y=0; y<H; y++) if (y%cell < 2 && y>0) for (let x=1; x<W-1; x++) t[y][x] = T(f===1?'cobblestone':'broken_tile')
  for (let x=0; x<W; x++) if (x%cell < 2 && x>0) for (let y=1; y<H-1; y++) t[y][x] = T(f===1?'cobblestone':'broken_tile')
  // Braziers at intersections
  for (let row=1; row*cell < H-5; row++) for (let col=1; col*cell < W-5; col++) {
    if (rand()<0.3) {
      const x=col*cell, y=row*cell
      if (t[y]?.[x]) t[y][x] = T('ancient_brazier')
    }
  }
  border(t, W, H, f===1?'ruin_wall':'wall')
  portalAt(t, 6, 6, 'portal', f===1?'cobblestone':'broken_tile')
  if (f===1) portalAt(t, W-7, H-7, 'haunted_portal', 'cobblestone')
  const pool: MonsterType[] = f===1?['skeleton','zombie','ghost','witch']:['vampire','demon','ghost','mage_enemy']
  const monsters = spawnPack(t, rand, 110+f*30, f===1?15:26, pool, 0.07)
  if (f===2) monsters.push(createMonster('vampire', 40, (W/2)*32, (H/2)*32, 'boss'))
  return { id: `necropolis${f}`, name: `Necrópole — Andar ${f}`, width: W, height: H, tiles: t, monsters,
    spawnPoints: [{x:6*32, y:6*32}], ambience: 'haunted', musicTheme: 'haunted',
    minLevel: f===1?15:26 }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. VINHEDOS SOMBRIOS — videiras formando labirinto orgânico
// ═══════════════════════════════════════════════════════════════════════════════
function genShadowVineyard(f: 1 | 2): GameMap {
  const W=250, H=250, rand=rngOf(5700+f*67)
  const t = blank(W, H, f===1?'tall_grass':'mossy_stone')
  // Vine walls in flowing curves (sine-based)
  for (let i=0; i<14; i++) {
    const baseY = 10+Math.floor(rand()*(H-20))
    const amp = 8+Math.floor(rand()*16), freq = 0.03+rand()*0.05, phase = rand()*Math.PI*2
    for (let x=2; x<W-2; x++) {
      const y = Math.round(baseY + Math.sin(x*freq+phase)*amp)
      if (y>1&&y<H-1) {
        t[y][x] = T(f===1?'vine_wall':'tree')
        if (t[y+1]?.[x]) t[y+1][x] = T(f===1?'vine_wall':'tree')
      }
    }
  }
  // Grape clusters (flowers)
  for (let i=0; i<80; i++) {
    const x=5+Math.floor(rand()*(W-10)), y=5+Math.floor(rand()*(H-10))
    if (t[y][x].walkable) t[y][x] = T(f===1?'flower':'mushroom')
  }
  // Wine vats / shrines
  for (let i=0; i<8; i++) {
    const cx=20+Math.floor(rand()*(W-40)), cy=20+Math.floor(rand()*(H-40))
    disc(t, cx, cy, 4, f===1?'cobblestone':'broken_tile', 1)
    t[cy][cx] = T(f===1?'fountain':'ancient_brazier')
  }
  border(t, W, H, f===1?'tree':'ruin_wall')
  path(t, 8, 8, W-9, H-9, f===1?'dirt':'ruin_floor', 1)
  portalAt(t, 8, 8, 'portal', f===1?'dirt':'ruin_floor')
  if (f===1) portalAt(t, W-9, H-9, 'haunted_portal', 'dirt')
  const pool: MonsterType[] = f===1?['spider','witch','wolf','treant']:['vampire','ghost','demon','witch']
  const monsters = spawnPack(t, rand, 100+f*30, f===1?17:28, pool, 0.08)
  if (f===2) monsters.push(createMonster('vampire', 42, (W/2)*32, (H/2)*32, 'boss'))
  return { id: `vineyard${f}`, name: `Vinhedos Sombrios — Andar ${f}`, width: W, height: H, tiles: t, monsters,
    spawnPoints: [{x:10*32, y:10*32}], ambience: 'forest', musicTheme: 'forest',
    minLevel: f===1?17:28 }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. FORJA VULCÂNICA — corredores industriais com rios de lava
// ═══════════════════════════════════════════════════════════════════════════════
function genVolcanicForge(f: 1 | 2): GameMap {
  const W=260, H=260, rand=rngOf(5800+f*71)
  const t = blank(W, H, f===1?'obsidian':'magma_crust')
  // Long parallel lava channels
  for (let i=0; i<8; i++) {
    const baseY = 20+i*28
    if (baseY >= H-10) break
    for (let x=10; x<W-10; x++) {
      const off = Math.round(Math.sin(x*0.04)*3)
      for (let w=-2; w<=2; w++) {
        const y = baseY+off+w
        if (t[y]?.[x]) t[y][x] = T('lava')
      }
      // Bridges every 18 tiles
      if (x%18===0) for (let w=-2; w<=2; w++) {
        const y = baseY+off+w
        if (t[y]?.[x]) t[y][x] = T(f===1?'bridge':'volcanic_rock')
      }
    }
  }
  // Forge chambers (large stone rooms)
  for (let i=0; i<10; i++) {
    const cx=20+Math.floor(rand()*(W-40)), cy=20+Math.floor(rand()*(H-40))
    for (let y=cy-5; y<=cy+5; y++) for (let x=cx-7; x<=cx+7; x++) {
      if (t[y]?.[x]) {
        if (Math.abs(x-cx)===7||Math.abs(y-cy)===5) t[y][x] = T(f===1?'volcanic_rock':'wall')
        else t[y][x] = T(f===1?'obsidian':'magma_crust')
      }
    }
    if (t[cy]?.[cx]) t[cy][cx] = T('volcanic_vent')
    // Anvils as braziers
    if (t[cy]?.[cx+2]) t[cy][cx+2] = T('ancient_brazier')
    if (t[cy]?.[cx-2]) t[cy][cx-2] = T('mythril_ore_node')
  }
  border(t, W, H, f===1?'volcanic_rock':'obsidian')
  portalAt(t, 8, 8, 'portal', f===1?'obsidian':'magma_crust')
  if (f===1) portalAt(t, W-9, H-9, 'haunted_portal', 'obsidian')
  const pool: MonsterType[] = f===1?['demon','goblin','orc','troll']:['demon','dragon','witch','vampire']
  const monsters = spawnPack(t, rand, 110+f*30, f===1?19:30, pool, 0.08)
  if (f===2) monsters.push(createMonster('dragon', 44, (W/2)*32, (H/2)*32, 'boss'))
  return { id: `forge${f}`, name: `Forja Vulcânica — Andar ${f}`, width: W, height: H, tiles: t, monsters,
    spawnPoints: [{x:10*32, y:10*32}], ambience: 'volcano', musicTheme: 'volcano',
    minLevel: f===1?19:30 }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 9. TEMPLO CELESTE — plataformas concêntricas no céu
// ═══════════════════════════════════════════════════════════════════════════════
function genCelestialTemple(f: 1 | 2): GameMap {
  const W=240, H=240, rand=rngOf(5900+f*73)
  const t = blank(W, H, 'sky_void')
  const cx = W/2, cy = H/2
  // 5 concentric rings of cloud platform
  for (let r=20; r<=100; r+=20) {
    for (let a=0; a<360; a+=2) {
      const rd=a*Math.PI/180
      for (let w=-5; w<=5; w++) {
        const x=Math.round(cx+Math.cos(rd)*(r+w)), y=Math.round(cy+Math.sin(rd)*(r+w))
        if (x>1&&y>1&&x<W-1&&y<H-1) t[y][x] = T(f===1?'cloud_floor':'sky_platform')
      }
    }
  }
  // Radial bridges connecting rings (8 directions)
  for (let a=0; a<8; a++) {
    const ang = a*Math.PI/4
    for (let r=0; r<=110; r++) {
      for (let w=-1; w<=1; w++) {
        const x=Math.round(cx+Math.cos(ang)*r+w), y=Math.round(cy+Math.sin(ang)*r)
        if (x>1&&y>1&&x<W-1&&y<H-1) t[y][x] = T(f===1?'cloud_floor':'sky_platform')
      }
    }
  }
  // Central temple
  disc(t, Math.floor(cx), Math.floor(cy), 8, f===1?'ancient_tile':'crystal_floor', 1)
  ring(t, Math.floor(cx), Math.floor(cy), 8, f===1?'ruin_pillar':'crystal_wall')
  t[Math.floor(cy)][Math.floor(cx)] = T(f===1?'fountain':'gem_node')
  // Scattered shrine altars on rings
  for (let i=0; i<14; i++) {
    const ang = rand()*Math.PI*2, r=30+Math.floor(rand()*70)
    const x=Math.round(cx+Math.cos(ang)*r), y=Math.round(cy+Math.sin(ang)*r)
    if (t[y]?.[x]) t[y][x] = T(f===1?'ruin_pillar':'crystal_wall')
  }
  portalAt(t, Math.floor(cx)+95, Math.floor(cy), 'portal', f===1?'cloud_floor':'sky_platform')
  if (f===1) portalAt(t, Math.floor(cx), Math.floor(cy)+95, 'sky_portal', 'cloud_floor')
  const pool: MonsterType[] = f===1?['ghost','witch','mage_enemy','knight_enemy']:['demon','dragon','vampire','witch']
  const monsters = spawnPack(t, rand, 90+f*25, f===1?21:32, pool, 0.09)
  if (f===2) monsters.push(createMonster('dragon', 46, Math.floor(cx)*32, Math.floor(cy)*32, 'boss'))
  return { id: `celestial${f}`, name: `Templo Celeste — Andar ${f}`, width: W, height: H, tiles: t, monsters,
    spawnPoints: [{x:Math.floor(cx+95)*32, y:Math.floor(cy)*32}], ambience: 'sky', musicTheme: 'sky',
    minLevel: f===1?21:32 }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 10. BOSQUE DAS RAÍZES — raízes ramificadas que viram corredores
// ═══════════════════════════════════════════════════════════════════════════════
function genRootGrove(f: 1 | 2): GameMap {
  const W=270, H=270, rand=rngOf(6000+f*79)
  const t = blank(W, H, f===1?'tree':'ancient_bark')
  // Branching root corridors (recursive-ish)
  function branch(x: number, y: number, ang: number, len: number, depth: number) {
    if (depth <= 0 || len < 4) return
    for (let s=0; s<len; s++) {
      const nx = Math.round(x+Math.cos(ang)*s), ny = Math.round(y+Math.sin(ang)*s)
      for (let w=-2; w<=2; w++) for (let h=-2; h<=2; h++) {
        const px=nx+w, py=ny+h
        if (px>1&&py>1&&px<W-1&&py<H-1) t[py][px] = T(f===1?'root':'mossy_stone')
      }
    }
    const endX = Math.round(x+Math.cos(ang)*len), endY = Math.round(y+Math.sin(ang)*len)
    branch(endX, endY, ang+0.6+rand()*0.4, len*0.7, depth-1)
    branch(endX, endY, ang-0.6-rand()*0.4, len*0.7, depth-1)
  }
  for (let i=0; i<5; i++) {
    const sx = 20+Math.floor(rand()*(W-40)), sy = 20+Math.floor(rand()*(H-40))
    branch(sx, sy, rand()*Math.PI*2, 30+Math.floor(rand()*30), 5)
  }
  // Clearings with mushrooms
  for (let i=0; i<14; i++) {
    const cx=20+Math.floor(rand()*(W-40)), cy=20+Math.floor(rand()*(H-40))
    disc(t, cx, cy, 6, f===1?'tall_grass':'mossy_stone', 1)
    disc(t, cx, cy, 2, f===1?'mushroom':'gem_node', 1)
  }
  border(t, W, H, f===1?'tree':'ancient_bark')
  portalAt(t, 12, 12, 'portal', f===1?'root':'mossy_stone')
  if (f===1) portalAt(t, W-13, H-13, 'haunted_portal', 'root')
  const pool: MonsterType[] = f===1?['treant','spider','witch','wolf']:['treant','dragon','demon','witch']
  const monsters = spawnPack(t, rand, 110+f*25, f===1?23:34, pool, 0.08)
  if (f===2) monsters.push(createMonster('dragon', 48, (W/2)*32, (H/2)*32, 'boss'))
  return { id: `roots${f}`, name: `Bosque das Raízes — Andar ${f}`, width: W, height: H, tiles: t, monsters,
    spawnPoints: [{x:12*32, y:12*32}], ambience: 'forest', musicTheme: 'forest',
    minLevel: f===1?23:34 }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXTRA DUNGEON FLOORS (dungeon2 .. dungeon6) — 5 novos andares
// ═══════════════════════════════════════════════════════════════════════════════
function genDungeonFloor(floor: number): GameMap {
  // Each floor scales bigger and uses a different topology
  const W = 500 + floor*40, H = 500 + floor*40
  const rand = rngOf(7000 + floor*131)
  const t = blank(W, H, 'dungeon_wall')
  border(t, W, H, 'dungeon_brick')

  const rooms: { x: number; y: number; w: number; h: number }[] = []
  const targetRooms = 80 + floor*20

  // Topology per floor
  if (floor === 2) {
    // Radial layout — rooms in concentric rings
    const cx = W/2, cy = H/2
    for (let ring=0; ring<5; ring++) {
      const r = 30 + ring*40
      const slots = 8 + ring*4
      for (let i=0; i<slots; i++) {
        const ang = (i/slots)*Math.PI*2
        const rx = Math.round(cx+Math.cos(ang)*r), ry = Math.round(cy+Math.sin(ang)*r)
        const w = 10+Math.floor(rand()*8), h = 8+Math.floor(rand()*6)
        rooms.push({x: rx-Math.floor(w/2), y: ry-Math.floor(h/2), w, h})
      }
    }
  } else if (floor === 3) {
    // Grid layout — uniform rooms
    const cell = 28
    for (let gy=1; gy*cell<H-cell; gy++) for (let gx=1; gx*cell<W-cell; gx++) {
      if (rand() < 0.75) rooms.push({x: gx*cell, y: gy*cell, w: 10+Math.floor(rand()*8), h: 8+Math.floor(rand()*6)})
    }
  } else if (floor === 4) {
    // Maze of thin corridors with small chambers
    for (let i=0; i<targetRooms; i++) {
      const w=5+Math.floor(rand()*4), h=5+Math.floor(rand()*4)
      const x=5+Math.floor(rand()*(W-w-10)), y=5+Math.floor(rand()*(H-h-10))
      rooms.push({x,y,w,h})
    }
  } else if (floor === 5) {
    // Organic chambers (varied sizes, clustered)
    for (let cluster=0; cluster<8; cluster++) {
      const cx=40+Math.floor(rand()*(W-80)), cy=40+Math.floor(rand()*(H-80))
      for (let i=0; i<15; i++) {
        const w=8+Math.floor(rand()*18), h=6+Math.floor(rand()*14)
        const x=cx+Math.floor((rand()-0.5)*60), y=cy+Math.floor((rand()-0.5)*60)
        if (x>5&&y>5&&x+w<W-5&&y+h<H-5) rooms.push({x,y,w,h})
      }
    }
  } else {
    // floor 6: massive chambers — boss arena
    for (let i=0; i<12; i++) {
      const w=18+Math.floor(rand()*22), h=14+Math.floor(rand()*18)
      const x=10+Math.floor(rand()*(W-w-20)), y=10+Math.floor(rand()*(H-h-20))
      rooms.push({x,y,w,h})
    }
    for (let i=0; i<60; i++) {
      const w=8+Math.floor(rand()*8), h=6+Math.floor(rand()*6)
      const x=10+Math.floor(rand()*(W-w-20)), y=10+Math.floor(rand()*(H-h-20))
      rooms.push({x,y,w,h})
    }
  }

  // Carve all rooms
  for (const r of rooms) {
    for (let y=r.y; y<r.y+r.h && y<H-1; y++) for (let x=r.x; x<r.x+r.w && x<W-1; x++) {
      if (x>0&&y>0) t[y][x] = T(floor>=5 ? 'dungeon_brick' : 'dungeon_floor')
    }
  }
  // Connect with corridors (sequential + extras)
  for (let i=1; i<rooms.length; i++) {
    const a = rooms[i-1], b = rooms[i]
    const x1 = Math.floor(a.x+a.w/2), y1 = Math.floor(a.y+a.h/2)
    const x2 = Math.floor(b.x+b.w/2), y2 = Math.floor(b.y+b.h/2)
    for (let x=Math.min(x1,x2); x<=Math.max(x1,x2); x++) for (let w=-1; w<=1; w++) {
      if (t[y1+w]?.[x]) t[y1+w][x] = T('dungeon_floor')
    }
    for (let y=Math.min(y1,y2); y<=Math.max(y1,y2); y++) for (let w=-1; w<=1; w++) {
      if (t[y]?.[x2+w]) t[y][x2+w] = T('dungeon_floor')
    }
  }
  // Extra long-range connectors
  for (let i=0; i<rooms.length-15; i+=15) {
    const a=rooms[i], b=rooms[i+15]
    const x1=Math.floor(a.x+a.w/2), y1=Math.floor(a.y+a.h/2)
    const x2=Math.floor(b.x+b.w/2), y2=Math.floor(b.y+b.h/2)
    for (let x=Math.min(x1,x2); x<=Math.max(x1,x2); x++) if (t[y1]?.[x]) t[y1][x] = T('dungeon_floor')
    for (let y=Math.min(y1,y2); y<=Math.max(y1,y2); y++) if (t[y]?.[x2]) t[y][x2] = T('dungeon_floor')
  }

  // Spawn + portal
  const first = rooms[0], last = rooms[rooms.length-1]
  const sx = Math.floor(first.x+first.w/2), sy = Math.floor(first.y+first.h/2)
  const px = Math.floor(last.x+last.w/2), py = Math.floor(last.y+last.h/2)
  for (let dy=-3; dy<=3; dy++) for (let dx=-3; dx<=3; dx++) {
    if (t[sy+dy]?.[sx+dx]) t[sy+dy][sx+dx] = T('dungeon_floor')
    if (t[py+dy]?.[px+dx]) t[py+dy][px+dx] = T('dungeon_floor')
  }
  t[py][px] = T('portal')
  // Treasure chests deep down
  for (let i=0; i<5+floor; i++) {
    const r = rooms[Math.floor(rand()*rooms.length)]
    const cx = Math.floor(r.x+r.w/2), cy = Math.floor(r.y+r.h/2)
    if (t[cy]?.[cx]) t[cy][cx] = T('chest')
  }

  // Monsters — scale lvl with floor
  const baseLvl = 10 + floor*8
  const pool: MonsterType[] = floor<=3
    ? ['skeleton','zombie','orc','knight_enemy','mage_enemy','witch','ghost']
    : ['demon','vampire','witch','mage_enemy','knight_enemy','dragon','ghost','troll']
  const monsters: Monster[] = []
  for (let i=1; i<rooms.length; i++) {
    const r = rooms[i]
    const n = 2 + Math.floor(rand()*4)
    for (let j=0; j<n; j++) {
      const mx = r.x+2+Math.floor(rand()*Math.max(1, r.w-4))
      const my = r.y+2+Math.floor(rand()*Math.max(1, r.h-4))
      const tt = pool[Math.floor(rand()*pool.length)]
      const lvl = baseLvl + Math.floor(rand()*5)
      const tier: EliteTier = rand()<0.04 ? 'elite' : 'normal'
      monsters.push(createMonster(tt, lvl, mx*32, my*32, tier))
    }
  }
  // Champions + boss
  for (let i=0; i<2+floor; i++) {
    const r = rooms[Math.floor(rand()*rooms.length)]
    const tt = pool[Math.floor(rand()*pool.length)]
    monsters.push(createMonster(tt, baseLvl+5, Math.floor(r.x+r.w/2)*32, Math.floor(r.y+r.h/2)*32, 'champion'))
  }
  const bossType: MonsterType = floor>=5 ? 'dragon' : floor>=3 ? 'vampire' : 'demon'
  monsters.push(createMonster(bossType, baseLvl+15, px*32, py*32, 'boss'))

  const names = ['', '', 'Profundezas', 'Câmaras Antigas', 'Labirinto Esquecido', 'Catacumbas Caóticas', 'Trono das Trevas']
  return {
    id: `dungeon${floor}`,
    name: `Masmorra — Andar ${floor} · ${names[floor]||''}`.trim(),
    width: W, height: H, tiles: t, monsters,
    spawnPoints: [{x: sx*32, y: sy*32}],
    ambience: 'dungeon', musicTheme: 'dungeon',
    minLevel: 5 + floor*5,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DISPATCHER + LISTAGEM
// ═══════════════════════════════════════════════════════════════════════════════
const BIOME_FNS: Record<string, (f: 1|2) => GameMap> = {
  coral: genCoralReef,
  canyon: genScarletCanyon,
  polar: genPolarTundra,
  mire: genVeiledBog,
  geode: genGeodeCavern,
  necropolis: genNecropolis,
  vineyard: genShadowVineyard,
  forge: genVolcanicForge,
  celestial: genCelestialTemple,
  roots: genRootGrove,
}

export function generateNewBiome(id: string): GameMap | null {
  for (const key of Object.keys(BIOME_FNS)) {
    if (id === `${key}1`) return BIOME_FNS[key](1)
    if (id === `${key}2`) return BIOME_FNS[key](2)
  }
  // Extra dungeon floors
  const m = id.match(/^dungeon(\d+)$/)
  if (m) {
    const f = parseInt(m[1], 10)
    if (f >= 2 && f <= 6) return genDungeonFloor(f)
  }
  return null
}

export const NEW_BIOMES = [
  { id: 'coral1',       name: 'Recife de Coral',       minLvl: 5,  icon: '🐚', description: 'Praia tropical com atóis vivos' },
  { id: 'coral2',       name: 'Recife · A2',           minLvl: 14, icon: '🌊', description: 'Recife abissal cristalino' },
  { id: 'canyon1',      name: 'Cânion Escarlate',      minLvl: 7,  icon: '🟥', description: 'Mesas e fendas vermelhas' },
  { id: 'canyon2',      name: 'Cânion · A2',           minLvl: 18, icon: '🪨', description: 'Cânion vulcânico fendido' },
  { id: 'polar1',       name: 'Tundra Polar',          minLvl: 9,  icon: '🧊', description: 'Geleira com crevasses' },
  { id: 'polar2',       name: 'Tundra · A2',           minLvl: 20, icon: '❄', description: 'Geleira cristalina abissal' },
  { id: 'mire1',        name: 'Pântano Velado',        minLvl: 11, icon: '🍄', description: 'Bog com cogumelos gigantes' },
  { id: 'mire2',        name: 'Pântano · A2',          minLvl: 22, icon: '🦠', description: 'Pântano ancestral e tóxico' },
  { id: 'geode1',       name: 'Caverna Geode',         minLvl: 13, icon: '💠', description: 'Câmaras hexagonais de gema' },
  { id: 'geode2',       name: 'Geode · A2',            minLvl: 24, icon: '✨', description: 'Coração abissal de cristal' },
  { id: 'necropolis1',  name: 'Necrópole',             minLvl: 15, icon: '⚰', description: 'Cidade dos mortos em grade' },
  { id: 'necropolis2',  name: 'Necrópole · A2',        minLvl: 26, icon: '🪦', description: 'Cripta real profunda' },
  { id: 'vineyard1',    name: 'Vinhedos Sombrios',     minLvl: 17, icon: '🍇', description: 'Videiras labirínticas' },
  { id: 'vineyard2',    name: 'Vinhedos · A2',         minLvl: 28, icon: '🍷', description: 'Sangue de vinha amaldiçoada' },
  { id: 'forge1',       name: 'Forja Vulcânica',       minLvl: 19, icon: '🔨', description: 'Canais de lava e bigornas' },
  { id: 'forge2',       name: 'Forja · A2',            minLvl: 30, icon: '🔥', description: 'Coração da forja' },
  { id: 'celestial1',   name: 'Templo Celeste',        minLvl: 21, icon: '🏛', description: 'Plataformas concêntricas no céu' },
  { id: 'celestial2',   name: 'Templo · A2',           minLvl: 32, icon: '⛩', description: 'Santuário etéreo superior' },
  { id: 'roots1',       name: 'Bosque das Raízes',     minLvl: 23, icon: '🌳', description: 'Raízes ramificadas vivas' },
  { id: 'roots2',       name: 'Raízes · A2',           minLvl: 34, icon: '🌲', description: 'Coração ancestral do bosque' },
] as const

export const EXTRA_DUNGEON_FLOORS = [
  { id: 'dungeon2', name: 'Masmorra · A2 Profundezas',     minLvl: 15, icon: '🏚' },
  { id: 'dungeon3', name: 'Masmorra · A3 Câmaras',         minLvl: 25, icon: '🗝' },
  { id: 'dungeon4', name: 'Masmorra · A4 Labirinto',       minLvl: 35, icon: '🌀' },
  { id: 'dungeon5', name: 'Masmorra · A5 Catacumbas',      minLvl: 45, icon: '☠' },
  { id: 'dungeon6', name: 'Masmorra · A6 Trono Sombrio',   minLvl: 55, icon: '👑' },
] as const
