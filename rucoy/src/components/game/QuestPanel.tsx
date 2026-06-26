import type { GameState } from '@/lib/game/types'
import { getActiveQuests } from '@/lib/game/quests'
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

/* ── Type badge colours ─────────────────────────────────────────────────── */
const TYPE_COLORS: Record<string, string> = {
  kill: '#e0402a', collect: '#ffd24a', reach_level: '#4090e8',
  explore: '#50c050', boss: '#c860e0',
}
const TYPE_LABELS: Record<string, string> = {
  kill: 'Matar', collect: 'Coletar', reach_level: 'Nível', explore: 'Explorar', boss: 'Chefe',
}

interface Props {
  gameState: GameState
  onClose: () => void
}

export default function QuestPanel({ gameState, onClose }: Props) {
  if (!gameState.player) return null
  const quests  = getActiveQuests(gameState.player)
  const active  = quests.filter(q => !q.completed)
  const done    = quests.filter(q =>  q.completed)

  return (
    <Overlay onBgClick={onClose} title="Missões" storageKey="quest" minHint={`${done.length}/${quests.length}`}>
      <div className="rcy-modal" style={{ width: 'min(520px, calc(100vw - 24px))' }}>
        <ModalHeader title="Missões" subtitle={`${done.length} / ${quests.length} completas`} onClose={onClose} />
        <div className="rcy-modal__body">
          {active.length > 0 && (
            <Section label="Em andamento">
              {active.map(q => {
                const pct = Math.min(1, q.currentCount / q.targetCount)
                const ac  = TYPE_COLORS[q.type] ?? '#4090e8'
                return (
                  <div key={q.id} style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid #000', boxShadow: 'inset 1px 1px 0 0 #3a2614', padding: 6, marginBottom: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3, gap: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
                        <span style={{ color: 'var(--rcy-text)', fontWeight: 700, fontSize: 11, textShadow: '1px 1px 0 #000' }}>{q.title}</span>
                        <span style={{ fontSize: 8, padding: '1px 4px', background: ac + '40', color: ac, border: '1px solid #000', textTransform: 'uppercase' }}>{TYPE_LABELS[q.type]}</span>
                      </div>
                      <span style={{ color: 'var(--rcy-gold)', fontSize: 9, whiteSpace: 'nowrap', textShadow: '1px 1px 0 #000' }}>+{q.rewardGold}g +{q.rewardXp}xp</span>
                    </div>
                    <p style={{ color: 'var(--rcy-text-dim)', fontSize: 10, margin: '0 0 4px' }}>{q.description}</p>
                    <div className="rcy-bar" style={{ marginBottom: 2 }}>
                      <div className="rcy-bar__fill" style={{ width: `${pct * 100}%`, backgroundColor: pct >= 1 ? 'var(--rcy-green)' : ac }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--rcy-text-mute)' }}>
                      <span>{q.currentCount} / {q.targetCount}</span>
                      {q.location && <span>📍 {q.location}</span>}
                    </div>
                  </div>
                )
              })}
            </Section>
          )}
          {done.length > 0 && (
            <Section label="Concluídas">
              {done.map(q => (
                <div key={q.id} style={{ background: 'rgba(20,60,20,0.2)', border: '1px solid #000', padding: '4px 6px', marginBottom: 3, display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                  <span style={{ color: 'var(--rcy-green)' }}>✓ {q.title}</span>
                  <span style={{ color: 'var(--rcy-text-mute)' }}>+{q.rewardGold}g</span>
                </div>
              ))}
            </Section>
          )}
          {quests.length === 0 && <EmptyState text="Nenhuma missão disponível." />}
        </div>
        <ModalFooter hint="[Q] fechar  ·  [_] minimizar" />
      </div>
    </Overlay>
  )
}

/* ════════════════════════════════════════════════════════════════════════ */
/* SHARED RUCOY MODAL SYSTEM                                              */
/* Pixel-art frame, mobile-friendly width, minimize-to-chip support.       */
/* ════════════════════════════════════════════════════════════════════════ */

interface ModalCtxValue {
  minimize: (() => void) | null
}
const ModalCtx = createContext<ModalCtxValue>({ minimize: null })

/**
 * Minimized tray — singleton bottom-left stack with chips for every
 * modal that's been minimized. Renders nothing when empty.
 */
type MinimizedEntry = { key: string; title: string; restore: () => void; close: () => void }
let minListeners: Array<(s: MinimizedEntry[]) => void> = []
let minState: MinimizedEntry[] = []
function emit() { minListeners.forEach(l => l(minState)) }
function addMin(e: MinimizedEntry) {
  minState = [...minState.filter(x => x.key !== e.key), e]; emit()
}
function removeMin(key: string) {
  minState = minState.filter(x => x.key !== key); emit()
}

export function MinimizedTray() {
  const [s, setS] = useState<MinimizedEntry[]>(minState)
  useEffect(() => { minListeners.push(setS); return () => { minListeners = minListeners.filter(l => l !== setS) } }, [])
  if (s.length === 0) return null
  return (
    <div className="rcy-min-tray">
      {s.map(e => (
        <div key={e.key} className="rcy-min-chip" onClick={e.restore} title="Restaurar">
          <span>▣</span>
          <span>{e.title}</span>
          <span
            className="rcy-min-chip__close"
            onClick={(ev) => { ev.stopPropagation(); e.close() }}
            title="Fechar"
          >×</span>
        </div>
      ))}
    </div>
  )
}

export function Overlay({
  children,
  onBgClick,
  title,
  storageKey,
  minHint,
}: {
  children: React.ReactNode
  onBgClick: () => void
  /** When provided, shows minimize button & registers a chip in the tray. */
  title?: string
  /** Persist minimized state across opens (optional). */
  storageKey?: string
  /** Tiny hint shown next to the chip title. */
  minHint?: string
}) {
  const [minimized, setMinimized] = useState<boolean>(() => {
    if (!storageKey) return false
    try { return sessionStorage.getItem(`rcy:min:${storageKey}`) === '1' } catch { return false }
  })

  const minimize = useCallback(() => {
    setMinimized(true)
    if (storageKey) { try { sessionStorage.setItem(`rcy:min:${storageKey}`, '1') } catch {} }
  }, [storageKey])

  const restore = useCallback(() => {
    setMinimized(false)
    if (storageKey) { try { sessionStorage.removeItem(`rcy:min:${storageKey}`) } catch {} }
  }, [storageKey])

  // Register / unregister minimized chip
  useEffect(() => {
    if (minimized && title) {
      const label = minHint ? `${title} ${minHint}` : title
      addMin({ key: storageKey ?? title, title: label, restore, close: onBgClick })
      return () => removeMin(storageKey ?? title)
    }
  }, [minimized, title, minHint, storageKey, restore, onBgClick])

  if (minimized && title) return null

  return (
    <ModalCtx.Provider value={{ minimize: title ? minimize : null }}>
      <div
        className="rcy-overlay rcy-pixel"
        onClick={e => { if (e.target === e.currentTarget) onBgClick() }}
      >
        {children}
      </div>
    </ModalCtx.Provider>
  )
}

export function ModalHeader({
  title,
  subtitle,
  accent,
  onClose,
}: {
  title: string
  subtitle?: string
  accent?: string
  onClose: () => void
}) {
  const { minimize } = useContext(ModalCtx)
  return (
    <div className="rcy-modal__header">
      <div style={{ display: 'flex', alignItems: 'baseline', minWidth: 0, flex: 1 }}>
        <span className="rcy-modal__title" style={accent ? { color: accent } : undefined}>{title}</span>
        {subtitle && <span className="rcy-modal__subtitle">{subtitle}</span>}
      </div>
      <div className="rcy-modal__actions">
        {minimize && (
          <button className="rcy-btn rcy-btn--icon" onClick={minimize} title="Minimizar" aria-label="Minimizar">_</button>
        )}
        <button className="rcy-btn rcy-btn--icon rcy-btn--close" onClick={onClose} title="Fechar" aria-label="Fechar">×</button>
      </div>
    </div>
  )
}

export function ModalFooter({ hint }: { hint: string }) {
  return <div className="rcy-modal__footer">{hint}</div>
}

export function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div className="rcy-section-label">{label}</div>
      {children}
    </div>
  )
}

export function EmptyState({ text }: { text: string }) {
  return <div style={{ color: 'var(--rcy-text-mute)', textAlign: 'center', padding: '32px 0', fontSize: 11 }}>{text}</div>
}

