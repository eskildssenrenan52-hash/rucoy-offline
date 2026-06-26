import type { CharacterClass } from './types'

import knight from '@/assets/portraits/knight.png.asset.json'
import archer from '@/assets/portraits/archer.png.asset.json'
import mage from '@/assets/portraits/mage.png.asset.json'
import necromancer from '@/assets/portraits/necromancer.png.asset.json'
import paladin from '@/assets/portraits/paladin.png.asset.json'
import berserker from '@/assets/portraits/berserker.png.asset.json'
import assassin from '@/assets/portraits/assassin.png.asset.json'
import druid from '@/assets/portraits/druid.png.asset.json'
import monk from '@/assets/portraits/monk.png.asset.json'
import samurai from '@/assets/portraits/samurai.png.asset.json'

// High-quality 64x64-style pixel art portraits used in the character selection
// preview, class grid, and account UI. Classes without a dedicated portrait
// fall back to the closest archetype.
const PORTRAIT_MAP: Partial<Record<CharacterClass, string>> = {
  knight: knight.url,
  archer: archer.url,
  mage: mage.url,
  necromancer: necromancer.url,
  paladin: paladin.url,
  berserker: berserker.url,
  assassin: assassin.url,
  druid: druid.url,
  monk: monk.url,
  samurai: samurai.url,
}

const FALLBACK: Record<string, CharacterClass> = {
  pyromancer: 'mage',
  cryomancer: 'mage',
  stormcaller: 'mage',
  chronomancer: 'mage',
  summoner: 'necromancer',
  alchemist: 'druid',
  geomancer: 'druid',
  beastmaster: 'druid',
  bard: 'mage',
  gunner: 'archer',
  ninja: 'assassin',
}

export function getClassPortrait(cls: CharacterClass): string | null {
  if (PORTRAIT_MAP[cls]) return PORTRAIT_MAP[cls]!
  const fb = FALLBACK[cls]
  if (fb && PORTRAIT_MAP[fb]) return PORTRAIT_MAP[fb]!
  return PORTRAIT_MAP.knight ?? null
}

export function hasOwnPortrait(cls: CharacterClass): boolean {
  return Boolean(PORTRAIT_MAP[cls])
}