import { memo, useState } from 'react'
import type { Player, GameMap, GameNotification, ChatMessage } from '@/lib/game/types'

interface Props {
  player: Player
  currentMap: GameMap
  notifications: GameNotification[]
  chatMessages: ChatMessage[]
  onOpenInventory: () => void
  onMapChange: (mapId: string) => void
  onSave: () => void
  onOpenQuests?: () => void
  onOpenAchievements?: () => void
  onOpenPassives?: () => void
  onOpenCrafting?: () => void
  onOpenStats?: () => void
  onOpenHelp?: () => void
  timeOfDay?: number
  weather?: string
  killStreak?: number
  devMode?: boolean
}

const CLASS_LABELS: Record<string, string> = {
  knight: 'Cav', archer: 'Arq', mage: 'Mag', necromancer: 'Necro',
  paladin: 'Pal', berserker: 'Bers', assassin: 'Ass', druid: 'Dru',
  monk: 'Monk', samurai: 'Sam',
}
const RARITY_COLORS: Record<string, string> = {
  common: '#a08858', uncommon: '#50c050', rare: '#4090e8', epic: '#c860e0', legendary: '#ffd24a',
}
const MSG_COLORS: Record<string, string> = {
  system: '#a08858', loot: '#ffd24a', level: '#50c050', combat: '#e0402a', info: '#a08858',
}
const MAP_LIST = [
  { id: 'city',       name: 'Cidade',    minLvl: 1  },
  { id: 'forest',     name: 'Floresta',  minLvl: 1  },
  { id: 'deepforest', name: 'F.Antiga',  minLvl: 10 },
  { id: 'dungeon',    name: 'Masmorra',  minLvl: 5  },
  { id: 'tundra',     name: 'Tundra',    minLvl: 12 },
  { id: 'desert',     name: 'Deserto',   minLvl: 8  },
  { id: 'swamp',      name: 'Pântano',   minLvl: 15 },
  { id: 'volcano',    name: 'Vulcão',    minLvl: 18 },
  { id: 'abyss',      name: 'Abismo',    minLvl: 22 },
  { id: 'crystal1',   name: 'Cristal1',  minLvl: 18 },
  { id: 'crystal2',   name: 'Cristal2',  minLvl: 24 },
  { id: 'crystal3',   name: 'Cristal3',  minLvl: 30 },
  { id: 'haunted1',   name: 'Ruínas1',   minLvl: 20 },
  { id: 'haunted2',   name: 'Ruínas2',   minLvl: 28 },
  { id: 'haunted3',   name: 'Ruínas3',   minLvl: 35 },
  { id: 'sky1',       name: 'Céu1',      minLvl: 22 },
  { id: 'sky2',       name: 'Céu2',      minLvl: 30 },
  { id: 'sky3',       name: 'Céu3',      minLvl: 40 },
]

function GameHUD({
  player, currentMap, notifications, chatMessages,
  onOpenInventory, onMapChange, onSave,
  onOpenQuests, onOpenAchievements, onOpenPassives,
  onOpenCrafting, onOpenStats, onOpenHelp,
  timeOfDay, weather, killStreak = 0, devMode = false,
}: Props) {
  const hpPct  = Math.max(0, Math.min(100, (player.hp / player.stats.maxHp) * 100))
  const mpPct  = Math.max(0, Math.min(100, (player.mp / player.stats.maxMp) * 100))
  const xpPct  = Math.max(0, Math.min(100, player.xpToNext > 0 ? (player.xp / player.xpToNext) * 100 : 0))

  const hour = timeOfDay !== undefined ? Math.floor((timeOfDay / 14400) * 24) : 12
  const isDay  = hour >= 8  && hour < 18
  const isDawn = hour >= 5  && hour < 8
  const isDusk = hour >= 18 && hour < 21
  const timeLabel = isDay ? '☀' : (isDawn ? '🌅' : (isDusk ? '🌇' : '🌙'))
  const weatherIcon: Record<string, string> = { rain: '🌧', snow: '❄', fog: '🌫', storm: '⛈', none: '' }

  // Minimize / expand HUD blocks
  const [statsMin, setStatsMin] = useState<boolean>(() => {
    try { return sessionStorage.getItem('rcy:hud:stats') === '1' } catch { return false }
  })
  const [mapMin, setMapMin] = useState<boolean>(() => {
    try { return sessionStorage.getItem('rcy:hud:map') === '1' } catch { return false }
  })
  const [menuOpen, setMenuOpen] = useState(false)

  const persistStats = (v: boolean) => { setStatsMin(v); try { sessionStorage.setItem('rcy:hud:stats', v ? '1' : '0') } catch {} }
  const persistMap   = (v: boolean) => { setMapMin(v); try { sessionStorage.setItem('rcy:hud:map', v ? '1' : '0') } catch {} }

  return (
    <div className="GameHUD rcy-hud rcy-pixel" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
      {/* ── TOP-LEFT ─────────────────────────────────────────────────── */}
      <div className="absolute top-1 left-1 pointer-events-auto select-none" style={{ width: 178 }}>
        {/* Always-visible thin status bar */}
        <div className="rcy-frame" style={{ padding: '4px 6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 4, marginBottom: 3 }}>
            <div style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 11, fontWeight: 700, color: 'var(--rcy-gold)', textShadow: '1px 1px 0 #000' }}>
              {player.name}
            </div>
            <button
              className="rcy-btn rcy-btn--icon"
              style={{ minHeight: 16, padding: '0 4px', fontSize: 10 }}
              onClick={() => persistStats(!statsMin)}
              title={statsMin ? 'Expandir' : 'Minimizar'}
            >{statsMin ? '+' : '_'}</button>
          </div>

          <div style={{ display: 'flex', gap: 4, fontSize: 9, color: 'var(--rcy-text-dim)', marginBottom: 3, textShadow: '1px 1px 0 #000' }}>
            <span style={{ color: 'var(--rcy-text)' }}>Nv {player.level}</span>
            <span>·</span>
            <span>{CLASS_LABELS[player.class] ?? player.class}</span>
            <span style={{ marginLeft: 'auto', color: 'var(--rcy-gold)' }}>{player.gold.toLocaleString()}g</span>
          </div>

          {/* HP / MP / XP slim bars */}
          <div className="rcy-bar rcy-bar--hp" style={{ marginBottom: 2 }}>
            <div className="rcy-bar__fill" style={{ width: `${hpPct}%` }} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#fff', textShadow: '1px 1px 0 #000', lineHeight: 1 }}>
              {player.hp}/{player.stats.maxHp}
            </div>
          </div>
          <div className="rcy-bar rcy-bar--mp" style={{ height: 6, marginBottom: 2 }}>
            <div className="rcy-bar__fill" style={{ width: `${mpPct}%` }} />
          </div>
          <div className="rcy-bar rcy-bar--xp" style={{ height: 4 }}>
            <div className="rcy-bar__fill" style={{ width: `${xpPct}%` }} />
          </div>

          {!statsMin && (
            <>
              {/* Combat stats grid */}
              <div className="rcy-stat-grid" style={{ marginTop: 5, color: 'var(--rcy-text)' }}>
                {[
                  { label: 'ATK', val: player.stats.attack },
                  { label: 'DEF', val: player.stats.defense },
                  { label: 'SPD', val: player.stats.speed.toFixed(1) },
                  { label: 'CRT', val: `${(player.stats.critChance*100).toFixed(0)}%` },
                ].map(s => (
                  <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0 2px', background: 'rgba(0,0,0,0.3)', border: '1px solid #000' }}>
                    <span style={{ color: 'var(--rcy-text-mute)' }}>{s.label}</span>
                    <span style={{ fontWeight: 700, textShadow: '1px 1px 0 #000' }}>{s.val}</span>
                  </div>
                ))}
              </div>

              {/* Equipment row */}
              <div style={{ display: 'flex', gap: 2, marginTop: 4 }}>
                {(['weapon','armor','helmet','boots','ring'] as const).map(slot => {
                  const item = player.equipment[slot]
                  const c = item ? RARITY_COLORS[item.rarity] : '#3a2410'
                  return (
                    <div key={slot} title={item ? `${item.name} (${item.rarity})` : slot}
                      style={{
                        flex: 1, aspectRatio: '1', fontSize: 12,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: '#000',
                        border: `2px solid ${c}`,
                        color: c,
                      }}>{item ? item.icon : ''}</div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* Environment strip */}
        <div className="rcy-frame" style={{ marginTop: 2, padding: '2px 5px', fontSize: 9, display: 'flex', gap: 6, color: 'var(--rcy-text-dim)' }}>
          <span style={{ color: 'var(--rcy-gold)' }}>{timeLabel} {hour.toString().padStart(2,'0')}h</span>
          {weather && weather !== 'none' && <span>{weatherIcon[weather] ?? ''} {weather}</span>}
          {killStreak >= 3 && <span style={{ color: 'var(--rcy-red)' }}>⚔×{killStreak}</span>}
          {devMode && <span style={{ color: 'var(--rcy-purple)' }}>DEV</span>}
        </div>
      </div>

      {/* ── TOP-RIGHT: Compact map ─────────────────────────────────── */}
      <div className="absolute top-1 right-1 pointer-events-auto select-none" style={{ width: 156 }}>
        <div className="rcy-frame" style={{ padding: '3px 5px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
              <span style={{ color: 'var(--rcy-gold)', fontSize: 11 }}>📍</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--rcy-text)', textShadow: '1px 1px 0 #000', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentMap.name}
              </span>
            </div>
            <button
              className="rcy-btn rcy-btn--icon"
              style={{ minHeight: 16, padding: '0 4px', fontSize: 10 }}
              onClick={() => persistMap(!mapMin)}
            >{mapMin ? '+' : '_'}</button>
          </div>
          {!mapMin && (
            <div style={{ marginTop: 4, maxHeight: 120, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
              {MAP_LIST.map(m => {
                const locked = player.level < m.minLvl
                const active = currentMap.id === m.id
                return (
                  <button
                    key={m.id}
                    onClick={() => !locked && onMapChange(m.id)}
                    disabled={locked}
                    title={locked ? `Requer Nv ${m.minLvl}` : m.name}
                    className={`rcy-btn ${active ? 'rcy-btn--active' : ''} ${locked ? 'rcy-btn--locked' : ''}`}
                    style={{ fontSize: 9, padding: '2px 3px', minHeight: 18 }}
                  >
                    {m.name}{locked && <span style={{ color: 'var(--rcy-text-mute)' }}> {m.minLvl}</span>}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── BOTTOM-RIGHT: Action FAB column (pixel buttons) ────────── */}
      <div className="rcy-fab-col pointer-events-auto">
        {menuOpen && (
          <>
            {onOpenStats && <button className="rcy-fab" onClick={onOpenStats} title="Status [S]">📊</button>}
            {onOpenCrafting && <button className="rcy-fab" onClick={onOpenCrafting} title="Ferraria [C]">🛠</button>}
            {onOpenPassives && <button className="rcy-fab" onClick={onOpenPassives} title="Passivas [P]">⭐</button>}
            {onOpenAchievements && <button className="rcy-fab" onClick={onOpenAchievements} title="Conquistas [A]">🏆</button>}
            {onOpenQuests && <button className="rcy-fab" onClick={onOpenQuests} title="Missões [Q]">📜</button>}
            {onOpenHelp && <button className="rcy-fab" onClick={onOpenHelp} title="Ajuda [H]">❓</button>}
            <button className="rcy-fab" onClick={onSave} title="Salvar">💾</button>
          </>
        )}
        <button className="rcy-fab" onClick={onOpenInventory} title="Inventário [I]">🎒</button>
        <button
          className="rcy-fab"
          onClick={() => setMenuOpen(v => !v)}
          title={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          style={{ color: 'var(--rcy-gold)' }}
        >
          {menuOpen ? '×' : '☰'}
        </button>
      </div>

      {/* ── BOTTOM-CENTER: Chat log (compact) ───────────────────────── */}
      <div
        className="absolute pointer-events-none select-none"
        style={{ zIndex: 10, left: 6, right: 56, bottom: 76, maxWidth: 360 }}
      >
        <div className="rcy-frame" style={{ padding: '3px 6px', background: 'rgba(20,17,10,0.85)' }}>
          {chatMessages.slice(-3).map(m => (
            <div key={m.id} style={{ fontSize: 9, color: MSG_COLORS[m.type] ?? 'var(--rcy-text-dim)', textShadow: '1px 1px 0 #000', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {m.text}
            </div>
          ))}
          {chatMessages.length === 0 && (
            <div style={{ fontSize: 9, color: 'var(--rcy-text-mute)' }}>WASD para mover · ☰ menu</div>
          )}
        </div>
      </div>

      {/* ── Notifications (top-center) ──────────────────────────────── */}
      <div
        className="absolute pointer-events-none select-none"
        style={{ zIndex: 25, top: 8, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, maxWidth: '90vw' }}
      >
        {notifications.slice(0, 3).map(n => {
          const clr = n.type === 'level' ? 'var(--rcy-green)' : n.type === 'achievement' ? 'var(--rcy-purple)' : 'var(--rcy-gold)'
          return (
            <div key={n.id} className="rcy-frame" style={{
              padding: '4px 12px',
              fontSize: 11, fontWeight: 700, color: clr,
              textShadow: '1px 1px 0 #000',
              animation: 'fadeSlideIn 0.25s ease-out',
              textAlign: 'center',
            }}>
              {n.text}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default memo(GameHUD) as unknown as typeof GameHUD
