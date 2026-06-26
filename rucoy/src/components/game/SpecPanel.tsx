// @ts-nocheck
import { useState } from 'react'
import type { Player } from '@/lib/game/types'
import { Overlay, ModalHeader, ModalFooter, Section } from './QuestPanel'
import {
  SPECIALIZATIONS, SPEC_UNLOCK_LEVEL, getSpecsForClass, setActiveSpec,
  specPointsAvailable, investSpecPoint, resetSpec,
} from '@/lib/game/specializations'

interface Props {
  player: Player
  onClose: () => void
  onPlayerUpdate: (p: Player) => void
}

const ACCENT = '#7ab8ff'

export default function SpecPanel({ player, onClose, onPlayerUpdate }: Props) {
  const specs = getSpecsForClass(player.class)
  const activeId = player.specializations?.active[player.class] ?? specs[0]?.id
  const [selectedId, setSelectedId] = useState<string>(activeId ?? specs[0].id)
  const spec = specs.find(s => s.id === selectedId) ?? specs[0]
  const invested = player.specializations?.invested[spec.id] ?? {}
  const points = specPointsAvailable(player, spec.id)
  const unlocked = player.level >= SPEC_UNLOCK_LEVEL
  const [msg, setMsg] = useState('')

  const setActive = () => {
    const np = setActiveSpec(player, spec.id)
    if (np === player) { setMsg('Precisa de nível 30 e classe correta.'); return }
    onPlayerUpdate(np); setMsg(`Especialização "${spec.name}" ativada!`)
  }
  const invest = (nodeId: string) => {
    const np = investSpecPoint(player, spec.id, nodeId)
    if (np === player) { setMsg('Sem pontos ou pré-requisitos não cumpridos.'); return }
    onPlayerUpdate(np); setMsg('')
  }
  const reset = () => { onPlayerUpdate(resetSpec(player, spec.id)); setMsg('Talentos resetados.') }

  // Build grid by row
  const maxRow = spec.tree.reduce((m, n) => Math.max(m, n.row), 0)
  const maxCol = 5

  return (
    <Overlay onBgClick={onClose} title="Especialização" storageKey="spec">
      <div className="rcy-modal rcy-modal--xl rcy-pixel" style={{ borderColor: ACCENT + '55' }}>
        <ModalHeader title="✦ ESPECIALIZAÇÕES" accent={ACCENT} onClose={onClose} />

        <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--rcy-border-strong)', display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', fontSize: 11 }}>
          {specs.map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedId(s.id)}
              className={`rcy-btn ${selectedId === s.id ? 'rcy-btn--active' : ''}`}
              style={{ color: selectedId === s.id ? s.color : 'var(--rcy-text)' }}
            >
              {s.icon} {s.name}
              {activeId === s.id && <span style={{ marginLeft: 4, color: 'var(--rcy-green)' }}>●</span>}
            </button>
          ))}
          <span style={{ marginLeft: 'auto', color: ACCENT, textShadow: '1px 1px 0 #000' }}>Pontos: <b style={{ color: 'var(--rcy-text)' }}>{points}</b></span>
          <button onClick={setActive} disabled={!unlocked || activeId === spec.id} className={`rcy-btn ${activeId === spec.id ? 'rcy-btn--green' : 'rcy-btn--gold'}`}>
            {activeId === spec.id ? '✓ ATIVA' : 'Ativar'}
          </button>
          <button onClick={reset} className="rcy-btn rcy-btn--red">Resetar</button>
        </div>

        <div style={{ padding: '6px 14px', color: spec.color, fontSize: 10, fontStyle: 'italic', borderBottom: '1px solid var(--rcy-border-strong)', textShadow: '1px 1px 0 #000' }}>
          “{spec.flavor}”
        </div>

        {!unlocked && (
          <div style={{ padding: '6px 14px', background: 'rgba(40,28,8,0.5)', color: 'var(--rcy-orange)', fontSize: 11, textShadow: '1px 1px 0 #000' }}>
            🔒 Desbloqueia no nível {SPEC_UNLOCK_LEVEL} (atual: {player.level})
          </div>
        )}
        {msg && <div style={{ padding: '6px 14px', color: ACCENT, fontSize: 11, textShadow: '1px 1px 0 #000' }}>{msg}</div>}

        <div className="rcy-modal__body">
          <div className="rcy-section-label">ÁRVORE DE TALENTOS</div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${maxCol}, var(--rcy-slot))`, gap: 6 }}>
            {Array.from({ length: maxRow * maxCol }, (_, idx) => {
              const row = Math.floor(idx / maxCol) + 1
              const col = idx % maxCol
              const node = spec.tree.find(n => n.row === row && n.col === col)
              if (!node) return <div key={idx} style={{ width: 'var(--rcy-slot)', height: 'var(--rcy-slot)' }} />
              const owned = invested[node.id] ?? 0
              const maxed = owned >= node.maxRank
              const can = points >= node.cost && !maxed && unlocked
              return (
                <button
                  key={node.id}
                  onClick={() => invest(node.id)}
                  disabled={!can && !maxed}
                  title={`${node.name} — ${node.description} (${owned}/${node.maxRank} · ${node.cost}p)`}
                  className={`rcy-slot ${maxed ? 'rcy-slot--active' : ''} ${!can && !maxed ? 'rcy-slot--locked' : ''}`}
                  style={{ boxShadow: owned > 0 ? `inset 0 0 0 1px ${spec.color}aa, inset 0 -8px 8px rgba(0,0,0,0.35)` : undefined }}
                >
                  {node.icon}
                  <span className="rcy-slot__badge">{owned}/{node.maxRank}</span>
                </button>
              )
            })}
          </div>
        </div>

        <ModalFooter hint="✦ Clique num talento para investir · cada spec usa pontos próprios" />
      </div>
    </Overlay>
  )
}
