// @ts-nocheck
import { useState } from 'react'
import type { Player } from '@/lib/game/types'
import { Overlay, ModalHeader, ModalFooter, Section } from './QuestPanel'
import {
  PRESTIGE_TREE, canPrestige, prestigeRequirement, performPrestige,
  investPrestigePoint, resetPrestigePoints, getActiveTitle,
} from '@/lib/game/prestigeSystem'

interface Props {
  player: Player
  onClose: () => void
  onPlayerUpdate: (p: Player) => void
}

const ACCENT = '#d8a534'

export default function PrestigePanel({ player, onClose, onPlayerUpdate }: Props) {
  const [msg, setMsg] = useState<string>('')
  const info = player.prestige?.byClass[player.class]
  const rank = info?.rank ?? 0
  const points = info?.totalPoints ?? 0
  const title = getActiveTitle(player)
  const canDo = canPrestige(player)
  const need = prestigeRequirement(rank)

  const grouped: Record<string, typeof PRESTIGE_TREE> = {
    'Combate': PRESTIGE_TREE.slice(0, 3),
    'Vitalidade': PRESTIGE_TREE.slice(3, 6),
    'Magia & Mobilidade': PRESTIGE_TREE.slice(6, 9),
    'Bônus Globais': PRESTIGE_TREE.slice(9, 12),
    'Keystones': PRESTIGE_TREE.slice(12),
  }

  const doPrestige = () => {
    if (!canDo) { setMsg(`Precisa de nível ${need} para prestigiar.`); return }
    const np = performPrestige(player)
    onPlayerUpdate(np)
    setMsg(`★ Prestígio ${np.prestige?.byClass[np.class].rank} alcançado!`)
  }
  const invest = (nodeId: string) => {
    const np = investPrestigePoint(player, nodeId)
    if (np === player) { setMsg('Sem pontos ou rank máximo atingido.'); return }
    onPlayerUpdate(np); setMsg('')
  }
  const reset = () => {
    const np = resetPrestigePoints(player)
    onPlayerUpdate(np); setMsg('Pontos resetados.')
  }

  return (
    <Overlay onBgClick={onClose} title="Prestígio" storageKey="prestige">
      <div className="rcy-modal rcy-modal--xl rcy-pixel" style={{ borderColor: ACCENT + '60' }}>
        <ModalHeader title="★ PRESTÍGIO  ·  ASCENSÃO ETERNA" accent={ACCENT} onClose={onClose} />

        <div style={{ padding: '8px 12px', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', fontSize: 11, background: 'rgba(40,28,8,0.4)', borderBottom: `1px solid var(--rcy-border-strong)`, textShadow: '1px 1px 0 #000' }}>
          <span style={{ color: ACCENT }}>Classe: <b style={{ color: 'var(--rcy-text)' }}>{player.class}</b></span>
          <span style={{ color: ACCENT }}>Rank: <b style={{ color: 'var(--rcy-text)' }}>{rank}</b> / 10</span>
          <span style={{ color: ACCENT }}>Pontos: <b style={{ color: 'var(--rcy-text)' }}>{points}</b></span>
          {title && <span style={{ color: '#ffe070' }}>“{title}”</span>}
          <span style={{ marginLeft: 'auto', color: canDo ? 'var(--rcy-green)' : 'var(--rcy-text-mute)' }}>
            Próximo: nv {need} {canDo ? '✓' : `(${player.level}/${need})`}
          </span>
          <button onClick={doPrestige} disabled={!canDo} className={`rcy-btn ${canDo ? 'rcy-btn--gold' : 'rcy-btn--locked'}`}>★ PRESTIGIAR</button>
          <button onClick={reset} className="rcy-btn">Resetar</button>
        </div>

        {msg && (
          <div style={{ padding: '6px 14px', background: 'rgba(30,20,4,0.9)', color: ACCENT, fontSize: 11, textShadow: '1px 1px 0 #000' }}>{msg}</div>
        )}

        <div className="rcy-modal__body">
          {Object.entries(grouped).map(([label, nodes]) => (
            <div key={label} style={{ marginBottom: 12 }}>
              <div className="rcy-section-label">{label}</div>
              <div className="rcy-slot-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', alignItems: 'stretch' }}>
                {nodes.map(node => {
                  const owned = info?.spent[node.id] ?? 0
                  const maxed = owned >= node.maxRank
                  const can = (points >= node.cost) && !maxed
                  return (
                    <div key={node.id} className="rcy-frame" style={{ padding: 8, borderColor: maxed ? ACCENT : owned > 0 ? ACCENT + '88' : 'var(--rcy-border-strong)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <div className={`rcy-slot rcy-slot--sm ${maxed ? 'rcy-slot--active' : ''}`} style={{ flexShrink: 0, fontSize: 18 }}>{node.icon}</div>
                        <span style={{ color: maxed ? ACCENT : 'var(--rcy-text)', fontWeight: 700, fontSize: 11, textShadow: '1px 1px 0 #000' }}>{node.name}</span>
                        <span style={{ marginLeft: 'auto', color: 'var(--rcy-text-dim)', fontSize: 10 }}>{owned}/{node.maxRank}</span>
                      </div>
                      <p style={{ color: 'var(--rcy-text-dim)', fontSize: 10, margin: '0 0 6px 0', lineHeight: 1.4, textShadow: '1px 1px 0 #000' }}>{node.description}</p>
                      <button onClick={() => invest(node.id)} disabled={!can} className={`rcy-btn ${can ? 'rcy-btn--gold' : 'rcy-btn--locked'}`} style={{ width: '100%' }}>
                        {maxed ? 'MAX' : `Investir (${node.cost}p)`}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <ModalFooter hint="★ Prestigie ao nv 50 (depois 60, 70...) — ganha pontos eternos." />
      </div>
    </Overlay>
  )
}
