import { useState } from 'react'
import type { Player, Item } from '@/lib/game/types'
import { playSfx } from '@/lib/game/audio'
import { Overlay, ModalHeader, ModalFooter, Section } from './QuestPanel'

export interface CraftRecipe {
  id: string
  name: string
  icon: string
  result: Item
  materials: { id: string; name: string; count: number }[]
  goldCost: number
}

const RARITY_COLORS: Record<string, string> = {
  common: '#8a9ab0', uncommon: '#40cc60', rare: '#4080ff', epic: '#c040ff', legendary: '#ff8c00',
}

const RARITY_LABELS: Record<string, string> = {
  common: 'Comum', uncommon: 'Incomum', rare: 'Raro', epic: 'Épico', legendary: 'Lendário',
}

const MAT_DISPLAY: Record<string, { label: string; icon: string }> = {
  slime_gel:          { label: 'Gel',     icon: '💚' },
  bone_shard:         { label: 'Osso',    icon: '🦴' },
  wolf_pelt:          { label: 'Pele',    icon: '🐺' },
  demon_horn:         { label: 'Chifre',  icon: '😈' },
  dragon_scale:       { label: 'Escama',  icon: '🐉' },
  void_crystal:       { label: 'Cristal', icon: '🔷' },
  ghost_essence:      { label: 'Espírito',icon: '👻' },
  ancient_bark_piece: { label: 'Casca',   icon: '🪵' },
  iron_ore:           { label: 'Ferro',   icon: '⛏' },
  gold_ore:           { label: 'Ouro',    icon: '🪙' },
  mythril_ore:        { label: 'Mythril', icon: '💠' },
  diamond:            { label: 'Diamante',icon: '💎' },
}

export const CRAFT_RECIPES: CraftRecipe[] = [
  {
    id: 'craft_chainmail', name: 'Cota de Malha', icon: '🛡',
    result: { id: 'chainmail', name: 'Cota de Malha', type: 'armor', rarity: 'uncommon', icon: '🛡', description: 'Aneis metálicos.', stats: { defense: 12, maxHp: 40 }, value: 250 },
    materials: [{ id: 'bone_shard', name: 'Fragmento de Osso', count: 5 }], goldCost: 80,
  },
  {
    id: 'craft_swift_boots', name: 'Botas Velozes', icon: '👢',
    result: { id: 'swift_boots', name: 'Botas Velozes', type: 'boots', rarity: 'rare', icon: '👢', description: 'Encantadas para velocidade.', stats: { speed: 4, defense: 4 }, value: 800 },
    materials: [{ id: 'wolf_pelt', name: 'Pele de Lobo', count: 5 }, { id: 'slime_gel', name: 'Gel de Slime', count: 3 }], goldCost: 300,
  },
  {
    id: 'craft_power_ring', name: 'Anel do Poder', icon: '💍',
    result: { id: 'power_ring', name: 'Anel do Poder', type: 'ring', rarity: 'rare', icon: '💍', description: 'Amplifica o portador.', stats: { maxHp: 50, maxMp: 50, attack: 10, critChance: 5 }, value: 1500 },
    materials: [{ id: 'wolf_pelt', name: 'Pele de Lobo', count: 3 }, { id: 'slime_gel', name: 'Gel de Slime', count: 5 }], goldCost: 200,
  },
  {
    id: 'craft_titan_armor', name: 'Armadura do Titan', icon: '🛡',
    result: { id: 'titan_armor', name: 'Armadura do Titan', type: 'armor', rarity: 'epic', icon: '🛡', description: 'Forjada no abismo.', stats: { defense: 50, maxHp: 200, speed: -2 }, value: 5000 },
    materials: [{ id: 'dragon_scale', name: 'Escama de Dragão', count: 3 }, { id: 'demon_horn', name: 'Chifre Demonico', count: 5 }], goldCost: 2000,
  },
  {
    id: 'craft_void_blade', name: 'Lâmina do Vazio', icon: '🗡',
    result: { id: 'void_blade', name: 'Lâmina do Vazio', type: 'weapon', rarity: 'legendary', icon: '🗡', description: 'Forjada no Abismo Eterno.', stats: { attack: 120, critChance: 20, critDamage: 80, speed: 1 }, value: 25000 },
    materials: [{ id: 'void_crystal', name: 'Cristal do Vazio', count: 8 }, { id: 'demon_horn', name: 'Chifre Demonico', count: 5 }, { id: 'dragon_scale', name: 'Escama de Dragão', count: 2 }], goldCost: 5000,
  },
  {
    id: 'craft_ghost_staff', name: 'Cajado das Almas', icon: '🪄',
    result: { id: 'soul_staff', name: 'Cajado das Almas', type: 'weapon', rarity: 'legendary', icon: '🪄', description: 'Alimentado por almas.', stats: { attack: 60, magicPower: 150, maxMp: 200, critChance: 15 }, value: 28000 },
    materials: [{ id: 'ghost_essence', name: 'Essência Fantasmal', count: 5 }, { id: 'void_crystal', name: 'Cristal do Vazio', count: 4 }], goldCost: 6000,
  },
  {
    id: 'craft_ancient_armor', name: 'Armadura do Abismo', icon: '🛡',
    result: { id: 'abyss_armor', name: 'Armadura do Abismo', type: 'armor', rarity: 'legendary', icon: '🛡', description: 'Tecida das trevas.', stats: { defense: 90, maxHp: 500, speed: -1 }, value: 30000 },
    materials: [{ id: 'ancient_bark_piece', name: 'Casca Ancião', count: 10 }, { id: 'dragon_scale', name: 'Escama de Dragão', count: 4 }], goldCost: 8000,
  },
  // ─── CHAVES DE PORTAL SECRETO ───
  {
    id: 'craft_stellar_key', name: '✦ Chave Estelar', icon: '✦',
    result: { id: 'stellar_key', name: 'Chave Estelar', type: 'consumable', rarity: 'legendary', icon: '✦', description: 'Abre o portal secreto da Fenda Estelar (norte da cidade, esquerda).', stats: {}, stackable: true, quantity: 1, value: 50000 },
    materials: [
      { id: 'void_crystal', name: 'Cristal do Vazio', count: 12 },
      { id: 'ghost_essence', name: 'Essência Fantasmal', count: 8 },
      { id: 'dragon_scale', name: 'Escama de Dragão', count: 5 },
    ],
    goldCost: 15000,
  },
  {
    id: 'craft_primordial_seed', name: '❀ Semente Primordial', icon: '🌱',
    result: { id: 'primordial_seed', name: 'Semente Primordial', type: 'consumable', rarity: 'legendary', icon: '🌱', description: 'Abre o portal secreto do Jardim Eterno (norte da cidade, direita).', stats: {}, stackable: true, quantity: 1, value: 50000 },
    materials: [
      { id: 'ancient_bark_piece', name: 'Casca Ancião', count: 15 },
      { id: 'slime_gel', name: 'Gel de Slime', count: 30 },
      { id: 'wolf_pelt', name: 'Pele de Lobo', count: 20 },
      { id: 'demon_horn', name: 'Chifre Demonico', count: 6 },
    ],
    goldCost: 15000,
  },

  // ╔══════════════════════════════════════════════════════════════╗
  // ║          FERRAMENTAS DE MINERAÇÃO (PICARETAS)                ║
  // ╚══════════════════════════════════════════════════════════════╝
  {
    id: 'craft_wooden_pickaxe', name: 'Picareta de Madeira', icon: '⛏',
    result: { id: 'wooden_pickaxe', name: 'Picareta de Madeira', type: 'weapon', rarity: 'common', icon: '⛏', description: 'Permite minerar minérios básicos.', stats: { attack: 4 }, value: 25 },
    materials: [{ id: 'ancient_bark_piece', name: 'Casca Ancião', count: 2 }],
    goldCost: 30,
  },
  {
    id: 'craft_iron_pickaxe', name: 'Picareta de Ferro', icon: '⛏',
    result: { id: 'iron_pickaxe', name: 'Picareta de Ferro', type: 'weapon', rarity: 'uncommon', icon: '⛏', description: 'Mineração mais rápida (+2 por nó).', stats: { attack: 12, critChance: 5 }, value: 250 },
    materials: [{ id: 'iron_ore', name: 'Minério de Ferro', count: 12 }, { id: 'ancient_bark_piece', name: 'Casca', count: 2 }],
    goldCost: 200,
  },
  {
    id: 'craft_mythril_pickaxe', name: 'Picareta de Mythril', icon: '⛏',
    result: { id: 'mythril_pickaxe', name: 'Picareta de Mythril', type: 'weapon', rarity: 'rare', icon: '⛏', description: 'Quebra qualquer rocha (+3 por nó).', stats: { attack: 30, critChance: 12, magicPower: 10 }, value: 2400 },
    materials: [{ id: 'mythril_ore', name: 'Mythril Bruto', count: 10 }, { id: 'iron_ore', name: 'Ferro', count: 20 }],
    goldCost: 2000,
  },

  // ╔══════════════════════════════════════════════════════════════╗
  // ║          CONJUNTO RÚNICO DE FERRO (3 peças)                  ║
  // ╚══════════════════════════════════════════════════════════════╝
  {
    id: 'craft_iron_set_helm', name: 'Elmo Rúnico', icon: '⛑',
    result: { id: 'iron_set_helm', name: 'Elmo Rúnico de Ferro', type: 'helmet', rarity: 'rare', icon: '⛑', description: 'Parte do conjunto Rúnico.', stats: { defense: 18, maxHp: 80 }, value: 900 },
    materials: [{ id: 'iron_ore', name: 'Ferro', count: 8 }],
    goldCost: 350,
  },
  {
    id: 'craft_iron_set_armor', name: 'Peitoral Rúnico', icon: '🛡',
    result: { id: 'iron_set_armor', name: 'Peitoral Rúnico', type: 'armor', rarity: 'rare', icon: '🛡', description: 'Parte do conjunto Rúnico.', stats: { defense: 35, maxHp: 180 }, value: 1500 },
    materials: [{ id: 'iron_ore', name: 'Ferro', count: 18 }, { id: 'gold_ore', name: 'Ouro', count: 3 }],
    goldCost: 700,
  },
  {
    id: 'craft_iron_set_boots', name: 'Botas Rúnicas', icon: '👢',
    result: { id: 'iron_set_boots', name: 'Botas Rúnicas', type: 'boots', rarity: 'rare', icon: '👢', description: 'Parte do conjunto Rúnico.', stats: { defense: 12, speed: 2 }, value: 700 },
    materials: [{ id: 'iron_ore', name: 'Ferro', count: 10 }, { id: 'wolf_pelt', name: 'Pele', count: 3 }],
    goldCost: 350,
  },

  // ╔══════════════════════════════════════════════════════════════╗
  // ║          CONJUNTO MYTHRIL ÉPICO (3 peças)                    ║
  // ╚══════════════════════════════════════════════════════════════╝
  {
    id: 'craft_mythril_helm', name: 'Elmo Mythril', icon: '⛑',
    result: { id: 'mythril_helm', name: 'Elmo Mythril', type: 'helmet', rarity: 'epic', icon: '⛑', description: 'Parte do conjunto Mythril.', stats: { defense: 30, maxHp: 150, magicPower: 12 }, value: 3800 },
    materials: [{ id: 'mythril_ore', name: 'Mythril', count: 12 }, { id: 'gold_ore', name: 'Ouro', count: 6 }],
    goldCost: 2500,
  },
  {
    id: 'craft_mythril_armor', name: 'Armadura Mythril', icon: '🛡',
    result: { id: 'mythril_armor', name: 'Armadura Mythril', type: 'armor', rarity: 'epic', icon: '🛡', description: 'Parte do conjunto Mythril.', stats: { defense: 60, maxHp: 380, magicPower: 18 }, value: 6500 },
    materials: [{ id: 'mythril_ore', name: 'Mythril', count: 25 }, { id: 'gold_ore', name: 'Ouro', count: 10 }],
    goldCost: 4500,
  },
  {
    id: 'craft_mythril_boots', name: 'Botas Mythril', icon: '👢',
    result: { id: 'mythril_boots', name: 'Botas Mythril', type: 'boots', rarity: 'epic', icon: '👢', description: 'Parte do conjunto Mythril.', stats: { defense: 20, speed: 3, magicPower: 8 }, value: 2800 },
    materials: [{ id: 'mythril_ore', name: 'Mythril', count: 14 }],
    goldCost: 1800,
  },

  // ╔══════════════════════════════════════════════════════════════╗
  // ║          ARMAS LENDÁRIAS DE DIAMANTE                          ║
  // ╚══════════════════════════════════════════════════════════════╝
  {
    id: 'craft_diamond_blade', name: 'Lâmina de Diamante', icon: '⚔',
    result: { id: 'diamond_blade', name: 'Lâmina de Diamante', type: 'weapon', rarity: 'legendary', icon: '⚔', description: 'Corta qualquer matéria.', stats: { attack: 180, critChance: 25, critDamage: 120, speed: 1 }, value: 60000 },
    materials: [{ id: 'diamond', name: 'Diamante', count: 10 }, { id: 'mythril_ore', name: 'Mythril', count: 30 }, { id: 'dragon_scale', name: 'Escama', count: 3 }],
    goldCost: 25000,
  },
  {
    id: 'craft_diamond_bow', name: 'Arco de Diamante', icon: '🏹',
    result: { id: 'diamond_bow', name: 'Arco de Diamante', type: 'weapon', rarity: 'legendary', icon: '🏹', description: 'Flechas como meteoros.', stats: { attack: 150, range: 8, critChance: 32, critDamage: 130 }, value: 60000 },
    materials: [{ id: 'diamond', name: 'Diamante', count: 10 }, { id: 'mythril_ore', name: 'Mythril', count: 25 }, { id: 'ancient_bark_piece', name: 'Casca', count: 8 }],
    goldCost: 25000,
  },
  {
    id: 'craft_diamond_staff', name: 'Cajado de Diamante', icon: '🪄',
    result: { id: 'diamond_staff', name: 'Cajado de Diamante', type: 'weapon', rarity: 'legendary', icon: '🪄', description: 'Magia pura cristalizada.', stats: { attack: 60, magicPower: 220, maxMp: 280, critChance: 22 }, value: 60000 },
    materials: [{ id: 'diamond', name: 'Diamante', count: 10 }, { id: 'mythril_ore', name: 'Mythril', count: 25 }, { id: 'void_crystal', name: 'Cristal do Vazio', count: 5 }],
    goldCost: 25000,
  },

  // ╔══════════════════════════════════════════════════════════════╗
  // ║          PERGAMINHOS DE ENCANTAMENTO                          ║
  // ╚══════════════════════════════════════════════════════════════╝
  {
    id: 'craft_enchant_atk', name: 'Pergaminho do Poder', icon: '📜',
    result: { id: 'enchant_scroll_atk', name: 'Pergaminho do Poder', type: 'consumable', rarity: 'rare', icon: '📜', description: 'Usa para +8 ATK na arma equipada.', stats: { attack: 8 }, stackable: true, quantity: 1, value: 1200 },
    materials: [{ id: 'mythril_ore', name: 'Mythril', count: 2 }, { id: 'demon_horn', name: 'Chifre', count: 2 }],
    goldCost: 600,
  },
  {
    id: 'craft_enchant_def', name: 'Pergaminho da Proteção', icon: '📜',
    result: { id: 'enchant_scroll_def', name: 'Pergaminho da Proteção', type: 'consumable', rarity: 'rare', icon: '📜', description: 'Usa para +10 DEF na armadura equipada.', stats: { defense: 10 }, stackable: true, quantity: 1, value: 1200 },
    materials: [{ id: 'mythril_ore', name: 'Mythril', count: 2 }, { id: 'bone_shard', name: 'Osso', count: 4 }],
    goldCost: 600,
  },
  {
    id: 'craft_enchant_hp', name: 'Pergaminho da Vida', icon: '📜',
    result: { id: 'enchant_scroll_hp', name: 'Pergaminho da Vida', type: 'consumable', rarity: 'rare', icon: '📜', description: 'Usa para +120 HP máx em uma peça equipada.', stats: { maxHp: 120 }, stackable: true, quantity: 1, value: 1500 },
    materials: [{ id: 'gold_ore', name: 'Ouro', count: 4 }, { id: 'slime_gel', name: 'Gel', count: 8 }],
    goldCost: 800,
  },
  {
    id: 'craft_soul_forge', name: 'Ficha da Forja da Alma', icon: '🔥',
    result: { id: 'soul_forge_token', name: 'Ficha da Forja da Alma', type: 'consumable', rarity: 'epic', icon: '🔥', description: 'Rerrola atributos de uma arma/armadura equipada.', stats: {}, stackable: true, quantity: 1, value: 8000 },
    materials: [{ id: 'diamond', name: 'Diamante', count: 2 }, { id: 'void_crystal', name: 'Cristal', count: 3 }, { id: 'ghost_essence', name: 'Espírito', count: 4 }],
    goldCost: 5000,
  },
  {
    id: 'craft_ascension', name: 'Totem da Ascensão', icon: '✨',
    result: { id: 'ascension_totem', name: 'Totem da Ascensão', type: 'consumable', rarity: 'legendary', icon: '✨', description: 'Renasce ao Nível 1 com +20% permanente em todos os atributos.', stats: {}, stackable: true, quantity: 1, value: 50000 },
    materials: [{ id: 'diamond', name: 'Diamante', count: 8 }, { id: 'dragon_scale', name: 'Escama', count: 4 }, { id: 'ghost_essence', name: 'Espírito', count: 10 }, { id: 'void_crystal', name: 'Cristal', count: 8 }],
    goldCost: 30000,
  },
]

function countMat(player: Player, id: string): number {
  return player.inventory.reduce((sum, item) => item?.id === id ? sum + (item.quantity ?? 1) : sum, 0)
}

interface Props {
  player: Player
  onClose: () => void
  onCraft: (recipe: CraftRecipe) => void
}

export default function CraftingPanel({ player, onClose, onCraft }: Props) {
  const [msg, setMsg] = useState('')
  const [msgOk, setMsgOk] = useState(false)

  const handleCraft = (recipe: CraftRecipe) => {
    if (player.gold < recipe.goldCost) { setMsg('Ouro insuficiente!'); setMsgOk(false); return }
    if (!recipe.materials.every(m => countMat(player, m.id) >= m.count)) { setMsg('Materiais insuficientes!'); setMsgOk(false); return }
    onCraft(recipe)
    playSfx('item_drop')
    setMsg(`${recipe.name} criado com sucesso!`)
    setMsgOk(true)
  }

  /* Materials the player actually has */
  const matKeys = Object.keys(MAT_DISPLAY)
  const ownedMats = matKeys.filter(id => countMat(player, id) > 0)

  return (
    <Overlay onBgClick={onClose} title="Ferraria" storageKey="craft">
      <div className="rcy-modal rcy-modal--wide rcy-pixel">
        <ModalHeader title="FERRARIA  ·  CRAFTING" accent="var(--rcy-orange)" onClose={onClose} />

        <div className="rcy-frame" style={{ padding: '6px 12px', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', borderRadius: 0, borderLeft: 'none', borderRight: 'none' }}>
          <span style={{ color: 'var(--rcy-gold)', fontSize: 11, textShadow: '1px 1px 0 #000' }}>⬡ {player.gold.toLocaleString()}g</span>
          {ownedMats.map(id => {
            const d = MAT_DISPLAY[id]
            return <span key={id} style={{ color: 'var(--rcy-text-dim)', fontSize: 10, textShadow: '1px 1px 0 #000' }}>{d.icon} {d.label}: <span style={{ color: 'var(--rcy-text)' }}>{countMat(player, id)}</span></span>
          })}
          {ownedMats.length === 0 && <span style={{ color: 'var(--rcy-text-mute)', fontSize: 10 }}>Nenhum material — derrote monstros para coletar</span>}
        </div>

        {msg && (
          <div style={{ padding: '6px 14px', background: msgOk ? 'rgba(8,30,10,0.9)' : 'rgba(30,8,8,0.9)', color: msgOk ? 'var(--rcy-green)' : 'var(--rcy-red)', fontSize: 11, textShadow: '1px 1px 0 #000', borderBottom: '1px solid var(--rcy-border-strong)' }}>
            {msg}
          </div>
        )}

        <div className="rcy-modal__body">
          <div className="rcy-section-label">RECEITAS</div>
          {CRAFT_RECIPES.map(recipe => {
            const canAfford = player.gold >= recipe.goldCost
            const hasMats   = recipe.materials.every(m => countMat(player, m.id) >= m.count)
            const canCraft  = canAfford && hasMats
            const rc        = RARITY_COLORS[recipe.result.rarity]

            return (
              <div key={recipe.id} className="rcy-frame" style={{ display: 'flex', gap: 10, alignItems: 'center', padding: 8, marginBottom: 5 }}>
                <div className={`rcy-slot rcy-slot--sm rcy-slot--${recipe.result.rarity}`}>{recipe.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <span style={{ color: rc, fontWeight: 700, fontSize: 12, textShadow: '1px 1px 0 #000' }}>{recipe.name}</span>
                    <span style={{ fontSize: 9, padding: '1px 5px', background: rc + '22', color: rc, border: `1px solid ${rc}55` }}>{RARITY_LABELS[recipe.result.rarity]}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 10, textShadow: '1px 1px 0 #000' }}>
                    {recipe.materials.map(m => {
                      const have = countMat(player, m.id)
                      const ok   = have >= m.count
                      return (
                        <span key={m.id} style={{ color: ok ? 'var(--rcy-green)' : 'var(--rcy-red)' }}>
                          {MAT_DISPLAY[m.id]?.icon ?? '·'} {m.name} <span style={{ opacity: 0.75 }}>{have}/{m.count}</span>
                        </span>
                      )
                    })}
                    <span style={{ color: canAfford ? 'var(--rcy-gold)' : 'var(--rcy-red)' }}>⬡ {recipe.goldCost.toLocaleString()}g</span>
                  </div>
                </div>
                <button
                  onClick={() => handleCraft(recipe)}
                  disabled={!canCraft}
                  className={`rcy-btn ${canCraft ? 'rcy-btn--gold' : 'rcy-btn--locked'}`}
                  style={{ flexShrink: 0 }}
                >
                  Criar
                </button>
              </div>
            )
          })}
        </div>

        <ModalFooter hint="[C] fechar  ·  Colete materiais derrotando inimigos" />
      </div>
    </Overlay>
  )
}
