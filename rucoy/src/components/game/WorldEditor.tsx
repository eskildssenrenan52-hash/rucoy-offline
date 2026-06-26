import { useRef, useEffect, useCallback, useState, useMemo } from 'react'
import type { GameMap, TileType, MonsterType, EditorState, EditorTool, Tile, Vec2 } from '@/lib/game/types'
import { drawTile } from '@/lib/game/sprites'
import { createMonster } from '@/lib/game/data'

const TILE = 32
const MAX_HISTORY = 60
const SLOT_KEY = 'rucoy:editor:slots'

// ─── Tile catalog ─────────────────────────────────────────────────────────

const TILE_GROUPS: { label: string; tiles: { type: TileType; label: string; color: string }[] }[] = [
  {
    label: 'Terreno',
    tiles: [
      { type: 'grass',      label: 'Grama',    color: '#2d5a1b' },
      { type: 'dirt',       label: 'Terra',    color: '#6b4c2a' },
      { type: 'stone',      label: 'Pedra',    color: '#606060' },
      { type: 'sand',       label: 'Areia',    color: '#c8a050' },
      { type: 'snow',       label: 'Neve',     color: '#d0dce8' },
      { type: 'road',       label: 'Estrada',  color: '#5a5048' },
      { type: 'bridge',     label: 'Ponte',    color: '#8a6030' },
      { type: 'cobblestone',label: 'Calçada',  color: '#7a7060' },
    ],
  },
  {
    label: 'Água / Fogo',
    tiles: [
      { type: 'water',      label: 'Água',     color: '#1a4a8a' },
      { type: 'deepwater',  label: 'Profundo', color: '#0a3060' },
      { type: 'lava',       label: 'Lava',     color: '#8a0000' },
    ],
  },
  {
    label: 'Objetos',
    tiles: [
      { type: 'tree',       label: 'Árvore',     color: '#2a5a18' },
      { type: 'rock',       label: 'Rocha',      color: '#505050' },
      { type: 'tall_grass', label: 'Capim Alto', color: '#4a8a28' },
      { type: 'flower',     label: 'Flor',       color: '#e060a0' },
      { type: 'portal',     label: 'Portal',     color: '#6020c0' },
      { type: 'chest',      label: 'Baú',        color: '#a07020' },
      { type: 'fountain',   label: 'Fonte',      color: '#5090c0' },
      { type: 'lamp_post',  label: 'Poste',      color: '#8a7030' },
      { type: 'fence',      label: 'Cerca',      color: '#6b4c2a' },
      { type: 'garden',     label: 'Jardim',     color: '#3a7028' },
    ],
  },
  {
    label: 'Construção',
    tiles: [
      { type: 'wall',         label: 'Parede',     color: '#3a3030' },
      { type: 'floor',        label: 'Piso',       color: '#252220' },
      { type: 'house_wall',   label: 'Casa Pared.',color: '#807060' },
      { type: 'house_roof',   label: 'Telhado',    color: '#9a3020' },
      { type: 'house_door',   label: 'Porta',      color: '#5a3010' },
      { type: 'market_stall', label: 'Barraca',    color: '#c08030' },
    ],
  },
  {
    label: 'Masmorra',
    tiles: [
      { type: 'dungeon_floor', label: 'Piso M.',    color: '#1e1a18' },
      { type: 'dungeon_wall',  label: 'Muro M.',    color: '#151210' },
      { type: 'dungeon_brick', label: 'Tijolo M.',  color: '#201c1a' },
    ],
  },
  {
    label: 'Tundra',
    tiles: [
      { type: 'ice',          label: 'Gelo',        color: '#80c0e8' },
      { type: 'frozen_tree',  label: 'Árv. Cong.',  color: '#a0c8d8' },
      { type: 'ice_rock',     label: 'Rocha Gelo',  color: '#90b8d0' },
      { type: 'snow_rock',    label: 'Rocha Neve', color: '#c8d8e0' },
    ],
  },
  {
    label: 'Vulcão',
    tiles: [
      { type: 'volcanic_rock', label: 'Rocha Vulc.', color: '#4a3028' },
      { type: 'ash',            label: 'Cinza',       color: '#3a3a3a' },
      { type: 'obsidian',       label: 'Obsidiana',   color: '#1a1a2a' },
      { type: 'magma_crust',    label: 'Crosta Mag.', color: '#6a2010' },
      { type: 'volcanic_vent',  label: 'Boca Vulc.',  color: '#8a1000' },
    ],
  },
]

const ALL_TILES = TILE_GROUPS.flatMap(g => g.tiles)

const MONSTER_LIST: { type: MonsterType; label: string; color: string }[] = [
  { type: 'slime', label: 'Slime', color: '#40a040' },
  { type: 'goblin', label: 'Goblin', color: '#80a030' },
  { type: 'skeleton', label: 'Esqueleto', color: '#c0b890' },
  { type: 'zombie', label: 'Zumbi', color: '#607040' },
  { type: 'wolf', label: 'Lobo', color: '#808068' },
  { type: 'spider', label: 'Aranha', color: '#604840' },
  { type: 'orc', label: 'Orc', color: '#508030' },
  { type: 'witch', label: 'Bruxa', color: '#804090' },
  { type: 'troll', label: 'Troll', color: '#506040' },
  { type: 'demon', label: 'Demônio', color: '#c02020' },
  { type: 'knight_enemy', label: 'Cav. Trevas', color: '#406080' },
  { type: 'archer_enemy', label: 'Arq. Sombrio', color: '#406050' },
  { type: 'mage_enemy', label: 'Mago Sombrio', color: '#5030a0' },
  { type: 'dragon', label: 'Dragão', color: '#c04020' },
]

const UNWALKABLE: TileType[] = ['water', 'deepwater', 'wall', 'dungeon_wall', 'dungeon_brick', 'lava', 'tree', 'rock', 'house_wall', 'house_roof', 'fence', 'ice', 'frozen_tree', 'ice_rock', 'volcanic_rock', 'obsidian', 'volcanic_vent']

function makeTile(type: TileType): Tile {
  return { type, walkable: !UNWALKABLE.includes(type), transparent: true }
}

function cloneTiles(tiles: Tile[][]): Tile[][] {
  return tiles.map(row => row.map(t => ({ ...t })))
}

// ─── Editor Tools ──────────────────────────────────────────────────────────

type ExtendedTool = EditorTool | 'line' | 'rect' | 'rect_fill' | 'circle'

const TOOLS: { id: ExtendedTool; label: string; icon: string; hotkey: string; desc: string }[] = [
  { id: 'paint',      label: 'Pincel',    icon: '✎', hotkey: 'B', desc: 'Pintar tile (clique e arraste)' },
  { id: 'erase',      label: 'Borracha',  icon: '⌫', hotkey: 'E', desc: 'Substitui por grama' },
  { id: 'fill',       label: 'Balde',     icon: '⬛', hotkey: 'G', desc: 'Flood fill' },
  { id: 'line',       label: 'Linha',     icon: '╱',  hotkey: 'L', desc: 'Arraste para desenhar uma linha' },
  { id: 'rect',       label: 'Retân.',    icon: '▢',  hotkey: 'R', desc: 'Retângulo (contorno)' },
  { id: 'rect_fill',  label: 'Retân. ▣',  icon: '▣',  hotkey: 'F', desc: 'Retângulo preenchido' },
  { id: 'circle',     label: 'Círculo',   icon: '○',  hotkey: 'O', desc: 'Círculo preenchido' },
  { id: 'eyedropper', label: 'Conta-gotas', icon: '◉', hotkey: 'I', desc: 'Pegar tile do mapa' },
  { id: 'spawn',      label: 'Spawn',     icon: '★',  hotkey: 'S', desc: 'Marca ponto de respawn' },
  { id: 'monster',    label: 'Monstro',   icon: '👹', hotkey: 'M', desc: 'Coloca monstro (Shift+click para remover)' },
  { id: 'select',     label: 'Seleção',   icon: '⛶',  hotkey: 'V', desc: 'Selecionar região (Ctrl+C copia, Ctrl+V cola)' },
]

interface Props {
  map: GameMap
  editorState: EditorState
  onEditorStateChange: (s: EditorState) => void
  onMapChange: (m: GameMap) => void
  onClose: () => void
}

// ─── Drawing helpers ───────────────────────────────────────────────────────

function plotLine(x0: number, y0: number, x1: number, y1: number): Vec2[] {
  const pts: Vec2[] = []
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0)
  const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1
  let err = dx + dy, x = x0, y = y0
  while (true) {
    pts.push({ x, y })
    if (x === x1 && y === y1) break
    const e2 = 2 * err
    if (e2 >= dy) { err += dy; x += sx }
    if (e2 <= dx) { err += dx; y += sy }
  }
  return pts
}

function plotRect(x0: number, y0: number, x1: number, y1: number, filled: boolean): Vec2[] {
  const pts: Vec2[] = []
  const ax = Math.min(x0, x1), bx = Math.max(x0, x1)
  const ay = Math.min(y0, y1), by = Math.max(y0, y1)
  for (let y = ay; y <= by; y++) for (let x = ax; x <= bx; x++) {
    if (filled || x === ax || x === bx || y === ay || y === by) pts.push({ x, y })
  }
  return pts
}

function plotCircle(cx: number, cy: number, r: number): Vec2[] {
  const pts: Vec2[] = []
  const r2 = r * r
  for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) {
    if (x * x + y * y <= r2) pts.push({ x: cx + x, y: cy + y })
  }
  return pts
}

function floodFill(tiles: Tile[][], x: number, y: number, target: TileType, replacement: TileType): Vec2[] {
  if (target === replacement) return []
  const w = tiles[0]?.length ?? 0
  const h = tiles.length
  const seen = new Uint8Array(w * h)
  const visited: Vec2[] = []
  const stack: Vec2[] = [{ x, y }]
  while (stack.length) {
    const p = stack.pop()!
    if (p.x < 0 || p.y < 0 || p.x >= w || p.y >= h) continue
    const idx = p.y * w + p.x
    if (seen[idx]) continue
    if (tiles[p.y][p.x].type !== target) continue
    seen[idx] = 1
    visited.push(p)
    if (visited.length > 20000) break
    stack.push({ x: p.x + 1, y: p.y }, { x: p.x - 1, y: p.y }, { x: p.x, y: p.y + 1 }, { x: p.x, y: p.y - 1 })
  }
  return visited
}

// Mirror cells around the map center on X / Y axes
function mirrorCells(cells: Vec2[], w: number, h: number, mx: boolean, my: boolean): Vec2[] {
  if (!mx && !my) return cells
  const out: Vec2[] = []
  const seen = new Set<number>()
  const push = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return
    const k = y * w + x
    if (seen.has(k)) return
    seen.add(k)
    out.push({ x, y })
  }
  for (const c of cells) {
    push(c.x, c.y)
    if (mx) push(w - 1 - c.x, c.y)
    if (my) push(c.x, h - 1 - c.y)
    if (mx && my) push(w - 1 - c.x, h - 1 - c.y)
  }
  return out
}

// ─── localStorage slot helpers ─────────────────────────────────────────────

interface SlotEntry {
  name: string
  ts: number
  data: {
    width: number
    height: number
    tiles: TileType[][]
    monsters: { type: MonsterType; level: number; position: Vec2 }[]
    spawnPoints: Vec2[]
  }
}

function readSlots(): Record<string, SlotEntry> {
  try { return JSON.parse(localStorage.getItem(SLOT_KEY) || '{}') } catch { return {} }
}
function writeSlots(s: Record<string, SlotEntry>) {
  try { localStorage.setItem(SLOT_KEY, JSON.stringify(s)) } catch (e) { console.warn('slot save failed', e) }
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function WorldEditor({ map, editorState, onEditorStateChange, onMapChange, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const minimapRef = useRef<HTMLCanvasElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)

  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState<Vec2>({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const panStart = useRef<Vec2>({ x: 0, y: 0 })
  const panOrigin = useRef<Vec2>({ x: 0, y: 0 })

  const [isDrawing, setIsDrawing] = useState(false)
  const [drawStart, setDrawStart] = useState<Vec2 | null>(null)
  const [hoverTile, setHoverTile] = useState<Vec2 | null>(null)

  // Panel collapse for narrow screens
  const [leftOpen, setLeftOpen] = useState(true)
  const [rightOpen, setRightOpen] = useState(true)

  // Quality-of-life additions
  const [tileQuery, setTileQuery] = useState('')
  const [recentTiles, setRecentTiles] = useState<TileType[]>([])
  const [mirrorX, setMirrorX] = useState(false)
  const [mirrorY, setMirrorY] = useState(false)
  const [scatter, setScatter] = useState(100) // % chance to paint a cell
  const [showMinimap, setShowMinimap] = useState(true)
  const [statusMsg, setStatusMsg] = useState<string>('')
  const statusTimer = useRef<number | null>(null)

  const flash = useCallback((msg: string) => {
    setStatusMsg(msg)
    if (statusTimer.current) window.clearTimeout(statusTimer.current)
    statusTimer.current = window.setTimeout(() => setStatusMsg(''), 1800)
  }, [])

  // Clipboard for select tool
  const clipboardRef = useRef<{ tiles: Tile[][]; w: number; h: number } | null>(null)

  const st = editorState
  const update = (patch: Partial<EditorState>) => onEditorStateChange({ ...st, ...patch })

  // Auto-track recent tiles
  useEffect(() => {
    setRecentTiles(prev => {
      const next = [st.selectedTile, ...prev.filter(t => t !== st.selectedTile)].slice(0, 8)
      return next
    })
  }, [st.selectedTile])

  // ── History (undo/redo) ──────────────────────────────────────────────────

  const pushHistory = useCallback((tiles: Tile[][]) => {
    const truncated = st.history.slice(0, st.historyIndex + 1)
    truncated.push(cloneTiles(tiles))
    if (truncated.length > MAX_HISTORY) truncated.shift()
    onEditorStateChange({ ...st, history: truncated, historyIndex: truncated.length - 1 })
  }, [st, onEditorStateChange])

  const undo = useCallback(() => {
    if (st.historyIndex <= 0) return
    const idx = st.historyIndex - 1
    const tiles = cloneTiles(st.history[idx])
    onMapChange({ ...map, tiles })
    onEditorStateChange({ ...st, historyIndex: idx })
    flash('Desfeito')
  }, [st, map, onMapChange, onEditorStateChange, flash])

  const redo = useCallback(() => {
    if (st.historyIndex >= st.history.length - 1) return
    const idx = st.historyIndex + 1
    const tiles = cloneTiles(st.history[idx])
    onMapChange({ ...map, tiles })
    onEditorStateChange({ ...st, historyIndex: idx })
    flash('Refeito')
  }, [st, map, onMapChange, onEditorStateChange, flash])

  // ── Apply paint to a list of cells ──────────────────────────────────────

  const applyCells = useCallback((cells: Vec2[], tileType: TileType, snapshot = true) => {
    if (cells.length === 0) return
    // Mirror
    let final = mirrorCells(cells, map.width, map.height, mirrorX, mirrorY)
    // Scatter
    if (scatter < 100) {
      const p = scatter / 100
      final = final.filter(() => Math.random() < p)
    }
    if (final.length === 0) return
    const tiles = cloneTiles(map.tiles)
    let changed = false
    for (const { x, y } of final) {
      if (x < 0 || y < 0 || x >= map.width || y >= map.height) continue
      if (tiles[y][x].type !== tileType) {
        tiles[y][x] = makeTile(tileType)
        changed = true
      }
    }
    if (!changed) return
    onMapChange({ ...map, tiles })
    if (snapshot) pushHistory(tiles)
  }, [map, onMapChange, pushHistory, mirrorX, mirrorY, scatter])

  const brushCells = (cx: number, cy: number): Vec2[] => {
    const r = Math.max(0, st.brushSize - 1)
    if (r === 0) return [{ x: cx, y: cy }]
    return plotCircle(cx, cy, r)
  }

  // ── Layout sizes ─────────────────────────────────────────────────────────

  const leftWidth = leftOpen ? 280 : 28
  const rightWidth = rightOpen ? 220 : 28

  // ── Render canvas ────────────────────────────────────────────────────────

  const render = useCallback(() => {
    const canvas = canvasRef.current
    const body = bodyRef.current
    if (!canvas || !body) return
    const w = body.clientWidth - leftWidth - rightWidth
    const h = body.clientHeight
    if (canvas.width !== w) canvas.width = Math.max(50, w)
    if (canvas.height !== h) canvas.height = Math.max(50, h)
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#080a0e'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.save()
    ctx.translate(pan.x, pan.y)
    ctx.scale(zoom, zoom)

    const startX = Math.max(0, Math.floor(-pan.x / zoom / TILE))
    const startY = Math.max(0, Math.floor(-pan.y / zoom / TILE))
    const endX = Math.min(map.width, Math.ceil((canvas.width - pan.x) / zoom / TILE) + 1)
    const endY = Math.min(map.height, Math.ceil((canvas.height - pan.y) / zoom / TILE) + 1)

    for (let ty = startY; ty < endY; ty++) {
      for (let tx = startX; tx < endX; tx++) {
        const tile = map.tiles[ty]?.[tx]
        if (!tile) continue
        drawTile(ctx, tile.type, tx * TILE, ty * TILE, 0)
        if (st.showCollisions && !tile.walkable) {
          ctx.fillStyle = 'rgba(255,0,0,0.25)'
          ctx.fillRect(tx * TILE, ty * TILE, TILE, TILE)
        }
      }
    }

    if (st.showGrid) {
      ctx.strokeStyle = 'rgba(255,255,255,0.08)'
      ctx.lineWidth = 1 / zoom
      for (let tx = startX; tx <= endX; tx++) {
        ctx.beginPath()
        ctx.moveTo(tx * TILE, startY * TILE)
        ctx.lineTo(tx * TILE, endY * TILE)
        ctx.stroke()
      }
      for (let ty = startY; ty <= endY; ty++) {
        ctx.beginPath()
        ctx.moveTo(startX * TILE, ty * TILE)
        ctx.lineTo(endX * TILE, ty * TILE)
        ctx.stroke()
      }
    }

    if (st.showMonsters) {
      for (const m of map.monsters) {
        const info = MONSTER_LIST.find(x => x.type === m.type)
        ctx.fillStyle = info?.color ?? '#c02020'
        ctx.globalAlpha = 0.8
        ctx.fillRect(m.position.x, m.position.y, 32, 32)
        ctx.globalAlpha = 1
        ctx.strokeStyle = '#000'
        ctx.lineWidth = 1
        ctx.strokeRect(m.position.x, m.position.y, 32, 32)
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 10px monospace'
        ctx.fillText(`L${m.level}`, m.position.x + 2, m.position.y + 12)
      }
    }

    if (st.showSpawns) {
      for (const sp of map.spawnPoints) {
        ctx.fillStyle = 'rgba(64, 255, 128, 0.7)'
        ctx.beginPath()
        ctx.arc(sp.x + 16, sp.y + 16, 10, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#000'
        ctx.font = 'bold 12px monospace'
        ctx.textAlign = 'center'
        ctx.fillText('★', sp.x + 16, sp.y + 21)
        ctx.textAlign = 'left'
      }
    }

    // Map bounds
    ctx.strokeStyle = '#c9952a'
    ctx.lineWidth = 2 / zoom
    ctx.strokeRect(0, 0, map.width * TILE, map.height * TILE)

    // Mirror axes
    if (mirrorX) {
      ctx.strokeStyle = 'rgba(64,200,255,0.5)'
      ctx.lineWidth = 1 / zoom
      ctx.setLineDash([6 / zoom, 4 / zoom])
      const mx = (map.width / 2) * TILE
      ctx.beginPath(); ctx.moveTo(mx, 0); ctx.lineTo(mx, map.height * TILE); ctx.stroke()
      ctx.setLineDash([])
    }
    if (mirrorY) {
      ctx.strokeStyle = 'rgba(64,200,255,0.5)'
      ctx.lineWidth = 1 / zoom
      ctx.setLineDash([6 / zoom, 4 / zoom])
      const my = (map.height / 2) * TILE
      ctx.beginPath(); ctx.moveTo(0, my); ctx.lineTo(map.width * TILE, my); ctx.stroke()
      ctx.setLineDash([])
    }

    // Hover preview
    if (hoverTile && !isPanning) {
      const baseCells: Vec2[] =
        st.activeTool === 'paint' || st.activeTool === 'erase'
          ? brushCells(hoverTile.x, hoverTile.y)
          : (isDrawing && drawStart && (st.activeTool === 'line'))
              ? plotLine(drawStart.x, drawStart.y, hoverTile.x, hoverTile.y)
          : (isDrawing && drawStart && (st.activeTool === 'rect'))
              ? plotRect(drawStart.x, drawStart.y, hoverTile.x, hoverTile.y, false)
          : (isDrawing && drawStart && (st.activeTool === 'rect_fill'))
              ? plotRect(drawStart.x, drawStart.y, hoverTile.x, hoverTile.y, true)
          : (isDrawing && drawStart && (st.activeTool === 'circle'))
              ? plotCircle(drawStart.x, drawStart.y, Math.round(Math.hypot(hoverTile.x - drawStart.x, hoverTile.y - drawStart.y)))
          : (isDrawing && drawStart && (st.activeTool === 'select'))
              ? plotRect(drawStart.x, drawStart.y, hoverTile.x, hoverTile.y, false)
          : [hoverTile]

      const preview = (st.activeTool === 'paint' || st.activeTool === 'erase' || st.activeTool === 'fill')
        ? mirrorCells(baseCells, map.width, map.height, mirrorX, mirrorY)
        : baseCells

      ctx.fillStyle = st.activeTool === 'select' ? 'rgba(64,200,255,0.35)' : 'rgba(255,255,255,0.25)'
      ctx.strokeStyle = st.activeTool === 'select' ? '#40c8ff' : '#ffffff'
      ctx.lineWidth = 1 / zoom
      for (const c of preview) {
        if (c.x < 0 || c.y < 0 || c.x >= map.width || c.y >= map.height) continue
        ctx.fillRect(c.x * TILE, c.y * TILE, TILE, TILE)
      }
    }

    if (st.selectionStart && st.selectionEnd) {
      const ax = Math.min(st.selectionStart.x, st.selectionEnd.x)
      const bx = Math.max(st.selectionStart.x, st.selectionEnd.x)
      const ay = Math.min(st.selectionStart.y, st.selectionEnd.y)
      const by = Math.max(st.selectionStart.y, st.selectionEnd.y)
      ctx.strokeStyle = '#40c8ff'
      ctx.lineWidth = 2 / zoom
      ctx.setLineDash([6 / zoom, 4 / zoom])
      ctx.strokeRect(ax * TILE, ay * TILE, (bx - ax + 1) * TILE, (by - ay + 1) * TILE)
      ctx.setLineDash([])
    }

    ctx.restore()

    // Minimap (on top of canvas)
    if (showMinimap) {
      const MM_MAX = 140
      const aspect = map.width / map.height
      const mmw = aspect >= 1 ? MM_MAX : Math.round(MM_MAX * aspect)
      const mmh = aspect >= 1 ? Math.round(MM_MAX / aspect) : MM_MAX
      const mx = canvas.width - mmw - 10
      const my = 10
      ctx.fillStyle = 'rgba(0,0,0,0.7)'
      ctx.fillRect(mx - 2, my - 2, mmw + 4, mmh + 4)
      ctx.strokeStyle = '#2a3860'
      ctx.lineWidth = 1
      ctx.strokeRect(mx - 2, my - 2, mmw + 4, mmh + 4)
      const sx = mmw / map.width
      const sy = mmh / map.height
      // Draw downsampled tiles
      const stepX = Math.max(1, Math.floor(map.width / mmw))
      const stepY = Math.max(1, Math.floor(map.height / mmh))
      for (let ty = 0; ty < map.height; ty += stepY) {
        for (let tx = 0; tx < map.width; tx += stepX) {
          const tile = map.tiles[ty]?.[tx]
          if (!tile) continue
          const info = ALL_TILES.find(t => t.type === tile.type)
          ctx.fillStyle = info?.color ?? '#000'
          ctx.fillRect(mx + tx * sx, my + ty * sy, Math.max(1, stepX * sx), Math.max(1, stepY * sy))
        }
      }
      // Viewport rect
      const vx = mx + (-pan.x / zoom / TILE) * sx
      const vy = my + (-pan.y / zoom / TILE) * sy
      const vw = (canvas.width / zoom / TILE) * sx
      const vh = (canvas.height / zoom / TILE) * sy
      ctx.strokeStyle = '#f0c040'
      ctx.lineWidth = 1.5
      ctx.strokeRect(vx, vy, vw, vh)
    }
  }, [map, st, pan, zoom, hoverTile, isPanning, isDrawing, drawStart, leftWidth, rightWidth, mirrorX, mirrorY, showMinimap])

  useEffect(() => { render() }, [render])

  useEffect(() => {
    const ro = new ResizeObserver(() => render())
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [render])

  useEffect(() => {
    if (st.history.length === 0) {
      onEditorStateChange({ ...st, history: [cloneTiles(map.tiles)], historyIndex: 0 })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Pointer math ─────────────────────────────────────────────────────────

  const toTile = (e: React.MouseEvent<HTMLCanvasElement>): Vec2 => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const px = (e.clientX - rect.left - pan.x) / zoom
    const py = (e.clientY - rect.top - pan.y) / zoom
    return { x: Math.floor(px / TILE), y: Math.floor(py / TILE) }
  }

  // Detect click on minimap; jump pan
  const minimapHit = (e: React.MouseEvent<HTMLCanvasElement>): Vec2 | null => {
    if (!showMinimap) return null
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const MM_MAX = 140
    const aspect = map.width / map.height
    const mmw = aspect >= 1 ? MM_MAX : Math.round(MM_MAX * aspect)
    const mmh = aspect >= 1 ? Math.round(MM_MAX / aspect) : MM_MAX
    const mx = canvas.width - mmw - 10
    const my = 10
    if (x < mx - 2 || x > mx + mmw + 2 || y < my - 2 || y > my + mmh + 2) return null
    const tx = ((x - mx) / mmw) * map.width
    const ty = ((y - my) / mmh) * map.height
    return { x: tx, y: ty }
  }

  // ── Zoom helpers ─────────────────────────────────────────────────────────

  const fitToScreen = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const z = Math.min(canvas.width / (map.width * TILE), canvas.height / (map.height * TILE)) * 0.96
    setZoom(Math.max(0.1, z))
    setPan({
      x: (canvas.width - map.width * TILE * z) / 2,
      y: (canvas.height - map.height * TILE * z) / 2,
    })
  }, [map.width, map.height])

  const resetZoom = useCallback(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [])

  // ── Pointer events ───────────────────────────────────────────────────────

  const handleDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Minimap navigation has priority
    const mm = minimapHit(e)
    if (mm) {
      const canvas = canvasRef.current!
      setPan({
        x: canvas.width / 2 - mm.x * TILE * zoom,
        y: canvas.height / 2 - mm.y * TILE * zoom,
      })
      return
    }

    if (e.button === 1 || (e.button === 0 && e.altKey) || e.button === 2) {
      setIsPanning(true)
      panStart.current = { x: e.clientX, y: e.clientY }
      panOrigin.current = { ...pan }
      e.preventDefault()
      return
    }
    if (e.button !== 0) return
    const t = toTile(e)
    if (t.x < 0 || t.y < 0 || t.x >= map.width || t.y >= map.height) return

    const tool = st.activeTool as ExtendedTool

    if (tool === 'eyedropper') {
      const tile = map.tiles[t.y][t.x]
      update({ selectedTile: tile.type, activeTool: 'paint' })
      flash(`Tile pego: ${tile.type}`)
      return
    }

    if (tool === 'spawn') {
      onMapChange({ ...map, spawnPoints: [...map.spawnPoints, { x: t.x * TILE, y: t.y * TILE }] })
      return
    }

    if (tool === 'monster') {
      if (e.shiftKey) {
        onMapChange({
          ...map,
          monsters: map.monsters.filter(m => !(Math.floor(m.position.x / TILE) === t.x && Math.floor(m.position.y / TILE) === t.y)),
        })
      } else {
        const mob = createMonster(st.selectedMonsterType, st.selectedMonsterLevel, t.x * TILE, t.y * TILE)
        onMapChange({ ...map, monsters: [...map.monsters, mob] })
      }
      return
    }

    if (tool === 'fill') {
      const target = map.tiles[t.y][t.x].type
      const cells = floodFill(map.tiles, t.x, t.y, target, st.selectedTile)
      applyCells(cells, st.selectedTile)
      return
    }

    if (tool === 'paint' || tool === 'erase') {
      const tileType = tool === 'erase' ? 'grass' : st.selectedTile
      setIsDrawing(true)
      setDrawStart(t)
      applyCells(brushCells(t.x, t.y), tileType, false)
      return
    }

    if (tool === 'line' || tool === 'rect' || tool === 'rect_fill' || tool === 'circle' || tool === 'select') {
      setIsDrawing(true)
      setDrawStart(t)
      if (tool === 'select') update({ selectionStart: t, selectionEnd: t })
      return
    }
  }

  const handleMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      setPan({
        x: panOrigin.current.x + (e.clientX - panStart.current.x),
        y: panOrigin.current.y + (e.clientY - panStart.current.y),
      })
      return
    }
    const t = toTile(e)
    setHoverTile(t)

    if (!isDrawing || !drawStart) return
    const tool = st.activeTool as ExtendedTool
    if (tool === 'paint' || tool === 'erase') {
      const tileType = tool === 'erase' ? 'grass' : st.selectedTile
      const cells: Vec2[] = []
      for (const p of plotLine(drawStart.x, drawStart.y, t.x, t.y)) {
        for (const c of brushCells(p.x, p.y)) cells.push(c)
      }
      applyCells(cells, tileType, false)
      setDrawStart(t)
    }
    if (tool === 'select') update({ selectionEnd: t })
  }

  const handleUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) { setIsPanning(false); return }
    if (!isDrawing || !drawStart) return
    const t = toTile(e)
    const tool = st.activeTool as ExtendedTool

    if (tool === 'paint' || tool === 'erase') {
      pushHistory(map.tiles)
    } else if (tool === 'line') {
      applyCells(plotLine(drawStart.x, drawStart.y, t.x, t.y), st.selectedTile)
    } else if (tool === 'rect') {
      applyCells(plotRect(drawStart.x, drawStart.y, t.x, t.y, false), st.selectedTile)
    } else if (tool === 'rect_fill') {
      applyCells(plotRect(drawStart.x, drawStart.y, t.x, t.y, true), st.selectedTile)
    } else if (tool === 'circle') {
      const r = Math.round(Math.hypot(t.x - drawStart.x, t.y - drawStart.y))
      applyCells(plotCircle(drawStart.x, drawStart.y, r), st.selectedTile)
    }
    setIsDrawing(false)
    setDrawStart(null)
  }

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const next = Math.min(8, Math.max(0.1, zoom * (e.deltaY < 0 ? 1.15 : 1 / 1.15)))
    const ratio = next / zoom
    setPan({ x: mx - (mx - pan.x) * ratio, y: my - (my - pan.y) * ratio })
    setZoom(next)
  }

  // ── Keyboard shortcuts ───────────────────────────────────────────────────

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      const k = e.key.toLowerCase()
      if ((e.ctrlKey || e.metaKey) && k === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); return }
      if ((e.ctrlKey || e.metaKey) && k === 'y') { e.preventDefault(); redo(); return }
      if ((e.ctrlKey || e.metaKey) && k === 'c' && st.selectionStart && st.selectionEnd) {
        const ax = Math.min(st.selectionStart.x, st.selectionEnd.x)
        const bx = Math.max(st.selectionStart.x, st.selectionEnd.x)
        const ay = Math.min(st.selectionStart.y, st.selectionEnd.y)
        const by = Math.max(st.selectionStart.y, st.selectionEnd.y)
        const grid: Tile[][] = []
        for (let y = ay; y <= by; y++) {
          const row: Tile[] = []
          for (let x = ax; x <= bx; x++) row.push({ ...map.tiles[y][x] })
          grid.push(row)
        }
        clipboardRef.current = { tiles: grid, w: bx - ax + 1, h: by - ay + 1 }
        flash(`Copiado ${grid[0].length}×${grid.length}`)
        return
      }
      if ((e.ctrlKey || e.metaKey) && k === 'v' && clipboardRef.current && hoverTile) {
        const cb = clipboardRef.current
        const tiles = cloneTiles(map.tiles)
        for (let y = 0; y < cb.h; y++) for (let x = 0; x < cb.w; x++) {
          const tx = hoverTile.x + x, ty = hoverTile.y + y
          if (tx < 0 || ty < 0 || tx >= map.width || ty >= map.height) continue
          tiles[ty][tx] = { ...cb.tiles[y][x] }
        }
        onMapChange({ ...map, tiles })
        pushHistory(tiles)
        flash('Colado')
        return
      }
      if (e.key === 'Escape') { onClose(); return }
      if (k === 'f' && !e.ctrlKey && !e.metaKey && !e.shiftKey) { e.preventDefault(); fitToScreen(); flash('Ajustado à tela'); return }
      if (k === '0' && !e.ctrlKey) { resetZoom(); flash('Zoom 100%'); return }
      const tool = TOOLS.find(t => t.hotkey.toLowerCase() === k)
      if (tool) update({ activeTool: tool.id as EditorTool })
      if (k === '[') update({ brushSize: Math.max(1, st.brushSize - 1) })
      if (k === ']') update({ brushSize: Math.min(10, st.brushSize + 1) })
      if (k === 'tab') { e.preventDefault(); setLeftOpen(o => !o) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [st, map, hoverTile, undo, redo, onMapChange, pushHistory, onClose, fitToScreen, resetZoom])

  // ── Export / Import / Resize / Slots ────────────────────────────────────

  const exportMap = () => {
    const data = JSON.stringify({
      id: map.id, name: map.name, width: map.width, height: map.height,
      tiles: map.tiles.map(row => row.map(t => t.type)),
      monsters: map.monsters.map(m => ({ type: m.type, level: m.level, position: m.position })),
      spawnPoints: map.spawnPoints,
    }, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${map.id}.json`; a.click()
    URL.revokeObjectURL(url)
    flash('Exportado')
  }

  const importMap = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result))
        const tiles: Tile[][] = data.tiles.map((row: TileType[]) => row.map((t: TileType) => makeTile(t)))
        const monsters = (data.monsters || []).map((m: { type: MonsterType; level: number; position: Vec2 }) =>
          createMonster(m.type, m.level, m.position.x, m.position.y))
        onMapChange({ ...map, name: data.name ?? map.name, width: data.width, height: data.height, tiles, monsters, spawnPoints: data.spawnPoints ?? [] })
        pushHistory(tiles)
        flash('Importado')
      } catch (err) { alert('JSON inválido: ' + (err as Error).message) }
    }
    reader.readAsText(file)
  }

  const resizeMap = (newW: number, newH: number) => {
    const tiles: Tile[][] = []
    for (let y = 0; y < newH; y++) {
      const row: Tile[] = []
      for (let x = 0; x < newW; x++) {
        row.push(map.tiles[y]?.[x] ? { ...map.tiles[y][x] } : makeTile('grass'))
      }
      tiles.push(row)
    }
    onMapChange({ ...map, width: newW, height: newH, tiles })
    pushHistory(tiles)
  }

  const clearSelection = () => update({ selectionStart: null, selectionEnd: null })

  const fillSelection = () => {
    if (!st.selectionStart || !st.selectionEnd) return
    const cells = plotRect(st.selectionStart.x, st.selectionStart.y, st.selectionEnd.x, st.selectionEnd.y, true)
    applyCells(cells, st.selectedTile)
  }

  const clearSelectionTiles = () => {
    if (!st.selectionStart || !st.selectionEnd) return
    const cells = plotRect(st.selectionStart.x, st.selectionStart.y, st.selectionEnd.x, st.selectionEnd.y, true)
    applyCells(cells, 'grass')
  }

  // Slots
  const [slots, setSlots] = useState<Record<string, SlotEntry>>(() => readSlots())
  const saveSlot = (slot: string) => {
    const all = readSlots()
    all[slot] = {
      name: map.name,
      ts: Date.now(),
      data: {
        width: map.width,
        height: map.height,
        tiles: map.tiles.map(row => row.map(t => t.type)),
        monsters: map.monsters.map(m => ({ type: m.type, level: m.level, position: m.position })),
        spawnPoints: map.spawnPoints,
      },
    }
    writeSlots(all)
    setSlots(all)
    flash(`Salvo no slot ${slot}`)
  }
  const loadSlot = (slot: string) => {
    const entry = slots[slot]
    if (!entry) return
    const tiles: Tile[][] = entry.data.tiles.map(row => row.map(t => makeTile(t)))
    const monsters = entry.data.monsters.map(m => createMonster(m.type, m.level, m.position.x, m.position.y))
    onMapChange({ ...map, name: entry.name, width: entry.data.width, height: entry.data.height, tiles, monsters, spawnPoints: entry.data.spawnPoints })
    pushHistory(tiles)
    flash(`Carregado slot ${slot}`)
  }
  const deleteSlot = (slot: string) => {
    const all = readSlots()
    delete all[slot]
    writeSlots(all)
    setSlots(all)
  }

  // ── Render UI ────────────────────────────────────────────────────────────

  const selectedTileInfo = useMemo(() => ALL_TILES.find(t => t.type === st.selectedTile), [st.selectedTile])

  const filteredGroups = useMemo(() => {
    const q = tileQuery.trim().toLowerCase()
    if (!q) return TILE_GROUPS
    return TILE_GROUPS
      .map(g => ({ ...g, tiles: g.tiles.filter(t => t.label.toLowerCase().includes(q) || t.type.toLowerCase().includes(q)) }))
      .filter(g => g.tiles.length > 0)
  }, [tileQuery])

  const monsterCount = map.monsters.length
  const spawnCount = map.spawnPoints.length

  return (
    <div ref={containerRef} className="absolute inset-0" style={{ background: '#06070b', color: '#c8c0b0', fontFamily: 'monospace', zIndex: 100, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ height: 46, display: 'flex', alignItems: 'center', padding: '0 12px', background: 'linear-gradient(180deg,#0c1220,#070a12)', borderBottom: '2px solid #2a3860', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 800, color: '#c9952a', letterSpacing: 2, fontSize: 12, textShadow: '0 0 6px rgba(201,149,42,0.5)' }}>⚒ EDITOR</span>
        <input
          value={map.name}
          onChange={(e) => onMapChange({ ...map, name: e.target.value })}
          style={{ background: '#0a0e16', border: '1px solid #2a3860', color: '#e8d9b5', padding: '4px 8px', fontSize: 12, borderRadius: 3, width: 160 }}
        />
        <span style={{ color: '#5a7a9a', fontSize: 10 }}>{map.width}×{map.height} · 👹{monsterCount} · ★{spawnCount}</span>

        <div style={{ flex: 1 }} />

        <button onClick={undo} disabled={st.historyIndex <= 0} title="Desfazer (Ctrl+Z)" style={btnStyle(st.historyIndex > 0)}>↶</button>
        <button onClick={redo} disabled={st.historyIndex >= st.history.length - 1} title="Refazer (Ctrl+Y)" style={btnStyle(st.historyIndex < st.history.length - 1)}>↷</button>
        <span style={{ width: 1, height: 20, background: '#2a3860' }} />
        <button onClick={fitToScreen} title="Ajustar à tela (F)" style={btnStyle(true)}>⤢ Fit</button>
        <button onClick={resetZoom} title="Zoom 100% (0)" style={btnStyle(true)}>100%</button>
        <span style={{ width: 1, height: 20, background: '#2a3860' }} />
        <button onClick={exportMap} title="Baixar JSON" style={btnStyle(true)}>↓ JSON</button>
        <label style={{ ...btnStyle(true), cursor: 'pointer' }}>
          ↑ JSON
          <input type="file" accept=".json" hidden onChange={(e) => e.target.files?.[0] && importMap(e.target.files[0])} />
        </label>
        <button onClick={onClose} style={{ ...btnStyle(true), borderColor: '#8a1010', color: '#ff8060' }}>✕ Esc</button>
      </div>

      {/* Body */}
      <div ref={bodyRef} style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        {/* Left sidebar */}
        <div style={{ width: leftWidth, overflow: 'hidden', background: 'rgba(8,10,18,0.95)', borderRight: '2px solid #2a3860', display: 'flex', flexDirection: 'column', flexShrink: 0, transition: 'width 0.15s' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #1a2540' }}>
            <button onClick={() => setLeftOpen(o => !o)} title={leftOpen ? 'Recolher (Tab)' : 'Expandir (Tab)'}
              style={{ width: '100%', padding: '6px', background: '#0a0e16', border: 'none', color: '#c9952a', cursor: 'pointer', fontSize: 12 }}>
              {leftOpen ? '◀ Painel' : '▶'}
            </button>
          </div>
          {leftOpen && (
            <div style={{ overflow: 'auto', padding: 10, flex: 1 }}>
              <SectionLabel>FERRAMENTAS</SectionLabel>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, marginBottom: 12 }}>
                {TOOLS.map(t => (
                  <button
                    key={t.id}
                    onClick={() => update({ activeTool: t.id as EditorTool })}
                    title={`${t.label} [${t.hotkey}] — ${t.desc}`}
                    style={{
                      aspectRatio: '1', display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      background: st.activeTool === t.id ? '#1a2a4a' : '#0a0e16',
                      border: `1px solid ${st.activeTool === t.id ? '#c9952a' : '#2a3860'}`,
                      color: st.activeTool === t.id ? '#f0c040' : '#8a9ab0',
                      borderRadius: 4, cursor: 'pointer', fontSize: 16,
                      position: 'relative',
                      boxShadow: st.activeTool === t.id ? '0 0 6px rgba(201,149,42,0.5)' : 'none',
                    }}
                  >
                    <span>{t.icon}</span>
                    <span style={{ position: 'absolute', bottom: 1, right: 2, fontSize: 8, opacity: 0.6 }}>{t.hotkey}</span>
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: 10, color: '#8a9ab0', width: 50 }}>Pincel</span>
                <input type="range" min={1} max={10} value={st.brushSize} onChange={(e) => update({ brushSize: +e.target.value })} style={{ flex: 1 }} />
                <span style={{ fontSize: 11, color: '#f0c040', width: 22, textAlign: 'right' }}>{st.brushSize}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: 10, color: '#8a9ab0', width: 50 }} title="Probabilidade de pintar cada célula">Dispersão</span>
                <input type="range" min={5} max={100} value={scatter} onChange={(e) => setScatter(+e.target.value)} style={{ flex: 1 }} />
                <span style={{ fontSize: 11, color: scatter < 100 ? '#40c8ff' : '#f0c040', width: 30, textAlign: 'right' }}>{scatter}%</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <span style={{ fontSize: 10, color: '#8a9ab0', width: 50 }}>Espelho</span>
                <button onClick={() => setMirrorX(v => !v)} title="Espelhar no eixo X"
                  style={{ flex: 1, ...btnStyle(true), borderColor: mirrorX ? '#40c8ff' : '#2a3860', color: mirrorX ? '#40c8ff' : '#8a9ab0' }}>↔ X</button>
                <button onClick={() => setMirrorY(v => !v)} title="Espelhar no eixo Y"
                  style={{ flex: 1, ...btnStyle(true), borderColor: mirrorY ? '#40c8ff' : '#2a3860', color: mirrorY ? '#40c8ff' : '#8a9ab0' }}>↕ Y</button>
              </div>

              {recentTiles.length > 1 && (
                <>
                  <SectionLabel>RECENTES</SectionLabel>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 3, marginBottom: 8 }}>
                    {recentTiles.map(rt => {
                      const info = ALL_TILES.find(x => x.type === rt)
                      return (
                        <button key={rt} onClick={() => update({ selectedTile: rt })}
                          title={info?.label ?? rt}
                          style={{
                            aspectRatio: '1', background: info?.color ?? '#000',
                            border: `2px solid ${st.selectedTile === rt ? '#f0c040' : '#000'}`,
                            cursor: 'pointer', borderRadius: 2,
                          }} />
                      )
                    })}
                  </div>
                </>
              )}

              <SectionLabel>TILES — {selectedTileInfo?.label ?? st.selectedTile}</SectionLabel>
              <input
                value={tileQuery}
                onChange={(e) => setTileQuery(e.target.value)}
                placeholder="🔍 buscar tile..."
                style={{ width: '100%', background: '#0a0e16', border: '1px solid #2a3860', color: '#e8d9b5', padding: '4px 6px', fontSize: 11, borderRadius: 3, marginBottom: 8, boxSizing: 'border-box' }}
              />
              {filteredGroups.map(group => (
                <div key={group.label} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 10, color: '#5a7a9a', marginBottom: 4, letterSpacing: 1 }}>{group.label.toUpperCase()}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 3 }}>
                    {group.tiles.map(t => (
                      <button
                        key={t.type}
                        onClick={() => update({ selectedTile: t.type, activeTool: st.activeTool === 'eyedropper' ? 'paint' : st.activeTool })}
                        title={t.label}
                        style={{
                          aspectRatio: '1',
                          background: t.color,
                          border: `2px solid ${st.selectedTile === t.type ? '#f0c040' : '#000'}`,
                          boxShadow: st.selectedTile === t.type ? '0 0 6px rgba(240,192,64,0.6)' : 'none',
                          cursor: 'pointer',
                          borderRadius: 2,
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
              {filteredGroups.length === 0 && <div style={{ fontSize: 11, color: '#5a7a9a', textAlign: 'center', padding: 12 }}>Nenhum tile encontrado</div>}
            </div>
          )}
        </div>

        {/* Canvas */}
        <div style={{ flex: 1, position: 'relative', background: '#000', minWidth: 0 }}>
          <canvas
            ref={canvasRef}
            onMouseDown={handleDown}
            onMouseMove={handleMove}
            onMouseUp={handleUp}
            onMouseLeave={() => { setIsDrawing(false); setIsPanning(false); setHoverTile(null) }}
            onWheel={handleWheel}
            onContextMenu={(e) => e.preventDefault()}
            style={{ display: 'block', cursor: isPanning ? 'grabbing' : 'crosshair' }}
          />
          {/* Toggle minimap */}
          <button
            onClick={() => setShowMinimap(s => !s)}
            title={showMinimap ? 'Esconder minimapa' : 'Mostrar minimapa'}
            style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.7)', border: '1px solid #2a3860', color: '#c9952a', padding: '2px 6px', fontSize: 10, borderRadius: 3, cursor: 'pointer' }}
          >
            {showMinimap ? '⊟ MAP' : '⊞ MAP'}
          </button>
          {/* Status bar */}
          <div style={{ position: 'absolute', bottom: 8, left: 8, right: 8, display: 'flex', gap: 8, alignItems: 'center', pointerEvents: 'none' }}>
            <div style={{ background: 'rgba(0,0,0,0.75)', padding: '4px 8px', fontSize: 11, borderRadius: 3, border: '1px solid #1a2540' }}>
              Zoom <span style={{ color: '#f0c040' }}>{(zoom * 100).toFixed(0)}%</span>
              {hoverTile && <> · <span style={{ color: '#f0c040' }}>({hoverTile.x}, {hoverTile.y})</span></>}
              {' · '}<span style={{ color: '#5a7a9a' }}>Roda=zoom · Alt/Direito=pan · F=fit · Tab=painel</span>
            </div>
            {statusMsg && (
              <div style={{ background: 'rgba(64,200,255,0.15)', padding: '4px 10px', fontSize: 11, borderRadius: 3, border: '1px solid #40c8ff', color: '#40c8ff' }}>
                {statusMsg}
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ width: rightWidth, overflow: 'hidden', background: 'rgba(8,10,18,0.95)', borderLeft: '2px solid #2a3860', display: 'flex', flexDirection: 'column', flexShrink: 0, transition: 'width 0.15s' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #1a2540' }}>
            <button onClick={() => setRightOpen(o => !o)} title={rightOpen ? 'Recolher' : 'Expandir'}
              style={{ width: '100%', padding: '6px', background: '#0a0e16', border: 'none', color: '#c9952a', cursor: 'pointer', fontSize: 12 }}>
              {rightOpen ? 'Painel ▶' : '◀'}
            </button>
          </div>
          {rightOpen && (
            <div style={{ overflow: 'auto', padding: 10, flex: 1 }}>
              <SectionLabel>CAMADAS</SectionLabel>
              <Toggle label="Grid" value={st.showGrid} onChange={(v) => update({ showGrid: v })} />
              <Toggle label="Colisões" value={st.showCollisions} onChange={(v) => update({ showCollisions: v })} />
              <Toggle label="Monstros" value={st.showMonsters} onChange={(v) => update({ showMonsters: v })} />
              <Toggle label="Spawns" value={st.showSpawns} onChange={(v) => update({ showSpawns: v })} />

              <SectionLabel>MAPA</SectionLabel>
              <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                <NumInput label="L" value={map.width} onChange={(v) => resizeMap(v, map.height)} />
                <NumInput label="A" value={map.height} onChange={(v) => resizeMap(map.width, v)} />
              </div>
              <button onClick={() => {
                if (!confirm('Limpar mapa inteiro?')) return
                const tiles = Array.from({ length: map.height }, () => Array.from({ length: map.width }, () => makeTile('grass')))
                onMapChange({ ...map, tiles })
                pushHistory(tiles)
              }} style={{ ...btnStyle(true), width: '100%', marginBottom: 4 }}>Limpar (grama)</button>
              <button onClick={() => onMapChange({ ...map, monsters: [] })} style={{ ...btnStyle(true), width: '100%', marginBottom: 4 }}>Remover Monstros</button>
              <button onClick={() => onMapChange({ ...map, spawnPoints: [] })} style={{ ...btnStyle(true), width: '100%' }}>Remover Spawns</button>

              <SectionLabel>SLOTS LOCAIS</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {['1','2','3','4','5'].map(slot => {
                  const entry = slots[slot]
                  return (
                    <div key={slot} style={{ display: 'flex', gap: 3, alignItems: 'center', background: '#0a0e16', border: '1px solid #1a2540', borderRadius: 2, padding: 3 }}>
                      <span style={{ fontSize: 11, color: '#c9952a', width: 14, textAlign: 'center' }}>{slot}</span>
                      <div style={{ flex: 1, minWidth: 0, fontSize: 10, color: entry ? '#c8c0b0' : '#3a4050', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {entry ? entry.name : '— vazio —'}
                      </div>
                      <button onClick={() => saveSlot(slot)} title="Salvar aqui" style={{ ...btnStyle(true), padding: '2px 5px', fontSize: 10 }}>💾</button>
                      <button onClick={() => loadSlot(slot)} disabled={!entry} title="Carregar" style={{ ...btnStyle(!!entry), padding: '2px 5px', fontSize: 10 }}>↥</button>
                      <button onClick={() => entry && confirm('Apagar slot?') && deleteSlot(slot)} disabled={!entry} title="Apagar" style={{ ...btnStyle(!!entry), padding: '2px 5px', fontSize: 10, color: entry ? '#ff8060' : '#3a4050' }}>✕</button>
                    </div>
                  )
                })}
              </div>

              {(st.selectionStart && st.selectionEnd) && (
                <>
                  <SectionLabel>SELEÇÃO</SectionLabel>
                  <button onClick={fillSelection} style={{ ...btnStyle(true), width: '100%', marginBottom: 4 }}>Preencher</button>
                  <button onClick={clearSelectionTiles} style={{ ...btnStyle(true), width: '100%', marginBottom: 4 }}>Apagar (grama)</button>
                  <button onClick={clearSelection} style={{ ...btnStyle(true), width: '100%' }}>Limpar Seleção</button>
                  <div style={{ fontSize: 10, color: '#5a7a9a', marginTop: 6 }}>Ctrl+C copia • Ctrl+V cola no cursor</div>
                </>
              )}

              <SectionLabel>MONSTROS</SectionLabel>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: '#8a9ab0' }}>Nv:</span>
                <input type="number" min={1} max={50} value={st.selectedMonsterLevel} onChange={(e) => update({ selectedMonsterLevel: Math.max(1, +e.target.value) })}
                  style={{ width: 50, background: '#0a0e16', border: '1px solid #2a3860', color: '#e8d9b5', padding: '2px 4px', fontSize: 11, borderRadius: 2 }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3 }}>
                {MONSTER_LIST.map(m => (
                  <button key={m.type}
                    onClick={() => update({ selectedMonsterType: m.type, activeTool: 'monster' })}
                    title={m.label}
                    style={{
                      background: st.selectedMonsterType === m.type ? '#1a2a4a' : '#0a0e16',
                      border: `1px solid ${st.selectedMonsterType === m.type ? m.color : '#2a3860'}`,
                      color: '#c8c0b0', fontSize: 10, padding: '4px 2px', cursor: 'pointer', borderRadius: 2,
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                    <span style={{ width: 10, height: 10, background: m.color, borderRadius: 2 }} />
                    <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.label}</span>
                  </button>
                ))}
              </div>

              <div style={{ marginTop: 14, padding: 8, background: 'rgba(0,0,0,0.4)', border: '1px solid #1a2540', borderRadius: 3, fontSize: 10, lineHeight: 1.5, color: '#5a7a9a' }}>
                <div style={{ color: '#c9952a', marginBottom: 4 }}>ATALHOS</div>
                B/E/G • L/R/F/O • I/S/M/V<br />
                [ ] = pincel ± • F = fit • 0 = 100%<br />
                Ctrl+Z/Y • Ctrl+C/V<br />
                Alt/Direito+arrastar = pan<br />
                Tab = painel • Esc = sair
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Small UI bits ─────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 10, color: '#c9952a', letterSpacing: 2, marginTop: 10, marginBottom: 6, borderBottom: '1px solid #2a3860', paddingBottom: 3 }}>{children}</div>
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, padding: '3px 0', cursor: 'pointer', color: '#c8c0b0' }}>
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  )
}

function NumInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ fontSize: 10, color: '#8a9ab0' }}>{label}</span>
      <input type="number" min={8} max={200} value={value}
        onChange={(e) => onChange(Math.max(8, Math.min(200, +e.target.value || 8)))}
        style={{ flex: 1, background: '#0a0e16', border: '1px solid #2a3860', color: '#e8d9b5', padding: '2px 4px', fontSize: 11, borderRadius: 2, width: '100%' }} />
    </label>
  )
}

function btnStyle(enabled: boolean): React.CSSProperties {
  return {
    background: '#0a0e16',
    border: `1px solid ${enabled ? '#2a3860' : '#1a2030'}`,
    color: enabled ? '#e8d9b5' : '#3a4050',
    padding: '4px 10px',
    fontSize: 11,
    fontFamily: 'monospace',
    borderRadius: 3,
    cursor: enabled ? 'pointer' : 'not-allowed',
    letterSpacing: 0.5,
  }
}
