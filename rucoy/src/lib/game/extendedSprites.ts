// ═══════════════════════════════════════════════════════════════════════════
// EXTENDED MONSTER SPRITES - renderizacao procedural por silhueta + paleta
// Chamado como fallback no drawMonster() (sprites.ts) quando o tipo nao
// pertence ao conjunto core.
// ═══════════════════════════════════════════════════════════════════════════

import type { Direction } from './types'
import { getExtendedDef, type Silhouette } from './extendedMonsters'

export function drawExtendedMonster(
  ctx: CanvasRenderingContext2D,
  type: string,
  _direction: Direction,
  isMoving: boolean,
  isAttacking: boolean,
  animFrame: number,
) {
  const def = getExtendedDef(type)
  if (!def) {
    // fallback ultimo recurso: blob roxo
    drawBlob(ctx, animFrame, { primary: '#a040ff', secondary: '#601090', accent: '#ffff00', eye: '#ffffff' })
    return
  }
  const p = def.palette
  const scale = def.scale ?? 1
  if (scale !== 1) { ctx.save(); ctx.translate(16, 16); ctx.scale(scale, scale); ctx.translate(-16, -16) }

  switch (def.silhouette) {
    case 'blob':       drawBlob(ctx, animFrame, p); break
    case 'humanoid':   drawHumanoid(ctx, isMoving, isAttacking, animFrame, p); break
    case 'beast':      drawBeast(ctx, isMoving, animFrame, p); break
    case 'flying':     drawFlying(ctx, animFrame, p); break
    case 'arachnid':   drawArachnid(ctx, isMoving, animFrame, p); break
    case 'serpent':    drawSerpent(ctx, isMoving, animFrame, p); break
    case 'elemental':  drawElemental(ctx, animFrame, p); break
    case 'construct':  drawConstruct(ctx, isMoving, animFrame, p); break
    case 'plant':      drawPlant(ctx, animFrame, p); break
    case 'ghost':      drawGhost(ctx, animFrame, p); break
    case 'colossus':   drawColossus(ctx, isMoving, isAttacking, animFrame, p); break
    case 'insect':     drawInsect(ctx, isMoving, animFrame, p); break
  }

  // Telegraph aura para chefes
  if ((def as { isWorldBoss?: boolean }).isWorldBoss) {
    const pulse = (Math.sin(animFrame * 0.1) + 1) * 0.5
    ctx.strokeStyle = p.accent
    ctx.globalAlpha = 0.3 + pulse * 0.4
    ctx.lineWidth = 2
    ctx.beginPath(); ctx.arc(16, 18, 18, 0, Math.PI * 2); ctx.stroke()
    ctx.globalAlpha = 1
  }

  if (scale !== 1) ctx.restore()
}

type Pal = { primary: string; secondary: string; accent: string; eye: string }

function drawBlob(ctx: CanvasRenderingContext2D, frame: number, p: Pal) {
  const bounce = Math.abs(Math.sin(frame * 0.08)) * 4
  ctx.fillStyle = p.primary
  ctx.beginPath(); ctx.ellipse(16, 22 - bounce, 12, 9 + bounce * 0.5, 0, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = p.secondary
  ctx.beginPath(); ctx.ellipse(16, 26 - bounce, 12, 4, 0, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = p.accent
  ctx.beginPath(); ctx.arc(12, 18 - bounce, 2, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = p.eye
  ctx.fillRect(11, 18 - bounce, 2, 3); ctx.fillRect(19, 18 - bounce, 2, 3)
}

function drawHumanoid(ctx: CanvasRenderingContext2D, isMoving: boolean, isAttacking: boolean, frame: number, p: Pal) {
  const walk = isMoving ? Math.sin(frame * 0.3) * 2 : 0
  const armSwing = isAttacking ? Math.sin(frame * 0.6) * 4 : walk
  // Corpo
  ctx.fillStyle = p.primary; ctx.fillRect(10, 14, 12, 14)
  // Cabeça
  ctx.fillStyle = p.secondary; ctx.beginPath(); ctx.arc(16, 8, 6, 0, Math.PI * 2); ctx.fill()
  // Olhos
  ctx.fillStyle = p.eye; ctx.fillRect(13, 7, 2, 2); ctx.fillRect(17, 7, 2, 2)
  // Detalhe
  ctx.fillStyle = p.accent; ctx.fillRect(13, 16, 6, 3)
  // Pernas
  ctx.fillStyle = p.secondary
  ctx.fillRect(11, 28, 4, 4 + Math.abs(walk)); ctx.fillRect(17, 28, 4, 4 + Math.abs(-walk))
  // Bracos
  ctx.fillRect(6 + armSwing, 16, 4, 8); ctx.fillRect(22 - armSwing, 16, 4, 8)
}

function drawBeast(ctx: CanvasRenderingContext2D, isMoving: boolean, frame: number, p: Pal) {
  const walk = isMoving ? Math.sin(frame * 0.35) * 2 : 0
  ctx.fillStyle = p.primary; ctx.fillRect(6, 16, 20, 10)
  ctx.fillStyle = p.secondary; ctx.fillRect(22, 12, 8, 8)
  // Orelhas
  ctx.fillStyle = p.primary
  ctx.beginPath(); ctx.moveTo(22, 12); ctx.lineTo(24, 6); ctx.lineTo(26, 12); ctx.closePath(); ctx.fill()
  ctx.beginPath(); ctx.moveTo(28, 12); ctx.lineTo(30, 6); ctx.lineTo(30, 12); ctx.closePath(); ctx.fill()
  ctx.fillStyle = p.eye; ctx.fillRect(26, 14, 2, 2)
  // Patas
  ctx.fillStyle = p.secondary
  ctx.fillRect(8, 26, 3, 4 + walk); ctx.fillRect(13, 26, 3, 4 - walk)
  ctx.fillRect(18, 26, 3, 4 + walk); ctx.fillRect(23, 26, 3, 4 - walk)
  // Cauda
  ctx.fillStyle = p.accent; ctx.fillRect(2, 18, 6, 3)
}

function drawFlying(ctx: CanvasRenderingContext2D, frame: number, p: Pal) {
  const flap = Math.sin(frame * 0.4) * 4
  ctx.fillStyle = p.primary
  ctx.beginPath(); ctx.arc(16, 16, 7, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = p.secondary
  // Asas
  ctx.beginPath(); ctx.moveTo(16, 14); ctx.lineTo(4, 12 - flap); ctx.lineTo(8, 18); ctx.closePath(); ctx.fill()
  ctx.beginPath(); ctx.moveTo(16, 14); ctx.lineTo(28, 12 - flap); ctx.lineTo(24, 18); ctx.closePath(); ctx.fill()
  ctx.fillStyle = p.eye; ctx.fillRect(13, 14, 2, 2); ctx.fillRect(17, 14, 2, 2)
  ctx.fillStyle = p.accent; ctx.fillRect(14, 18, 4, 2)
}

function drawArachnid(ctx: CanvasRenderingContext2D, isMoving: boolean, frame: number, p: Pal) {
  const wig = isMoving ? Math.sin(frame * 0.4) * 2 : 0
  ctx.fillStyle = p.primary
  ctx.beginPath(); ctx.ellipse(16, 18, 10, 7, 0, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = p.secondary; ctx.beginPath(); ctx.arc(16, 12, 5, 0, Math.PI * 2); ctx.fill()
  // 8 pernas
  ctx.strokeStyle = p.secondary; ctx.lineWidth = 2
  for (let i = -3; i <= 3; i++) {
    if (i === 0) continue
    ctx.beginPath(); ctx.moveTo(16, 18); ctx.lineTo(16 + i * 4, 26 + wig); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(16, 18); ctx.lineTo(16 + i * 5, 10 - wig); ctx.stroke()
  }
  ctx.fillStyle = p.eye; ctx.fillRect(13, 11, 2, 2); ctx.fillRect(17, 11, 2, 2)
  ctx.fillStyle = p.accent; ctx.fillRect(14, 14, 4, 1)
}

function drawSerpent(ctx: CanvasRenderingContext2D, isMoving: boolean, frame: number, p: Pal) {
  const wave = Math.sin(frame * 0.25) * 3
  ctx.fillStyle = p.primary
  for (let i = 0; i < 5; i++) {
    ctx.beginPath(); ctx.arc(6 + i * 5, 20 + Math.sin(frame * 0.2 + i) * 3 + (isMoving ? wave * 0.3 : 0), 4 - i * 0.4, 0, Math.PI * 2); ctx.fill()
  }
  ctx.fillStyle = p.secondary; ctx.beginPath(); ctx.arc(28, 16 + Math.sin(frame * 0.2) * 3, 6, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = p.eye; ctx.fillRect(27, 14, 2, 2); ctx.fillRect(30, 14, 2, 2)
  ctx.fillStyle = p.accent
  ctx.beginPath(); ctx.moveTo(32, 17); ctx.lineTo(36, 16); ctx.lineTo(32, 18); ctx.closePath(); ctx.fill()
}

function drawElemental(ctx: CanvasRenderingContext2D, frame: number, p: Pal) {
  const pulse = (Math.sin(frame * 0.15) + 1) * 0.5
  ctx.fillStyle = p.primary
  ctx.globalAlpha = 0.7 + pulse * 0.3
  ctx.beginPath(); ctx.arc(16, 16, 12, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = p.secondary; ctx.globalAlpha = 0.8
  ctx.beginPath(); ctx.arc(16, 16, 8, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = p.accent; ctx.globalAlpha = 1
  ctx.beginPath(); ctx.arc(16, 16, 4 + pulse * 2, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = p.eye; ctx.fillRect(13, 13, 2, 2); ctx.fillRect(17, 13, 2, 2)
}

function drawConstruct(ctx: CanvasRenderingContext2D, isMoving: boolean, frame: number, p: Pal) {
  const walk = isMoving ? Math.sin(frame * 0.25) * 1 : 0
  // Corpo bloco
  ctx.fillStyle = p.primary; ctx.fillRect(7, 10, 18, 18)
  ctx.fillStyle = p.secondary; ctx.fillRect(9, 12, 14, 14)
  // Cabeca
  ctx.fillStyle = p.primary; ctx.fillRect(11, 4, 10, 8)
  // Detalhes
  ctx.fillStyle = p.accent; ctx.fillRect(12, 14, 8, 2); ctx.fillRect(12, 18, 8, 2); ctx.fillRect(12, 22, 8, 2)
  // Olhos
  ctx.fillStyle = p.eye; ctx.fillRect(13, 7, 2, 2); ctx.fillRect(17, 7, 2, 2)
  // Pernas-bloco
  ctx.fillStyle = p.secondary
  ctx.fillRect(9, 28, 5, 4 + Math.abs(walk)); ctx.fillRect(18, 28, 5, 4 + Math.abs(-walk))
}

function drawPlant(ctx: CanvasRenderingContext2D, frame: number, p: Pal) {
  const sway = Math.sin(frame * 0.12) * 2
  // Tronco
  ctx.fillStyle = p.secondary; ctx.fillRect(13, 16, 6, 14)
  // Folhagem
  ctx.fillStyle = p.primary
  ctx.beginPath(); ctx.arc(16 + sway, 12, 10, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(10 + sway, 16, 5, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(22 + sway, 16, 5, 0, Math.PI * 2); ctx.fill()
  // Boca
  ctx.fillStyle = p.accent; ctx.fillRect(13 + sway, 12, 6, 3)
  // Olhos
  ctx.fillStyle = p.eye; ctx.fillRect(12 + sway, 8, 2, 2); ctx.fillRect(18 + sway, 8, 2, 2)
}

function drawGhost(ctx: CanvasRenderingContext2D, frame: number, p: Pal) {
  const bob = Math.sin(frame * 0.2) * 2
  ctx.globalAlpha = 0.75
  ctx.fillStyle = p.primary
  ctx.beginPath(); ctx.ellipse(16, 14 + bob, 10, 12, 0, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = p.secondary; ctx.fillRect(6, 22 + bob, 20, 10)
  ctx.fillStyle = p.accent
  for (let i = 0; i < 5; i++) {
    ctx.beginPath(); ctx.arc(7 + i * 5, 32 + bob + Math.sin(frame * 0.2 + i) * 2, 3, 0, Math.PI * 2); ctx.fill()
  }
  ctx.fillStyle = p.eye; ctx.fillRect(11, 10 + bob, 4, 4); ctx.fillRect(17, 10 + bob, 4, 4)
  ctx.globalAlpha = 1
}

function drawColossus(ctx: CanvasRenderingContext2D, isMoving: boolean, isAttacking: boolean, frame: number, p: Pal) {
  const walk = isMoving ? Math.sin(frame * 0.18) * 2 : 0
  const slam = isAttacking ? Math.sin(frame * 0.5) * 3 : 0
  // Tronco enorme
  ctx.fillStyle = p.primary; ctx.fillRect(4, 8, 24, 18)
  // Cabeca
  ctx.fillStyle = p.secondary; ctx.fillRect(10, 0, 12, 10)
  // Bracos
  ctx.fillStyle = p.primary
  ctx.fillRect(0, 10 + slam, 6, 14); ctx.fillRect(26, 10 - slam, 6, 14)
  // Pernas
  ctx.fillStyle = p.secondary; ctx.fillRect(6, 26, 8, 6 + Math.abs(walk)); ctx.fillRect(18, 26, 8, 6 + Math.abs(-walk))
  // Detalhe
  ctx.fillStyle = p.accent; ctx.fillRect(8, 14, 16, 4)
  // Olhos
  ctx.fillStyle = p.eye; ctx.fillRect(12, 4, 2, 3); ctx.fillRect(18, 4, 2, 3)
}

function drawInsect(ctx: CanvasRenderingContext2D, isMoving: boolean, frame: number, p: Pal) {
  const wig = isMoving ? Math.sin(frame * 0.5) * 1 : 0
  ctx.fillStyle = p.primary; ctx.beginPath(); ctx.ellipse(16, 18, 9, 6, 0, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = p.secondary; ctx.beginPath(); ctx.arc(24, 16, 4, 0, Math.PI * 2); ctx.fill()
  // Antenas
  ctx.strokeStyle = p.secondary; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(26, 14); ctx.lineTo(30, 8 + wig); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(26, 18); ctx.lineTo(30, 24 - wig); ctx.stroke()
  // Pernas
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.moveTo(10 + i * 4, 22); ctx.lineTo(8 + i * 4 + wig, 28); ctx.stroke()
  }
  ctx.fillStyle = p.eye; ctx.fillRect(22, 14, 2, 2); ctx.fillRect(24, 17, 2, 2)
  ctx.fillStyle = p.accent; ctx.fillRect(8, 16, 14, 2)
}

export type { Silhouette }
