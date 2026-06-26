import { memo, useState } from 'react'
import type { PlayerPets, Pet } from '@/lib/game/types'
import { getActivePetBonuses } from '@/lib/game/petSystem'

interface Props {
  pets: PlayerPets
  onClose: () => void
  onSelectPet?: (petId: string) => void
  onFeedPet?: (petId: string) => void
  onAddToParty?: (petId: string, slot: number) => void
  onSetActive?: (petId: string) => void
}

const RARITY_COLOR: Record<string, string> = {
  common: 'rcy-slot--common',
  uncommon: 'rcy-slot--uncommon',
  rare: 'rcy-slot--rare',
  epic: 'rcy-slot--epic',
  legendary: 'rcy-slot--legendary',
}

function moodEmoji(m: Pet['mood']) {
  return ({ happy: '😊', neutral: '😐', angry: '😠', hungry: '😋' } as const)[m]
}

function PetPanel({ pets, onClose, onSelectPet, onFeedPet, onAddToParty, onSetActive }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(pets.active || pets.pets[0]?.id || null)
  const selected = selectedId ? pets.pets.find(p => p.id === selectedId) ?? null : null
  const bonuses = getActivePetBonuses(pets)

  return (
    <div
      className="rcy-overlay rcy-pixel"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="rcy-modal rcy-modal--wide">
        <div className="rcy-modal__header">
          <span className="rcy-modal__title">🐾 PETS</span>
          <span className="rcy-modal__subtitle">
            {pets.pets.length} criatura(s) · XP +{Math.round((bonuses.xpMul - 1) * 100)}% · Drop +{Math.round((bonuses.dropMul - 1) * 100)}%
          </span>
          <div className="rcy-modal__actions">
            <button className="rcy-btn rcy-btn--icon rcy-btn--close" onClick={onClose} aria-label="Fechar">×</button>
          </div>
        </div>

        <div className="rcy-modal__body" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.4fr)', gap: 12 }}>
          {/* Pet grid */}
          <div>
            <div className="rcy-section-label">COLEÇÃO</div>
            <div className="rcy-slot-grid">
              {pets.pets.map(pet => {
                const isSel = pet.id === selectedId
                const isActive = pet.id === pets.active
                const cls = `rcy-slot ${RARITY_COLOR[pet.rarity] || ''} ${isSel ? 'rcy-slot--active' : ''}`
                return (
                  <div
                    key={pet.id}
                    className={cls}
                    onClick={() => { setSelectedId(pet.id); onSelectPet?.(pet.id) }}
                    title={`${pet.name} · Nv ${pet.level} · ${pet.rarity}`}
                  >
                    <span style={{ fontSize: 22 }}>{pet.image}</span>
                    <span className="rcy-slot__badge">{pet.level}</span>
                    {isActive && (
                      <span className="rcy-slot__qty" style={{ color: 'var(--rcy-gold)' }}>★</span>
                    )}
                  </div>
                )
              })}
              {pets.pets.length === 0 && (
                <div className="rcy-slot rcy-slot--empty">vazio</div>
              )}
            </div>

            <div className="rcy-section-label" style={{ marginTop: 12 }}>PARTY (3)</div>
            <div className="rcy-slot-grid">
              {[0, 1, 2].map(slot => {
                const id = pets.partySlots[slot]
                const pet = id ? pets.pets.find(p => p.id === id) : null
                return (
                  <div
                    key={slot}
                    className={`rcy-slot ${pet ? 'rcy-slot--active' : 'rcy-slot--empty'}`}
                    onClick={() => selected && onAddToParty?.(selected.id, slot)}
                    title={pet ? pet.name : `Slot ${slot + 1} — clique para alocar`}
                  >
                    {pet ? <span style={{ fontSize: 22 }}>{pet.image}</span> : <span>+</span>}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Detail */}
          <div>
            {!selected ? (
              <div className="rcy-section-label">Selecione um pet</div>
            ) : (
              <>
                <div className="rcy-section-label">
                  {selected.name} · {selected.type} · Nv {selected.level} · {selected.rarity.toUpperCase()}
                </div>

                {/* XP bar */}
                <div style={{ marginBottom: 6 }}>
                  <div className="rcy-bar rcy-bar--xp">
                    <div className="rcy-bar__fill" style={{ width: `${(selected.xp / Math.max(1, selected.xpToNext)) * 100}%` }} />
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--rcy-text-mute)', marginTop: 2 }}>
                    XP {selected.xp}/{selected.xpToNext}
                  </div>
                </div>

                {/* HP bar */}
                <div style={{ marginBottom: 8 }}>
                  <div className="rcy-bar rcy-bar--hp">
                    <div className="rcy-bar__fill" style={{ width: `${(selected.stats.hp / Math.max(1, selected.stats.maxHp)) * 100}%` }} />
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--rcy-text-mute)', marginTop: 2 }}>
                    HP {selected.stats.hp}/{selected.stats.maxHp}
                  </div>
                </div>

                <div className="rcy-stat-grid" style={{ marginBottom: 10 }}>
                  <span>Ataque</span><span>{Math.round(selected.stats.attack)}</span>
                  <span>Defesa</span><span>{Math.round(selected.stats.defense)}</span>
                  <span>Velocidade</span><span>{selected.stats.speed}</span>
                  <span>Mágica</span><span>{Math.round(selected.stats.magicPower)}</span>
                  <span>Humor</span><span>{moodEmoji(selected.mood)} {selected.mood}</span>
                  <span>Fidelidade</span><span>{selected.loyalty}%</span>
                  <span>Felicidade</span><span>{selected.happiness}%</span>
                </div>

                <div className="rcy-section-label">BÔNUS PASSIVO (quando ativo)</div>
                <div className="rcy-stat-grid" style={{ marginBottom: 10 }}>
                  <span>XP ganho</span><span>+{Math.round((bonuses.xpMul - 1) * 100)}%</span>
                  <span>Ouro</span><span>+{Math.round((bonuses.goldMul - 1) * 100)}%</span>
                  <span>Chance de drop</span><span>+{Math.round((bonuses.dropMul - 1) * 100)}%</span>
                  <span>Dano extra estimado</span><span>+{bonuses.damageFlat}</span>
                </div>

                <div className="rcy-section-label">HABILIDADES</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
                  {selected.skills.map(s => (
                    <div key={s.name} className="rcy-frame" style={{ padding: 6, display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 18 }}>{s.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: 'var(--rcy-gold)', fontSize: 12 }}>{s.name}</div>
                        <div style={{ color: 'var(--rcy-text-mute)', fontSize: 10 }}>{s.description}</div>
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--rcy-text-dim)' }}>
                        DMG {s.damage} · CD {s.cooldown}s
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button
                    className={`rcy-btn ${pets.active === selected.id ? 'rcy-btn--active' : 'rcy-btn--gold'}`}
                    onClick={() => onSetActive?.(selected.id)}
                  >
                    {pets.active === selected.id ? '★ ATIVO' : '★ Tornar Ativo'}
                  </button>
                  <button className="rcy-btn rcy-btn--green" onClick={() => onFeedPet?.(selected.id)}>
                    🍖 Alimentar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="rcy-modal__footer">
          [E] fechar · Pet ativo segue o personagem e ataca monstros próximos
        </div>
      </div>
    </div>
  )
}

export default memo(PetPanel)
