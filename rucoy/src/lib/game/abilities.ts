// @ts-nocheck
import type { AbilityDef, AbilityState, CharacterClass } from './types'

// ─── Definicoes de Habilidades por Classe ───────────────────────────────────
// Cada classe tem 4 habilidades, desbloqueadas conforme o nivel da classe sobe.

export const ABILITIES: Record<string, AbilityDef> = {
  // ─── Cronomante (Chronomancer) ───────────────────────────────────────────
  time_lance: {
    id: 'time_lance', name: 'Lança Temporal', cls: 'chronomancer',
    description: 'Dispara um cristal de tempo que perfura inimigos e os atrasa.',
    icon: 'TL', color: '#80c0ff', manaCost: 14, cooldown: 90, unlockLevel: 1,
    effect: 'projectile', damageMultiplier: 2.0, range: 380,
  },
  temporal_rift: {
    id: 'temporal_rift', name: 'Fenda Temporal', cls: 'chronomancer',
    description: 'Cria uma fenda no espaço-tempo que implode causando dano massivo em área.',
    icon: 'TR', color: '#a060e0', manaCost: 30, cooldown: 360, unlockLevel: 4,
    effect: 'target_aoe', damageMultiplier: 2.8, range: 280, radius: 110,
  },
  haste_field: {
    id: 'haste_field', name: 'Campo de Aceleração', cls: 'chronomancer',
    description: 'Acelera o próprio tempo aumentando velocidade, alcance e crítico.',
    icon: 'HF', color: '#60e0ff', manaCost: 25, cooldown: 480, unlockLevel: 6,
    effect: 'buff', damageMultiplier: 0, range: 0, duration: 420,
  },
  paradox_collapse: {
    id: 'paradox_collapse', name: 'Colapso Paradoxal', cls: 'chronomancer',
    description: 'Dobra o tempo em torno do jogador detonando uma nova devastadora.',
    icon: 'PC', color: '#c060ff', manaCost: 50, cooldown: 720, unlockLevel: 10,
    effect: 'nova', damageMultiplier: 3.8, range: 0, radius: 180,
  },

  // ─── Domador de Feras (Beastmaster) ─────────────────────────────────────
  hunters_mark: {
    id: 'hunters_mark', name: 'Marca do Caçador', cls: 'beastmaster',
    description: 'Dispara uma flecha rastreadora que perfura e marca o alvo.',
    icon: 'HM', color: '#c0a060', manaCost: 10, cooldown: 100, unlockLevel: 1,
    effect: 'projectile', damageMultiplier: 1.8, range: 340,
  },
  feral_companion: {
    id: 'feral_companion', name: 'Companheiro Feral', cls: 'beastmaster',
    description: 'Invoca lobos espirituais que lutam ao seu lado.',
    icon: 'FC', color: '#80c060', manaCost: 28, cooldown: 540, unlockLevel: 3,
    effect: 'summon', damageMultiplier: 1.2, range: 0,
    summonCount: 2, summonType: 'wraith_minion', duration: 720,
  },
  beast_call: {
    id: 'beast_call', name: 'Chamado Selvagem', cls: 'beastmaster',
    description: 'Cura e energiza o jogador e fortalece feras invocadas.',
    icon: 'BC', color: '#60c060', manaCost: 22, cooldown: 360, unlockLevel: 6,
    effect: 'heal', damageMultiplier: 0, range: 0, healPercent: 0.35,
  },
  primal_roar: {
    id: 'primal_roar', name: 'Rugido Primordial', cls: 'beastmaster',
    description: 'Ruge atordoando inimigos em volta e aumentando seu próprio ataque.',
    icon: 'PR', color: '#e08040', manaCost: 35, cooldown: 600, unlockLevel: 9,
    effect: 'nova', damageMultiplier: 2.2, range: 0, radius: 130,
  },

  // ─── Cavaleiro (Knight) ───────────────────────────────────────────────────
  whirlwind: {
    id: 'whirlwind', name: 'Redemoinho', cls: 'knight',
    description: 'Gira a lamina causando dano massivo a todos os inimigos ao redor.',
    icon: 'WW', color: '#d8b048', manaCost: 18, cooldown: 180, unlockLevel: 1,
    effect: 'melee_aoe', damageMultiplier: 1.6, range: 0, radius: 80,
  },
  charge: {
    id: 'charge', name: 'Investida', cls: 'knight',
    description: 'Avanca na direcao atual atropelando inimigos no caminho.',
    icon: 'CH', color: '#e0a030', manaCost: 14, cooldown: 240, unlockLevel: 3,
    effect: 'dash', damageMultiplier: 1.8, range: 180, radius: 40,
  },
  war_cry: {
    id: 'war_cry', name: 'Grito de Guerra', cls: 'knight',
    description: 'Aumenta drasticamente o ataque e a defesa por um tempo.',
    icon: 'WC', color: '#ff7040', manaCost: 25, cooldown: 480, unlockLevel: 5,
    effect: 'buff', damageMultiplier: 0, range: 0, duration: 360,
  },
  earthquake: {
    id: 'earthquake', name: 'Terremoto', cls: 'knight',
    description: 'Golpeia o chao criando uma onda de choque devastadora.',
    icon: 'EQ', color: '#c08020', manaCost: 40, cooldown: 600, unlockLevel: 8,
    effect: 'nova', damageMultiplier: 3.0, range: 0, radius: 140,
  },

  // ─── Arqueiro (Archer) ────────────────────────────────────────────────────
  power_shot: {
    id: 'power_shot', name: 'Tiro Poderoso', cls: 'archer',
    description: 'Dispara uma flecha perfurante que atravessa inimigos.',
    icon: 'PS', color: '#60c040', manaCost: 12, cooldown: 120, unlockLevel: 1,
    effect: 'projectile', damageMultiplier: 2.2, range: 360,
  },
  multi_shot: {
    id: 'multi_shot', name: 'Chuva de Flechas', cls: 'archer',
    description: 'Dispara 5 flechas em leque na direcao atual.',
    icon: 'MS', color: '#80e050', manaCost: 20, cooldown: 240, unlockLevel: 3,
    effect: 'multi_projectile', damageMultiplier: 1.1, range: 320, projectileCount: 5,
  },
  evasion: {
    id: 'evasion', name: 'Passo Veloz', cls: 'archer',
    description: 'Aumenta muito a velocidade e o critico por um tempo.',
    icon: 'EV', color: '#40e0c0', manaCost: 22, cooldown: 420, unlockLevel: 5,
    effect: 'buff', damageMultiplier: 0, range: 0, duration: 300,
  },
  arrow_rain: {
    id: 'arrow_rain', name: 'Dilúvio de Flechas', cls: 'archer',
    description: 'Chove flechas numa grande area mirada, atingindo todos.',
    icon: 'AR', color: '#a0e060', manaCost: 38, cooldown: 540, unlockLevel: 8,
    effect: 'target_aoe', damageMultiplier: 2.6, range: 340, radius: 120,
  },

  // ─── Mago (Mage) ──────────────────────────────────────────────────────────
  fireball: {
    id: 'fireball', name: 'Bola de Fogo', cls: 'mage',
    description: 'Lanca uma bola de fogo que explode ao impacto.',
    icon: 'FB', color: '#ff6020', manaCost: 16, cooldown: 90, unlockLevel: 1,
    effect: 'projectile', damageMultiplier: 2.4, range: 360, aoeRadius: 50,
  },
  frost_nova: {
    id: 'frost_nova', name: 'Nova de Gelo', cls: 'mage',
    description: 'Explosao de gelo que fere e congela inimigos ao redor.',
    icon: 'FN', color: '#60c0ff', manaCost: 28, cooldown: 300, unlockLevel: 3,
    effect: 'nova', damageMultiplier: 2.0, range: 0, radius: 130,
  },
  arcane_heal: {
    id: 'arcane_heal', name: 'Cura Arcana', cls: 'mage',
    description: 'Restaura uma grande quantidade de HP instantaneamente.',
    icon: 'HL', color: '#40ff80', manaCost: 30, cooldown: 420, unlockLevel: 5,
    effect: 'heal', damageMultiplier: 0, range: 0, healPercent: 0.45,
  },
  meteor: {
    id: 'meteor', name: 'Meteoro', cls: 'mage',
    description: 'Invoca um meteoro flamejante numa area mirada.',
    icon: 'MT', color: '#ff4020', manaCost: 50, cooldown: 600, unlockLevel: 8,
    effect: 'target_aoe', damageMultiplier: 4.0, range: 360, radius: 110,
  },

  // ─── Necromante (Necromancer) ─────────────────────────────────────────────
  raise_dead: {
    id: 'raise_dead', name: 'Erguer Mortos', cls: 'necromancer',
    description: 'Invoca esqueletos guerreiros para lutar ao seu lado.',
    icon: 'RD', color: '#80ff90', manaCost: 30, cooldown: 360, unlockLevel: 1,
    effect: 'summon', damageMultiplier: 0, range: 0, summonCount: 2,
    summonType: 'skeleton_minion', duration: 1200,
  },
  bone_spear: {
    id: 'bone_spear', name: 'Lanca de Osso', cls: 'necromancer',
    description: 'Dispara uma lanca de osso perfurante que atravessa tudo.',
    icon: 'BS', color: '#d0e0c0', manaCost: 14, cooldown: 100, unlockLevel: 2,
    effect: 'projectile', damageMultiplier: 2.0, range: 340,
  },
  life_drain: {
    id: 'life_drain', name: 'Drenar Vida', cls: 'necromancer',
    description: 'Drena a vida dos inimigos proximos, curando voce.',
    icon: 'LD', color: '#c040c0', manaCost: 26, cooldown: 300, unlockLevel: 4,
    effect: 'life_drain', damageMultiplier: 1.6, range: 0, radius: 110, healPercent: 0.5,
  },
  death_nova: {
    id: 'death_nova', name: 'Explosao da Morte', cls: 'necromancer',
    description: 'Libera uma onda de energia necrotica e invoca espectros.',
    icon: 'DN', color: '#a020e0', manaCost: 48, cooldown: 600, unlockLevel: 7,
    effect: 'nova', damageMultiplier: 3.2, range: 0, radius: 150,
    summonCount: 2, summonType: 'wraith_minion', duration: 900,
  },
  // ─── Paladino (Paladin) ───────────────────────────────────────────────────
  holy_strike: {
    id: 'holy_strike', name: 'Golpe Sagrado', cls: 'paladin',
    description: 'Um golpe radiante que fere e cura voce.',
    icon: 'HS', color: '#ffe080', manaCost: 14, cooldown: 150, unlockLevel: 1,
    effect: 'melee_aoe', damageMultiplier: 1.8, range: 0, radius: 70, healPercent: 0.15,
  },
  divine_shield: {
    id: 'divine_shield', name: 'Escudo Divino', cls: 'paladin',
    description: 'Aumenta drasticamente a defesa por um tempo.',
    icon: 'DS', color: '#fff0a0', manaCost: 22, cooldown: 420, unlockLevel: 3,
    effect: 'buff', damageMultiplier: 0, range: 0, duration: 360,
  },
  lay_on_hands: {
    id: 'lay_on_hands', name: 'Toque de Cura', cls: 'paladin',
    description: 'Restaura uma grande quantidade de HP instantaneamente.',
    icon: 'LH', color: '#40ff80', manaCost: 30, cooldown: 420, unlockLevel: 5,
    effect: 'heal', damageMultiplier: 0, range: 0, healPercent: 0.55,
  },
  judgment: {
    id: 'judgment', name: 'Julgamento', cls: 'paladin',
    description: 'Invoca um pilar de luz sagrada numa area mirada.',
    icon: 'JU', color: '#ffd040', manaCost: 42, cooldown: 540, unlockLevel: 8,
    effect: 'target_aoe', damageMultiplier: 3.2, range: 240, radius: 100,
  },

  // ─── Berserker ────────────────────────────────────────────────────────────
  cleave: {
    id: 'cleave', name: 'Talho', cls: 'berserker',
    description: 'Um corte largo que atinge varios inimigos a frente.',
    icon: 'CL', color: '#ff5040', manaCost: 6, cooldown: 90, unlockLevel: 1,
    effect: 'melee_aoe', damageMultiplier: 2.0, range: 0, radius: 70,
  },
  blood_rage: {
    id: 'blood_rage', name: 'Sede de Sangue', cls: 'berserker',
    description: 'Aumenta brutalmente o ataque por um tempo.',
    icon: 'BR', color: '#c01010', manaCost: 12, cooldown: 360, unlockLevel: 3,
    effect: 'buff', damageMultiplier: 0, range: 0, duration: 360,
  },
  reckless_charge: {
    id: 'reckless_charge', name: 'Carga Imprudente', cls: 'berserker',
    description: 'Carrega na direcao atual atropelando tudo.',
    icon: 'RC', color: '#e04040', manaCost: 10, cooldown: 240, unlockLevel: 5,
    effect: 'dash', damageMultiplier: 2.2, range: 220, radius: 44,
  },
  bloodbath: {
    id: 'bloodbath', name: 'Banho de Sangue', cls: 'berserker',
    description: 'Explosao de furia que devasta tudo ao redor.',
    icon: 'BB', color: '#ff2020', manaCost: 30, cooldown: 600, unlockLevel: 8,
    effect: 'nova', damageMultiplier: 3.6, range: 0, radius: 150,
  },

  // ─── Assassino (Assassin) ─────────────────────────────────────────────────
  shadow_strike: {
    id: 'shadow_strike', name: 'Golpe das Sombras', cls: 'assassin',
    description: 'Ataque furtivo com chance massiva de critico.',
    icon: 'SS', color: '#8060c0', manaCost: 10, cooldown: 90, unlockLevel: 1,
    effect: 'melee_aoe', damageMultiplier: 2.4, range: 0, radius: 50,
  },
  smoke_bomb: {
    id: 'smoke_bomb', name: 'Bomba de Fumaca', cls: 'assassin',
    description: 'Some das vistas, ganhando enorme velocidade e critico.',
    icon: 'SB', color: '#606060', manaCost: 18, cooldown: 360, unlockLevel: 3,
    effect: 'buff', damageMultiplier: 0, range: 0, duration: 300,
  },
  poison_dagger: {
    id: 'poison_dagger', name: 'Adaga Envenenada', cls: 'assassin',
    description: 'Lanca uma adaga que envenena o alvo.',
    icon: 'PD', color: '#60ff40', manaCost: 14, cooldown: 180, unlockLevel: 5,
    effect: 'projectile', damageMultiplier: 1.8, range: 300,
  },
  death_mark: {
    id: 'death_mark', name: 'Marca da Morte', cls: 'assassin',
    description: 'Marca uma area condenada — explosao critica brutal.',
    icon: 'DM', color: '#a040ff', manaCost: 40, cooldown: 540, unlockLevel: 8,
    effect: 'target_aoe', damageMultiplier: 4.0, range: 320, radius: 90,
  },

  // ─── Druida (Druid) ───────────────────────────────────────────────────────
  thorn_lash: {
    id: 'thorn_lash', name: 'Chicote de Espinhos', cls: 'druid',
    description: 'Acerta um inimigo com cipos perfurantes a distancia.',
    icon: 'TL', color: '#60c060', manaCost: 12, cooldown: 100, unlockLevel: 1,
    effect: 'projectile', damageMultiplier: 2.0, range: 320,
  },
  rejuvenate: {
    id: 'rejuvenate', name: 'Rejuvenescer', cls: 'druid',
    description: 'Cura instantanea e regeneracao continua.',
    icon: 'RJ', color: '#40ff80', manaCost: 24, cooldown: 360, unlockLevel: 3,
    effect: 'heal', damageMultiplier: 0, range: 0, healPercent: 0.4,
  },
  entangle: {
    id: 'entangle', name: 'Emaranhar', cls: 'druid',
    description: 'Cipos emergem ao redor causando dano em area.',
    icon: 'EN', color: '#40a040', manaCost: 28, cooldown: 300, unlockLevel: 5,
    effect: 'nova', damageMultiplier: 2.2, range: 0, radius: 130,
  },
  wild_storm: {
    id: 'wild_storm', name: 'Tempestade Selvagem', cls: 'druid',
    description: 'Invoca uma tempestade da natureza numa area mirada.',
    icon: 'WS', color: '#60ffa0', manaCost: 46, cooldown: 600, unlockLevel: 8,
    effect: 'target_aoe', damageMultiplier: 3.5, range: 340, radius: 120,
  },

  // ─── Monge (Monk) ─────────────────────────────────────────────────────────
  flurry_strike: {
    id: 'flurry_strike', name: 'Rajada de Punhos', cls: 'monk',
    description: 'Uma sequencia rapida de golpes em area corpo a corpo.',
    icon: 'FS', color: '#ffd070', manaCost: 6, cooldown: 70, unlockLevel: 1,
    effect: 'melee_aoe', damageMultiplier: 1.7, range: 0, radius: 60,
  },
  iron_body: {
    id: 'iron_body', name: 'Corpo de Ferro', cls: 'monk',
    description: 'Endurece o corpo, aumentando defesa e velocidade.',
    icon: 'IB', color: '#c0a060', manaCost: 16, cooldown: 360, unlockLevel: 3,
    effect: 'buff', damageMultiplier: 0, range: 0, duration: 360,
  },
  meditate: {
    id: 'meditate', name: 'Meditar', cls: 'monk',
    description: 'Restaura HP gradualmente e regenera vida.',
    icon: 'MD', color: '#80ffd0', manaCost: 22, cooldown: 420, unlockLevel: 5,
    effect: 'heal', damageMultiplier: 0, range: 0, healPercent: 0.4,
  },
  dragon_palm: {
    id: 'dragon_palm', name: 'Palma do Dragao', cls: 'monk',
    description: 'Explosao de energia interior que devasta inimigos ao redor.',
    icon: 'DP', color: '#ff9050', manaCost: 38, cooldown: 540, unlockLevel: 8,
    effect: 'nova', damageMultiplier: 3.2, range: 0, radius: 140,
  },

  // ─── Samurai ──────────────────────────────────────────────────────────────
  iaido: {
    id: 'iaido', name: 'Iaido', cls: 'samurai',
    description: 'Saque relampago da espada que avanca cortando inimigos.',
    icon: 'IA', color: '#e0c060', manaCost: 10, cooldown: 150, unlockLevel: 1,
    effect: 'dash', damageMultiplier: 2.4, range: 180, radius: 38,
  },
  bushido: {
    id: 'bushido', name: 'Bushido', cls: 'samurai',
    description: 'Foca o espirito, elevando criticos e ataque.',
    icon: 'BU', color: '#f0e090', manaCost: 18, cooldown: 360, unlockLevel: 3,
    effect: 'buff', damageMultiplier: 0, range: 0, duration: 360,
  },
  cherry_blossom: {
    id: 'cherry_blossom', name: 'Flor de Cerejeira', cls: 'samurai',
    description: 'Sete cortes em leque que cortam o ar ao redor.',
    icon: 'CB', color: '#ffb0c0', manaCost: 24, cooldown: 300, unlockLevel: 5,
    effect: 'nova', damageMultiplier: 2.6, range: 0, radius: 110,
  },
  thousand_cuts: {
    id: 'thousand_cuts', name: 'Mil Cortes', cls: 'samurai',
    description: 'Tecnica final: incontaveis cortes em uma area mirada.',
    icon: 'TC', color: '#ff4060', manaCost: 42, cooldown: 600, unlockLevel: 8,
    effect: 'target_aoe', damageMultiplier: 3.8, range: 280, radius: 90,
  },

  // ─── Summoner ────────────────────────────────────────────────────────────
  summon_familiar: {
    id: 'summon_familiar', name: 'Familiar Espiritual', cls: 'summoner',
    description: 'Invoca um esqueleto leal que combate ao seu lado.',
    icon: 'SF', color: '#a0e0ff', manaCost: 22, cooldown: 480, unlockLevel: 1,
    effect: 'summon', damageMultiplier: 0, range: 64, summonType: 'skeleton_minion', duration: 900,
  },
  arcane_bolt: {
    id: 'arcane_bolt', name: 'Esfera Arcana', cls: 'summoner',
    description: 'Esfera de energia que persegue e estilhaça.',
    icon: 'AB', color: '#80c0ff', manaCost: 14, cooldown: 130, unlockLevel: 1,
    effect: 'projectile', damageMultiplier: 2.0, range: 240, radius: 12,
  },
  spirit_swarm: {
    id: 'spirit_swarm', name: 'Enxame Espiritual', cls: 'summoner',
    description: 'Convoca um enxame de wraiths que rasgam o ar.',
    icon: 'SS', color: '#b080ff', manaCost: 28, cooldown: 360, unlockLevel: 4,
    effect: 'summon', damageMultiplier: 0, range: 64, summonType: 'wraith_minion', duration: 600,
  },
  soul_link: {
    id: 'soul_link', name: 'Elo das Almas', cls: 'summoner',
    description: 'Energia se concentra: aumenta poder mágico e velocidade.',
    icon: 'SL', color: '#d0a0ff', manaCost: 20, cooldown: 540, unlockLevel: 6,
    effect: 'buff', damageMultiplier: 0, range: 0, duration: 420,
  },

  // ─── Alchemist ───────────────────────────────────────────────────────────
  acid_flask: {
    id: 'acid_flask', name: 'Frasco Ácido', cls: 'alchemist',
    description: 'Arremessa uma poção corrosiva em arco.',
    icon: 'AF', color: '#a8e060', manaCost: 12, cooldown: 110, unlockLevel: 1,
    effect: 'projectile', damageMultiplier: 1.8, range: 200, radius: 20,
  },
  fire_bomb: {
    id: 'fire_bomb', name: 'Bomba Incendiária', cls: 'alchemist',
    description: 'Bomba que explode incendiando uma grande área.',
    icon: 'FB', color: '#ff8030', manaCost: 24, cooldown: 280, unlockLevel: 3,
    effect: 'target_aoe', damageMultiplier: 3.2, range: 220, radius: 90,
  },
  healing_brew: {
    id: 'healing_brew', name: 'Elixir Restaurador', cls: 'alchemist',
    description: 'Beba uma poção que regenera HP e MP imediatamente.',
    icon: 'HB', color: '#80ffa0', manaCost: 18, cooldown: 360, unlockLevel: 4,
    effect: 'heal', damageMultiplier: 0, range: 0, healAmount: 180,
  },
  alchemy_storm: {
    id: 'alchemy_storm', name: 'Tempestade Alquímica', cls: 'alchemist',
    description: 'Lança uma cascata de frascos voláteis ao redor.',
    icon: 'AS', color: '#e0a040', manaCost: 38, cooldown: 540, unlockLevel: 7,
    effect: 'nova', damageMultiplier: 3.4, range: 0, radius: 130,
  },
  // ─── Ninja ───────────────────────────────────────────────────────────────
  shadow_clone:   { id:'shadow_clone',  name:'Clone das Sombras',  cls:'ninja', description:'Invoca clones que atacam ao seu lado.', icon:'SC', color:'#404060', manaCost:24, cooldown:420, unlockLevel:1, effect:'summon', damageMultiplier:0, range:0, summonCount:2, summonType:'skeleton_minion', duration:540 },
  shuriken_burst: { id:'shuriken_burst',name:'Estrelas Mortais',   cls:'ninja', description:'Lança 5 shurikens em leque.', icon:'SH', color:'#a0a0c0', manaCost:14, cooldown:120, unlockLevel:1, effect:'multi_projectile', damageMultiplier:1.3, range:280, projectileCount:5 },
  vanish:         { id:'vanish',        name:'Desvanecer',         cls:'ninja', description:'Some, ganhando velocidade e crítico massivos.', icon:'VN', color:'#202040', manaCost:20, cooldown:360, unlockLevel:4, effect:'buff', damageMultiplier:0, range:0, duration:300 },
  thousand_blades:{ id:'thousand_blades',name:'Mil Lâminas',       cls:'ninja', description:'Rajada caótica de lâminas em área.', icon:'TB', color:'#80a0ff', manaCost:42, cooldown:600, unlockLevel:8, effect:'nova', damageMultiplier:3.6, range:0, radius:140 },

  // ─── Pyromancer ───────────────────────────────────────────────────────────
  flame_lance:    { id:'flame_lance',   name:'Lança Flamejante',   cls:'pyromancer', description:'Lança chamejante perfurante.', icon:'FL', color:'#ff5520', manaCost:16, cooldown:100, unlockLevel:1, effect:'projectile', damageMultiplier:2.4, range:380, aoeRadius:40 },
  fire_wall:      { id:'fire_wall',     name:'Muralha de Fogo',    cls:'pyromancer', description:'Erige uma muralha de chamas em área.', icon:'FW', color:'#ff7030', manaCost:30, cooldown:300, unlockLevel:3, effect:'target_aoe', damageMultiplier:2.6, range:280, radius:120 },
  inner_fire:     { id:'inner_fire',    name:'Chama Interior',     cls:'pyromancer', description:'Enche-se de fogo aumentando magia e crítico.', icon:'IF', color:'#ff9040', manaCost:22, cooldown:420, unlockLevel:5, effect:'buff', damageMultiplier:0, range:0, duration:360 },
  phoenix_rise:   { id:'phoenix_rise',  name:'Ascensão da Fênix',  cls:'pyromancer', description:'Explosão flamejante e cura instantânea.', icon:'PX', color:'#ffb030', manaCost:50, cooldown:660, unlockLevel:9, effect:'nova', damageMultiplier:4.0, range:0, radius:160, healPercent:0.4 },

  // ─── Cryomancer ───────────────────────────────────────────────────────────
  ice_shard:      { id:'ice_shard',     name:'Estilhaço de Gelo',  cls:'cryomancer', description:'Lança um cristal de gelo perfurante.', icon:'IS', color:'#80d4ff', manaCost:14, cooldown:90, unlockLevel:1, effect:'projectile', damageMultiplier:2.2, range:360 },
  blizzard:       { id:'blizzard',      name:'Nevasca',            cls:'cryomancer', description:'Tempestade de gelo em uma grande área mirada.', icon:'BZ', color:'#a0e0ff', manaCost:38, cooldown:480, unlockLevel:4, effect:'target_aoe', damageMultiplier:3.2, range:340, radius:150 },
  frost_armor:    { id:'frost_armor',   name:'Armadura de Gelo',   cls:'cryomancer', description:'Cobre-se de gelo aumentando defesa e HP.', icon:'FA', color:'#c0e8ff', manaCost:24, cooldown:360, unlockLevel:6, effect:'buff', damageMultiplier:0, range:0, duration:420 },
  absolute_zero:  { id:'absolute_zero', name:'Zero Absoluto',      cls:'cryomancer', description:'Onda glacial que congela tudo ao redor.', icon:'AZ', color:'#e0f8ff', manaCost:52, cooldown:720, unlockLevel:10, effect:'nova', damageMultiplier:3.8, range:0, radius:170 },

  // ─── Stormcaller ─────────────────────────────────────────────────────────
  lightning_bolt: { id:'lightning_bolt',name:'Raio',               cls:'stormcaller', description:'Raio fulminante a distância.', icon:'LB', color:'#a060ff', manaCost:16, cooldown:90, unlockLevel:1, effect:'projectile', damageMultiplier:2.6, range:420, aoeRadius:30 },
  chain_lightning:{ id:'chain_lightning',name:'Raio em Cadeia',    cls:'stormcaller', description:'Raios em leque que se ramificam.', icon:'CL', color:'#c080ff', manaCost:28, cooldown:240, unlockLevel:3, effect:'multi_projectile', damageMultiplier:1.6, range:380, projectileCount:5 },
  storm_aegis:    { id:'storm_aegis',   name:'Égide da Tempestade',cls:'stormcaller', description:'Tempestade pessoal aumenta velocidade e magia.', icon:'SA', color:'#e0c0ff', manaCost:24, cooldown:420, unlockLevel:6, effect:'buff', damageMultiplier:0, range:0, duration:420 },
  ragnarok:       { id:'ragnarok',      name:'Ragnarök',           cls:'stormcaller', description:'Chuva de raios devasta uma área enorme.', icon:'RK', color:'#ffe040', manaCost:54, cooldown:720, unlockLevel:10, effect:'target_aoe', damageMultiplier:4.5, range:380, radius:180 },

  // ─── Geomancer ────────────────────────────────────────────────────────────
  stone_throw:    { id:'stone_throw',   name:'Pedregulho',         cls:'geomancer', description:'Atira pedra esmagadora.', icon:'ST', color:'#a07040', manaCost:14, cooldown:120, unlockLevel:1, effect:'projectile', damageMultiplier:2.4, range:300, aoeRadius:40 },
  earth_pillar:   { id:'earth_pillar',  name:'Pilar de Pedra',     cls:'geomancer', description:'Pilar de rocha explode na área.', icon:'EP', color:'#c08850', manaCost:28, cooldown:280, unlockLevel:3, effect:'target_aoe', damageMultiplier:3.0, range:240, radius:90 },
  stone_skin:     { id:'stone_skin',    name:'Pele de Pedra',      cls:'geomancer', description:'Defesa e HP aumentam drasticamente.', icon:'SK', color:'#807060', manaCost:22, cooldown:420, unlockLevel:5, effect:'buff', damageMultiplier:0, range:0, duration:420 },
  tectonic_shock: { id:'tectonic_shock',name:'Choque Tectônico',   cls:'geomancer', description:'Terremoto massivo ao redor.', icon:'TS', color:'#604020', manaCost:46, cooldown:660, unlockLevel:9, effect:'nova', damageMultiplier:3.8, range:0, radius:160 },

  // ─── Bard ─────────────────────────────────────────────────────────────────
  sonic_note:     { id:'sonic_note',    name:'Nota Sônica',        cls:'bard', description:'Nota mágica perfurante.', icon:'SN', color:'#e060c0', manaCost:12, cooldown:90, unlockLevel:1, effect:'projectile', damageMultiplier:2.0, range:340 },
  inspiring_song: { id:'inspiring_song',name:'Canção Inspiradora', cls:'bard', description:'Aumenta ataque, magia e crítico próprios.', icon:'IN', color:'#ffd060', manaCost:24, cooldown:480, unlockLevel:3, effect:'buff', damageMultiplier:0, range:0, duration:480 },
  healing_ballad: { id:'healing_ballad',name:'Balada Curativa',    cls:'bard', description:'Restaura grande quantidade de HP.', icon:'HB', color:'#80ff80', manaCost:26, cooldown:360, unlockLevel:5, effect:'heal', damageMultiplier:0, range:0, healPercent:0.45 },
  finale:         { id:'finale',        name:'Grande Final',       cls:'bard', description:'Onda sônica devastadora ao redor.', icon:'FN', color:'#ff60e0', manaCost:44, cooldown:600, unlockLevel:8, effect:'nova', damageMultiplier:3.4, range:0, radius:150 },

  // ─── Gunner ───────────────────────────────────────────────────────────────
  quick_shot:     { id:'quick_shot',    name:'Tiro Rápido',        cls:'gunner', description:'Disparo poderoso e veloz.', icon:'QS', color:'#c0c0c0', manaCost:10, cooldown:60, unlockLevel:1, effect:'projectile', damageMultiplier:2.0, range:320 },
  shrapnel:       { id:'shrapnel',      name:'Estilhaços',         cls:'gunner', description:'Cone de estilhaços em leque.', icon:'SP', color:'#a0a0a0', manaCost:20, cooldown:200, unlockLevel:3, effect:'multi_projectile', damageMultiplier:1.4, range:240, projectileCount:6 },
  grenade:        { id:'grenade',       name:'Granada',            cls:'gunner', description:'Granada explosiva em área mirada.', icon:'GR', color:'#807030', manaCost:30, cooldown:360, unlockLevel:5, effect:'target_aoe', damageMultiplier:3.4, range:260, radius:110 },
  bullet_storm:   { id:'bullet_storm',  name:'Tempestade de Balas',cls:'gunner', description:'Rajada caótica ao redor.', icon:'BS', color:'#ffd060', manaCost:46, cooldown:660, unlockLevel:9, effect:'nova', damageMultiplier:3.8, range:0, radius:140 },

  // ─── Templar ──────────────────────────────────────────────────────────────
  hammer_strike:  { id:'hammer_strike', name:'Golpe do Martelo',   cls:'templar', description:'Martelada sagrada em área melê.', icon:'HS', color:'#ffe070', manaCost:16, cooldown:140, unlockLevel:1, effect:'melee_aoe', damageMultiplier:2.2, range:0, radius:80 },
  holy_shield:    { id:'holy_shield',   name:'Escudo Sagrado',     cls:'templar', description:'Escudo flamejante eleva defesa e HP.', icon:'HD', color:'#fff0a0', manaCost:24, cooldown:420, unlockLevel:3, effect:'buff', damageMultiplier:0, range:0, duration:420 },
  consecration:   { id:'consecration',  name:'Consagração',        cls:'templar', description:'Solo abençoado explode em luz.', icon:'CN', color:'#ffd040', manaCost:34, cooldown:360, unlockLevel:5, effect:'target_aoe', damageMultiplier:2.8, range:200, radius:120 },
  divine_wrath:   { id:'divine_wrath',  name:'Ira Divina',         cls:'templar', description:'Coluna de luz devasta uma área mirada.', icon:'DW', color:'#ffffff', manaCost:50, cooldown:660, unlockLevel:9, effect:'target_aoe', damageMultiplier:4.2, range:300, radius:120 },

  // ─── Warlock ──────────────────────────────────────────────────────────────
  shadow_bolt:    { id:'shadow_bolt',   name:'Raio Sombrio',       cls:'warlock', description:'Esfera de sombra a distância.', icon:'SB', color:'#601890', manaCost:14, cooldown:90, unlockLevel:1, effect:'projectile', damageMultiplier:2.2, range:340 },
  curse:          { id:'curse',         name:'Maldição',           cls:'warlock', description:'Drena vida de inimigos ao redor.', icon:'CR', color:'#a020a0', manaCost:26, cooldown:300, unlockLevel:3, effect:'life_drain', damageMultiplier:1.8, range:0, radius:120, healPercent:0.5 },
  summon_imp:     { id:'summon_imp',    name:'Invocar Diabrete',   cls:'warlock', description:'Invoca diabretes que atacam por você.', icon:'IM', color:'#ff60c0', manaCost:28, cooldown:480, unlockLevel:5, effect:'summon', damageMultiplier:0, range:0, summonCount:2, summonType:'wraith_minion', duration:900 },
  soul_burn:      { id:'soul_burn',     name:'Queima de Almas',    cls:'warlock', description:'Explosão sombria devastadora.', icon:'SL', color:'#c040ff', manaCost:48, cooldown:660, unlockLevel:9, effect:'nova', damageMultiplier:3.8, range:0, radius:150 },

  // ─── Valkyrie ─────────────────────────────────────────────────────────────
  divine_spear:   { id:'divine_spear',  name:'Lança Divina',       cls:'valkyrie', description:'Lança dourada perfurante.', icon:'DS', color:'#ffe070', manaCost:14, cooldown:120, unlockLevel:1, effect:'projectile', damageMultiplier:2.4, range:340 },
  winged_charge:  { id:'winged_charge', name:'Voo de Carga',       cls:'valkyrie', description:'Voa atravessando inimigos.', icon:'WC', color:'#ffffff', manaCost:18, cooldown:240, unlockLevel:3, effect:'dash', damageMultiplier:2.4, range:220, radius:48 },
  warcry_heaven:  { id:'warcry_heaven', name:'Brado dos Céus',     cls:'valkyrie', description:'Brado divino aumenta ataque e defesa.', icon:'BH', color:'#fff0c0', manaCost:24, cooldown:420, unlockLevel:5, effect:'buff', damageMultiplier:0, range:0, duration:420 },
  judgement_sky:  { id:'judgement_sky', name:'Julgamento Celeste', cls:'valkyrie', description:'Pilar dourado fulmina inimigos.', icon:'JS', color:'#ffd040', manaCost:48, cooldown:660, unlockLevel:9, effect:'target_aoe', damageMultiplier:4.0, range:320, radius:130 },
}

// Lista ordenada de habilidades por classe
export const CLASS_ABILITIES: Record<CharacterClass, string[]> = {
  knight: ['whirlwind', 'charge', 'war_cry', 'earthquake'],
  archer: ['power_shot', 'multi_shot', 'evasion', 'arrow_rain'],
  mage: ['fireball', 'frost_nova', 'arcane_heal', 'meteor'],
  necromancer: ['raise_dead', 'bone_spear', 'life_drain', 'death_nova'],
  paladin: ['holy_strike', 'divine_shield', 'lay_on_hands', 'judgment'],
  berserker: ['cleave', 'blood_rage', 'reckless_charge', 'bloodbath'],
  assassin: ['shadow_strike', 'smoke_bomb', 'poison_dagger', 'death_mark'],
  druid: ['thorn_lash', 'rejuvenate', 'entangle', 'wild_storm'],
  monk: ['flurry_strike', 'iron_body', 'meditate', 'dragon_palm'],
  samurai: ['iaido', 'bushido', 'cherry_blossom', 'thousand_cuts'],
  summoner: ['arcane_bolt', 'summon_familiar', 'spirit_swarm', 'soul_link'],
  alchemist: ['acid_flask', 'fire_bomb', 'healing_brew', 'alchemy_storm'],
  chronomancer: ['time_lance', 'temporal_rift', 'haste_field', 'paradox_collapse'],
  beastmaster: ['hunters_mark', 'feral_companion', 'beast_call', 'primal_roar'],
  ninja: ['shuriken_burst', 'shadow_clone', 'vanish', 'thousand_blades'],
  pyromancer: ['flame_lance', 'fire_wall', 'inner_fire', 'phoenix_rise'],
  cryomancer: ['ice_shard', 'blizzard', 'frost_armor', 'absolute_zero'],
  stormcaller: ['lightning_bolt', 'chain_lightning', 'storm_aegis', 'ragnarok'],
  geomancer: ['stone_throw', 'earth_pillar', 'stone_skin', 'tectonic_shock'],
  bard: ['sonic_note', 'inspiring_song', 'healing_ballad', 'finale'],
  gunner: ['quick_shot', 'shrapnel', 'grenade', 'bullet_storm'],
  templar: ['hammer_strike', 'holy_shield', 'consecration', 'divine_wrath'],
  warlock: ['shadow_bolt', 'curse', 'summon_imp', 'soul_burn'],
  valkyrie: ['divine_spear', 'winged_charge', 'warcry_heaven', 'judgement_sky'],
}


export function buildAbilityStates(cls: CharacterClass): AbilityState[] {
  return CLASS_ABILITIES[cls].map((id) => ({ id, currentCooldown: 0 }))
}

export function getAbilityDef(id: string): AbilityDef | undefined {
  return ABILITIES[id]
}

// Buffs aplicados por habilidades de buff
export function getBuffForAbility(abilityId: string): { name: string; stat: keyof import('./types').CharacterStats; amount: number; duration: number }[] {
  switch (abilityId) {
    case 'war_cry':
      return [
        { name: 'Grito de Guerra', stat: 'attack', amount: 20, duration: 360 },
        { name: 'Grito de Guerra', stat: 'defense', amount: 15, duration: 360 },
      ]
    case 'evasion':
      return [
        { name: 'Passo Veloz', stat: 'speed', amount: 3, duration: 300 },
        { name: 'Passo Veloz', stat: 'critChance', amount: 30, duration: 300 },
      ]
    case 'divine_shield':
      return [
        { name: 'Escudo Divino', stat: 'defense', amount: 40, duration: 360 },
        { name: 'Escudo Divino', stat: 'maxHp', amount: 80, duration: 360 },
      ]
    case 'blood_rage':
      return [
        { name: 'Sede de Sangue', stat: 'attack', amount: 35, duration: 360 },
        { name: 'Sede de Sangue', stat: 'speed', amount: 1, duration: 360 },
      ]
    case 'smoke_bomb':
      return [
        { name: 'Bomba de Fumaca', stat: 'speed', amount: 4, duration: 300 },
        { name: 'Bomba de Fumaca', stat: 'critChance', amount: 50, duration: 300 },
      ]
    case 'iron_body':
      return [
        { name: 'Corpo de Ferro', stat: 'defense', amount: 25, duration: 360 },
        { name: 'Corpo de Ferro', stat: 'speed', amount: 2, duration: 360 },
      ]
    case 'bushido':
      return [
        { name: 'Bushido', stat: 'attack', amount: 25, duration: 360 },
        { name: 'Bushido', stat: 'critChance', amount: 30, duration: 360 },
      ]
    case 'haste_field':
      return [
        { name: 'Campo de Aceleração', stat: 'speed', amount: 3, duration: 420 },
        { name: 'Campo de Aceleração', stat: 'critChance', amount: 25, duration: 420 },
        { name: 'Campo de Aceleração', stat: 'range', amount: 40, duration: 420 },
      ]
    case 'primal_roar':
      return [
        { name: 'Rugido Primordial', stat: 'attack', amount: 30, duration: 360 },
        { name: 'Rugido Primordial', stat: 'defense', amount: 12, duration: 360 },
      ]
    default:
      return []
  }
}
