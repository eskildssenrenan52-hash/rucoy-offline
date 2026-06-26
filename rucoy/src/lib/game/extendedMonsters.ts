// ═══════════════════════════════════════════════════════════════════════════
// EXTENDED MONSTERS REGISTRY
// 50+ novos monstros distribuidos pelos biomas com IA propria,
// resistencias, fraquezas, elemento e comportamento avancado.
// Renderizados procedimentalmente via extendedSprites.ts (silhueta + paleta).
// Integrado a createMonster() em data.ts atraves de lookup no registry.
// ═══════════════════════════════════════════════════════════════════════════

import type {
  Monster, MonsterType, EliteTier, DamageElement, MonsterBehavior, ItemDropEntry, Item,
} from './types'

export type Silhouette =
  | 'blob' | 'humanoid' | 'beast' | 'flying' | 'arachnid' | 'serpent'
  | 'elemental' | 'construct' | 'plant' | 'ghost' | 'colossus' | 'insect'

export type BiomeTag =
  | 'forest' | 'desert' | 'tundra' | 'volcano' | 'abyss' | 'crystal'
  | 'ruins' | 'sky' | 'deep_forest' | 'snowy_mountain' | 'ancient_ruins'
  | 'swamp' | 'ocean' | 'city' | 'dungeon' | 'tower' | 'graveyard' | 'underdark'

export interface ExtendedMonsterDef {
  id: string
  name: string
  silhouette: Silhouette
  palette: { primary: string; secondary: string; accent: string; eye: string }
  element: DamageElement
  behavior: MonsterBehavior
  biomes: BiomeTag[]
  baseHp: number
  baseAtk: number
  baseDef: number
  speed: number
  aggroRange: number
  isRanged: boolean
  attackRange?: number
  resistances?: Partial<Record<DamageElement, number>>
  weaknesses?: Partial<Record<DamageElement, number>>
  xpMul?: number
  goldMul?: number
  scale?: number  // tamanho visual (1 = normal, 1.5 = grande, 2 = enorme)
  dropTable?: (lvl: number) => ItemDropEntry[]
}

export interface WorldBossDef extends ExtendedMonsterDef {
  isWorldBoss: true
  phases: { threshold: number; speedMul: number; atkMul: number; behavior?: MonsterBehavior; element?: DamageElement }[]
  telegraphs: { id: string; name: string; cooldown: number; warning: number; element: DamageElement; description: string }[]
  summonOnPhaseChange?: { type: MonsterType; count: number }
  uniqueReward: { name: string; icon: string; description: string }
}

// ─── Drop helper ────────────────────────────────────────────────────────────
const stubDrop = (): ItemDropEntry[] => []

// ═══════════════════════════════════════════════════════════════════════════
// 50 MONSTROS ESTENDIDOS
// ═══════════════════════════════════════════════════════════════════════════
export const EXTENDED_MONSTERS: ExtendedMonsterDef[] = [
  // ── FOREST / DEEP_FOREST ─────────────────────────────────────────────────
  { id: 'forest_sprite',     name: 'Espirito da Floresta',  silhouette: 'flying',   palette: { primary: '#a8e85e', secondary: '#4a8030', accent: '#fff89e', eye: '#fff' }, element: 'nature',    behavior: 'kiter',    biomes: ['forest','deep_forest'], baseHp: 22, baseAtk: 6,  baseDef: 1, speed: 3.0, aggroRange: 180, isRanged: true,  attackRange: 200, weaknesses: { fire: 0.5 }, resistances: { nature: 0.5 } },
  { id: 'thorn_lurker',      name: 'Espreitador Espinhoso', silhouette: 'plant',    palette: { primary: '#3d6b2a', secondary: '#1a3a10', accent: '#7a1a1a', eye: '#ff4040' }, element: 'poison',    behavior: 'turret',   biomes: ['forest','deep_forest'], baseHp: 55, baseAtk: 9,  baseDef: 6, speed: 0.4, aggroRange: 220, isRanged: true,  attackRange: 240, weaknesses: { fire: 0.6 } },
  { id: 'moss_giant',        name: 'Gigante de Musgo',      silhouette: 'colossus', palette: { primary: '#4a6a30', secondary: '#2a4a20', accent: '#88aa50', eye: '#fff200' }, element: 'nature',    behavior: 'tank',     biomes: ['deep_forest'],          baseHp: 180, baseAtk: 22, baseDef: 14, speed: 1.0, aggroRange: 150, isRanged: false, weaknesses: { fire: 0.5 }, resistances: { physical: 0.3, nature: 0.6 }, scale: 1.6 },
  { id: 'shadow_panther',    name: 'Pantera Sombria',       silhouette: 'beast',    palette: { primary: '#1a1a20', secondary: '#0a0a10', accent: '#5a2a8a', eye: '#ff00ff' }, element: 'shadow',    behavior: 'charger',  biomes: ['deep_forest','forest'],  baseHp: 70, baseAtk: 18, baseDef: 4, speed: 4.0, aggroRange: 200, isRanged: false, resistances: { shadow: 0.6 }, weaknesses: { holy: 0.6 } },
  { id: 'mushroom_zealot',   name: 'Zelote-Cogumelo',       silhouette: 'humanoid', palette: { primary: '#aa3030', secondary: '#fff', accent: '#5a3010', eye: '#ffff00' }, element: 'poison',    behavior: 'swarmer',  biomes: ['deep_forest'],           baseHp: 28, baseAtk: 7,  baseDef: 2, speed: 2.4, aggroRange: 130, isRanged: false, weaknesses: { fire: 0.7 } },
  { id: 'verdant_wisp',      name: 'Wisp Verdejante',       silhouette: 'flying',   palette: { primary: '#88ff88', secondary: '#30ff30', accent: '#fff', eye: '#fff' }, element: 'nature',    behavior: 'healer',   biomes: ['forest','deep_forest'],  baseHp: 35, baseAtk: 4,  baseDef: 2, speed: 2.5, aggroRange: 220, isRanged: true,  attackRange: 180 },

  // ── DESERT ────────────────────────────────────────────────────────────────
  { id: 'sand_wraith',       name: 'Espectro de Areia',     silhouette: 'ghost',    palette: { primary: '#e8c878', secondary: '#a88848', accent: '#fff8c0', eye: '#ff8800' }, element: 'arcane',    behavior: 'phaser',   biomes: ['desert'],                baseHp: 50, baseAtk: 16, baseDef: 3, speed: 2.8, aggroRange: 200, isRanged: false, resistances: { physical: 0.5 }, weaknesses: { holy: 0.6 } },
  { id: 'scorpion_king',     name: 'Escorpiao Imperial',    silhouette: 'arachnid', palette: { primary: '#c08020', secondary: '#601000', accent: '#ffcc00', eye: '#ff0000' }, element: 'poison',    behavior: 'charger',  biomes: ['desert'],                baseHp: 110, baseAtk: 20, baseDef: 10, speed: 2.4, aggroRange: 170, isRanged: false, scale: 1.3, weaknesses: { ice: 0.5 } },
  { id: 'dune_serpent',      name: 'Serpente das Dunas',    silhouette: 'serpent',  palette: { primary: '#d8a850', secondary: '#806020', accent: '#ffe890', eye: '#00ff00' }, element: 'poison',    behavior: 'phaser',   biomes: ['desert'],                baseHp: 75, baseAtk: 17, baseDef: 6, speed: 3.2, aggroRange: 180, isRanged: false, weaknesses: { ice: 0.5 } },
  { id: 'mirage_djinn',      name: 'Djinn da Miragem',      silhouette: 'elemental',palette: { primary: '#88ddff', secondary: '#3060a0', accent: '#ffffff', eye: '#ffff00' }, element: 'arcane',    behavior: 'kiter',    biomes: ['desert'],                baseHp: 90, baseAtk: 22, baseDef: 5, speed: 2.6, aggroRange: 230, isRanged: true, attackRange: 260, resistances: { arcane: 0.7 }, weaknesses: { physical: 0.3 } },
  { id: 'sun_scarab',        name: 'Escaravelho Solar',     silhouette: 'insect',   palette: { primary: '#ffaa00', secondary: '#aa5500', accent: '#ffffff', eye: '#ff0000' }, element: 'fire',      behavior: 'swarmer',  biomes: ['desert'],                baseHp: 38, baseAtk: 11, baseDef: 5, speed: 2.6, aggroRange: 150, isRanged: false, resistances: { fire: 0.6 }, weaknesses: { ice: 0.7 } },

  // ── TUNDRA / SNOWY_MOUNTAIN ──────────────────────────────────────────────
  { id: 'ice_revenant',      name: 'Revenante de Gelo',     silhouette: 'humanoid', palette: { primary: '#a0d8ff', secondary: '#3060a0', accent: '#ffffff', eye: '#00ffff' }, element: 'ice',       behavior: 'tank',     biomes: ['tundra','snowy_mountain'], baseHp: 130, baseAtk: 18, baseDef: 12, speed: 1.5, aggroRange: 160, isRanged: false, resistances: { ice: 0.8 }, weaknesses: { fire: 0.7 } },
  { id: 'frost_wyrm',        name: 'Wyrm de Gelo',          silhouette: 'serpent',  palette: { primary: '#80c0f0', secondary: '#204060', accent: '#ffffff', eye: '#80ffff' }, element: 'ice',       behavior: 'kiter',    biomes: ['snowy_mountain','tundra'], baseHp: 160, baseAtk: 24, baseDef: 8, speed: 2.4, aggroRange: 230, isRanged: true, attackRange: 280, scale: 1.4, resistances: { ice: 0.7 }, weaknesses: { fire: 0.7 } },
  { id: 'yeti_brawler',      name: 'Yeti Lutador',          silhouette: 'colossus', palette: { primary: '#ffffff', secondary: '#a0c0e0', accent: '#604030', eye: '#000000' }, element: 'physical',  behavior: 'berserk',  biomes: ['snowy_mountain'],        baseHp: 200, baseAtk: 26, baseDef: 12, speed: 1.8, aggroRange: 180, isRanged: false, scale: 1.5, weaknesses: { fire: 0.5 } },
  { id: 'snow_stalker',      name: 'Caçador da Neve',       silhouette: 'beast',    palette: { primary: '#e8f0ff', secondary: '#a0b0c0', accent: '#202030', eye: '#0080ff' }, element: 'ice',       behavior: 'charger',  biomes: ['tundra','snowy_mountain'], baseHp: 65, baseAtk: 16, baseDef: 5, speed: 3.6, aggroRange: 200, isRanged: false, resistances: { ice: 0.4 } },
  { id: 'glacial_warden',    name: 'Guardiao Glacial',      silhouette: 'construct',palette: { primary: '#60a0e0', secondary: '#204060', accent: '#a0d0ff', eye: '#ffffff' }, element: 'ice',       behavior: 'turret',   biomes: ['snowy_mountain'],        baseHp: 140, baseAtk: 20, baseDef: 18, speed: 0.6, aggroRange: 240, isRanged: true,  attackRange: 260, resistances: { ice: 0.8, physical: 0.4 }, weaknesses: { fire: 0.6, lightning: 0.5 } },

  // ── VOLCANO ───────────────────────────────────────────────────────────────
  { id: 'magma_imp',         name: 'Imp do Magma',          silhouette: 'humanoid', palette: { primary: '#e04020', secondary: '#601008', accent: '#ffcc00', eye: '#ffffff' }, element: 'fire',      behavior: 'swarmer',  biomes: ['volcano'],               baseHp: 30, baseAtk: 12, baseDef: 3, speed: 3.0, aggroRange: 150, isRanged: false, resistances: { fire: 0.8 }, weaknesses: { ice: 0.7 } },
  { id: 'lava_golem',        name: 'Golem de Lava',         silhouette: 'colossus', palette: { primary: '#502010', secondary: '#ff4000', accent: '#ffaa00', eye: '#ffff00' }, element: 'fire',      behavior: 'tank',     biomes: ['volcano'],               baseHp: 220, baseAtk: 28, baseDef: 18, speed: 1.0, aggroRange: 160, isRanged: false, scale: 1.7, resistances: { fire: 0.9, physical: 0.3 }, weaknesses: { ice: 0.8 } },
  { id: 'phoenix_chick',     name: 'Filhote de Fenix',      silhouette: 'flying',   palette: { primary: '#ff8000', secondary: '#ffcc00', accent: '#ffffff', eye: '#ff0000' }, element: 'fire',      behavior: 'kiter',    biomes: ['volcano'],               baseHp: 60, baseAtk: 16, baseDef: 4, speed: 3.4, aggroRange: 220, isRanged: true,  attackRange: 240, resistances: { fire: 0.7 } },
  { id: 'obsidian_juggernaut', name: 'Juggernaut de Obsidiana', silhouette: 'colossus', palette: { primary: '#1a1a1a', secondary: '#3a0a0a', accent: '#ff4000', eye: '#ff8000' }, element: 'physical', behavior: 'charger', biomes: ['volcano'], baseHp: 260, baseAtk: 30, baseDef: 22, speed: 1.8, aggroRange: 200, isRanged: false, scale: 1.8, resistances: { physical: 0.5, fire: 0.6 } },
  { id: 'flame_serpent',     name: 'Serpente de Chamas',    silhouette: 'serpent',  palette: { primary: '#ff4000', secondary: '#800000', accent: '#ffff00', eye: '#ffffff' }, element: 'fire',      behavior: 'phaser',   biomes: ['volcano'],               baseHp: 90, baseAtk: 22, baseDef: 6, speed: 3.0, aggroRange: 200, isRanged: false, resistances: { fire: 0.7 }, weaknesses: { ice: 0.6 } },

  // ── ABYSS / SHADOW ───────────────────────────────────────────────────────
  { id: 'void_stalker',      name: 'Caçador do Vazio',      silhouette: 'humanoid', palette: { primary: '#100020', secondary: '#000000', accent: '#8000ff', eye: '#ff00ff' }, element: 'shadow',    behavior: 'phaser',   biomes: ['abyss'],                 baseHp: 95, baseAtk: 24, baseDef: 6, speed: 2.8, aggroRange: 220, isRanged: false, resistances: { shadow: 0.8, physical: 0.3 }, weaknesses: { holy: 0.9 } },
  { id: 'soul_eater',        name: 'Devorador de Almas',    silhouette: 'ghost',    palette: { primary: '#300050', secondary: '#600090', accent: '#a0d0ff', eye: '#00ffff' }, element: 'shadow',    behavior: 'kiter',    biomes: ['abyss','graveyard'],     baseHp: 80, baseAtk: 22, baseDef: 4, speed: 2.6, aggroRange: 230, isRanged: true,  attackRange: 260, resistances: { shadow: 0.7, physical: 0.4 }, weaknesses: { holy: 0.8 } },
  { id: 'void_horror',       name: 'Horror do Vazio',       silhouette: 'colossus', palette: { primary: '#0a0014', secondary: '#400080', accent: '#ff00aa', eye: '#ffff00' }, element: 'shadow',    behavior: 'summoner', biomes: ['abyss'],                 baseHp: 240, baseAtk: 30, baseDef: 10, speed: 1.4, aggroRange: 200, isRanged: false, scale: 1.8, resistances: { shadow: 0.8 }, weaknesses: { holy: 0.9 } },
  { id: 'abyssal_eye',       name: 'Olho Abissal',          silhouette: 'flying',   palette: { primary: '#400060', secondary: '#100020', accent: '#ffffff', eye: '#ff0040' }, element: 'arcane',    behavior: 'turret',   biomes: ['abyss'],                 baseHp: 100, baseAtk: 22, baseDef: 8, speed: 0.8, aggroRange: 280, isRanged: true,  attackRange: 300, resistances: { arcane: 0.7 }, weaknesses: { physical: 0.4 } },

  // ── CRYSTAL CAVERNS ──────────────────────────────────────────────────────
  { id: 'crystal_spider',    name: 'Aranha de Cristal',     silhouette: 'arachnid', palette: { primary: '#ff80c0', secondary: '#8040a0', accent: '#ffffff', eye: '#00ffff' }, element: 'arcane',    behavior: 'swarmer',  biomes: ['crystal'],               baseHp: 45, baseAtk: 14, baseDef: 7, speed: 2.6, aggroRange: 160, isRanged: false, resistances: { arcane: 0.5, physical: 0.3 } },
  { id: 'gem_golem',         name: 'Golem de Gema',         silhouette: 'construct',palette: { primary: '#8040c0', secondary: '#40208a', accent: '#ff80ff', eye: '#ffffff' }, element: 'arcane',    behavior: 'tank',     biomes: ['crystal'],               baseHp: 180, baseAtk: 22, baseDef: 20, speed: 1.0, aggroRange: 150, isRanged: false, scale: 1.4, resistances: { physical: 0.5, arcane: 0.4 }, weaknesses: { lightning: 0.6 } },
  { id: 'prism_wraith',      name: 'Espectro Prismatico',   silhouette: 'ghost',    palette: { primary: '#ff80ff', secondary: '#80ffff', accent: '#ffff80', eye: '#ffffff' }, element: 'arcane',    behavior: 'phaser',   biomes: ['crystal'],               baseHp: 70, baseAtk: 18, baseDef: 5, speed: 2.6, aggroRange: 220, isRanged: true, attackRange: 220, resistances: { arcane: 0.6 } },

  // ── RUINS / ANCIENT_RUINS ────────────────────────────────────────────────
  { id: 'mummy_lord',        name: 'Senhor Mumificado',     silhouette: 'humanoid', palette: { primary: '#c8b890', secondary: '#806040', accent: '#ffd000', eye: '#0080ff' }, element: 'shadow',    behavior: 'tank',     biomes: ['ruins','ancient_ruins','desert'], baseHp: 140, baseAtk: 20, baseDef: 14, speed: 1.4, aggroRange: 170, isRanged: false, resistances: { shadow: 0.5, physical: 0.3 }, weaknesses: { fire: 0.6, holy: 0.7 } },
  { id: 'cursed_pharaoh',    name: 'Faraó Amaldiçoado',     silhouette: 'humanoid', palette: { primary: '#604030', secondary: '#ffd000', accent: '#8000ff', eye: '#00ffff' }, element: 'arcane',    behavior: 'summoner', biomes: ['ancient_ruins','desert'], baseHp: 180, baseAtk: 24, baseDef: 10, speed: 1.6, aggroRange: 200, isRanged: true,  attackRange: 240, scale: 1.2, resistances: { arcane: 0.5, shadow: 0.4 }, weaknesses: { holy: 0.8 } },
  { id: 'stone_sentinel',    name: 'Sentinela de Pedra',    silhouette: 'construct',palette: { primary: '#808080', secondary: '#404040', accent: '#a0a0a0', eye: '#ff8000' }, element: 'physical',  behavior: 'turret',   biomes: ['ruins','ancient_ruins'], baseHp: 200, baseAtk: 24, baseDef: 24, speed: 0.0, aggroRange: 260, isRanged: true,  attackRange: 280, resistances: { physical: 0.6 }, weaknesses: { lightning: 0.5 } },
  { id: 'tomb_guardian',     name: 'Guardiao da Tumba',     silhouette: 'humanoid', palette: { primary: '#a08060', secondary: '#503020', accent: '#ffd000', eye: '#ff0000' }, element: 'physical',  behavior: 'basic',    biomes: ['ancient_ruins'],         baseHp: 110, baseAtk: 22, baseDef: 12, speed: 1.8, aggroRange: 160, isRanged: false, weaknesses: { holy: 0.5 } },
  { id: 'ancient_scarab_swarm', name: 'Enxame de Escaravelhos Anciaos', silhouette: 'insect', palette: { primary: '#ffd000', secondary: '#806000', accent: '#000000', eye: '#ff0000' }, element: 'physical', behavior: 'swarmer', biomes: ['ancient_ruins','desert'], baseHp: 25, baseAtk: 8, baseDef: 3, speed: 3.2, aggroRange: 140, isRanged: false },

  // ── SKY / AERIAL ─────────────────────────────────────────────────────────
  { id: 'storm_harpy',       name: 'Harpia da Tempestade',  silhouette: 'flying',   palette: { primary: '#a0a0e0', secondary: '#404080', accent: '#ffff00', eye: '#00ffff' }, element: 'lightning', behavior: 'kiter',    biomes: ['sky'],                   baseHp: 65, baseAtk: 18, baseDef: 5, speed: 3.6, aggroRange: 240, isRanged: true,  attackRange: 260, resistances: { lightning: 0.6 }, weaknesses: { ice: 0.5 } },
  { id: 'sky_drake',         name: 'Drake Celeste',         silhouette: 'flying',   palette: { primary: '#80c0ff', secondary: '#2060a0', accent: '#ffffff', eye: '#ffff00' }, element: 'lightning', behavior: 'charger',  biomes: ['sky'],                   baseHp: 140, baseAtk: 26, baseDef: 9, speed: 3.2, aggroRange: 220, isRanged: false, scale: 1.5, resistances: { lightning: 0.5 } },
  { id: 'cloud_giant',       name: 'Gigante das Nuvens',    silhouette: 'colossus', palette: { primary: '#e0e8ff', secondary: '#8090c0', accent: '#ffffff', eye: '#0080ff' }, element: 'lightning', behavior: 'tank',     biomes: ['sky'],                   baseHp: 280, baseAtk: 30, baseDef: 16, speed: 1.4, aggroRange: 180, isRanged: false, scale: 1.9 },

  // ── DUNGEON / TOWER / UNDERDARK ─────────────────────────────────────────
  { id: 'flesh_construct',   name: 'Construto de Carne',    silhouette: 'humanoid', palette: { primary: '#a04040', secondary: '#400000', accent: '#ffff80', eye: '#ff0000' }, element: 'physical',  behavior: 'berserk',  biomes: ['dungeon','underdark'],   baseHp: 140, baseAtk: 22, baseDef: 8, speed: 2.0, aggroRange: 160, isRanged: false, weaknesses: { fire: 0.5 } },
  { id: 'iron_maiden',       name: 'Donzela de Ferro',      silhouette: 'humanoid', palette: { primary: '#808080', secondary: '#202020', accent: '#ff0000', eye: '#ffffff' }, element: 'physical',  behavior: 'tank',     biomes: ['dungeon','tower'],       baseHp: 180, baseAtk: 24, baseDef: 18, speed: 1.2, aggroRange: 160, isRanged: false, resistances: { physical: 0.5 }, weaknesses: { lightning: 0.5 } },
  { id: 'lich_acolyte',      name: 'Acolito Liche',         silhouette: 'humanoid', palette: { primary: '#202040', secondary: '#603080', accent: '#00ff00', eye: '#00ffff' }, element: 'shadow',    behavior: 'summoner', biomes: ['dungeon','tower','graveyard'], baseHp: 90, baseAtk: 20, baseDef: 7, speed: 1.8, aggroRange: 220, isRanged: true,  attackRange: 240, resistances: { shadow: 0.6 }, weaknesses: { holy: 0.7 } },
  { id: 'eyeball_horror',    name: 'Horror Ocular',         silhouette: 'flying',   palette: { primary: '#ffffff', secondary: '#ff0000', accent: '#000000', eye: '#000000' }, element: 'arcane',    behavior: 'turret',   biomes: ['dungeon','underdark'],   baseHp: 70, baseAtk: 18, baseDef: 6, speed: 1.0, aggroRange: 260, isRanged: true,  attackRange: 280 },
  { id: 'dread_knight',      name: 'Cavaleiro do Medo',     silhouette: 'humanoid', palette: { primary: '#1a0a2a', secondary: '#400060', accent: '#ff0040', eye: '#ff0000' }, element: 'shadow',    behavior: 'charger',  biomes: ['tower','dungeon'],       baseHp: 200, baseAtk: 28, baseDef: 16, speed: 2.4, aggroRange: 200, isRanged: false, resistances: { physical: 0.4, shadow: 0.6 }, weaknesses: { holy: 0.7 } },

  // ── SWAMP ────────────────────────────────────────────────────────────────
  { id: 'bog_witch',         name: 'Bruxa do Pantano',      silhouette: 'humanoid', palette: { primary: '#406030', secondary: '#205020', accent: '#80ff00', eye: '#ffff00' }, element: 'poison',    behavior: 'kiter',    biomes: ['swamp'],                 baseHp: 80, baseAtk: 20, baseDef: 6, speed: 2.2, aggroRange: 220, isRanged: true,  attackRange: 240, resistances: { poison: 0.8 }, weaknesses: { fire: 0.6 } },
  { id: 'mire_lurker',       name: 'Espreitador do Lodo',   silhouette: 'beast',    palette: { primary: '#3a4020', secondary: '#1a2010', accent: '#80a040', eye: '#ff0000' }, element: 'poison',    behavior: 'basic',    biomes: ['swamp'],                 baseHp: 90, baseAtk: 18, baseDef: 8, speed: 1.8, aggroRange: 150, isRanged: false, resistances: { poison: 0.7 } },
  { id: 'plague_toad',       name: 'Sapo Pestilento',       silhouette: 'beast',    palette: { primary: '#80a020', secondary: '#406010', accent: '#aaff40', eye: '#ff0000' }, element: 'poison',    behavior: 'swarmer',  biomes: ['swamp'],                 baseHp: 50, baseAtk: 14, baseDef: 4, speed: 2.4, aggroRange: 140, isRanged: false, resistances: { poison: 0.9 } },
  { id: 'hydra_spawn',       name: 'Cria de Hidra',         silhouette: 'serpent',  palette: { primary: '#205040', secondary: '#103020', accent: '#80ffaa', eye: '#ff8000' }, element: 'poison',    behavior: 'phaser',   biomes: ['swamp','ocean'],         baseHp: 130, baseAtk: 22, baseDef: 10, speed: 2.4, aggroRange: 200, isRanged: false, scale: 1.3, resistances: { poison: 0.6, physical: 0.3 } },

  // ── OCEAN / COAST ────────────────────────────────────────────────────────
  { id: 'deep_kraken',       name: 'Kraken das Profundezas',silhouette: 'serpent',  palette: { primary: '#2040a0', secondary: '#102060', accent: '#a040ff', eye: '#ffff00' }, element: 'ice',       behavior: 'charger',  biomes: ['ocean'],                 baseHp: 220, baseAtk: 28, baseDef: 12, speed: 2.0, aggroRange: 220, isRanged: false, scale: 1.6, resistances: { ice: 0.5 }, weaknesses: { lightning: 0.7 } },
  { id: 'siren',             name: 'Sereia Predadora',      silhouette: 'humanoid', palette: { primary: '#60a0ff', secondary: '#2060a0', accent: '#ffaaff', eye: '#ffff00' }, element: 'arcane',    behavior: 'kiter',    biomes: ['ocean'],                 baseHp: 75, baseAtk: 20, baseDef: 5, speed: 2.6, aggroRange: 240, isRanged: true,  attackRange: 260, resistances: { ice: 0.5 } },
  { id: 'reef_crab',         name: 'Caranguejo de Recife',  silhouette: 'arachnid', palette: { primary: '#e04060', secondary: '#a02040', accent: '#ffff80', eye: '#000000' }, element: 'physical',  behavior: 'tank',     biomes: ['ocean'],                 baseHp: 150, baseAtk: 20, baseDef: 20, speed: 1.4, aggroRange: 140, isRanged: false, resistances: { physical: 0.6 }, weaknesses: { lightning: 0.5 } },

  // ── GRAVEYARD / UNDEAD ───────────────────────────────────────────────────
  { id: 'banshee',           name: 'Banshee',               silhouette: 'ghost',    palette: { primary: '#a0e0ff', secondary: '#4060a0', accent: '#ffffff', eye: '#ff0000' }, element: 'shadow',    behavior: 'kiter',    biomes: ['graveyard'],             baseHp: 80, baseAtk: 22, baseDef: 4, speed: 2.6, aggroRange: 240, isRanged: true,  attackRange: 260, resistances: { shadow: 0.6, physical: 0.5 }, weaknesses: { holy: 0.8 } },
  { id: 'bone_colossus',     name: 'Colosso de Ossos',      silhouette: 'colossus', palette: { primary: '#e8e0c0', secondary: '#a09060', accent: '#ff0000', eye: '#00ffff' }, element: 'physical',  behavior: 'tank',     biomes: ['graveyard','dungeon'],   baseHp: 280, baseAtk: 28, baseDef: 16, speed: 1.0, aggroRange: 180, isRanged: false, scale: 1.8, weaknesses: { holy: 0.6 } },
  { id: 'wight',             name: 'Wight',                 silhouette: 'humanoid', palette: { primary: '#604080', secondary: '#202040', accent: '#80ff80', eye: '#00ff00' }, element: 'shadow',    behavior: 'phaser',   biomes: ['graveyard'],             baseHp: 95, baseAtk: 22, baseDef: 8, speed: 2.4, aggroRange: 200, isRanged: false, resistances: { shadow: 0.7 }, weaknesses: { holy: 0.7 } },
  { id: 'plague_doctor',     name: 'Doutor da Peste',       silhouette: 'humanoid', palette: { primary: '#202020', secondary: '#604020', accent: '#80ff40', eye: '#ffffff' }, element: 'poison',    behavior: 'healer',   biomes: ['graveyard','city'],      baseHp: 90, baseAtk: 16, baseDef: 6, speed: 2.0, aggroRange: 200, isRanged: true,  attackRange: 220, resistances: { poison: 0.8 } },

  // ── CITY (humanoid threats) ─────────────────────────────────────────────
  { id: 'corrupt_guard',     name: 'Guarda Corrupto',       silhouette: 'humanoid', palette: { primary: '#603020', secondary: '#a06030', accent: '#ffd000', eye: '#ff0000' }, element: 'physical',  behavior: 'basic',    biomes: ['city'],                  baseHp: 100, baseAtk: 18, baseDef: 10, speed: 2.2, aggroRange: 160, isRanged: false },
  { id: 'rogue_assassin',    name: 'Assassino Renegado',    silhouette: 'humanoid', palette: { primary: '#101010', secondary: '#400040', accent: '#80ff80', eye: '#ff0000' }, element: 'shadow',    behavior: 'phaser',   biomes: ['city','dungeon'],        baseHp: 75, baseAtk: 26, baseDef: 5, speed: 3.4, aggroRange: 200, isRanged: false, resistances: { shadow: 0.4 } },

  // ── UNDERDARK ───────────────────────────────────────────────────────────
  { id: 'drow_mage',         name: 'Mago Drow',             silhouette: 'humanoid', palette: { primary: '#403040', secondary: '#201020', accent: '#a040ff', eye: '#ffff00' }, element: 'shadow',    behavior: 'kiter',    biomes: ['underdark','crystal'],   baseHp: 70, baseAtk: 24, baseDef: 5, speed: 2.4, aggroRange: 240, isRanged: true,  attackRange: 260, resistances: { shadow: 0.5 }, weaknesses: { holy: 0.6 } },
  { id: 'mind_flayer',       name: 'Devorador de Mentes',   silhouette: 'humanoid', palette: { primary: '#a040c0', secondary: '#401060', accent: '#ff00ff', eye: '#ffff00' }, element: 'arcane',    behavior: 'phaser',   biomes: ['underdark'],             baseHp: 130, baseAtk: 26, baseDef: 8, speed: 2.4, aggroRange: 220, isRanged: true,  attackRange: 200, resistances: { arcane: 0.7 } },
  { id: 'rock_worm',         name: 'Verme das Rochas',      silhouette: 'serpent',  palette: { primary: '#604030', secondary: '#302010', accent: '#ff8000', eye: '#000000' }, element: 'physical',  behavior: 'phaser',   biomes: ['underdark','volcano'],   baseHp: 150, baseAtk: 24, baseDef: 12, speed: 1.6, aggroRange: 160, isRanged: false, scale: 1.4, resistances: { physical: 0.5 } },

  // ── EXPANSAO: 20 NOVOS INIMIGOS ─────────────────────────────────────────
  { id: 'thunder_roc',       name: 'Roc do Trovão',         silhouette: 'flying',   palette: { primary: '#ffe060', secondary: '#806020', accent: '#ffffff', eye: '#00ffff' }, element: 'lightning', behavior: 'charger',  biomes: ['sky','snowy_mountain'],  baseHp: 170, baseAtk: 26, baseDef: 10, speed: 3.4, aggroRange: 240, isRanged: false, scale: 1.6, resistances: { lightning: 0.7 } },
  { id: 'frostbite_imp',     name: 'Imp Congelante',        silhouette: 'humanoid', palette: { primary: '#a0e0ff', secondary: '#205080', accent: '#ffffff', eye: '#0080ff' }, element: 'ice',       behavior: 'swarmer',  biomes: ['tundra','snowy_mountain'], baseHp: 32, baseAtk: 11, baseDef: 3, speed: 3.0, aggroRange: 150, isRanged: false, resistances: { ice: 0.8 }, weaknesses: { fire: 0.7 } },
  { id: 'molten_hound',      name: 'Cão de Magma',          silhouette: 'beast',    palette: { primary: '#ff5020', secondary: '#601000', accent: '#ffaa00', eye: '#ffff00' }, element: 'fire',      behavior: 'charger',  biomes: ['volcano','desert'],      baseHp: 85, baseAtk: 19, baseDef: 6, speed: 3.6, aggroRange: 200, isRanged: false, resistances: { fire: 0.8 }, weaknesses: { ice: 0.7 } },
  { id: 'bramble_ent',       name: 'Ente Espinhento',       silhouette: 'plant',    palette: { primary: '#3a5020', secondary: '#1a2810', accent: '#80a040', eye: '#ff0000' }, element: 'nature',    behavior: 'tank',     biomes: ['forest','deep_forest','swamp'], baseHp: 200, baseAtk: 22, baseDef: 16, speed: 0.8, aggroRange: 160, isRanged: false, scale: 1.5, resistances: { nature: 0.7, physical: 0.3 }, weaknesses: { fire: 0.8 } },
  { id: 'swamp_leech',       name: 'Sanguessuga do Pântano',silhouette: 'serpent',  palette: { primary: '#602030', secondary: '#300010', accent: '#ff4080', eye: '#ffff00' }, element: 'poison',    behavior: 'swarmer',  biomes: ['swamp'],                 baseHp: 40, baseAtk: 13, baseDef: 4, speed: 2.6, aggroRange: 140, isRanged: false, resistances: { poison: 0.8 } },
  { id: 'crystal_drake',     name: 'Drake de Cristal',      silhouette: 'flying',   palette: { primary: '#a060ff', secondary: '#402080', accent: '#ff80ff', eye: '#00ffff' }, element: 'arcane',    behavior: 'kiter',    biomes: ['crystal','sky'],         baseHp: 150, baseAtk: 24, baseDef: 10, speed: 3.0, aggroRange: 230, isRanged: true,  attackRange: 260, scale: 1.4, resistances: { arcane: 0.7 } },
  { id: 'gravewalker',       name: 'Andarilho Tumular',     silhouette: 'humanoid', palette: { primary: '#404060', secondary: '#1a1a2a', accent: '#80ff80', eye: '#00ff00' }, element: 'shadow',    behavior: 'basic',    biomes: ['graveyard','ruins'],     baseHp: 120, baseAtk: 19, baseDef: 9, speed: 1.6, aggroRange: 170, isRanged: false, resistances: { shadow: 0.6 }, weaknesses: { holy: 0.8 } },
  { id: 'sand_titan',        name: 'Titã das Areias',       silhouette: 'colossus', palette: { primary: '#d8b870', secondary: '#806030', accent: '#ffe890', eye: '#ff8000' }, element: 'physical',  behavior: 'tank',     biomes: ['desert','ancient_ruins'], baseHp: 260, baseAtk: 28, baseDef: 18, speed: 1.2, aggroRange: 180, isRanged: false, scale: 1.8, resistances: { physical: 0.5, fire: 0.4 } },
  { id: 'spectral_archer',   name: 'Arqueiro Espectral',    silhouette: 'ghost',    palette: { primary: '#80a0e0', secondary: '#304060', accent: '#ffffff', eye: '#00ffff' }, element: 'arcane',    behavior: 'turret',   biomes: ['graveyard','ruins','tower'], baseHp: 70, baseAtk: 22, baseDef: 4, speed: 1.4, aggroRange: 260, isRanged: true,  attackRange: 300, resistances: { physical: 0.6, shadow: 0.5 }, weaknesses: { holy: 0.7 } },
  { id: 'venom_widow',       name: 'Viúva Venenosa',        silhouette: 'arachnid', palette: { primary: '#200010', secondary: '#600020', accent: '#80ff00', eye: '#ff0080' }, element: 'poison',    behavior: 'kiter',    biomes: ['forest','swamp','underdark'], baseHp: 75, baseAtk: 20, baseDef: 6, speed: 3.0, aggroRange: 200, isRanged: true,  attackRange: 220, resistances: { poison: 0.9 } },
  { id: 'shadow_assassin',   name: 'Assassino das Sombras', silhouette: 'humanoid', palette: { primary: '#0a0a14', secondary: '#2a1040', accent: '#ff0080', eye: '#ff00ff' }, element: 'shadow',    behavior: 'phaser',   biomes: ['abyss','dungeon','city'],baseHp: 85, baseAtk: 28, baseDef: 6, speed: 3.6, aggroRange: 220, isRanged: false, resistances: { shadow: 0.7 }, weaknesses: { holy: 0.8 } },
  { id: 'arcane_construct',  name: 'Construto Arcano',      silhouette: 'construct',palette: { primary: '#6080ff', secondary: '#2040a0', accent: '#ffffff', eye: '#ffff00' }, element: 'arcane',    behavior: 'turret',   biomes: ['tower','crystal','dungeon'], baseHp: 160, baseAtk: 22, baseDef: 16, speed: 0.8, aggroRange: 260, isRanged: true,  attackRange: 280, resistances: { arcane: 0.8, physical: 0.4 } },
  { id: 'blood_bat_swarm',   name: 'Enxame de Morcegos',    silhouette: 'flying',   palette: { primary: '#400010', secondary: '#1a0008', accent: '#ff2040', eye: '#ff0000' }, element: 'physical',  behavior: 'swarmer',  biomes: ['dungeon','underdark','graveyard'], baseHp: 28, baseAtk: 9, baseDef: 2, speed: 3.8, aggroRange: 160, isRanged: false },
  { id: 'forest_guardian',   name: 'Guardião da Mata',      silhouette: 'colossus', palette: { primary: '#2a5020', secondary: '#102810', accent: '#80c040', eye: '#ffff00' }, element: 'nature',    behavior: 'tank',     biomes: ['deep_forest'],           baseHp: 320, baseAtk: 30, baseDef: 20, speed: 1.0, aggroRange: 180, isRanged: false, scale: 2.0, resistances: { nature: 0.8, physical: 0.4 }, weaknesses: { fire: 0.7 } },
  { id: 'tidal_serpent',     name: 'Serpente das Marés',    silhouette: 'serpent',  palette: { primary: '#2080c0', secondary: '#103060', accent: '#80ffff', eye: '#00ffff' }, element: 'ice',       behavior: 'phaser',   biomes: ['ocean','swamp'],         baseHp: 140, baseAtk: 22, baseDef: 9, speed: 2.8, aggroRange: 200, isRanged: false, scale: 1.4, resistances: { ice: 0.6 }, weaknesses: { lightning: 0.7 } },
  { id: 'ashen_ghoul',       name: 'Carniçal das Cinzas',   silhouette: 'humanoid', palette: { primary: '#605040', secondary: '#201810', accent: '#ff4000', eye: '#ff8000' }, element: 'fire',      behavior: 'berserk',  biomes: ['volcano','graveyard'],   baseHp: 95, baseAtk: 24, baseDef: 7, speed: 3.0, aggroRange: 180, isRanged: false, resistances: { fire: 0.5, shadow: 0.4 } },
  { id: 'wind_dancer',       name: 'Dançarina dos Ventos',  silhouette: 'flying',   palette: { primary: '#e0ffe0', secondary: '#80a080', accent: '#a0ffe0', eye: '#00ff80' }, element: 'lightning', behavior: 'kiter',    biomes: ['sky','meadow' as any],   baseHp: 55, baseAtk: 16, baseDef: 4, speed: 4.0, aggroRange: 230, isRanged: true,  attackRange: 240 },
  { id: 'magma_serpent',     name: 'Serpente de Magma',     silhouette: 'serpent',  palette: { primary: '#ff3000', secondary: '#400000', accent: '#ffcc00', eye: '#ffffff' }, element: 'fire',      behavior: 'charger',  biomes: ['volcano','underdark'],   baseHp: 130, baseAtk: 26, baseDef: 8, speed: 3.0, aggroRange: 200, isRanged: false, scale: 1.3, resistances: { fire: 0.8 }, weaknesses: { ice: 0.8 } },
  { id: 'crystal_sentinel',  name: 'Sentinela Cristalino',  silhouette: 'construct',palette: { primary: '#ff80ff', secondary: '#8040a0', accent: '#ffffff', eye: '#00ffff' }, element: 'arcane',    behavior: 'turret',   biomes: ['crystal'],               baseHp: 220, baseAtk: 24, baseDef: 22, speed: 0.4, aggroRange: 260, isRanged: true,  attackRange: 280, scale: 1.4, resistances: { arcane: 0.7, physical: 0.5 }, weaknesses: { lightning: 0.6 } },
  { id: 'void_leviathan',    name: 'Leviatã do Vazio',      silhouette: 'colossus', palette: { primary: '#0a0020', secondary: '#3a0060', accent: '#ff00ff', eye: '#ffff00' }, element: 'shadow',    behavior: 'tank',     biomes: ['abyss','ocean'],         baseHp: 360, baseAtk: 32, baseDef: 18, speed: 1.2, aggroRange: 220, isRanged: false, scale: 2.0, resistances: { shadow: 0.8, arcane: 0.5 }, weaknesses: { holy: 0.9 } },
]

// ═══════════════════════════════════════════════════════════════════════════
// 8 CHEFES MUNDIAIS (multi-fase, telegraphs, invocacoes, recompensas)
// ═══════════════════════════════════════════════════════════════════════════
export const WORLD_BOSSES: WorldBossDef[] = [
  {
    id: 'wb_ember_titan', name: 'Titã Brasa', silhouette: 'colossus',
    palette: { primary: '#ff4000', secondary: '#601000', accent: '#ffcc00', eye: '#ffffff' },
    element: 'fire', behavior: 'tank', biomes: ['volcano'],
    baseHp: 1800, baseAtk: 40, baseDef: 22, speed: 1.2, aggroRange: 280, isRanged: false, scale: 2.2,
    resistances: { fire: 0.85, physical: 0.4 }, weaknesses: { ice: 0.8 },
    xpMul: 8, goldMul: 10, isWorldBoss: true,
    phases: [
      { threshold: 1.00, speedMul: 1.0, atkMul: 1.0, behavior: 'tank',    element: 'fire' },
      { threshold: 0.66, speedMul: 1.2, atkMul: 1.2, behavior: 'charger', element: 'fire' },
      { threshold: 0.33, speedMul: 1.5, atkMul: 1.5, behavior: 'berserk', element: 'fire' },
    ],
    telegraphs: [
      { id: 'meteor_slam',   name: 'Impacto Meteorico', cooldown: 320, warning: 70, element: 'fire', description: 'Salta no ar e cai com impacto em area' },
      { id: 'flame_pillar',  name: 'Pilar de Chamas',   cooldown: 220, warning: 50, element: 'fire', description: 'Coluna vertical de fogo' },
      { id: 'magma_wave',    name: 'Onda de Magma',     cooldown: 280, warning: 60, element: 'fire', description: 'Onda radial de fogo' },
    ],
    summonOnPhaseChange: { type: 'magma_imp', count: 4 },
    uniqueReward: { name: 'Coracao Brasa', icon: '🔥', description: 'Relíquia mítica caída do Titã Brasa.' },
  },
  {
    id: 'wb_glacier_queen', name: 'Rainha das Geleiras', silhouette: 'humanoid',
    palette: { primary: '#80c0ff', secondary: '#2060a0', accent: '#ffffff', eye: '#00ffff' },
    element: 'ice', behavior: 'kiter', biomes: ['snowy_mountain','tundra'],
    baseHp: 1500, baseAtk: 38, baseDef: 16, speed: 2.0, aggroRange: 300, isRanged: true, attackRange: 280, scale: 1.6,
    resistances: { ice: 0.9 }, weaknesses: { fire: 0.8 },
    xpMul: 7, goldMul: 8, isWorldBoss: true,
    phases: [
      { threshold: 1.00, speedMul: 1.0, atkMul: 1.0, behavior: 'kiter' },
      { threshold: 0.50, speedMul: 1.3, atkMul: 1.3, behavior: 'phaser' },
    ],
    telegraphs: [
      { id: 'frost_nova',    name: 'Nova Glacial',    cooldown: 260, warning: 60, element: 'ice', description: 'Explosao gelada em area' },
      { id: 'ice_lance',     name: 'Lanca de Gelo',   cooldown: 160, warning: 30, element: 'ice', description: 'Projetil traspassante' },
      { id: 'blizzard',      name: 'Nevasca',         cooldown: 380, warning: 90, element: 'ice', description: 'Tempestade de gelo persistente' },
    ],
    summonOnPhaseChange: { type: 'ice_revenant', count: 3 },
    uniqueReward: { name: 'Diadema Glacial', icon: '❄️', description: 'Coroa caída da Rainha das Geleiras.' },
  },
  {
    id: 'wb_void_sovereign', name: 'Soberano do Vazio', silhouette: 'colossus',
    palette: { primary: '#100020', secondary: '#400080', accent: '#ff00aa', eye: '#ffff00' },
    element: 'shadow', behavior: 'summoner', biomes: ['abyss'],
    baseHp: 2200, baseAtk: 44, baseDef: 18, speed: 1.4, aggroRange: 320, isRanged: true, attackRange: 240, scale: 2.0,
    resistances: { shadow: 0.9, arcane: 0.6 }, weaknesses: { holy: 0.95 },
    xpMul: 10, goldMul: 12, isWorldBoss: true,
    phases: [
      { threshold: 1.00, speedMul: 1.0, atkMul: 1.0, behavior: 'summoner' },
      { threshold: 0.66, speedMul: 1.2, atkMul: 1.3, behavior: 'phaser' },
      { threshold: 0.33, speedMul: 1.5, atkMul: 1.6, behavior: 'berserk' },
    ],
    telegraphs: [
      { id: 'void_rift',     name: 'Fenda do Vazio',  cooldown: 300, warning: 80, element: 'shadow', description: 'Rasga buracos no espaco' },
      { id: 'shadow_chains', name: 'Correntes Sombrias', cooldown: 240, warning: 60, element: 'shadow', description: 'Imobiliza alvo' },
      { id: 'soul_drain',    name: 'Sucção de Alma',  cooldown: 360, warning: 70, element: 'shadow', description: 'Cura-se drenando vida' },
    ],
    summonOnPhaseChange: { type: 'void_stalker', count: 5 },
    uniqueReward: { name: 'Cetro do Vazio', icon: '🌌', description: 'Cetro divino do Soberano do Vazio.' },
  },
  {
    id: 'wb_ancient_dragon', name: 'Dragao Ancestral', silhouette: 'serpent',
    palette: { primary: '#604030', secondary: '#a06040', accent: '#ffd000', eye: '#ff0000' },
    element: 'fire', behavior: 'charger', biomes: ['volcano','snowy_mountain','sky'],
    baseHp: 2800, baseAtk: 48, baseDef: 22, speed: 2.4, aggroRange: 340, isRanged: true, attackRange: 320, scale: 2.4,
    resistances: { fire: 0.6, physical: 0.5 }, weaknesses: { ice: 0.5, lightning: 0.5 },
    xpMul: 12, goldMul: 15, isWorldBoss: true,
    phases: [
      { threshold: 1.00, speedMul: 1.0, atkMul: 1.0, behavior: 'charger', element: 'fire' },
      { threshold: 0.66, speedMul: 1.2, atkMul: 1.3, behavior: 'kiter',   element: 'lightning' },
      { threshold: 0.33, speedMul: 1.5, atkMul: 1.7, behavior: 'berserk', element: 'shadow' },
    ],
    telegraphs: [
      { id: 'dragon_breath', name: 'Sopro Dracônico', cooldown: 280, warning: 80, element: 'fire',    description: 'Cone gigante de fogo' },
      { id: 'wing_buffet',   name: 'Vento de Asas',   cooldown: 220, warning: 50, element: 'physical',description: 'Empurra alvos' },
      { id: 'tail_swipe',    name: 'Golpe de Cauda',  cooldown: 180, warning: 40, element: 'physical',description: 'Varredura em cone' },
    ],
    summonOnPhaseChange: { type: 'flame_serpent', count: 3 },
    uniqueReward: { name: 'Coracao do Dragao Ancestral', icon: '🐉', description: 'Relíquia divina lendária.' },
  },
  {
    id: 'wb_swamp_witch', name: 'Bruxa-Mãe do Pântano', silhouette: 'humanoid',
    palette: { primary: '#406030', secondary: '#205020', accent: '#80ff00', eye: '#ffff00' },
    element: 'poison', behavior: 'summoner', biomes: ['swamp'],
    baseHp: 1400, baseAtk: 34, baseDef: 12, speed: 1.8, aggroRange: 260, isRanged: true, attackRange: 260, scale: 1.4,
    resistances: { poison: 0.9, nature: 0.6 }, weaknesses: { fire: 0.8 },
    xpMul: 6, goldMul: 7, isWorldBoss: true,
    phases: [
      { threshold: 1.00, speedMul: 1.0, atkMul: 1.0 },
      { threshold: 0.50, speedMul: 1.3, atkMul: 1.4, behavior: 'phaser' },
    ],
    telegraphs: [
      { id: 'toxic_cloud',   name: 'Nuvem Tóxica',     cooldown: 240, warning: 60, element: 'poison', description: 'AoE persistente' },
      { id: 'vine_grasp',    name: 'Tentaculos de Vinha', cooldown: 200, warning: 50, element: 'nature', description: 'Imobiliza alvo' },
    ],
    summonOnPhaseChange: { type: 'plague_toad', count: 6 },
    uniqueReward: { name: 'Caldeirão Pútrido', icon: '🧪', description: 'Caldeirão eterno da Bruxa-Mãe.' },
  },
  {
    id: 'wb_pharaoh_eternal', name: 'Faraó Eterno', silhouette: 'humanoid',
    palette: { primary: '#ffd000', secondary: '#604030', accent: '#8000ff', eye: '#00ffff' },
    element: 'arcane', behavior: 'summoner', biomes: ['ancient_ruins','desert'],
    baseHp: 1700, baseAtk: 36, baseDef: 14, speed: 1.6, aggroRange: 280, isRanged: true, attackRange: 240, scale: 1.6,
    resistances: { arcane: 0.7, shadow: 0.5 }, weaknesses: { holy: 0.85 },
    xpMul: 7, goldMul: 9, isWorldBoss: true,
    phases: [
      { threshold: 1.00, speedMul: 1.0, atkMul: 1.0, behavior: 'summoner' },
      { threshold: 0.50, speedMul: 1.3, atkMul: 1.4, behavior: 'kiter' },
    ],
    telegraphs: [
      { id: 'sand_storm',    name: 'Tempestade de Areia', cooldown: 300, warning: 70, element: 'physical', description: 'AoE radial' },
      { id: 'curse_beam',    name: 'Raio da Maldição',    cooldown: 200, warning: 50, element: 'shadow',   description: 'Raio direcional' },
    ],
    summonOnPhaseChange: { type: 'mummy_lord', count: 3 },
    uniqueReward: { name: 'Coroa do Faraó Eterno', icon: '👑', description: 'Coroa divina ressurgida.' },
  },
  {
    id: 'wb_storm_lord', name: 'Senhor da Tempestade', silhouette: 'flying',
    palette: { primary: '#a0a0e0', secondary: '#404080', accent: '#ffff00', eye: '#00ffff' },
    element: 'lightning', behavior: 'kiter', biomes: ['sky'],
    baseHp: 1600, baseAtk: 38, baseDef: 12, speed: 3.0, aggroRange: 320, isRanged: true, attackRange: 320, scale: 1.6,
    resistances: { lightning: 0.85 }, weaknesses: { ice: 0.6 },
    xpMul: 7, goldMul: 8, isWorldBoss: true,
    phases: [
      { threshold: 1.00, speedMul: 1.0, atkMul: 1.0 },
      { threshold: 0.40, speedMul: 1.5, atkMul: 1.6, behavior: 'berserk' },
    ],
    telegraphs: [
      { id: 'chain_lightning', name: 'Raio em Cadeia', cooldown: 200, warning: 40, element: 'lightning', description: 'Salta entre alvos' },
      { id: 'thunder_storm',   name: 'Trovão Cíclico', cooldown: 320, warning: 80, element: 'lightning', description: 'Multiplos AoE simultaneos' },
    ],
    summonOnPhaseChange: { type: 'storm_harpy', count: 4 },
    uniqueReward: { name: 'Trono Trovejante', icon: '⚡', description: 'Trono divino do Senhor da Tempestade.' },
  },
  {
    id: 'wb_lich_king', name: 'Rei Liche', silhouette: 'humanoid',
    palette: { primary: '#202040', secondary: '#603080', accent: '#00ff00', eye: '#00ffff' },
    element: 'shadow', behavior: 'summoner', biomes: ['graveyard','dungeon','tower'],
    baseHp: 2000, baseAtk: 42, baseDef: 16, speed: 1.6, aggroRange: 300, isRanged: true, attackRange: 280, scale: 1.7,
    resistances: { shadow: 0.85, arcane: 0.6, ice: 0.5 }, weaknesses: { holy: 0.95, fire: 0.5 },
    xpMul: 9, goldMul: 10, isWorldBoss: true,
    phases: [
      { threshold: 1.00, speedMul: 1.0, atkMul: 1.0, behavior: 'summoner' },
      { threshold: 0.66, speedMul: 1.2, atkMul: 1.3, behavior: 'kiter' },
      { threshold: 0.33, speedMul: 1.4, atkMul: 1.6, behavior: 'phaser' },
    ],
    telegraphs: [
      { id: 'death_nova',    name: 'Nova da Morte',    cooldown: 280, warning: 70, element: 'shadow', description: 'AoE drenadora' },
      { id: 'raise_dead',    name: 'Erguer Mortos',    cooldown: 360, warning: 60, element: 'shadow', description: 'Invoca esqueletos' },
      { id: 'frost_bolt',    name: 'Dardo Gelado',     cooldown: 140, warning: 25, element: 'ice',    description: 'Projetil rapido' },
    ],
    summonOnPhaseChange: { type: 'lich_acolyte', count: 4 },
    uniqueReward: { name: 'Filactério Divino', icon: '💀', description: 'Filactério do Rei Liche, joia divina.' },
  },
]

// ═══════════════════════════════════════════════════════════════════════════
// REGISTRY LOOKUPS
// ═══════════════════════════════════════════════════════════════════════════
const REGISTRY = new Map<string, ExtendedMonsterDef | WorldBossDef>()
for (const m of EXTENDED_MONSTERS) REGISTRY.set(m.id, m)
for (const b of WORLD_BOSSES) REGISTRY.set(b.id, b)

export function getExtendedDef(type: string): ExtendedMonsterDef | WorldBossDef | undefined {
  return REGISTRY.get(type)
}

export function isExtendedType(type: string): boolean {
  return REGISTRY.has(type)
}

export function isWorldBoss(type: string): boolean {
  const d = REGISTRY.get(type)
  return !!(d as WorldBossDef | undefined)?.isWorldBoss
}

export function getMonstersForBiome(biome: BiomeTag): ExtendedMonsterDef[] {
  return EXTENDED_MONSTERS.filter(m => m.biomes.includes(biome))
}

export function getBossesForBiome(biome: BiomeTag): WorldBossDef[] {
  return WORLD_BOSSES.filter(b => b.biomes.includes(biome))
}

export function buildExtendedMonsterFromDef(
  def: ExtendedMonsterDef | WorldBossDef,
  level: number,
  x: number,
  y: number,
  elite: EliteTier = 'normal',
): Monster {
  const isBoss = (def as WorldBossDef).isWorldBoss === true
  const eliteMul = elite === 'boss' ? 9 : elite === 'champion' ? 4 : elite === 'elite' ? 2.2 : 1
  const eliteAtk = elite === 'boss' ? 3.2 : elite === 'champion' ? 2.1 : elite === 'elite' ? 1.5 : 1
  const hpScale = isBoss ? 1 : 5 // existing diff multiplier
  const atkScale = isBoss ? 1 : 4

  const maxHp = Math.round(def.baseHp * level * eliteMul * hpScale * (def.xpMul ? 1 : 1))
  const attack = Math.round(def.baseAtk * level * eliteAtk * atkScale)
  const defense = Math.round(def.baseDef * 2.5 + level * 2)

  const prefix = isBoss ? '★ ' : elite === 'normal' ? '' : elite === 'elite' ? 'Elite ' : elite === 'champion' ? 'Campeao ' : 'CHEFE '

  const m: Monster = {
    id: `${def.id}_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    type: def.id as MonsterType,
    name: prefix + def.name,
    level,
    hp: maxHp,
    maxHp,
    attack,
    defense,
    speed: def.speed * 1.4,
    xpReward: Math.round(level * 30 * (def.xpMul ?? 1) * (isBoss ? 1 : eliteMul * 1.5)),
    goldReward: Math.round(level * 20 * (def.goldMul ?? 1) * (isBoss ? 1 : eliteMul * 1.5)),
    position: { x, y },
    targetPosition: { x, y },
    direction: 'down',
    isMoving: false,
    isAttacking: false,
    attackCooldown: 0,
    aggroRange: def.aggroRange,
    isAggrod: false,
    drops: def.dropTable ? def.dropTable(level) : stubDrop(),
    animFrame: Math.random() * 60,
    animTimer: 0,
    isDead: false,
    deathTimer: 0,
    attackRange: def.attackRange ?? (def.isRanged ? 220 : 42),
    isRanged: def.isRanged,
    elite: isBoss ? 'boss' : elite,
    _spawnX: x, _spawnY: y, _spawnType: def.id as MonsterType, _spawnLevel: level, _spawnElite: isBoss ? 'boss' : elite, _respawnIn: 0,
    element: def.element,
    resistances: def.resistances,
    weaknesses: def.weaknesses,
    behavior: def.behavior,
  }

  if (isBoss) {
    const wb = def as WorldBossDef
    m.isWorldBoss = true
    m.bossPhase = 1
    m.bossPhasesHpThresholds = wb.phases.slice(1).map(p => p.threshold)
    m.telegraphTimer = wb.telegraphs[0]?.cooldown ?? 240
    m.telegraphTelegraphing = 0
    m.summonCooldown = 600
    m.healCooldown = 0
    m.chargeCooldown = 0
    m.phaseShiftCooldown = 0
  }

  return m
}
