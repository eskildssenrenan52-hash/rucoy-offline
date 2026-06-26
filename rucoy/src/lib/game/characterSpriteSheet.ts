// AI-generated character sprite sheet loader.
// Each sheet: 8 columns x 4 rows on a magenta (#FF00FF) background.
// Row 0 = walk down (facing camera)
// Row 1 = walk up (back view)
// Row 2 = walk side (right profile; left mirrors)
// Row 3 = attack / special
//
// At load time we key out the magenta background and a small inset is used
// when sampling cells to escape the thin black grid lines the model draws.

import type { CharacterClass, Direction } from './types'

type SheetState = {
  canvas: HTMLCanvasElement | null
  cellW: number
  cellH: number
  cols: number
  rows: number
  ready: boolean
  failed: boolean
}

const COLS = 8
const ROWS = 4

const SHEET_URLS: Partial<Record<CharacterClass, string>> = {}
const sheets: Partial<Record<CharacterClass, SheetState>> = {}

export function registerSpriteSheet(cls: CharacterClass, url: string) {
  SHEET_URLS[cls] = url
}

export function getSheetState(cls: CharacterClass): SheetState | null {
  return sheets[cls] ?? null
}

function processImageToCanvas(img: HTMLImageElement): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = img.naturalWidth
  c.height = img.naturalHeight
  const ctx = c.getContext('2d', { willReadFrequently: true })!
  ctx.drawImage(img, 0, 0)
  // Magenta key-out + remove dark grid lines.
  try {
    const data = ctx.getImageData(0, 0, c.width, c.height)
    const px = data.data
    for (let i = 0; i < px.length; i += 4) {
      const r = px[i], g = px[i + 1], b = px[i + 2]
      // magenta-ish background
      if (r > 200 && g < 90 && b > 200) {
        px[i + 3] = 0
      } else if (r < 30 && g < 30 && b < 30) {
        // dark grid line — also drop
        px[i + 3] = 0
      }
    }
    ctx.putImageData(data, 0, 0)
  } catch {
    /* ignore (e.g. SSR) */
  }
  return c
}

function loadSheet(cls: CharacterClass) {
  const url = SHEET_URLS[cls]
  if (!url || sheets[cls]) return
  const state: SheetState = {
    canvas: null,
    cellW: 0,
    cellH: 0,
    cols: COLS,
    rows: ROWS,
    ready: false,
    failed: false,
  }
  sheets[cls] = state
  if (typeof window === 'undefined') return
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    state.canvas = processImageToCanvas(img)
    state.cellW = Math.floor(state.canvas.width / COLS)
    state.cellH = Math.floor(state.canvas.height / ROWS)
    state.ready = true
  }
  img.onerror = () => {
    state.failed = true
  }
  img.src = url
}

export function preloadSpriteSheets(classes: CharacterClass[]) {
  for (const c of classes) loadSheet(c)
}

function directionRow(dir: Direction, isAttacking: boolean): number {
  if (isAttacking) return 3
  switch (dir) {
    case 'down': return 0
    case 'up': return 1
    case 'left':
    case 'right':
    default:
      return 2
  }
}

/**
 * Draw a character from the AI-generated sprite sheet, at a target tile size
 * (default 32). Returns true if a sheet frame was drawn, false to let the
 * caller fall back to procedural rendering.
 */
export function drawCharacterFromSheet(
  ctx: CanvasRenderingContext2D,
  cls: CharacterClass,
  direction: Direction,
  isMoving: boolean,
  isAttacking: boolean,
  animFrame: number,
  x: number,
  y: number,
  scale: number = 1,
): boolean {
  if (!SHEET_URLS[cls]) return false
  if (!sheets[cls]) loadSheet(cls)
  const state = sheets[cls]
  if (!state || !state.ready || !state.canvas) return false

  const row = directionRow(direction, isAttacking)
  // Animation frame selection (0..COLS-1).
  let frame: number
  if (isAttacking) {
    // Play attack frames forward, clamped, but loop while flag stays true.
    frame = Math.floor(animFrame) % COLS
  } else if (isMoving) {
    frame = Math.floor(animFrame) % COLS
  } else {
    frame = 0 // idle pose
  }
  if (frame < 0) frame = 0

  // Tight inset so we skip the ~1-3px black borders the AI draws.
  const insetX = Math.max(2, Math.floor(state.cellW * 0.04))
  const insetY = Math.max(2, Math.floor(state.cellH * 0.04))
  const sx = frame * state.cellW + insetX
  const sy = row * state.cellH + insetY
  const sw = state.cellW - insetX * 2
  const sh = state.cellH - insetY * 2

  const target = 32 * scale
  // Preserve aspect ratio inside the 32px tile; characters often have
  // taller-than-wide art, scale to the larger dimension and center.
  const aspect = sw / sh
  let dw: number, dh: number
  if (aspect >= 1) {
    dw = target
    dh = target / aspect
  } else {
    dh = target
    dw = target * aspect
  }
  const dx = x + (target - dw) / 2
  const dy = y + (target - dh) / 2

  ctx.save()
  // Mirror for 'left' (sheet shows right-facing profile).
  if (direction === 'left') {
    ctx.translate(dx + dw, dy)
    ctx.scale(-1, 1)
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(state.canvas, sx, sy, sw, sh, 0, 0, dw, dh)
  } else {
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(state.canvas, sx, sy, sw, sh, dx, dy, dw, dh)
  }
  ctx.restore()
  return true
}
