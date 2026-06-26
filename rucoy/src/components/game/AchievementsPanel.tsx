import type { GameState } from '@/lib/game/types'
import { ACHIEVEMENTS, TIER_COLORS } from '@/lib/game/achievements'
import { Overlay, ModalHeader, ModalFooter, Section } from './QuestPanel'

interface Props {
  gameState: GameState
  onClose: () => void
}

export default function AchievementsPanel({ gameState, onClose }: Props) {
  if (!gameState.player) return null
  const unlockedIds: string[] = gameState.player._achievements ?? []
  const unlocked = ACHIEVEMENTS.filter(a =>  unlockedIds.includes(a.id))
  const locked   = ACHIEVEMENTS.filter(a => !unlockedIds.includes(a.id))
  const pct      = Math.round((unlocked.length / ACHIEVEMENTS.length) * 100)

  return (
    <Overlay onBgClick={onClose} title="Conquistas" storageKey="ach">
      <div className="rcy-modal rcy-modal--wide rcy-pixel">
        <ModalHeader title="CONQUISTAS" subtitle={`${unlocked.length} / ${ACHIEVEMENTS.length}  (${pct}%)`} accent="var(--rcy-purple)" onClose={onClose} />

        <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--rcy-border-strong)' }}>
          <div className="rcy-bar rcy-bar--xp" style={{ height: 8 }}>
            <div className="rcy-bar__fill" style={{ width: `${pct}%`, background: 'linear-gradient(180deg,#c040ff,#6020b0)' }} />
          </div>
        </div>

        <div className="rcy-modal__body">
          {unlocked.length > 0 && (
            <>
              <div className="rcy-section-label">DESBLOQUEADAS ({unlocked.length})</div>
              <div className="rcy-slot-grid" style={{ marginBottom: 12 }}>
                {unlocked.map(a => (
                  <div
                    key={a.id}
                    title={`${a.title} — ${a.description} (+${a.rewardGold}g)`}
                    className="rcy-slot"
                    style={{ boxShadow: `inset 0 0 0 1px ${TIER_COLORS[a.tier]}aa, inset 0 -8px 8px rgba(0,0,0,0.35)` }}
                  >
                    {a.icon}
                  </div>
                ))}
              </div>
            </>
          )}

          {locked.length > 0 && (
            <>
              <div className="rcy-section-label">BLOQUEADAS ({locked.length})</div>
              <div className="rcy-slot-grid">
                {locked.map(a => (
                  <div
                    key={a.id}
                    title={`??? — ${a.description}`}
                    className="rcy-slot rcy-slot--locked"
                    style={{ filter: 'grayscale(1)' }}
                  >
                    {a.icon}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <ModalFooter hint="[A] fechar  ·  Passe o mouse para ver detalhes" />
      </div>
    </Overlay>
  )
}
