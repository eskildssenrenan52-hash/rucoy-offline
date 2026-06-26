import { useState } from 'react'
import type { Player, Item } from '@/lib/game/types'
import { Overlay, ModalHeader, ModalFooter } from './QuestPanel'

const RARITY_COLORS: Record<string, string> = {
  common: '#8a9ab0', uncommon: '#40cc60', rare: '#4080ff', epic: '#c040ff', legendary: '#ff8c00',
}
const RARITY_LABELS: Record<string, string> = {
  common: 'Comum', uncommon: 'Incomum', rare: 'Raro', epic: 'Épico', legendary: 'Lendário',
}
const STAT_LABELS: Record<string, string> = {
  maxHp: 'HP Máx', maxMp: 'MP Máx', attack: 'Ataque', defense: 'Defesa',
  speed: 'Velocidade', critChance: 'Critico %', critDamage: 'Dano Crit %', magicPower: 'Poder Mágico', range: 'Alcance',
}

interface Props {
  player: Player
  onClose: () => void
  onUseItem: (slotIdx: number) => void
}

export default function InventoryPanel({ player, onClose, onUseItem }: Props) {
  const [hovered, setHovered] = useState<number | null>(null)

  const equip = player.equipment
  const SLOTS = 30
  const slots = Array.from({ length: SLOTS }, (_, i) => player.inventory[i] ?? null)

  return (
    <Overlay onBgClick={onClose} title="Inventário" storageKey="inv">
      <div className="rcy-modal rcy-modal--wide rcy-pixel">
        <ModalHeader title="INVENTÁRIO" subtitle={`${player.inventory.filter(Boolean).length} / ${SLOTS} itens`} accent="var(--rcy-blue)" onClose={onClose} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', flex: 1, overflow: 'hidden' }}>
          <div className="rcy-modal__body" style={{ padding: '10px 12px' }}>
            <div style={{ marginBottom: 10 }}>
              <div className="rcy-section-label">EQUIPAMENTOS</div>
              <div style={{ display: 'flex', gap: 4 }}>
                {(['weapon','armor','helmet','boots','ring'] as const).map(slot => {
                  const item = equip[slot]
                  const cls = item ? `rcy-slot rcy-slot--sm rcy-slot--${item.rarity}` : 'rcy-slot rcy-slot--sm rcy-slot--empty'
                  return (
                    <div key={slot} title={item ? item.name : slot} className={cls}>
                      {item ? item.icon : '–'}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="rcy-section-label">MOCHILA</div>
            <div className="rcy-slot-grid">
              {slots.map((item, i) => {
                const isHov = hovered === i
                const cls = item
                  ? `rcy-slot rcy-slot--${item.rarity}${isHov ? ' rcy-slot--active' : ''}`
                  : 'rcy-slot rcy-slot--empty'
                return (
                  <div
                    key={i}
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => item && onUseItem(i)}
                    className={cls}
                  >
                    {item ? (
                      <>
                        <span>{item.icon}</span>
                        {item.stackable && (item.quantity ?? 0) > 1 && (
                          <span className="rcy-slot__qty">{item.quantity}</span>
                        )}
                      </>
                    ) : '·'}
                  </div>
                )
              })}
            </div>
          </div>

          <div style={{ borderLeft: '1px solid var(--rcy-border-strong)', overflowY: 'auto', padding: '12px 10px', background: 'var(--rcy-panel)' }}>
            {hovered !== null && slots[hovered] ? (() => {
              const item = slots[hovered]!
              const rc   = RARITY_COLORS[item.rarity]
              return (
                <>
                  <div style={{ fontSize: 34, textAlign: 'center', marginBottom: 6 }}>{item.icon}</div>
                  <div style={{ color: rc, fontWeight: 700, fontSize: 12, textAlign: 'center', textShadow: '1px 1px 0 #000' }}>{item.name}</div>
                  <div style={{ color: rc, opacity: 0.7, fontSize: 9, textAlign: 'center', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{RARITY_LABELS[item.rarity]}</div>
                  <p style={{ color: 'var(--rcy-text-dim)', fontSize: 10, marginBottom: 8, lineHeight: 1.4, textShadow: '1px 1px 0 #000' }}>{item.description}</p>
                  <div className="rcy-stat-grid">
                    {Object.entries(item.stats).filter(([, v]) => v).map(([k, v]) => (
                      <span key={k} style={{ display: 'contents' }}>
                        <span>{STAT_LABELS[k] ?? k}</span>
                        <span style={{ color: (v as number) > 0 ? 'var(--rcy-green)' : 'var(--rcy-red)' }}>
                          {(v as number) > 0 ? '+' : ''}{v}
                        </span>
                      </span>
                    ))}
                  </div>
                  {item.type === 'consumable' && (
                    <button
                      onClick={() => onUseItem(hovered)}
                      className="rcy-btn rcy-btn--green"
                      style={{ marginTop: 10, width: '100%' }}
                    >
                      Usar Item
                    </button>
                  )}
                </>
              )
            })() : (
              <div style={{ color: 'var(--rcy-text-mute)', textAlign: 'center', paddingTop: 40, fontSize: 11, textShadow: '1px 1px 0 #000' }}>
                Passe o mouse sobre um item para ver detalhes
              </div>
            )}
          </div>
        </div>

        <ModalFooter hint="[I] fechar  ·  Clique em consumível para usar" />
      </div>
    </Overlay>
  )
}
