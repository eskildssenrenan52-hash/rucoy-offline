import { useState } from 'react'
import type { GameState } from '@/lib/game/types'

interface Props {
  gameState: GameState
  onToggleDevMode: () => void
  onTeleportClick: () => void
  onGiveMoney: () => void
  onGiveXP: () => void
  onGiveItem: () => void
  onKillAll: () => void
  onSetHP: (pct: number) => void
  onSetMP: (pct: number) => void
  onChangeMap: (mapId: string) => void
}

const MAPS = [
  { id: 'city',       label: 'Cidade'   },
  { id: 'forest',     label: 'Floresta' },
  { id: 'deepforest', label: 'F.Antiga' },
  { id: 'dungeon',    label: 'Masmorra' },
  { id: 'tundra',     label: 'Tundra'   },
  { id: 'desert',     label: 'Deserto'  },
  { id: 'swamp',      label: 'Pântano'  },
  { id: 'volcano',    label: 'Vulcão'   },
  { id: 'abyss',      label: 'Abismo'   },
]

export default function DevPanel({
  gameState, onToggleDevMode, onTeleportClick,
  onGiveMoney, onGiveXP, onGiveItem, onKillAll,
  onSetHP, onSetMP, onChangeMap,
}: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const hour = gameState._timeOfDay !== undefined ? Math.floor((gameState._timeOfDay / 14400) * 24) : 0

  return (
    <div
      className="rcy-pixel rcy-frame"
      style={{
        position: 'absolute', top: 56, left: 8, zIndex: 200,
        padding: '6px 8px', minWidth: 240,
        boxShadow: '0 4px 32px rgba(120,40,200,0.25), inset 0 0 0 1px rgba(120,88,32,0.25)',
        borderColor: 'var(--rcy-purple)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: collapsed ? 0 : 6 }}>
        <span style={{ color: 'var(--rcy-purple)', fontWeight: 700, fontSize: 12, textShadow: '1px 1px 0 #000' }}>⚙ DEV MODE</span>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="rcy-btn rcy-btn--icon" style={{ width: 26, height: 22 }} onClick={() => setCollapsed(c => !c)}>{collapsed ? '▼' : '▲'}</button>
          <button className="rcy-btn rcy-btn--red"  style={{ minHeight: 22, padding: '2px 6px' }} onClick={onToggleDevMode}>OFF</button>
        </div>
      </div>

      {!collapsed && (
        <>
          <div className="rcy-stat-grid" style={{ marginBottom: 8, gridTemplateColumns: '1fr 1fr', fontSize: 10 }}>
            <span>Nível</span><span>{gameState.player?.level}</span>
            <span>HP</span><span>{gameState.player?.hp}/{gameState.player?.stats.maxHp}</span>
            <span>Ouro</span><span>{gameState.player?.gold?.toLocaleString()}</span>
            <span>Mapa</span><span>{gameState.currentMap?.id}</span>
            <span>Hora</span><span>{hour}h</span>
          </div>

          <div className="rcy-section-label">AÇÕES</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, marginBottom: 8 }}>
            {[
              { label: '+ Ouro',       cls: 'rcy-btn--gold',  cb: onGiveMoney },
              { label: '+ XP ×10',     cls: '',               cb: onGiveXP    },
              { label: '+ Item Lend.', cls: '',               cb: onGiveItem  },
              { label: 'Matar Tudo',   cls: 'rcy-btn--red',   cb: onKillAll   },
              { label: 'HP 100%',      cls: 'rcy-btn--green', cb: () => onSetHP(1)   },
              { label: 'HP 10%',       cls: 'rcy-btn--red',   cb: () => onSetHP(0.1) },
              { label: 'MP 100%',      cls: '',               cb: () => onSetMP(1)   },
              { label: 'MP 0%',        cls: '',               cb: () => onSetMP(0)   },
            ].map(b => (
              <button key={b.label} onClick={b.cb} className={`rcy-btn ${b.cls}`} style={{ minHeight: 24, fontSize: 10 }}>{b.label}</button>
            ))}
          </div>

          <button onClick={onTeleportClick} className="rcy-btn rcy-btn--gold" style={{ width: '100%', marginBottom: 8 }}>
            🎯 Teleporte (clique no canvas)
          </button>

          <div className="rcy-section-label">VIAJAR</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3 }}>
            {MAPS.map(m => (
              <button
                key={m.id}
                onClick={() => onChangeMap(m.id)}
                className={`rcy-btn ${gameState.currentMap?.id === m.id ? 'rcy-btn--active' : ''}`}
                style={{ minHeight: 22, padding: '2px 4px', fontSize: 9 }}
              >{m.label}</button>
            ))}
          </div>

          <div style={{ color: 'var(--rcy-text-mute)', fontSize: 9, marginTop: 8, textShadow: '1px 1px 0 #000' }}>Imortalidade ativa  ·  F9 para fechar</div>
        </>
      )}
    </div>
  )
}
