// @ts-nocheck
import { useEffect, useRef, useCallback } from 'react'
import type { GameState } from '@/lib/game/types'
import { drawTile, drawProjectile, drawAreaEffect } from '@/lib/game/sprites'
import {
  drawCharacterCached as drawCharacter,
  drawMonsterCached as drawMonster,
  drawMinionCached as drawMinion,
} from '@/lib/game/spriteCache'
import { registerAllCharacterSheets } from '@/lib/game/characterSheetRegistry'

// Eagerly register AI-generated character sprite sheets so they start
// loading the moment this module is imported (before the canvas mounts).
registerAllCharacterSheets()

const TILE = 32
const CHUNK_TILES = 20
const CHUNK_PX = CHUNK_TILES * TILE

const ANIMATED_TILES = new Set([
  'water', 'deepwater', 'lava', 'dark_water',
  'soul_fire', 'portal',
])

interface Props {
  gameState: GameState
  onCanvasClick: (worldX: number, worldY: number, screen?: { x: number; y: number }) => void
}

interface ChunkCacheEntry {
  canvas: HTMLCanvasElement
  animated: Array<[number, number, string]>
}

// Per-instance visual FX layer driven by state diffing — no engine changes.
interface FxRing { x: number; y: number; r: number; maxR: number; color: string; life: number; max: number }
interface FxBurst { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string; size: number }
interface FxState {
  shake: number
  shakeMag: number
  rings: FxRing[]
  bursts: FxBurst[]
  prevDmgIds: Set<string>
  prevLvlFlash: number
  prevPlayerHp: number
  monsterHitFlash: Map<string, number>
  prevMonsterHp: Map<string, number>
  lastTick: number
}

function easeOutCubic(t: number) { return 1 - Math.pow(1 - t, 3) }

export default function GameCanvas({ gameState, onCanvasClick }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const chunkCacheRef = useRef<{ mapId: string | null; chunks: Map<string, ChunkCacheEntry> }>({
    mapId: null,
    chunks: new Map(),
  })
  const fxRef = useRef<FxState>({
    shake: 0, shakeMag: 0, rings: [], bursts: [],
    prevDmgIds: new Set(), prevLvlFlash: 0, prevPlayerHp: 0,
    monsterHitFlash: new Map(), prevMonsterHp: new Map(), lastTick: 0,
  })

  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let ctx = ctxRef.current
    if (!ctx) {
      ctx = canvas.getContext('2d', { alpha: false }) as CanvasRenderingContext2D | null
      if (!ctx) return
      ctx.imageSmoothingEnabled = false
      ctxRef.current = ctx
    }

    const { currentMap, player, camera, tick, damageNumbers, particles, minions, projectiles, areaEffects } = gameState
    if (!currentMap || !player) return

    const fx = fxRef.current
    const dt = Math.max(1, (tick ?? 0) - fx.lastTick)
    fx.lastTick = tick ?? 0

    // ── Diff damage numbers to trigger FX (ring, burst, shake) ──
    const liveIds = new Set<string>()
    for (const d of damageNumbers) {
      const id = `${(d as any).id ?? `${d.x}|${d.y}|${d.value}|${d.type}`}|${d.timer}`
      const baseId = `${(d as any).id ?? `${d.x}|${d.y}|${d.value}|${d.type}`}`
      liveIds.add(baseId)
      if (!fx.prevDmgIds.has(baseId)) {
        // new damage event
        const isCrit = d.type === 'crit'
        const isHeal = d.type === 'heal'
        const color = isCrit ? '#ffd24a' : isHeal ? '#5ad06a' : d.type === 'magic' ? '#80a0ff' : '#ff6b6b'
        fx.rings.push({
          x: d.x, y: d.y + 6, r: isCrit ? 6 : 3,
          maxR: isCrit ? 38 : 22, color, life: 0, max: isCrit ? 26 : 18,
        })
        // little particle burst
        const n = isCrit ? 10 : 5
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2 + Math.random() * 0.4
          const sp = (isCrit ? 1.6 : 1.0) + Math.random() * 1.2
          fx.bursts.push({
            x: d.x, y: d.y + 6, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 0.6,
            life: 0, max: 18 + Math.random() * 10, color, size: isCrit ? 2.4 : 1.8,
          })
        }
        if (isCrit) { fx.shake = Math.max(fx.shake, 10); fx.shakeMag = Math.max(fx.shakeMag, 5) }
        else if (!isHeal && d.type !== 'magic') { fx.shake = Math.max(fx.shake, 4); fx.shakeMag = Math.max(fx.shakeMag, 2) }
      }
    }
    fx.prevDmgIds = liveIds

    // ── Monster hit-flash diffing ──
    for (const m of currentMap.monsters) {
      const prev = fx.prevMonsterHp.get(m.id) ?? m.hp
      if (m.hp < prev && !m.isDead) fx.monsterHitFlash.set(m.id, 8)
      fx.prevMonsterHp.set(m.id, m.hp)
    }
    // tick down flashes
    for (const [k, v] of fx.monsterHitFlash) {
      if (v <= 1) fx.monsterHitFlash.delete(k)
      else fx.monsterHitFlash.set(k, v - 1)
    }

    // ── Player damage shake ──
    if (player.hp < fx.prevPlayerHp) {
      fx.shake = Math.max(fx.shake, 8); fx.shakeMag = Math.max(fx.shakeMag, 4)
    }
    fx.prevPlayerHp = player.hp

    // Level-up flash shake
    const lvlFlash = (gameState as any)._levelUpFlash ?? 0
    if (lvlFlash > fx.prevLvlFlash) { fx.shake = Math.max(fx.shake, 14); fx.shakeMag = Math.max(fx.shakeMag, 6) }
    fx.prevLvlFlash = lvlFlash

    // Compute shake offset
    let shakeX = 0, shakeY = 0
    if (fx.shake > 0) {
      const m = fx.shakeMag * (fx.shake / 20)
      shakeX = (Math.random() - 0.5) * 2 * m
      shakeY = (Math.random() - 0.5) * 2 * m
      fx.shake = Math.max(0, fx.shake - dt)
    }

    // Reset chunk cache when map changes
    const cache = chunkCacheRef.current
    if (cache.mapId !== currentMap.id) {
      cache.mapId = currentMap.id
      cache.chunks.clear()
      fx.monsterHitFlash.clear(); fx.prevMonsterHp.clear()
      fx.rings.length = 0; fx.bursts.length = 0
    }

    // Clear
    ctx.fillStyle = '#070912'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.save()
    ctx.translate(-camera.x + shakeX, -camera.y + shakeY)

    // ── Tile chunks ──
    const startCX = Math.max(0, Math.floor(camera.x / CHUNK_PX))
    const startCY = Math.max(0, Math.floor(camera.y / CHUNK_PX))
    const endCX = Math.min(Math.ceil(currentMap.width / CHUNK_TILES), Math.ceil((camera.x + canvas.width) / CHUNK_PX))
    const endCY = Math.min(Math.ceil(currentMap.height / CHUNK_TILES), Math.ceil((camera.y + canvas.height) / CHUNK_PX))

    let chunksBuiltThisFrame = 0
    const CHUNK_BUDGET = 4

    for (let cy = startCY; cy < endCY; cy++) {
      for (let cx = startCX; cx < endCX; cx++) {
        const key = `${cx},${cy}`
        let entry = cache.chunks.get(key)
        if (!entry) {
          if (chunksBuiltThisFrame >= CHUNK_BUDGET) {
            ctx.fillStyle = '#0a0e16'
            ctx.fillRect(cx * CHUNK_PX, cy * CHUNK_PX, CHUNK_PX, CHUNK_PX)
            continue
          }
          entry = buildChunk(currentMap, cx, cy)
          cache.chunks.set(key, entry)
          chunksBuiltThisFrame++
        }
        ctx.drawImage(entry.canvas, cx * CHUNK_PX, cy * CHUNK_PX)
        if (entry.animated.length > 0) {
          for (const [tx, ty, type] of entry.animated) {
            drawTile(ctx, type, tx * TILE, ty * TILE, tick)
          }
        }
      }
    }

    if (chunksBuiltThisFrame < CHUNK_BUDGET) {
      const pCX = endCX, pCY = startCY
      const pkey = `${pCX},${pCY}`
      if (pCX < Math.ceil(currentMap.width / CHUNK_TILES) && !cache.chunks.has(pkey)) {
        cache.chunks.set(pkey, buildChunk(currentMap, pCX, pCY))
      }
    }

    const viewL = camera.x - 48
    const viewR = camera.x + canvas.width + 48
    const viewT = camera.y - 48
    const viewB = camera.y + canvas.height + 48

    // ── Monsters ──
    const visibleMonsters: typeof currentMap.monsters = []
    for (const monster of currentMap.monsters) {
      if (monster.isDead && monster.deathTimer <= 0) continue
      const mx = monster.position.x
      const my = monster.position.y
      if (mx + 32 < viewL || mx > viewR || my + 32 < viewT || my > viewB) continue
      visibleMonsters.push(monster)
    }
    visibleMonsters.sort((a, b) => a.position.y - b.position.y)

    for (const monster of visibleMonsters) {
      const mx = monster.position.x
      const my = monster.position.y

      // soft shadow
      if (!monster.isDead) {
        ctx.fillStyle = 'rgba(0,0,0,0.32)'
        ctx.beginPath(); ctx.ellipse(mx + 16, my + 30, 11, 4, 0, 0, Math.PI * 2); ctx.fill()
      }

      const alpha = monster.isDead ? Math.max(0, monster.deathTimer / 80) : 1
      ctx.globalAlpha = alpha
      drawMonster(ctx, monster.type, monster.direction, monster.isMoving, monster.isAttacking, monster.animFrame, mx, my, 1)

      // hit-flash overlay
      const flash = fx.monsterHitFlash.get(monster.id) ?? 0
      if (flash > 0 && !monster.isDead) {
        ctx.globalCompositeOperation = 'lighter'
        ctx.globalAlpha = (flash / 8) * 0.55
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(mx, my, 32, 32)
        ctx.globalCompositeOperation = 'source-over'
        ctx.globalAlpha = alpha
      }

      if (!monster.isDead && monster.hp < monster.maxHp) {
        const barW = 32, barH = 4, bx = mx, by = my - 10
        const hpr = monster.hp / monster.maxHp
        ctx.fillStyle = 'rgba(0,0,0,0.78)'; ctx.fillRect(bx - 1, by - 1, barW + 2, barH + 2)
        ctx.fillStyle = '#260808'; ctx.fillRect(bx, by, barW, barH)
        const grad = ctx.createLinearGradient(bx, by, bx, by + barH)
        const hi = hpr > 0.5 ? '#ff7a3a' : hpr > 0.25 ? '#ff5a5a' : '#ff2020'
        const lo = hpr > 0.5 ? '#a83018' : hpr > 0.25 ? '#7a1818' : '#5a0808'
        grad.addColorStop(0, hi); grad.addColorStop(1, lo)
        ctx.fillStyle = grad
        ctx.fillRect(bx, by, Math.round(barW * hpr), barH)
        // shimmer at edge
        if (hpr < 1) {
          ctx.fillStyle = 'rgba(255,255,255,0.55)'
          ctx.fillRect(bx + Math.round(barW * hpr) - 1, by, 1, barH)
        }
      }

      if (!monster.isDead) {
        ctx.fillStyle = 'rgba(0,0,0,0.78)'
        ctx.fillRect(mx - 20, my - 26, 72, 14)
        ctx.fillStyle = '#e8d9b5'
        ctx.font = '10px monospace'
        ctx.textAlign = 'center'
        ctx.fillText(`Lv${monster.level}`, mx + 16, my - 15)
        ctx.textAlign = 'left'
      }

      if (monster.statusEffects && monster.statusEffects.length > 0 && !monster.isDead) {
        const ew = 14
        const tw = monster.statusEffects.length * ew
        let ex = mx + 16 - tw / 2
        const ey = my - 34
        for (const effect of monster.statusEffects) {
          ctx.fillStyle = `${effect.color}40`; ctx.fillRect(ex, ey, ew - 2, ew - 2)
          ctx.strokeStyle = `${effect.color}80`; ctx.lineWidth = 1; ctx.strokeRect(ex, ey, ew - 2, ew - 2)
          ctx.fillStyle = effect.color
          ctx.font = '8px monospace'
          ctx.textAlign = 'center'
          ctx.fillText(effect.icon, ex + (ew - 2) / 2, ey + 9)
          ex += ew
        }
        ctx.textAlign = 'left'
      }
      ctx.globalAlpha = 1
    }

    // ── Minions ──
    for (const minion of minions) {
      const mx = minion.position.x, my = minion.position.y
      if (mx + 32 < viewL || mx > viewR || my + 32 < viewT || my > viewB) continue
      ctx.globalAlpha = minion.lifespan < 120 ? Math.max(0.3, (minion.lifespan % 30) / 30) : 1
      drawMinion(ctx, minion.type, minion.direction, minion.isMoving, minion.isAttacking, minion.animFrame, mx, my, 0.85)
      ctx.globalAlpha = 1
      if (minion.hp < minion.maxHp) {
        const barW = 24
        ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(mx + 2, my - 6, barW + 2, 4)
        ctx.fillStyle = '#80ff90'; ctx.fillRect(mx + 3, my - 5, Math.round(barW * (minion.hp / minion.maxHp)), 2)
      }
    }

    // ── Player ──
    const px = player.position.x, py = player.position.y

    // dual shadow for grounding
    ctx.fillStyle = 'rgba(0,0,0,0.28)'
    ctx.beginPath(); ctx.ellipse(px + 16, py + 30, 12, 4.5, 0, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = 'rgba(0,0,0,0.18)'
    ctx.beginPath(); ctx.ellipse(px + 16, py + 30, 16, 6, 0, 0, Math.PI * 2); ctx.fill()

    drawCharacter(ctx, player.class, player.direction, player.isMoving, player.isAttacking, tick, px, py, 1, player.skin ?? 0)

    // player name tag — glassy gold pill
    ctx.fillStyle = 'rgba(0,0,0,0.72)'
    ctx.fillRect(px - 14, py - 20, 60, 13)
    ctx.strokeStyle = 'rgba(240,200,80,0.45)'; ctx.lineWidth = 1
    ctx.strokeRect(px - 14, py - 20, 60, 13)
    ctx.fillStyle = '#f5c95a'
    ctx.font = 'bold 10px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(player.name, px + 16, py - 9)
    ctx.textAlign = 'left'

    // ── Pet ──
    const petRuntime = (player as any)._petRuntime
    const activePetId = player.pets?.active
    const activePet = activePetId ? player.pets?.pets?.find((p: any) => p.id === activePetId) : null
    if (petRuntime && activePet) {
      const ex = petRuntime.x, ey = petRuntime.y
      ctx.fillStyle = 'rgba(0,0,0,0.3)'
      ctx.beginPath(); ctx.ellipse(ex + 8, ey + 18, 8, 3, 0, 0, Math.PI * 2); ctx.fill()
      ctx.font = '20px serif'
      ctx.textAlign = 'center'
      ctx.fillText(activePet.image || '🐾', ex + 8, ey + 14)
      const hpRatio = Math.max(0, Math.min(1, activePet.stats.hp / activePet.stats.maxHp))
      ctx.fillStyle = 'rgba(0,0,0,0.7)'
      ctx.fillRect(ex - 2, ey - 6, 22, 3)
      ctx.fillStyle = '#5ad06a'
      ctx.fillRect(ex - 1, ey - 5, Math.round(20 * hpRatio), 1)
      if (petRuntime.targetId && currentMap) {
        const tgt = currentMap.monsters.find((m: any) => m.id === petRuntime.targetId && !m.isDead)
        if (tgt && petRuntime.cd > 22) {
          ctx.strokeStyle = 'rgba(240,192,64,0.45)'
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(ex + 8, ey + 8)
          ctx.lineTo(tgt.position.x + 16, tgt.position.y + 16)
          ctx.stroke()
        }
      }
      ctx.textAlign = 'left'
    }

    // ── Area effects + projectile trails ──
    for (const fx2 of areaEffects) drawAreaEffect(ctx, fx2)

    for (const proj of projectiles) {
      if (proj.x + 32 < viewL || proj.x > viewR || proj.y + 32 < viewT || proj.y > viewB) continue
      // glowing trail
      ctx.globalCompositeOperation = 'lighter'
      const grd = ctx.createRadialGradient(proj.x + 8, proj.y + 8, 0, proj.x + 8, proj.y + 8, 14)
      grd.addColorStop(0, 'rgba(255,220,150,0.6)')
      grd.addColorStop(1, 'rgba(255,220,150,0)')
      ctx.fillStyle = grd
      ctx.fillRect(proj.x - 8, proj.y - 8, 32, 32)
      ctx.globalCompositeOperation = 'source-over'
      drawProjectile(ctx, proj, tick)
    }

    for (const p of particles) {
      const lifeRatio = p.life / p.maxLife
      ctx.globalAlpha = lifeRatio
      ctx.fillStyle = p.color
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size)
    }
    ctx.globalAlpha = 1

    // ── FX layer: hit rings + bursts ──
    ctx.globalCompositeOperation = 'lighter'
    for (let i = fx.rings.length - 1; i >= 0; i--) {
      const r = fx.rings[i]
      r.life += dt
      const t = r.life / r.max
      if (t >= 1) { fx.rings.splice(i, 1); continue }
      const e = easeOutCubic(t)
      const radius = r.r + (r.maxR - r.r) * e
      ctx.globalAlpha = (1 - t) * 0.85
      ctx.strokeStyle = r.color
      ctx.lineWidth = 2
      ctx.beginPath(); ctx.arc(r.x, r.y, radius, 0, Math.PI * 2); ctx.stroke()
      // inner soft fill
      ctx.globalAlpha = (1 - t) * 0.18
      const g = ctx.createRadialGradient(r.x, r.y, 0, r.x, r.y, radius)
      g.addColorStop(0, r.color); g.addColorStop(1, 'transparent')
      ctx.fillStyle = g
      ctx.beginPath(); ctx.arc(r.x, r.y, radius, 0, Math.PI * 2); ctx.fill()
    }
    for (let i = fx.bursts.length - 1; i >= 0; i--) {
      const b = fx.bursts[i]
      b.life += dt
      const t = b.life / b.max
      if (t >= 1) { fx.bursts.splice(i, 1); continue }
      b.x += b.vx * dt; b.y += b.vy * dt; b.vy += 0.12 * dt
      ctx.globalAlpha = (1 - t) * 0.95
      ctx.fillStyle = b.color
      const s = b.size * (1 - t * 0.4)
      ctx.fillRect(b.x - s / 2, b.y - s / 2, s, s)
    }
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1

    // ── Damage numbers (animated with arc + glow) ──
    for (const d of damageNumbers) {
      const t = 1 - Math.max(0, Math.min(1, d.timer / 60))  // 0→1 over life
      const lifeRatio = d.timer / 60
      const eased = easeOutCubic(t)
      const floatY = eased * 36
      // gentle horizontal drift based on id hash
      const seed = ((d as any).id ?? (d.x + d.y * 7)).toString()
      let h = 0; for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0
      const driftX = Math.sin((h & 0xff) * 0.1 + t * 2.5) * 6

      let color = '#ffffff', fontSize = 13, label = `${d.value}`
      if (d.type === 'crit') { color = '#ffd24a'; fontSize = 19 + Math.sin(t * 8) * 1.5; label = `${d.value}!` }
      else if (d.type === 'magic') { color = '#9fb4ff' }
      else if (d.type === 'heal')  { color = '#7cff9a'; fontSize = 14; label = `+${d.value}` }
      else if (d.type === 'physical') { color = '#ff7575' }

      const drawX = d.x + driftX, drawY = d.y - floatY - 4

      // glow
      ctx.globalAlpha = lifeRatio * 0.55
      ctx.font = `bold ${fontSize + 2}px ui-monospace, monospace`
      ctx.textAlign = 'center'
      ctx.fillStyle = color
      ctx.shadowColor = color
      ctx.shadowBlur = d.type === 'crit' ? 14 : 6
      ctx.fillText(label, drawX, drawY)
      ctx.shadowBlur = 0

      // crisp outline + fill
      ctx.globalAlpha = lifeRatio
      ctx.font = `900 ${fontSize}px ui-monospace, monospace`
      ctx.lineWidth = 3
      ctx.strokeStyle = 'rgba(0,0,0,0.95)'
      ctx.strokeText(label, drawX, drawY)
      ctx.fillStyle = color
      ctx.fillText(label, drawX, drawY)
      ctx.textAlign = 'left'
    }
    ctx.globalAlpha = 1

    ctx.restore()

    // ── Dynamic player light (radial halo on top of world, under weather) ──
    const playerScreenX = (player.position.x + 16) - camera.x + shakeX
    const playerScreenY = (player.position.y + 16) - camera.y + shakeY
    {
      ctx.globalCompositeOperation = 'lighter'
      const pulse = 0.85 + Math.sin((tick ?? 0) * 0.05) * 0.05
      const lr = 160 * pulse
      const lg = ctx.createRadialGradient(playerScreenX, playerScreenY, 0, playerScreenX, playerScreenY, lr)
      lg.addColorStop(0, 'rgba(255,220,150,0.18)')
      lg.addColorStop(0.5, 'rgba(255,200,120,0.07)')
      lg.addColorStop(1, 'rgba(255,200,120,0)')
      ctx.fillStyle = lg
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.globalCompositeOperation = 'source-over'
    }

    // ── Weather overlay ──
    const weather = (gameState as any)._weather ?? 'none'
    const wIntensity = (gameState as any)._weatherIntensity ?? 0.5
    if (weather !== 'none') {
      const seed = gameState.tick ?? 0
      if (weather === 'rain' || weather === 'storm') {
        ctx.save()
        ctx.strokeStyle = weather === 'storm' ? 'rgba(180,200,255,0.4)' : 'rgba(140,180,255,0.28)'
        ctx.lineWidth = 1
        const count = Math.floor(60 * wIntensity)
        for (let i = 0; i < count; i++) {
          const h = Math.sin(seed * 0.017 + i * 2.399) * 0.5 + 0.5
          const h2 = Math.sin(seed * 0.013 + i * 1.618) * 0.5 + 0.5
          const rx = h * canvas.width
          const ry = ((h2 + seed * 0.05 * (1 + i * 0.01)) % 1) * canvas.height
          ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx + 2, ry + 12); ctx.stroke()
        }
        if (weather === 'storm' && (seed % 220) < 4) {
          ctx.fillStyle = 'rgba(220,230,255,0.35)'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }
        ctx.restore()
      } else if (weather === 'snow') {
        ctx.save()
        ctx.fillStyle = 'rgba(230,238,255,0.7)'
        const count = Math.floor(50 * wIntensity)
        for (let i = 0; i < count; i++) {
          const h = Math.sin(seed * 0.011 + i * 2.399) * 0.5 + 0.5
          const h2 = Math.sin(seed * 0.007 + i * 1.618) * 0.5 + 0.5
          const rx = h * canvas.width
          const ry = ((h2 + seed * 0.02 * (1 + i * 0.01)) % 1) * canvas.height
          const sz = 1 + ((i % 3))
          ctx.fillRect(rx, ry, sz, sz)
        }
        ctx.restore()
      } else if (weather === 'fog') {
        ctx.save()
        ctx.fillStyle = `rgba(190,200,220,${0.16 * wIntensity})`
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.restore()
      }
    }

    // ── Time of day tint ──
    const tod = (gameState as any)._timeOfDay ?? 7200
    const hour = (tod / 14400) * 24
    let nightAlpha = 0
    if (hour < 5) nightAlpha = 0.5
    else if (hour < 8) nightAlpha = 0.5 - ((hour - 5) / 3) * 0.5
    else if (hour >= 18 && hour < 21) nightAlpha = ((hour - 18) / 3) * 0.5
    else if (hour >= 21) nightAlpha = 0.5
    if (nightAlpha > 0) {
      // night blue tint
      ctx.fillStyle = `rgba(8,14,46,${nightAlpha})`
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      // cut a soft light around the player so night feels like night
      ctx.globalCompositeOperation = 'destination-out'
      const r = 180
      const g = ctx.createRadialGradient(playerScreenX, playerScreenY, 20, playerScreenX, playerScreenY, r)
      g.addColorStop(0, `rgba(0,0,0,${0.85 * nightAlpha})`)
      g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.globalCompositeOperation = 'source-over'
    }
    if (hour >= 5.5 && hour < 8.5) {
      ctx.fillStyle = `rgba(255,140,60,${0.14 * Math.sin(((hour - 5.5) / 3) * Math.PI)})`
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    // ── Vignette (post-process) ──
    {
      const vg = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) * 0.35,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) * 0.75,
      )
      vg.addColorStop(0, 'rgba(0,0,0,0)')
      vg.addColorStop(1, 'rgba(0,0,0,0.55)')
      ctx.fillStyle = vg
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    // Low-HP red pulse vignette
    const hpRatio = player.hp / Math.max(1, player.stats.maxHp)
    if (hpRatio < 0.3 && player.hp > 0) {
      const pulseA = (0.18 + Math.sin((tick ?? 0) * 0.18) * 0.08) * (1 - hpRatio / 0.3)
      const rg = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) * 0.25,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) * 0.7,
      )
      rg.addColorStop(0, 'rgba(220,40,40,0)')
      rg.addColorStop(1, `rgba(220,30,30,${Math.max(0, pulseA)})`)
      ctx.fillStyle = rg
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    // ── Map name overlay ──
    if (tick < 180) {
      const fade = Math.min(1, tick / 40) * (1 - Math.max(0, (tick - 140) / 40))
      ctx.globalAlpha = fade
      ctx.fillStyle = 'rgba(0,0,0,0.6)'
      const tw = 340
      ctx.fillRect(canvas.width / 2 - tw / 2, canvas.height / 2 - 36, tw, 60)
      ctx.strokeStyle = 'rgba(240,200,80,0.45)'; ctx.lineWidth = 1
      ctx.strokeRect(canvas.width / 2 - tw / 2, canvas.height / 2 - 36, tw, 60)
      ctx.fillStyle = '#f5c95a'
      ctx.shadowColor = 'rgba(245,201,90,0.7)'; ctx.shadowBlur = 12
      ctx.font = 'bold 22px serif'
      ctx.textAlign = 'center'
      ctx.fillText(currentMap.name, canvas.width / 2, canvas.height / 2 - 6)
      ctx.shadowBlur = 0
      ctx.fillStyle = '#a0b0c0'
      ctx.font = '12px monospace'
      ctx.fillText(`Lv. ${player.level} — ${player.name}`, canvas.width / 2, canvas.height / 2 + 16)
      ctx.textAlign = 'left'
      ctx.globalAlpha = 1
    }

    if (lvlFlash > 0) {
      const a = Math.min(0.5, lvlFlash / 30)
      const lg = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 30,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) * 0.7,
      )
      lg.addColorStop(0, `rgba(120,220,255,${a})`)
      lg.addColorStop(1, 'rgba(120,220,255,0)')
      ctx.fillStyle = lg
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = `rgba(255,250,210,${Math.min(1, lvlFlash / 20)})`
      ctx.shadowColor = '#ffd24a'; ctx.shadowBlur = 16
      ctx.font = 'bold 30px serif'
      ctx.textAlign = 'center'
      ctx.fillText(`⭐ NÍVEL ${player.level}!`, canvas.width / 2, canvas.height / 2 + 9)
      ctx.shadowBlur = 0
      ctx.textAlign = 'left'
    }
  }, [gameState])

  useEffect(() => { render() }, [render])

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const cx = (e.clientX - rect.left) * scaleX
    const cy = (e.clientY - rect.top) * scaleY
    const wx = cx + gameState.camera.x
    const wy = cy + gameState.camera.y
    onCanvasClick(wx, wy, { x: cx, y: cy })
  }, [gameState.camera, onCanvasClick])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const cx = (e.clientX - rect.left) * scaleX
    const cy = (e.clientY - rect.top) * scaleY
    const wx = cx + gameState.camera.x
    const wy = cy + gameState.camera.y
    const { currentMap } = gameState
    if (currentMap) {
      const hovered = currentMap.monsters.find((m: any) => {
        if (m.isDead) return false
        return wx >= m.position.x && wx <= m.position.x + 32 && wy >= m.position.y && wy <= m.position.y + 32
      })
      canvas.style.cursor = hovered ? 'crosshair' : 'default'
    }
  }, [gameState])

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={540}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      className="block w-full h-full"
      style={{ imageRendering: 'pixelated' }}
    />
  )
}

function buildChunk(map: any, cx: number, cy: number): ChunkCacheEntry {
  const canvas = document.createElement('canvas')
  canvas.width = CHUNK_PX
  canvas.height = CHUNK_PX
  const ctx = canvas.getContext('2d')!
  const animated: Array<[number, number, string]> = []

  const startTX = cx * CHUNK_TILES
  const startTY = cy * CHUNK_TILES
  const endTX = Math.min(map.width, startTX + CHUNK_TILES)
  const endTY = Math.min(map.height, startTY + CHUNK_TILES)

  for (let ty = startTY; ty < endTY; ty++) {
    for (let tx = startTX; tx < endTX; tx++) {
      const tile = map.tiles[ty]?.[tx]
      if (!tile) continue
      const localX = (tx - startTX) * TILE
      const localY = (ty - startTY) * TILE
      drawTile(ctx, tile.type, localX, localY, 0)
      if (ANIMATED_TILES.has(tile.type)) {
        animated.push([tx, ty, tile.type])
      }
    }
  }

  return { canvas, animated }
}
