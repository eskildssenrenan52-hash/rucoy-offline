import type { Player } from '@/lib/game/types'
import { PASSIVES, getUnlockedPassives } from '@/lib/game/passives'
import { Overlay, ModalHeader, ModalFooter, Section } from './QuestPanel'

const CLASS_COLORS: Record<string, string> = {
  knight: '#d0a030', archer: '#40c060', mage: '#4080ff', necromancer: '#c040ff',
  paladin: '#f0d878', berserker: '#c83030', assassin: '#a0a0c0', druid: '#3aa84a',
}

interface Props {
  player: Player
  onClose: () => void
}

export default function PassiveTree({ player, onClose }: Props) {
  const unlocked = getUnlockedPassives(player)
  const upcoming = PASSIVES
    .filter(p => (!p.cls || p.cls === player.class) && player.level < p.level)
    .sort((a, b) => a.level - b.level)
    .slice(0, 8)

  const bonusSummary: Record<string, number> = {}
  for (const p of unlocked) {
    bonusSummary[p.stat] = (bonusSummary[p.stat] ?? 0) + p.value
  }

  return (
    <Overlay onBgClick={onClose} title="Passivas" storageKey="passive">
      <div className="rcy-modal rcy-modal--wide rcy-pixel">
        <ModalHeader title="PASSIVAS" subtitle={`${unlocked.length} ativas  ·  Lv ${player.level}`} accent="var(--rcy-blue)" onClose={onClose} />

        <div className="rcy-modal__body">
          {Object.keys(bonusSummary).length > 0 && (
            <div className="rcy-frame" style={{ padding: '6px 10px', marginBottom: 10, display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
              {Object.entries(bonusSummary).map(([stat, val]) => (
                <span key={stat} style={{ fontSize: 10, color: 'var(--rcy-blue)', textShadow: '1px 1px 0 #000' }}>
                  <span style={{ color: 'var(--rcy-text-mute)' }}>{stat}:</span> +{typeof val === 'number' && val < 1 ? `${(val*100).toFixed(0)}%` : val}
                </span>
              ))}
            </div>
          )}

          {unlocked.length > 0 && (
            <>
              <div className="rcy-section-label">ATIVAS ({unlocked.length})</div>
              <div className="rcy-slot-grid" style={{ marginBottom: 12 }}>
                {unlocked.map(p => (
                  <div
                    key={p.id}
                    title={`${p.name} (Nv ${p.level}) — ${p.description}`}
                    className="rcy-slot"
                    style={{ boxShadow: `inset 0 0 0 1px ${(p.cls ? CLASS_COLORS[p.cls] : '#40b060')}aa, inset 0 -8px 8px rgba(0,0,0,0.35)` }}
                  >
                    {p.icon}
                    <span className="rcy-slot__badge">{p.level}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {upcoming.length > 0 && (
            <>
              <div className="rcy-section-label">PRÓXIMAS</div>
              <div className="rcy-slot-grid">
                {upcoming.map(p => (
                  <div
                    key={p.id}
                    title={`${p.name} (Lv ${p.level}) — ${p.description}`}
                    className="rcy-slot rcy-slot--locked"
                  >
                    {p.icon}
                    <span className="rcy-slot__badge" style={{ color: 'var(--rcy-text-mute)' }}>{p.level}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {unlocked.length === 0 && upcoming.length === 0 && (
            <div style={{ color: 'var(--rcy-text-mute)', textAlign: 'center', padding: '32px 0', textShadow: '1px 1px 0 #000' }}>Suba de nível para desbloquear passivas.</div>
          )}
        </div>

        <ModalFooter hint="[P] fechar  ·  Passivas aplicadas automaticamente ao subir de nível" />
      </div>
    </Overlay>
  )
}
