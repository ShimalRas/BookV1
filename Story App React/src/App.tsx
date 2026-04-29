import { useEffect, useMemo, useState, type CSSProperties } from 'react'

import ranksDoc from './docs/ranks.txt?raw'
import itemsDoc from './docs/items.txt?raw'
import { canonSkillCodex, type SkillCodexEntry, type StarTier } from './data/skillCodex'

type RankName = 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS-1' | 'SS-2' | 'SS-3' | 'Mythic-1' | 'Mythic-2' | 'Demi' | 'Divine'
type SystemMode = 'status' | 'skills'
type WorkspacePage = 'panel' | 'editor' | 'history' | 'progression'
type NavPage = 'characters' | 'skills' | 'ranks' | 'items'

type Palette = {
  base: string
  panel: string
  accent: string
  accentSoft: string
  glow: string
  text: string
}

type Skill = {
  id: string
  name: string
  rank: string
  description: string
}

type SkillPageStarFilter = 'all' | 'none' | '1' | '2' | '3' | '4'

type HistoryEntry = {
  id: string
  timestamp: string
  action: string
  detail: string
}

type Item = {
  id: string
  name: string
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Divine'
  category: string
  description: string
  equipped: boolean
}

type Avatar = {
  character: string
  eyes: string
  hair: string
  skin: string
  accent: string
}

type Character = {
  id: string
  name: string
  race: string
  rank: RankName
  level: number
  str: number
  agi: number
  vit: number
  intelligence: number
  intDragon: number
  intDemon: number
  intAngel: number
  divinity: number
  divinityEnabled: boolean
  affinity: string
  attributePoints: number
  towerPoints: number
  title: string
  notes: string
  skills: Skill[]
  items: Item[]
  avatar: Avatar
  history: HistoryEntry[]
}

const rankColors: Record<RankName, Palette> = {
  E: { base: '#1d2230', panel: '#273041', accent: '#7c8aa1', accentSoft: '#3a4558', glow: '#c7d2fe', text: '#f5f7fb' },
  D: { base: '#16273a', panel: '#20384f', accent: '#4f8cc9', accentSoft: '#2d5378', glow: '#dbeafe', text: '#f4f8fb' },
  C: { base: '#17312f', panel: '#214542', accent: '#50a7a1', accentSoft: '#2d5d5a', glow: '#d1fae5', text: '#f2fbfa' },
  B: { base: '#2b2a14', panel: '#3d3820', accent: '#d4a02f', accentSoft: '#6f5a1d', glow: '#fde68a', text: '#fffaf0' },
  A: { base: '#352047', panel: '#4a2f67', accent: '#b06cff', accentSoft: '#6b3f94', glow: '#e9d5ff', text: '#fcf7ff' },
  S: { base: '#3d1e13', panel: '#5a2f1f', accent: '#ff8a3d', accentSoft: '#8a4628', glow: '#fed7aa', text: '#fff9f4' },
  'SS-1': { base: '#1f2c4d', panel: '#2d416d', accent: '#5db3ff', accentSoft: '#355f94', glow: '#bfdbfe', text: '#f5faff' },
  'SS-2': { base: '#1d2240', panel: '#2b3360', accent: '#7a84ff', accentSoft: '#3e4f8a', glow: '#c7d2fe', text: '#f7f7ff' },
  'SS-3': { base: '#3a1531', panel: '#5a224d', accent: '#ff6bc8', accentSoft: '#8b356f', glow: '#f9a8d4', text: '#fff7fb' },
  'Mythic-1': { base: '#311d36', panel: '#482553', accent: '#d96cff', accentSoft: '#7a3d8d', glow: '#f0abfc', text: '#fcf6ff' },
  'Mythic-2': { base: '#12364c', panel: '#1b4f70', accent: '#53d0ff', accentSoft: '#27688f', glow: '#bae6fd', text: '#f1fbff' },
  Demi: { base: '#1c1a2c', panel: '#2d2947', accent: '#9c7bff', accentSoft: '#52428c', glow: '#ddd6fe', text: '#faf7ff' },
  Divine: { base: '#1a1033', panel: '#26164a', accent: '#f5c85a', accentSoft: '#4f2f77', glow: '#fff0b8', text: '#fffdf6' },
}

const rankGains: Record<RankName, { phy: number; int: number; divinity: number }> = {
  E: { phy: 1, int: 2, divinity: 0 },
  D: { phy: 1, int: 2, divinity: 0 },
  C: { phy: 1, int: 2, divinity: 0 },
  B: { phy: 1, int: 2, divinity: 0 },
  A: { phy: 1, int: 2, divinity: 0 },
  S: { phy: 3, int: 5, divinity: 0 },
  'SS-1': { phy: 3, int: 5, divinity: 0 },
  'SS-2': { phy: 3, int: 5, divinity: 0 },
  'SS-3': { phy: 3, int: 5, divinity: 0 },
  'Mythic-1': { phy: 3, int: 5, divinity: 0 },
  'Mythic-2': { phy: 3, int: 5, divinity: 0 },
  Demi: { phy: 5, int: 10, divinity: 2 },
  Divine: { phy: 5, int: 10, divinity: 4 },
}

const races = ['human', 'elf', 'vampire', 'dragonoid', 'angel', 'fairy', 'valkyrie', 'demon', 'mixed']
const ranks: RankName[] = ['E', 'D', 'C', 'B', 'A', 'S', 'SS-1', 'SS-2', 'SS-3', 'Mythic-1', 'Mythic-2', 'Demi', 'Divine']
const STORAGE_KEY = 'story-app-react-v2'

const elementTint: Record<string, string> = {
  Arcane: '#8ec5ff',
  Blood: '#ff7b8f',
  Dark: '#8b7be2',
  'Death/Command': '#9f9fbc',
  Evolution: '#9adf93',
  Fire: '#ff9656',
  'Fire+Lightning+Ground': '#ffb763',
  Ground: '#c9a06f',
  Ice: '#8de6ff',
  Life: '#85d88f',
  'Life/Death': '#96cfaa',
  Light: '#ffe49d',
  'Lightning/Divine': '#f9d377',
  Lightning: '#f6c65b',
  Mind: '#8dc7ff',
  Nature: '#93e69f',
  Physical: '#c3c8d6',
  Soul: '#b39cff',
  Water: '#79c7ff',
  Wind: '#93dbff',
}

const starLabel: Record<SkillPageStarFilter, string> = {
  all: 'All Stars',
  none: 'No Star',
  '1': '1-Star',
  '2': '2-Star',
  '3': '3-Star',
  '4': '4-Star',
}

const chromePalette: Palette = {
  base: '#000000',
  panel: '#0b0b12',
  accent: '#9aa3b2',
  accentSoft: '#1b2230',
  glow: '#e5e7eb',
  text: '#ffffff',
}

const seededCharacter: Character = {
  id: crypto.randomUUID(),
  name: 'Alok Aeonmorta',
  race: 'mixed',
  rank: 'Divine',
  level: 135,
  str: 7449,
  agi: 9560,
  vit: 10020,
  intelligence: 15190,
  intDragon: 18450,
  intDemon: 18450,
  intAngel: 18450,
  divinity: 8420,
  divinityEnabled: true,
  affinity: 'Lightning, Flame, Frost, Blood (150% damage, 100% resistance)',
  attributePoints: 0,
  towerPoints: 394345250,
  title: 'Eternal Legion Sovereign',
  notes: 'Canon profile seeded from Newwrite.txt',
  skills: [
    { id: crypto.randomUUID(), name: 'Regeneration', rank: 'Divine', description: 'Regenerates body from damage and poisons. Can restore the body even from a death state, drawing upon the cycle of both life and death.' },
    { id: crypto.randomUUID(), name: 'Incineration Beam', rank: 'Divine', description: 'Shoots a beam of absolute flames that incinerate monsters caught.' },
    { id: crypto.randomUUID(), name: "Thunder's Judgement", rank: 'Divine', description: 'An immensely powerful spear of pure divine lightning that unleashes complete destruction upon an area of 10,000 meters releasing a violent thunderstorm that sweeps away everything.' },
    { id: crypto.randomUUID(), name: 'Soul Absorber', rank: 'Divine', description: 'Absorb and store souls, gaining their knowledge, skills, and essence.' },
    { id: crypto.randomUUID(), name: 'Soul Rebirth', rank: 'Divine', description: 'Transform a soul, wiping its memories to grant it a new beginning.' },
    { id: crypto.randomUUID(), name: 'Sovereign of Eternal Legions', rank: 'Divine', description: 'Divine skill that enhances creating, commanding, and binding undead into your soul-domain and authority.' },

    { id: crypto.randomUUID(), name: 'Perception', rank: 'Rank A (99.07%)', description: 'Greatly enhanced senses.' },
    { id: crypto.randomUUID(), name: 'Giant Force', rank: 'Rank A (0%)', description: 'For 10 seconds increases all physical stats by 500%. Cooldown 10 minutes.' },
    { id: crypto.randomUUID(), name: 'Basic Mana Meditation', rank: 'Unranked', description: 'Gather mana to your core and increases the mana pool, however it will be harder to gain as your stats increase.' },
    { id: crypto.randomUUID(), name: 'Basic Combat', rank: 'Rank C (56.554%)', description: 'Refines combat techniques.' },
    { id: crypto.randomUUID(), name: 'Swordsmanship', rank: 'Rank B (85.53%)', description: 'Proficiency with sword combat increases.' },
    { id: crypto.randomUUID(), name: 'Astraean Valkyrie Sword Style', rank: 'Rank S', description: 'The sword art of the Valkyrie Royals and warriors from Brynhildr Astraean, the supreme empire of the Valkyries.' },

    { id: crypto.randomUUID(), name: 'Mana Form', rank: 'Rank C (98%)', description: 'Forms shapes using mana. Uses a lot of mana. Effects of shapes scale with INT. Saved shapes: Sphere, Bullet, Sword, Hammer, Fist, Arrow.' },
    { id: crypto.randomUUID(), name: 'Mana Bullet', rank: 'Rank D (99.99%)', description: 'Forms a bullet of mana and shoots at a target. Bullet can explode on impact. Explosion radius: 1 meter.' },
    { id: crypto.randomUUID(), name: 'Mana Sword', rank: 'Rank C (74%)', description: 'Create a temporary sword with mana, provides an Attack power of 20.' },
    { id: crypto.randomUUID(), name: 'Basic Marksmanship', rank: 'Rank D (73.43%)', description: 'Increases accuracy with ranged weapons by 20% and grants intuitive understanding of angles, wind, and leading targets.' },
    { id: crypto.randomUUID(), name: 'Mana Blast (one-star)', rank: 'Rank C (75.36%)', description: 'Forms and releases a blast of mana that explodes when the user wills it to or explodes on impact. Explosion radius: 25 meters normally.' },
    { id: crypto.randomUUID(), name: "Angel's Condemnation (three-stars)", rank: 'Rank A (0.002%)', description: 'Rains down hundreds of swords of pure light that targets enemies and pierces through.' },

    { id: crypto.randomUUID(), name: 'Blood Manipulation', rank: 'Rank C (98%)', description: 'Blood affinity manipulation toolkit (arrows, fists, spikes, mist).' },
    { id: crypto.randomUUID(), name: 'Lightning Manipulation', rank: 'Rank B (12.2%)', description: 'Lightning magic toolkit (zap, bolt, ball lightning, spear, dominion).' },
    { id: crypto.randomUUID(), name: 'Flame Manipulation', rank: 'Rank B (83.16%)', description: 'Flame magic toolkit (fire ball, blasts, beams, chains, tornado, inferno crown).' },
    { id: crypto.randomUUID(), name: 'Ice Manipulation', rank: 'Rank C (54.68%)', description: 'Frost magic toolkit (blast, wave, beams, absolute zero field).' },
    { id: crypto.randomUUID(), name: 'Wind Manipulation', rank: 'Rank D (64.23%)', description: 'Wind magic toolkit (bullet, arcs of wind, sky rend).' },
    { id: crypto.randomUUID(), name: 'Nature Manipulation', rank: 'Rank C (0.5%)', description: 'Nature magic toolkit (vines, roots, thorns, bark armor, sovereignty).' },
    { id: crypto.randomUUID(), name: 'Ground Manipulation', rank: 'Rank D (1%)', description: 'Earth magic toolkit (stone gauntlet, seismic ruin).' },
    { id: crypto.randomUUID(), name: 'Water Manipulation', rank: 'Rank D (1%)', description: 'Water magic toolkit (sphere, blast, spikes, tidal cataclysm).' },
    { id: crypto.randomUUID(), name: 'Light Manipulation', rank: 'Rank C (54.32%)', description: "Light magic toolkit (light ball, Angel's Condemnation, radiant judgment)." },

    { id: crypto.randomUUID(), name: 'Molten Tempest (four-stars)', rank: 'Combined Elemental', description: 'Fire + Lightning + Ground: molten spikes that resonate with lightning and chain discharges.' },
    { id: crypto.randomUUID(), name: 'Charged Gauntlet (three-star)', rank: 'Combined Elemental', description: 'Combines flame and lightning with stone gauntlets; lightning arc with each powered strike.' },

    { id: crypto.randomUUID(), name: 'Guiding Light', rank: 'Passive', description: 'Creates a stable orb of light that floats ahead, maintaining ideal position and brightness.' },
    { id: crypto.randomUUID(), name: 'Blessing (Lilith)', rank: 'Blessing', description: 'Resistance to mental charms and mind magic.' },
    { id: crypto.randomUUID(), name: "Divine Blessing: Thor's Mark of the Storm Sovereign", rank: 'Legendary Divine Blessing', description: 'Amplifies lightning attacks; once per day localized storm; temporary immunity to paralysis/stun/shock.' },
    { id: crypto.randomUUID(), name: 'Title: Evolver', rank: 'Title', description: 'Increases success/stability of forced evolutions and reduces costs for subordinates.' },
    { id: crypto.randomUUID(), name: 'Title: Life Bringer', rank: 'Title', description: 'Enhances life-aligned abilities and boosts regeneration for familiars and undead bound to your soul.' },
  ],
  items: [
    { id: crypto.randomUUID(), name: 'Astraean Divine Sword', rarity: 'Divine', category: 'Weapon', description: 'Legendary sword of the Valkyrie royalty, channeling divine lightning.', equipped: true },
    { id: crypto.randomUUID(), name: 'Robe of Eternal Legion', rarity: 'Legendary', category: 'Armor', description: 'Robes woven with the essence of undead legions.', equipped: true },
    { id: crypto.randomUUID(), name: 'Ring of Soul Sovereignty', rarity: 'Legendary', category: 'Accessory', description: 'Amplifies soul manipulation abilities.', equipped: true },
    { id: crypto.randomUUID(), name: 'Phylactery of Regeneration', rarity: 'Epic', category: 'Artifact', description: 'Stores life force for instant healing.', equipped: false },
  ],
  avatar: {
    character: 'Alok',
    eyes: '#8b7be2',
    hair: '#ffd700',
    skin: '#e8d4b0',
    accent: '#f5c85a',
  },
  history: [
    { id: crypto.randomUUID(), timestamp: new Date().toISOString(), action: 'Seed', detail: 'Created Alok canon profile with Divine rank.' },
  ],
}

function normalizeCharacter(raw: any): Character {
  const rawObj = raw && typeof raw === 'object' ? raw : {}
  const hasIntDragon = Object.prototype.hasOwnProperty.call(rawObj, 'intDragon')
  const hasIntDemon = Object.prototype.hasOwnProperty.call(rawObj, 'intDemon')
  const hasIntAngel = Object.prototype.hasOwnProperty.call(rawObj, 'intAngel')
  const hasAffinity = Object.prototype.hasOwnProperty.call(rawObj, 'affinity')
  const hasTowerPoints = Object.prototype.hasOwnProperty.call(rawObj, 'towerPoints')

  let intDragon = Number(rawObj?.intDragon ?? 0) || 0
  let intDemon = Number(rawObj?.intDemon ?? 0) || 0
  let intAngel = Number(rawObj?.intAngel ?? 0) || 0
  let affinity = String(rawObj?.affinity ?? '')
  let towerPoints = Number(rawObj?.towerPoints ?? 0) || 0

  const inferredAlok =
    (typeof rawObj?.name === 'string' && rawObj.name.toLowerCase().includes('alok')) || intDragon + intDemon + intAngel !== 0
  const divinityEnabled = rawObj?.divinityEnabled === true ? true : rawObj?.divinityEnabled === false ? false : inferredAlok

  if (inferredAlok) {
    const canonMissing = (!hasIntDragon && !hasIntDemon && !hasIntAngel) || (intDragon === 0 && intDemon === 0 && intAngel === 0)
    const metaMissing = (!hasAffinity && !hasTowerPoints) || (!affinity.trim() && towerPoints === 0)
    if (canonMissing && metaMissing) {
      intDragon = seededCharacter.intDragon
      intDemon = seededCharacter.intDemon
      intAngel = seededCharacter.intAngel
      affinity = seededCharacter.affinity
      towerPoints = seededCharacter.towerPoints
    } else {
      if (!hasIntDragon && intDragon === 0) intDragon = seededCharacter.intDragon
      if (!hasIntDemon && intDemon === 0) intDemon = seededCharacter.intDemon
      if (!hasIntAngel && intAngel === 0) intAngel = seededCharacter.intAngel
      if (!hasAffinity && !affinity.trim()) affinity = seededCharacter.affinity
      if (!hasTowerPoints && towerPoints === 0) towerPoints = seededCharacter.towerPoints
    }
  }

  return {
    ...raw,
    intDragon,
    intDemon,
    intAngel,
    affinity,
    attributePoints: Number(raw?.attributePoints ?? 0) || 0,
    towerPoints,
    divinityEnabled,
    skills: Array.isArray(raw?.skills) ? raw.skills : [],
    items: Array.isArray(raw?.items) ? raw.items : [],
    avatar: raw?.avatar || {
      character: raw?.name || 'Character',
      eyes: '#555555',
      hair: '#8b7355',
      skin: '#f0d9c8',
      accent: '#888888',
    },
    history: Array.isArray(raw?.history) ? raw.history : [],
  }
}

function loadInitialCharacters(): Character[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return [seededCharacter]
    const parsed = JSON.parse(raw) as any
    if (!Array.isArray(parsed) || parsed.length === 0) return [seededCharacter]
    return parsed.map(normalizeCharacter)
  } catch {
    return [seededCharacter]
  }
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function normalizeOwnerName(owner: string): string {
  const value = owner.trim()
  if (!value) return 'Unknown'
  if (value.toLowerCase().includes('alok')) return 'Alok'
  return value
}

function inferStarTier(...texts: string[]): StarTier {
  const merged = texts.join(' ').toLowerCase()
  if (/\b(one|1)\s*-?\s*star/.test(merged)) return 1
  if (/\b(two|2)\s*-?\s*star/.test(merged)) return 2
  if (/\b(three|3)\s*-?\s*star/.test(merged)) return 3
  if (/\b(four|4)\s*-?\s*star/.test(merged)) return 4
  return null
}

function inferElement(name: string, rank: string, description: string): string {
  const text = `${name} ${rank} ${description}`.toLowerCase()
  if (text.includes('blood')) return 'Blood'
  if (text.includes('lightning') || text.includes('storm') || text.includes('thunder')) return 'Lightning'
  if (text.includes('fire') || text.includes('flame') || text.includes('inferno') || text.includes('ember')) return 'Fire'
  if (text.includes('frost') || text.includes('ice') || text.includes('zero')) return 'Ice'
  if (text.includes('wind') || text.includes('air')) return 'Wind'
  if (text.includes('water') || text.includes('tidal')) return 'Water'
  if (text.includes('ground') || text.includes('stone') || text.includes('earth') || text.includes('seismic')) return 'Ground'
  if (text.includes('nature') || text.includes('vine') || text.includes('root') || text.includes('thorn') || text.includes('verdant')) return 'Nature'
  if (text.includes('light') || text.includes('radiant') || text.includes('angel')) return 'Light'
  if (text.includes('dark')) return 'Dark'
  if (text.includes('soul')) return 'Soul'
  if (text.includes('divine') || text.includes('blessing')) return 'Lightning/Divine'
  if (text.includes('mana')) return 'Arcane'
  if (text.includes('sword') || text.includes('physical')) return 'Physical'
  return 'Arcane'
}

function isTitleSkill(skill: SkillCodexEntry): boolean {
  return skill.category === 'Title' || skill.name.toLowerCase().startsWith('title:')
}

function isDivineSkill(skill: SkillCodexEntry): boolean {
  const rank = skill.rank.toLowerCase()
  const category = skill.category.toLowerCase()
  const name = skill.name.toLowerCase()
  return (
    rank.includes('divine') ||
    category.includes('divine') ||
    category.includes('unique authority') ||
    name.includes('divine blessing')
  )
}

function isCombinedSkill(skill: SkillCodexEntry): boolean {
  return skill.category === 'Combination' || skill.element.includes('+')
}

function App() {
  const [characters, setCharacters] = useState<Character[]>(() => loadInitialCharacters())
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [mode, setMode] = useState<SystemMode>('status')
  const [page, setPage] = useState<WorkspacePage>('panel')
  const [navPage, setNavPage] = useState<NavPage>('characters')
  const [skillDraft, setSkillDraft] = useState({ name: '', rank: 'Rank C', description: '' })
  const [skillSearch, setSkillSearch] = useState('')
  const [skillElement, setSkillElement] = useState('all')
  const [skillStar, setSkillStar] = useState<SkillPageStarFilter>('all')

  const selected = useMemo(() => characters.find((item) => item.id === selectedId), [characters, selectedId])

  const selectedRankPalette = selected ? rankColors[selected.rank] : rankColors.Divine
  const hasAlokExtraInt = Boolean(selected && (selected.intDragon !== 0 || selected.intDemon !== 0 || selected.intAngel !== 0))
  const isAlokNameMatch = Boolean(selected && selected.name.toLowerCase().includes('alok'))
  const isAlok = Boolean(selected && (isAlokNameMatch || hasAlokExtraInt))
  const divinityEnabled = Boolean(selected && (isAlok || selected.divinityEnabled))
  const extraInt = selected && isAlok ? selected.intDragon + selected.intDemon + selected.intAngel : 0
  const totalInt = selected ? selected.intelligence + extraInt : 0
  const effectiveDivinity = selected && divinityEnabled ? selected.divinity : 0
  const totalPower = selected ? selected.str + selected.agi + selected.vit + totalInt + effectiveDivinity : 0
  const hp = selected ? selected.vit * 100 : 0
  const mp = selected ? totalInt * 100 : 0
  const hpFill = selected ? Math.min(100, Math.round((hp / (selected.level * 3000)) * 100)) : 0
  const mpFill = selected ? Math.min(100, Math.round((mp / (selected.level * 4600)) * 100)) : 0

  const trackedSkills = useMemo<SkillCodexEntry[]>(() => {
    return characters.flatMap((character) =>
      character.skills.map((skill) => ({
        id: `tracked-${character.id}-${skill.id}`,
        name: skill.name,
        owner: normalizeOwnerName(character.name),
        rank: skill.rank,
        element: inferElement(skill.name, skill.rank, skill.description),
        starTier: inferStarTier(skill.name, skill.rank, skill.description),
        category: 'Tracked',
        description: skill.description || 'No description provided.',
        source: 'tracked' as const,
      })),
    )
  }, [characters])

  const allCodexSkills = useMemo<SkillCodexEntry[]>(() => {
    const index = new Map<string, SkillCodexEntry>()
    for (const skill of [...canonSkillCodex, ...trackedSkills]) {
      const key = `${slugify(skill.name)}::${slugify(skill.element)}::${skill.starTier ?? 'none'}::${slugify(skill.category)}`
      if (!index.has(key)) index.set(key, skill)
    }
    return Array.from(index.values())
  }, [trackedSkills])

  const codexElements = useMemo(() => {
    return ['all', ...Array.from(new Set(allCodexSkills.map((skill) => skill.element))).sort((a, b) => a.localeCompare(b))]
  }, [allCodexSkills])

  const filteredCodex = useMemo(() => {
    const query = skillSearch.trim().toLowerCase()
    return allCodexSkills
      .filter((skill) => (skillElement === 'all' ? true : skill.element === skillElement))
      .filter((skill) => {
        if (skillStar === 'all') return true
        if (skillStar === 'none') return skill.starTier === null
        return skill.starTier === Number(skillStar)
      })
      .filter((skill) => {
        if (!query) return true
        return [skill.name, skill.rank, skill.element, skill.category, skill.description].join(' ').toLowerCase().includes(query)
      })
      .sort((a, b) => {
        const aStar = a.starTier ?? -1
        const bStar = b.starTier ?? -1
        if (aStar !== bStar) return bStar - aStar
        return a.name.localeCompare(b.name)
      })
  }, [allCodexSkills, skillElement, skillSearch, skillStar])

  const filteredTitleCodex = useMemo(() => {
    return filteredCodex.filter((skill) => isTitleSkill(skill))
  }, [filteredCodex])

  const filteredDivineCodex = useMemo(() => {
    return filteredCodex.filter((skill) => !isTitleSkill(skill) && isDivineSkill(skill))
  }, [filteredCodex])

  const filteredCombinedCodex = useMemo(() => {
    return filteredCodex.filter((skill) => !isTitleSkill(skill) && !isDivineSkill(skill) && isCombinedSkill(skill))
  }, [filteredCodex])

  const filteredSkillCodex = useMemo(() => {
    return filteredCodex.filter((skill) => !isTitleSkill(skill) && !isDivineSkill(skill) && !isCombinedSkill(skill))
  }, [filteredCodex])

  const groupedCodex = useMemo(() => {
    const order: StarTier[] = [4, 3, 2, 1, null]
    return order
      .map((starTier) => {
        const starSkills = filteredSkillCodex.filter((skill) => skill.starTier === starTier)
        if (starSkills.length === 0) return null
        const elements = Array.from(new Set(starSkills.map((skill) => skill.element))).sort((a, b) => a.localeCompare(b))
        return {
          starTier,
          starText: starTier === null ? 'Starless Skills' : `${starTier}-Star Skills`,
          elements: elements.map((element) => ({
            element,
            skills: starSkills.filter((skill) => skill.element === element),
          })),
        }
      })
      .filter((group): group is { starTier: StarTier; starText: string; elements: { element: string; skills: SkillCodexEntry[] }[] } => group !== null)
  }, [filteredSkillCodex])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(characters))
  }, [characters])

  function updateSelected(patch: Partial<Character>, action = 'Edit', detail = 'Updated character data') {
    if (!selected) return
    setCharacters((prev) =>
      prev.map((item) => {
        if (item.id !== selected.id) return item
        return {
          ...item,
          ...patch,
          history: [{ id: crypto.randomUUID(), timestamp: new Date().toISOString(), action, detail }, ...item.history],
        }
      }),
    )
  }

  function addCharacter() {
    const created: Character = {
      id: crypto.randomUUID(),
      name: `New Character ${characters.length + 1}`,
      race: 'human',
      rank: 'E',
      level: 1,
      str: 10,
      agi: 10,
      vit: 10,
      intelligence: 10,
      intDragon: 0,
      intDemon: 0,
      intAngel: 0,
      divinity: 0,
      divinityEnabled: false,
      affinity: '',
      attributePoints: 0,
      towerPoints: 0,
      title: 'Unassigned',
      notes: '',
      skills: [],
      items: [],
      avatar: {
        character: `New Character ${characters.length + 1}`,
        eyes: '#555555',
        hair: '#8b7355',
        skin: '#f0d9c8',
        accent: '#888888',
      },
      history: [{ id: crypto.randomUUID(), timestamp: new Date().toISOString(), action: 'Create', detail: 'Character created.' }],
    }
    setCharacters((prev) => [created, ...prev])
    setSelectedId(created.id)
    setPage('panel')
    setMode('status')
  }

  const selectedCardVars = useMemo(() => {
    return {
      '--accent': selectedRankPalette.accent,
      '--accent-soft': selectedRankPalette.accentSoft,
      '--glow': selectedRankPalette.glow,
    } as CSSProperties
  }, [selectedRankPalette])

  function openCharacter(id: string) {
    setSelectedId(id)
    setPage('panel')
    setMode('status')
  }

  function levelUpSelected() {
    if (!selected) return
    const gain = rankGains[selected.rank]
    const canUseDivinity = Boolean(isAlok || selected.divinityEnabled)
    const divinityGain = canUseDivinity ? gain.divinity : 0
    updateSelected(
      {
        level: selected.level + 1,
        str: selected.str + gain.phy,
        agi: selected.agi + gain.phy,
        vit: selected.vit + gain.phy,
        intelligence: selected.intelligence + gain.int,
        divinity: selected.divinity + divinityGain,
      },
      'Level Up',
      `Leveled to ${selected.level + 1} with ${selected.rank} gains (+${gain.phy} PHY, +${gain.int} INT).`,
    )
  }

  function addSkill() {
    if (!selected) return
    if (!skillDraft.name.trim()) return
    const skill: Skill = {
      id: crypto.randomUUID(),
      name: skillDraft.name.trim(),
      rank: skillDraft.rank,
      description: skillDraft.description.trim(),
    }
    updateSelected(
      { skills: [skill, ...selected.skills] },
      'Skill',
      `Added skill ${skill.name} (${skill.rank}).`,
    )
    setSkillDraft({ name: '', rank: 'Rank C', description: '' })
  }

  function PixelAvatar({ avatar, size = 'large' }: { avatar: Avatar; size?: 'small' | 'large' }) {
    const scale = size === 'small' ? 4 : 8
    const width = 16 * scale
    const height = 20 * scale
    const blockSize = scale

    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${16 * scale} ${20 * scale}`}
        className={`pixel-avatar pixel-avatar-${size}`}
        style={{ imageRendering: 'pixelated' }}
      >
        <defs>
          <style>{`
            .pixel-avatar { image-rendering: pixelated; }
          `}</style>
        </defs>

        {/* Hair */}
        <rect x={4 * blockSize} y={0} width={8 * blockSize} height={6 * blockSize} fill={avatar.hair} />
        <rect x={3 * blockSize} y={2 * blockSize} width={1 * blockSize} height={2 * blockSize} fill={avatar.hair} />
        <rect x={12 * blockSize} y={2 * blockSize} width={1 * blockSize} height={2 * blockSize} fill={avatar.hair} />

        {/* Head */}
        <rect x={3 * blockSize} y={5 * blockSize} width={10 * blockSize} height={7 * blockSize} fill={avatar.skin} />

        {/* Eyes - Left Eye */}
        <rect x={5 * blockSize} y={7 * blockSize} width={1 * blockSize} height={1 * blockSize} fill={avatar.eyes} />
        {/* Eyes - Right Eye */}
        <rect x={10 * blockSize} y={7 * blockSize} width={1 * blockSize} height={1 * blockSize} fill={avatar.eyes} />

        {/* Mouth */}
        <rect x={6 * blockSize} y={10 * blockSize} width={4 * blockSize} height={1 * blockSize} fill="#333333" opacity={0.5} />

        {/* Body/Shoulders */}
        <rect x={2 * blockSize} y={12 * blockSize} width={12 * blockSize} height={8 * blockSize} fill={avatar.accent} />

        {/* Arms */}
        <rect x={0} y={13 * blockSize} width={2 * blockSize} height={6 * blockSize} fill={avatar.skin} />
        <rect x={14 * blockSize} y={13 * blockSize} width={2 * blockSize} height={6 * blockSize} fill={avatar.skin} />
      </svg>
    )
  }

  return (
    <div
      className="app"
      style={{
        '--base': chromePalette.base,
        '--panel': chromePalette.panel,
        '--accent': chromePalette.accent,
        '--accent-soft': chromePalette.accentSoft,
        '--glow': chromePalette.glow,
        '--text': chromePalette.text,
      } as CSSProperties}
    >
      <header className="topbar">
        <div>
          <h1>Story App</h1>
          <p>Local character manager with a dedicated celestial panel, separate stat editor, and saved history</p>
          <div className="top-nav">
            <button
              className={navPage === 'characters' ? 'active' : ''}
              onClick={() => {
                setNavPage('characters')
                setSelectedId(null)
                setPage('panel')
                setMode('status')
              }}
            >
              Characters
            </button>
            <button className={navPage === 'skills' ? 'active' : ''} onClick={() => setNavPage('skills')}>Skills</button>
            <button className={navPage === 'ranks' ? 'active' : ''} onClick={() => setNavPage('ranks')}>Ranks</button>
            <button className={navPage === 'items' ? 'active' : ''} onClick={() => setNavPage('items')}>Items</button>
          </div>
        </div>
        <div className="rank-badge">{selected ? `Lv ${selected.level} ${selected.rank}` : 'No character selected'}</div>
      </header>

      <main className="app-main">
        {navPage === 'characters' ? (
          selectedId === null ? (
            <section className="characters-center">
              <div className="character-grid">
                {characters.map((character) => {
                  const rankPalette = rankColors[character.rank]
                  const cardVars = {
                    '--accent': rankPalette.accent,
                    '--accent-soft': rankPalette.accentSoft,
                    '--glow': rankPalette.glow,
                  } as CSSProperties

                  return (
                    <button key={character.id} className="char-card" style={cardVars} onClick={() => openCharacter(character.id)}>
                      <div className="char-card-avatar">
                        <PixelAvatar avatar={character.avatar} size="small" />
                      </div>
                      <div className="char-card-top">
                        <strong>{character.name}</strong>
                        <span className="char-card-rank">{character.rank}</span>
                      </div>
                      <div className="char-card-meta">
                        <span>{character.race}</span>
                        <span>Lv {character.level}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
              <div className="character-footer">
                <button className="primary" onClick={addCharacter}>New Character</button>
              </div>
            </section>
          ) : (
            <section className="main-panel">
              <div className="workspace-tabs">
                <button className={page === 'panel' ? 'active' : ''} onClick={() => setPage('panel')}>System Panel</button>
                <button className={page === 'editor' ? 'active' : ''} onClick={() => setPage('editor')}>Stat Editor</button>
                <button className={page === 'history' ? 'active' : ''} onClick={() => setPage('history')}>History</button>
                <button className={page === 'progression' ? 'active' : ''} onClick={() => setPage('progression')}>Progression</button>
              </div>

          {!selected && (
            <article className="empty-state">
              <h2>Select a character</h2>
              <p>Choose a character to open the system panel.</p>
            </article>
          )}

          {selected && page === 'editor' && (
            <article className="sheet-card">
              <h2>Stat Editor</h2>
              <div className="grid2">
                <label>Name<input value={selected.name} onChange={(event) => updateSelected({ name: event.target.value }, 'Edit', 'Updated name.')} /></label>
                <label>Race<select value={selected.race} onChange={(event) => updateSelected({ race: event.target.value }, 'Edit', 'Updated race.')}>{races.map((race) => <option key={race}>{race}</option>)}</select></label>
                <label>Rank<select value={selected.rank} onChange={(event) => updateSelected({ rank: event.target.value as RankName }, 'Edit', 'Updated rank.')}>{ranks.map((rank) => <option key={rank}>{rank}</option>)}</select></label>
                <label>Level<input type="number" value={selected.level} onChange={(event) => updateSelected({ level: Number(event.target.value) || 1 }, 'Edit', 'Adjusted level manually.')} /></label>
                <label>
                  Divinity Enabled
                  <input
                    type="checkbox"
                    checked={divinityEnabled}
                    disabled={isAlok}
                    onChange={(event) => {
                      const nextEnabled = event.target.checked
                      updateSelected(
                        nextEnabled ? { divinityEnabled: true } : { divinityEnabled: false, divinity: 0 },
                        'Edit',
                        nextEnabled ? 'Enabled Divinity.' : 'Disabled Divinity and cleared value.',
                      )
                    }}
                  />
                </label>
                <label>STR<input type="number" value={selected.str} onChange={(event) => updateSelected({ str: Number(event.target.value) || 0 }, 'Edit', 'Adjusted STR.')} /></label>
                <label>AGI<input type="number" value={selected.agi} onChange={(event) => updateSelected({ agi: Number(event.target.value) || 0 }, 'Edit', 'Adjusted AGI.')} /></label>
                <label>VIT<input type="number" value={selected.vit} onChange={(event) => updateSelected({ vit: Number(event.target.value) || 0 }, 'Edit', 'Adjusted VIT.')} /></label>
                <label>INT<input type="number" value={selected.intelligence} onChange={(event) => updateSelected({ intelligence: Number(event.target.value) || 0 }, 'Edit', 'Adjusted INT.')} /></label>
                {isAlok && (
                  <>
                    <label>Dragon INT<input type="number" value={selected.intDragon} onChange={(event) => updateSelected({ intDragon: Number(event.target.value) || 0 }, 'Edit', 'Adjusted Dragon INT.')} /></label>
                    <label>Demon INT<input type="number" value={selected.intDemon} onChange={(event) => updateSelected({ intDemon: Number(event.target.value) || 0 }, 'Edit', 'Adjusted Demon INT.')} /></label>
                    <label>Angel Core<input type="number" value={selected.intAngel} onChange={(event) => updateSelected({ intAngel: Number(event.target.value) || 0 }, 'Edit', 'Adjusted Angel Core.')} /></label>
                  </>
                )}
                {divinityEnabled && (
                  <label>Divinity<input type="number" value={selected.divinity} onChange={(event) => updateSelected({ divinity: Number(event.target.value) || 0 }, 'Edit', 'Adjusted Divinity.')} /></label>
                )}
                <label>Attribute Points<input type="number" value={selected.attributePoints} onChange={(event) => updateSelected({ attributePoints: Number(event.target.value) || 0 }, 'Edit', 'Adjusted attribute points.')} /></label>
                <label>Tower Points<input type="number" value={selected.towerPoints} onChange={(event) => updateSelected({ towerPoints: Number(event.target.value) || 0 }, 'Edit', 'Adjusted tower points.')} /></label>
                <label>Affinity<input value={selected.affinity} onChange={(event) => updateSelected({ affinity: event.target.value }, 'Edit', 'Updated affinity.')} /></label>
              </div>
              <label className="notes">Notes<textarea value={selected.notes} onChange={(event) => updateSelected({ notes: event.target.value }, 'Notes', 'Updated notes.')} /></label>
            </article>
          )}

          {selected && page === 'history' && (
            <article className="sheet-card">
              <h2>History Timeline</h2>
              <div className="history-list">
                {selected.history.map((entry) => (
                  <div key={entry.id} className="history-row">
                    <strong>{entry.action}</strong>
                    <span>{entry.detail}</span>
                    <small>{new Date(entry.timestamp).toLocaleString()}</small>
                  </div>
                ))}
              </div>
            </article>
          )}

          {selected && page === 'progression' && (
            <article className="sheet-card">
              <h2>Progression</h2>
              <div className="progress-panel">
                <p>Current rank: <strong>{selected.rank}</strong></p>
                <p>Level gain model: +{rankGains[selected.rank].phy} PHY, +{rankGains[selected.rank].int} INT, +{rankGains[selected.rank].divinity} Divinity</p>
                <button onClick={levelUpSelected}>Apply One Level Up</button>
              </div>
            </article>
          )}

          {selected && page === 'panel' && (
            <article className="status-window panel-only" style={selectedCardVars}>
              <div className={isAlok ? 'status-frame alok-frame' : 'status-frame'}>
                <div className="status-head">
                  <div className="avatar-display">
                    <PixelAvatar avatar={selected.avatar} size="large" />
                  </div>
                  <div className="status-head-text">
                    <div className="stars">✦ ✧ ✦</div>
                    <h3>STATUS</h3>
                    <p>{isAlok ? 'CELESTIAL DIVINE INTERFACE' : 'SYSTEM INTERFACE'}</p>
                    <h4>{selected.name}</h4>
                    <small>{selected.race} • {selected.rank} • Level {selected.level} • Total power {totalPower.toLocaleString()}</small>
                  </div>
                </div>

                <div className="mode-row">
                  <button className={mode === 'status' ? 'active' : ''} onClick={() => setMode('status')}>Status</button>
                  <button className={mode === 'skills' ? 'active' : ''} onClick={() => setMode('skills')}>Skills</button>
                </div>

                {mode === 'status' ? (
                  <>
                    <div className="bars">
                      <div>
                        <label>HP</label>
                        <div className="bar-track"><div className="bar-fill" style={{ width: `${hpFill}%` }} /></div>
                        <strong>{hp.toLocaleString()}</strong>
                      </div>
                      <div>
                        <label>MP</label>
                        <div className="bar-track"><div className="bar-fill mp" style={{ width: `${mpFill}%` }} /></div>
                        <strong>{mp.toLocaleString()}</strong>
                      </div>
                    </div>

                    <div className="summary-grid">
                      <Card label="Name" value={selected.name} />
                      <Card label="Level" value={String(selected.level)} />
                      <Card label="Rank" value={selected.rank} />
                      <Card label="Title" value={selected.title} />
                      <Card label="Attribute Points" value={String(selected.attributePoints)} />
                      <Card label="Tower Points" value={selected.towerPoints.toLocaleString()} />
                      <Card label="Affinity" value={selected.affinity || '—'} />
                    </div>

                    <div className="stat-grid">
                      <Card label="STR" value={selected.str.toLocaleString()} />
                      <Card label="AGI" value={selected.agi.toLocaleString()} />
                      <Card label="VIT" value={selected.vit.toLocaleString()} />
                      <Card label="TOTAL INT" value={totalInt.toLocaleString()} />
                      {divinityEnabled && <Card label="DIVINITY" value={selected.divinity.toLocaleString()} />}
                    </div>

                    <div className="items-section">
                      <h4>Inventory</h4>
                      <div className="items-grid">
                        {selected.items.map((item) => (
                          <div key={item.id} className={`item-slot item-rarity-${item.rarity.toLowerCase()}`}>
                            <div className="item-badge">{item.equipped ? '⚔' : '□'}</div>
                            <strong>{item.name}</strong>
                            <small>{item.category}</small>
                            <span className="item-rarity">{item.rarity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {isAlok && (
                      <div className="alok-int-grid">
                        <Card className="span-2" label="DRAGON INT" value={selected.intDragon.toLocaleString()} />
                        <Card className="span-2" label="DEMON INT" value={selected.intDemon.toLocaleString()} />
                        <Card className="span-1" label="ANGEL CORE" value={selected.intAngel.toLocaleString()} />
                      </div>
                    )}

                    {isAlok && <div className="canon">Canon profile active: Alok has a unique celestial system panel</div>}
                  </>
                ) : (
                  <div className="skills-list-wrap">
                    <div className="skill-form">
                      <input placeholder="Skill name" value={skillDraft.name} onChange={(event) => setSkillDraft((prev) => ({ ...prev, name: event.target.value }))} />
                      <input placeholder="Skill rank" value={skillDraft.rank} onChange={(event) => setSkillDraft((prev) => ({ ...prev, rank: event.target.value }))} />
                      <input placeholder="Description" value={skillDraft.description} onChange={(event) => setSkillDraft((prev) => ({ ...prev, description: event.target.value }))} />
                      <button onClick={addSkill}>Add Skill</button>
                    </div>
                    <div className="skills-list">
                      {selected.skills.map((skill) => (
                        <div key={skill.id} className="skill-row">
                          <strong>{skill.name} [{skill.rank}]</strong>
                          <span>{skill.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </article>
          )}
            </section>
          )
        ) : (
          <section className="main-panel">
            <article className="sheet-card">
              <h2>{navPage === 'skills' ? 'Skills Codex' : navPage === 'ranks' ? 'Ranks' : 'Items'}</h2>
              {navPage === 'skills' ? (
                <div className="skills-codex">
                  <div className="skills-codex-head">
                    <div>
                      <h3>Elemental Star Skill Archive</h3>
                      <p>Skills are organized by star tier first, then by element. Titles are listed in a separate section.</p>
                    </div>
                    <div className="skills-codex-metrics">
                      <span>{filteredSkillCodex.length} skills</span>
                      <span>{filteredDivineCodex.length} divine</span>
                      <span>{filteredCombinedCodex.length} combined</span>
                      <span>{filteredTitleCodex.length} titles</span>
                      <span>{allCodexSkills.length} total</span>
                    </div>
                  </div>

                  <div className="skills-filters">
                    <label>
                      Search
                      <input value={skillSearch} onChange={(event) => setSkillSearch(event.target.value)} placeholder="skill, element, rank..." />
                    </label>
                    <label>
                      Element
                      <select value={skillElement} onChange={(event) => setSkillElement(event.target.value)}>
                        {codexElements.map((element) => (
                          <option key={element} value={element}>{element === 'all' ? 'All Elements' : element}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Star Tier
                      <select value={skillStar} onChange={(event) => setSkillStar(event.target.value as SkillPageStarFilter)}>
                        {Object.keys(starLabel).map((key) => (
                          <option key={key} value={key}>{starLabel[key as SkillPageStarFilter]}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <section className="divine-section">
                    <h4>Divine Skills</h4>
                    <div className="skills-grid-codex">
                      {filteredDivineCodex.map((skill) => {
                        const tint = elementTint[skill.element] ?? '#f6d37d'
                        return (
                          <article key={skill.id} className="skill-codex-card divine-card" style={{ '--skill-tint': tint } as CSSProperties}>
                            <div className="skill-codex-top">
                              <strong>{skill.name}</strong>
                              <span>{skill.starTier === null ? 'No Star' : `${skill.starTier}-Star`}</span>
                            </div>
                            <div className="skill-codex-tags">
                              <span>{skill.element}</span>
                              <span>{skill.rank}</span>
                              <span>{skill.category}</span>
                            </div>
                            <p>{skill.description}</p>
                          </article>
                        )
                      })}
                    </div>
                  </section>

                  <section className="combined-section">
                    <h4>Combined Skills</h4>
                    <div className="skills-grid-codex">
                      {filteredCombinedCodex.map((skill) => {
                        const tint = elementTint[skill.element] ?? '#ffb763'
                        return (
                          <article key={skill.id} className="skill-codex-card combined-card" style={{ '--skill-tint': tint } as CSSProperties}>
                            <div className="skill-codex-top">
                              <strong>{skill.name}</strong>
                              <span>{skill.starTier === null ? 'No Star' : `${skill.starTier}-Star`}</span>
                            </div>
                            <div className="skill-codex-tags">
                              <span>{skill.element}</span>
                              <span>{skill.rank}</span>
                              <span>{skill.category}</span>
                            </div>
                            <p>{skill.description}</p>
                          </article>
                        )
                      })}
                    </div>
                  </section>

                  <div className="skills-group-stack">
                    {groupedCodex.map((group) => (
                      <section key={group.starText} className="skills-star-group">
                        <h4>{group.starText}</h4>
                        {group.elements.map((elementBlock) => (
                          <div key={`${group.starText}-${elementBlock.element}`} className="skills-element-block">
                            <h5>{elementBlock.element}</h5>
                            <div className="skills-grid-codex">
                              {elementBlock.skills.map((skill) => {
                                const tint = elementTint[skill.element] ?? '#9ab3ff'
                                return (
                                  <article key={skill.id} className="skill-codex-card" style={{ '--skill-tint': tint } as CSSProperties}>
                                    <div className="skill-codex-top">
                                      <strong>{skill.name}</strong>
                                      <span>{skill.starTier === null ? 'No Star' : `${skill.starTier}-Star`}</span>
                                    </div>
                                    <div className="skill-codex-tags">
                                      <span>{skill.element}</span>
                                      <span>{skill.rank}</span>
                                      <span>{skill.category}</span>
                                    </div>
                                    <p>{skill.description}</p>
                                  </article>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </section>
                    ))}
                  </div>

                  <section className="titles-section">
                    <h4>Titles</h4>
                    <div className="titles-grid">
                      {filteredTitleCodex.map((title) => (
                        <article key={title.id} className="title-card">
                          <strong>{title.name}</strong>
                          <div className="skill-codex-tags">
                            <span>{title.rank}</span>
                            <span>{title.element}</span>
                          </div>
                          <p>{title.description}</p>
                        </article>
                      ))}
                    </div>
                  </section>
                </div>
              ) : (
                <pre className="doc-view">{navPage === 'ranks' ? ranksDoc : itemsDoc}</pre>
              )}
            </article>
          </section>
        )}
      </main>
    </div>
  )
}

function Card({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={className ? `card ${className}` : 'card'}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

export default App
