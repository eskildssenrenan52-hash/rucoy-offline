import { memo, useState } from 'react'
import type { Player } from '@/lib/game/types'

interface MapData {
  id: string
  name: string
  minLvl: number
  description?: string
}

interface Props {
  isOpen: boolean
  onClose: () => void
  player: Player
  currentMapId: string
  onMapChange: (mapId: string) => void
}

const MAP_LIST: MapData[] = [
  { id: 'city',       name: 'Cidade',      minLvl: 1,  description: 'Local seguro para iniciantes' },
  { id: 'forest',     name: 'Floresta',    minLvl: 1,  description: 'Primeiras aventuras' },
  { id: 'deepforest', name: 'F. Antiga',   minLvl: 10, description: 'Floresta perigosa' },
  { id: 'dungeon',    name: 'Masmorra',    minLvl: 5,  description: 'Calabouço profundo' },
  { id: 'tundra',     name: 'Tundra',      minLvl: 12, description: 'Terras geladas' },
  { id: 'desert',     name: 'Deserto',     minLvl: 8,  description: 'Areias áridas' },
  { id: 'swamp',      name: 'Pântano',     minLvl: 15, description: 'Terras pântanosas' },
  { id: 'volcano',    name: 'Vulcão',      minLvl: 18, description: 'Vulcão ativo' },
  { id: 'abyss',      name: 'Abismo',      minLvl: 22, description: 'Profundezas escuras' },
  { id: 'crystal1',   name: 'Cristal 1',   minLvl: 18, description: 'Caverna de Cristal' },
  { id: 'crystal2',   name: 'Cristal 2',   minLvl: 24, description: 'Cristais radiantes' },
  { id: 'crystal3',   name: 'Cristal 3',   minLvl: 30, description: 'Coração de Cristal' },
  { id: 'haunted1',   name: 'Ruínas 1',    minLvl: 20, description: 'Ruínas Assombradas' },
  { id: 'haunted2',   name: 'Ruínas 2',    minLvl: 28, description: 'Câmaras Antigas' },
  { id: 'haunted3',   name: 'Ruínas 3',    minLvl: 35, description: 'Santuário Esquecido' },
  { id: 'sky1',       name: 'Céu 1',       minLvl: 22, description: 'Reinos do Céu' },
  { id: 'sky2',       name: 'Céu 2',       minLvl: 30, description: 'Ilhas Flutuantes' },
  { id: 'sky3',       name: 'Céu 3',       minLvl: 40, description: 'Trono Celestial' },
  // ─── NOVOS BIOMAS NORMAIS ───
  { id: 'crystgrove1', name: 'Bosque Cristal',  minLvl: 4,  description: 'Floresta bioluminescente (oeste)' },
  { id: 'crystgrove2', name: 'B.Cristal A2',    minLvl: 12, description: 'Câmara cristalina profunda' },
  { id: 'savanna1',    name: 'Savana Dourada',  minLvl: 6,  description: 'Pradaria âmbar do sul' },
  { id: 'savanna2',    name: 'Savana A2',       minLvl: 16, description: 'Savana escorchada vulcânica' },
  { id: 'archipel1',   name: 'Arquipélago',     minLvl: 10, description: 'Ilhas conectadas por pontes' },
  { id: 'archipel2',   name: 'Arquipélago A2',  minLvl: 22, description: 'Ilhas celestes flutuantes' },
  { id: 'vale1',       name: 'Vale Esquecido',  minLvl: 8,  description: 'Canyon de pedra com névoa' },
  { id: 'vale2',       name: 'Vale A2',         minLvl: 20, description: 'Cripta ancestral profunda' },
  // ─── SECRETOS (precisa de chave craftada) ───
  { id: 'stellar1',    name: '✦ F.Estelar 1',   minLvl: 33, description: 'SECRETO · Chave Estelar' },
  { id: 'stellar2',    name: '✦ F.Estelar 2',   minLvl: 41, description: 'Fenda mais profunda' },
  { id: 'stellar3',    name: '✦ F.Estelar 3',   minLvl: 49, description: 'Núcleo cósmico' },
  { id: 'stellar4',    name: '✦ F.Estelar 4',   minLvl: 57, description: 'Vácuo absoluto' },
  { id: 'stellar5',    name: '✦ F.Estelar 5',   minLvl: 65, description: 'Coração estelar' },
  { id: 'stellar6',    name: '✦ F.Estelar 6',   minLvl: 73, description: 'Trono do Vazio' },
  { id: 'eden1',       name: '❀ Jardim 1',      minLvl: 36, description: 'SECRETO · Semente Primordial' },
  { id: 'eden2',       name: '❀ Jardim 2',      minLvl: 44, description: 'Floresta ancestral' },
  { id: 'eden3',       name: '❀ Jardim 3',      minLvl: 52, description: 'Raízes vivas' },
  { id: 'eden4',       name: '❀ Jardim 4',      minLvl: 60, description: 'Coração do bosque' },
  { id: 'eden5',       name: '❀ Jardim 5',      minLvl: 68, description: 'Santuário verde' },
  { id: 'eden6',       name: '❀ Jardim 6',      minLvl: 76, description: 'Árvore da Vida' },
  // ─── 10 NOVOS BIOMAS (2 andares cada) ───
  { id: 'coral1',      name: 'Recife Coral',    minLvl: 5,  description: 'Praia tropical com atóis' },
  { id: 'coral2',      name: 'Recife · A2',     minLvl: 14, description: 'Recife abissal cristalino' },
  { id: 'canyon1',     name: 'Cânion Escarlate', minLvl: 7,  description: 'Mesas e fendas vermelhas' },
  { id: 'canyon2',     name: 'Cânion · A2',     minLvl: 18, description: 'Cânion vulcânico' },
  { id: 'polar1',      name: 'Tundra Polar',    minLvl: 9,  description: 'Geleira com crevasses' },
  { id: 'polar2',      name: 'Tundra · A2',     minLvl: 20, description: 'Geleira cristalina' },
  { id: 'mire1',       name: 'Pântano Velado',  minLvl: 11, description: 'Bog com cogumelos gigantes' },
  { id: 'mire2',       name: 'Pântano · A2',    minLvl: 22, description: 'Pântano tóxico ancestral' },
  { id: 'geode1',      name: 'Caverna Geode',   minLvl: 13, description: 'Câmaras hexagonais de gema' },
  { id: 'geode2',      name: 'Geode · A2',      minLvl: 24, description: 'Coração abissal cristalino' },
  { id: 'necropolis1', name: 'Necrópole',       minLvl: 15, description: 'Cidade dos mortos em grade' },
  { id: 'necropolis2', name: 'Necrópole · A2',  minLvl: 26, description: 'Cripta real profunda' },
  { id: 'vineyard1',   name: 'Vinhedos',        minLvl: 17, description: 'Videiras labirínticas' },
  { id: 'vineyard2',   name: 'Vinhedos · A2',   minLvl: 28, description: 'Vinha amaldiçoada' },
  { id: 'forge1',      name: 'Forja Vulcânica', minLvl: 19, description: 'Canais de lava e bigornas' },
  { id: 'forge2',      name: 'Forja · A2',      minLvl: 30, description: 'Coração da forja' },
  { id: 'celestial1',  name: 'Templo Celeste',  minLvl: 21, description: 'Plataformas no céu' },
  { id: 'celestial2',  name: 'Templo · A2',     minLvl: 32, description: 'Santuário etéreo' },
  { id: 'roots1',      name: 'Bosque Raízes',   minLvl: 23, description: 'Raízes ramificadas vivas' },
  { id: 'roots2',      name: 'Raízes · A2',     minLvl: 34, description: 'Coração ancestral' },
  // ─── 5 NOVOS ANDARES DE MASMORRA ───
  { id: 'dungeon2',    name: 'Masmorra · A2',   minLvl: 15, description: 'Profundezas radiais' },
  { id: 'dungeon3',    name: 'Masmorra · A3',   minLvl: 25, description: 'Câmaras em grade' },
  { id: 'dungeon4',    name: 'Masmorra · A4',   minLvl: 35, description: 'Labirinto esquecido' },
  { id: 'dungeon5',    name: 'Masmorra · A5',   minLvl: 45, description: 'Catacumbas caóticas' },
  { id: 'dungeon6',    name: 'Masmorra · A6',   minLvl: 55, description: 'Trono das trevas' },
]

const MAP_ICON = (id: string) => {
  if (id === 'city') return '🏰'
  if (id === 'forest') return '🌲'
  if (id === 'deepforest') return '🌳'
  if (id.startsWith('dungeon')) return '🏚'
  if (id === 'tundra') return '❄'
  if (id === 'desert') return '🏜'
  if (id === 'swamp') return '🌿'
  if (id === 'volcano') return '🌋'
  if (id === 'abyss') return '🌌'
  if (id.includes('crystal')) return '💎'
  if (id.includes('haunted')) return '👻'
  if (id.includes('sky')) return '☁'
  if (id.startsWith('crystgrove')) return '🔮'
  if (id.startsWith('savanna')) return '🌾'
  if (id.startsWith('archipel')) return '🏝'
  if (id.startsWith('vale')) return '🗿'
  if (id.startsWith('stellar')) return '✦'
  if (id.startsWith('eden')) return '❀'
  if (id.startsWith('coral')) return '🐚'
  if (id.startsWith('canyon')) return '🟥'
  if (id.startsWith('polar')) return '🧊'
  if (id.startsWith('mire')) return '🍄'
  if (id.startsWith('geode')) return '💠'
  if (id.startsWith('necropolis')) return '⚰'
  if (id.startsWith('vineyard')) return '🍇'
  if (id.startsWith('forge')) return '🔨'
  if (id.startsWith('celestial')) return '🏛'
  if (id.startsWith('roots')) return '🌳'
  return '📍'
}

const NEW_BIOME_IDS = ['coral','canyon','polar','mire','geode','necropolis','vineyard','forge','celestial','roots']
const isNewBiome = (id: string) => NEW_BIOME_IDS.some(p => id.startsWith(p))
const isExtraDungeon = (id: string) => /^dungeon[2-6]$/.test(id)

const GROUPS: { label: string; filter: (m: MapData) => boolean }[] = [
  { label: 'CIDADE & INICIANTES', filter: m => ['city','forest','dungeon','desert','crystgrove1','savanna1','vale1','deepforest'].includes(m.id) },
  { label: 'INTERMEDIÁRIOS',      filter: m => ['tundra','swamp','volcano','archipel1','crystgrove2','savanna2','vale2'].includes(m.id) },
  { label: 'ABISMO & CRISTAL',    filter: m => m.id === 'abyss' || m.id.startsWith('crystal') },
  { label: 'CÉU & RUÍNAS',        filter: m => m.id.startsWith('sky') || m.id.startsWith('haunted') || m.id === 'archipel2' },
  { label: '🌍 NOVOS BIOMAS',      filter: m => isNewBiome(m.id) },
  { label: '🏚 MASMORRA PROFUNDA', filter: m => isExtraDungeon(m.id) },
  { label: '✦ SECRETOS ESTELARES', filter: m => m.id.startsWith('stellar') },
  { label: '❀ SECRETOS DO JARDIM', filter: m => m.id.startsWith('eden') },
]


function RucoyWorldModal({ isOpen, onClose, player, currentMapId, onMapChange }: Props) {
  const [hoveredMap, setHoveredMap] = useState<string | null>(null)
  if (!isOpen) return null

  const handleMapClick = (mapId: string, minLvl: number) => {
    if (player.level >= minLvl) { onMapChange(mapId); onClose() }
  }

  const hovered = MAP_LIST.find(m => m.id === hoveredMap)

  return (
    <div className="rcy-overlay rcy-pixel" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="rcy-modal rcy-modal--xl">
        <div className="rcy-modal__header">
          <span className="rcy-modal__title">🗺 MUNDOS</span>
          <span className="rcy-modal__subtitle">Nv {player.level}  ·  {MAP_LIST.length} áreas</span>
          <div className="rcy-modal__actions">
            <button className="rcy-btn rcy-btn--icon rcy-btn--close" onClick={onClose} aria-label="Fechar">×</button>
          </div>
        </div>

        <div className="rcy-modal__body">
          {GROUPS.map(g => {
            const items = MAP_LIST.filter(g.filter)
            if (items.length === 0) return null
            return (
              <div key={g.label} style={{ marginBottom: 12 }}>
                <div className="rcy-section-label">{g.label}</div>
                <div className="rcy-slot-grid">
                  {items.map(mapData => {
                    const locked = player.level < mapData.minLvl
                    const isActive = currentMapId === mapData.id
                    const cls = `rcy-slot ${isActive ? 'rcy-slot--active' : ''} ${locked ? 'rcy-slot--locked' : ''}`
                    return (
                      <div
                        key={mapData.id}
                        onMouseEnter={() => setHoveredMap(mapData.id)}
                        onMouseLeave={() => setHoveredMap(null)}
                        onClick={() => handleMapClick(mapData.id, mapData.minLvl)}
                        title={`${mapData.name} — ${mapData.description ?? ''} (Nv ${mapData.minLvl})`}
                        className={cls}
                      >
                        {MAP_ICON(mapData.id)}
                        <span className="rcy-slot__badge">{mapData.minLvl}</span>
                        {isActive && <span className="rcy-slot__qty" style={{ color: 'var(--rcy-green)' }}>✓</span>}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        <div className="rcy-modal__footer" style={{ textAlign: 'left' }}>
          {hovered ? (
            <span>
              <b style={{ color: 'var(--rcy-gold)' }}>{hovered.name}</b>
              {' · '}
              <span style={{ color: 'var(--rcy-text)' }}>{hovered.description}</span>
              {' · '}
              <span style={{ color: player.level >= hovered.minLvl ? 'var(--rcy-green)' : 'var(--rcy-red)' }}>
                Nv {hovered.minLvl}
              </span>
            </span>
          ) : (
            <span>[M] fechar  ·  Passe o mouse para detalhes  ·  Clique para viajar</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default memo(RucoyWorldModal)
