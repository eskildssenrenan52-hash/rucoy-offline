import { memo, useState } from 'react'

interface Props {
  isInventoryOpen: boolean
  isQuestOpen: boolean
  isAchievementsOpen: boolean
  isPassiveOpen: boolean
  isCraftingOpen: boolean
  isStatsOpen: boolean
  isHelpOpen: boolean
  isMapOpen: boolean
  isPrestigeOpen?: boolean
  isSpecOpen?: boolean
  isPetsOpen?: boolean
  isEditorOpen?: boolean
  onToggleInventory: () => void
  onToggleQuest: () => void
  onToggleAchievements: () => void
  onTogglePassive: () => void
  onToggleCrafting: () => void
  onToggleStats: () => void
  onToggleHelp: () => void
  onToggleMap: () => void
  onTogglePrestige?: () => void
  onToggleSpec?: () => void
  onTogglePets?: () => void
  onToggleEditor?: () => void
  onSave: () => void
}


type BtnDef = { key: string; icon: string; label: string; shortcut: string }

const MODAL_BUTTONS: BtnDef[] = [
  { key: 'map',          icon: '🗺',  label: 'Mundo',      shortcut: 'M' },
  { key: 'inventory',    icon: '🎒', label: 'Inventário', shortcut: 'I' },
  { key: 'stats',        icon: '📊', label: 'Status',     shortcut: 'S' },
  { key: 'quest',        icon: '📜', label: 'Missões',    shortcut: 'Q' },
  { key: 'achievements', icon: '🏆', label: 'Conquistas', shortcut: 'A' },
  { key: 'passive',      icon: '🌳', label: 'Passivas',   shortcut: 'P' },
  { key: 'crafting',     icon: '⚒',  label: 'Ferraria',   shortcut: 'C' },
  { key: 'pets',         icon: '🐾', label: 'Pets',       shortcut: 'E' },
  { key: 'prestige',     icon: '★',  label: 'Prestígio',  shortcut: 'X' },
  { key: 'spec',         icon: '✦',  label: 'Specs',      shortcut: 'B' },
  { key: 'editor',       icon: '🛠', label: 'Editor',     shortcut: 'F2' },
  { key: 'help',         icon: '❓', label: 'Ajuda',      shortcut: 'H' },
]



function RucoyModalBar({
  isInventoryOpen,
  isQuestOpen,
  isAchievementsOpen,
  isPassiveOpen,
  isCraftingOpen,
  isStatsOpen,
  isHelpOpen,
  isMapOpen,
  isPrestigeOpen,
  isSpecOpen,
  isPetsOpen,
  isEditorOpen,
  onToggleInventory,
  onToggleQuest,
  onToggleAchievements,
  onTogglePassive,
  onToggleCrafting,
  onToggleStats,
  onToggleHelp,
  onToggleMap,
  onTogglePrestige,
  onToggleSpec,
  onTogglePets,
  onToggleEditor,
  onSave,
}: Props) {
  const [collapsed, setCollapsed] = useState(false)

  const toggleMap: Record<string, () => void> = {
    map: onToggleMap,
    inventory: onToggleInventory,
    stats: onToggleStats,
    quest: onToggleQuest,
    achievements: onToggleAchievements,
    passive: onTogglePassive,
    crafting: onToggleCrafting,
    pets: onTogglePets ?? (() => {}),
    prestige: onTogglePrestige ?? (() => {}),
    spec: onToggleSpec ?? (() => {}),
    editor: onToggleEditor ?? (() => {}),
    help: onToggleHelp,
  }

  const isOpen: Record<string, boolean> = {
    map: isMapOpen,
    inventory: isInventoryOpen,
    stats: isStatsOpen,
    quest: isQuestOpen,
    achievements: isAchievementsOpen,
    passive: isPassiveOpen,
    crafting: isCraftingOpen,
    pets: !!isPetsOpen,
    prestige: !!isPrestigeOpen,
    spec: !!isSpecOpen,
    editor: !!isEditorOpen,
    help: isHelpOpen,

  }


  return (
    <div
      className="rcy-pixel rcy-fab-col pointer-events-auto select-none"
      style={{
        position: 'absolute',
        top: 8,
        right: 6,
        bottom: 8,
        zIndex: 'var(--rcy-z-bar)' as unknown as number,
        display: 'flex',
        alignItems: 'flex-start',
        pointerEvents: 'none',
      }}
    >
      <div
        className="rcy-frame"
        style={{
          padding: 3,
          maxHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          pointerEvents: 'auto',
          overflow: 'hidden',
        }}
      >
        {/* Collapse toggle */}
        <button
          className={`rcy-btn rcy-btn--icon ${collapsed ? 'rcy-btn--active' : ''}`}
          onClick={() => setCollapsed(c => !c)}
          title={collapsed ? 'Expandir menu' : 'Recolher menu'}
          aria-label="Alternar menu"
          style={{ width: 32, height: 24, marginBottom: 3, flex: '0 0 auto' }}
        >
          {collapsed ? '▸' : '▾'}
        </button>

        {!collapsed && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 32px)',
              gap: 3,
              overflowY: 'auto',
              overflowX: 'hidden',
              minHeight: 0,
              flex: '1 1 auto',
              paddingRight: 2,
            }}
          >
            {MODAL_BUTTONS.map(btn => (
              <button
                key={btn.key}
                onClick={toggleMap[btn.key]}
                title={`${btn.label} [${btn.shortcut}]`}
                aria-label={btn.label}
                aria-pressed={isOpen[btn.key]}
                className={`rcy-btn rcy-btn--icon ${isOpen[btn.key] ? 'rcy-btn--active' : ''}`}
              >
                <span aria-hidden>{btn.icon}</span>
              </button>
            ))}
          </div>
        )}

        <button
          onClick={onSave}
          title="Salvar Jogo [G]"
          aria-label="Salvar Jogo"
          className="rcy-btn rcy-btn--icon rcy-btn--gold"
          style={{ width: 'auto', marginTop: 3, flex: '0 0 auto' }}
        >
          💾
        </button>
      </div>
    </div>
  )
}

export default memo(RucoyModalBar)
