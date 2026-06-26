import { useState } from 'react'
import type { CharacterClass, Player } from '@/lib/game/types'

interface Props {
  player: Player
  onSwitch: (cls: CharacterClass) => void
}

const CLASSES: { id: CharacterClass; label: string; icon: string; color: string }[] = [
  { id: 'knight',      label: 'Cavaleiro',   icon: '⚔', color: '#d8b048' },
  { id: 'archer',      label: 'Arqueiro',    icon: '🏹', color: '#60c040' },
  { id: 'mage',        label: 'Mago',        icon: '✦', color: '#60c0ff' },
  { id: 'necromancer', label: 'Necromante',  icon: '☠', color: '#a020e0' },
  { id: 'paladin',     label: 'Paladino',    icon: '✚', color: '#f0d878' },
  { id: 'berserker',   label: 'Berserker',   icon: '🪓', color: '#c83030' },
  { id: 'assassin',    label: 'Assassino',   icon: '🗡', color: '#a0a0c0' },
  { id: 'druid',       label: 'Druida',      icon: '🌿', color: '#3aa84a' },
  { id: 'monk',        label: 'Monge',       icon: '✊', color: '#ffd070' },
  { id: 'samurai',     label: 'Samurai',     icon: '🗡', color: '#e0c060' },
  { id: 'summoner',    label: 'Invocador',   icon: '✦', color: '#80c0ff' },
  { id: 'alchemist',   label: 'Alquimista',  icon: '⚗', color: '#a8e060' },
  { id: 'chronomancer',label: 'Cronomante',  icon: '⌛', color: '#80c0ff' },
  { id: 'beastmaster', label: 'Domador',     icon: '🐾', color: '#a08040' },
  { id: 'ninja',       label: 'Ninja',       icon: '🥷', color: '#1a1a2e' },
  { id: 'pyromancer',  label: 'Piromante',   icon: '🔥', color: '#ff5520' },
  { id: 'cryomancer',  label: 'Criomante',   icon: '❄', color: '#80d4ff' },
  { id: 'stormcaller', label: 'Tempestuoso', icon: '⚡', color: '#a060ff' },
  { id: 'geomancer',   label: 'Geomante',    icon: '⛰', color: '#a07040' },
  { id: 'bard',        label: 'Bardo',       icon: '🎵', color: '#e060c0' },
  { id: 'gunner',      label: 'Pistoleiro',  icon: '🔫', color: '#808080' },
  { id: 'templar',     label: 'Templário',   icon: '🛡', color: '#fff0a0' },
  { id: 'warlock',     label: 'Bruxo',       icon: '☠', color: '#601890' },
  { id: 'valkyrie',    label: 'Valquíria',   icon: '👼', color: '#ffe070' },
]


export default function ClassSwitcher({ player, onSwitch }: Props) {
  const [open, setOpen] = useState(false)
  const current = CLASSES.find(c => c.id === player.class)!

  return (
    <div className="pointer-events-auto rcy-pixel" style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(v => !v)}
        title="Trocar de classe [C]"
        className="rcy-btn"
        style={{
          borderColor: current.color,
          color: current.color,
          minHeight: 30,
          padding: '4px 10px',
          fontWeight: 700,
          letterSpacing: 1,
          gap: 6,
          boxShadow: `inset 0 0 0 1px ${current.color}55, 0 0 10px ${current.color}33`,
        }}
      >
        <span style={{ fontSize: 14 }}>{current.icon}</span>
        <span>{current.label.toUpperCase()}</span>
        <span style={{ fontSize: 9, color: 'var(--rcy-text-mute)' }}>[C]</span>
      </button>
      {open && (
        <div
          className="rcy-frame"
          style={{
            position: 'absolute', top: '110%', right: 0,
            padding: 4,
            display: 'grid',
            gridTemplateColumns: 'repeat(2, var(--rcy-slot))',
            gap: 3,
            zIndex: 40,
            maxHeight: 360,
            overflowY: 'auto',
          }}
        >
          {CLASSES.map(c => {
            const prog = player.classProgress[c.id]
            const lvl = prog?.level ?? 1
            const active = c.id === player.class
            return (
              <button
                key={c.id}
                onClick={() => { onSwitch(c.id); setOpen(false) }}
                disabled={active}
                title={`${c.label}  ·  Nv ${lvl}`}
                className={`rcy-slot ${active ? 'rcy-slot--active' : ''}`}
                style={{ flexDirection: 'column', fontSize: 22, gap: 0, color: c.color }}
              >
                <span>{c.icon}</span>
                <span style={{ fontSize: 8, color: 'var(--rcy-text-dim)', marginTop: 2, textShadow: '1px 1px 0 #000' }}>{c.label.slice(0, 7)}</span>
                <span className="rcy-slot__badge">{lvl}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
