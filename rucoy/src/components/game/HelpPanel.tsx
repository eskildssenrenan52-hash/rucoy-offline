import { Overlay, ModalHeader, ModalFooter } from './QuestPanel'

const BINDINGS = [
  { key: 'WASD / ↑↓←→', desc: 'Mover personagem' },
  { key: 'Clique',       desc: 'Atacar inimigo' },
  { key: '1 / 2 / 3 / 4', desc: 'Habilidades' },
  { key: 'I',            desc: 'Inventário' },
  { key: 'B',            desc: 'Loja' },
  { key: 'M',            desc: 'Mapa Mundi' },
  { key: 'Q',            desc: 'Missões' },
  { key: 'A',            desc: 'Conquistas' },
  { key: 'P',            desc: 'Passivas' },
  { key: 'C',            desc: 'Crafting' },
  { key: 'S',            desc: 'Status' },
  { key: 'H',            desc: 'Ajuda' },
  { key: 'F2',           desc: 'Editor de Mundo' },
  { key: 'F9',           desc: 'Modo Dev (imortalidade)' },
  { key: 'ESC',          desc: 'Fechar painéis' },
]

const TIPS = [
  'Derrote monstros para ganhar XP e subir de nível.',
  'Colete materiais: slimes → Gel, lobos → Pele, dragões → Escama.',
  'Passivas são desbloqueadas automaticamente ao subir de nível.',
  'Chefes têm barra de HP especial no topo da tela.',
  'Fique longe dos inimigos para regenerar HP/MP mais rápido.',
  'Use o Mapa Mundi [M] para viajar entre os 9 biomas.',
  'O Abismo Eterno (Lv 22) tem os drops lendários mais raros.',
  'Kill Streaks acima de 3 aparecem no topo da tela.',
  'O Ferreiro [C] cria equipamentos com materiais coletados.',
  'Cada classe tem 4 habilidades únicas — experimente todas!',
]

interface Props { onClose: () => void }

export default function HelpPanel({ onClose }: Props) {
  return (
    <Overlay onBgClick={onClose} title="Ajuda" storageKey="help">
      <div className="rcy-modal rcy-modal--wide rcy-pixel">
        <ModalHeader title="AJUDA  ·  CONTROLES" accent="var(--rcy-blue)" onClose={onClose} />

        <div className="rcy-modal__body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          <div>
            <div className="rcy-section-label">CONTROLES</div>
            <div className="rcy-stat-grid" style={{ gridTemplateColumns: 'auto 1fr', rowGap: 4 }}>
              {BINDINGS.map(b => (
                <span key={b.key} style={{ display: 'contents' }}>
                  <span style={{
                    background: 'var(--rcy-panel)', border: '1px solid var(--rcy-border-strong)',
                    boxShadow: 'inset 0 0 0 1px rgba(120,88,32,0.2)',
                    padding: '1px 6px', fontSize: 10, color: 'var(--rcy-gold)',
                    whiteSpace: 'nowrap', textShadow: '1px 1px 0 #000',
                  }}>{b.key}</span>
                  <span style={{ color: 'var(--rcy-text)', fontSize: 11, textShadow: '1px 1px 0 #000' }}>{b.desc}</span>
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="rcy-section-label">DICAS</div>
            {TIPS.map((tip, i) => (
              <div key={i} className="rcy-frame" style={{ padding: '5px 8px', marginBottom: 4, fontSize: 11, color: 'var(--rcy-text-dim)', textShadow: '1px 1px 0 #000' }}>
                <span style={{ color: 'var(--rcy-green)', marginRight: 6 }}>▸</span>
                {tip}
              </div>
            ))}
          </div>
        </div>

        <ModalFooter hint="[H] ou [ESC] para fechar" />
      </div>
    </Overlay>
  )
}
