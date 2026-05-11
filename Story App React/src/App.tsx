// @ts-nocheck
import { useState, useMemo } from "react";

// ── THEME / RANK DATA ─────────────────────────────────────────────────────────
const RANK_DATA = {
  E:        { accent:"#9ca3af", glow:"#d1d5db", bg:"#111827", manaColor:"#9ca3af", label:"The Mundane",        statGain:2  },
  D:        { accent:"#b45309", glow:"#fcd34d", bg:"#1c1107", manaColor:"#b45309", label:"The Initiated",      statGain:3  },
  C:        { accent:"#16a34a", glow:"#86efac", bg:"#071a0e", manaColor:"#16a34a", label:"The Capable",        statGain:4  },
  B:        { accent:"#3b82f6", glow:"#93c5fd", bg:"#0d1a38", manaColor:"#3b82f6", label:"The Advanced",       statGain:5  },
  A:        { accent:"#9333ea", glow:"#d8b4fe", bg:"#1a0a2e", manaColor:"#9333ea", label:"The Elite",          statGain:7  },
  S:        { accent:"#f59e0b", glow:"#fde68a", bg:"#2a1a00", manaColor:"#f59e0b", label:"The Pinnacle",       statGain:10 },
  "SS-1":   { accent:"#ef4444", glow:"#fca5a5", bg:"#2a0808", manaColor:"#ef4444", label:"The Ascendant",      statGain:12 },
  "SS-2":   { accent:"#7c3aed", glow:"#c4b5fd", bg:"#1e0d40", manaColor:"#7c3aed", label:"The Sovereign",      statGain:14 },
  "SS-3":   { accent:"#e2e8f0", glow:"#f8fafc", bg:"#1a1f2e", manaColor:"#e2e8f0", label:"The Transcendent",   statGain:16 },
  "Mythic-1":{ accent:"#2dd4bf", glow:"#99f6e4", bg:"#051a17", manaColor:"#2dd4bf", label:"The Legendary",    statGain:18 },
  "Mythic-2":{ accent:"#f0f9ff", glow:"#ffffff", bg:"#0a1628", manaColor:"#f0f9ff", label:"The Origin",        statGain:20 },
  Demi:     { accent:"#1e1b4b", glow:"#6366f1", bg:"#080810", manaColor:"#4338ca", label:"The Primordial",     statGain:25 },
  Divine:   { accent:"#c084fc", glow:"#f5c85a", bg:"#0e0718", manaColor:"#c084fc", label:"The Godborn",        statGain:30 },
};
const RANKS = Object.keys(RANK_DATA);
const RACES = ["Human","Elf","Vampire","Dragonoid","Angel","Fairy","Valkyrie","Demon","Mixed"];
const HAIR_STYLES   = ["short","long","spiky","mohawk","ponytail","bun"];
const OUTFIT_STYLES = ["jacket","armor","robe","ranger","necromancer","mage"];
const ACCESSORIES   = ["none","headband","cape","horns","halo","eyepatch","scarf"];

// Palettes
const SKIN_P  = ["#f5d5b0","#edc492","#d9a87c","#c48b5a","#a0663a","#6b3e20"];
const SKIN_S  = ["#d9a87c","#c49060","#b07848","#966030","#7a4820","#4a2210"];
const EYE_P   = ["#5bc8f5","#8b7be2","#6dd6a2","#e87cb4","#f5c842","#e85c5c","#4aafff","#c87de8"];
const HAIR_P  = ["#f7d85d","#d0d5db","#8f6f52","#1f2430","#d97757","#6fd6cf","#e06090","#3f7fe8","#eeeeee","#2a1a0a"];
const OUTFIT_P= ["#3a4a3a","#2e3a52","#5a2a2a","#2e4a5a","#4a2e5a","#5a4a20","#1a1a2e","#3a5a3a","#4a3a2a","#1e3a2e"];

const EL_ICON ={ Fire:"🔥",Lightning:"⚡",Ice:"❄️",Water:"🌊",Wind:"🌀",Blood:"🩸",Dark:"🌑",Light:"✨",Soul:"👻",Nature:"🌿",Ground:"⛰️",Arcane:"🔮",Physical:"⚔️","Lightning/Divine":"⚡","Fire+Lightning+Ground":"🌋","Life/Death":"☯️",Life:"💚","Death/Command":"💀",Evolution:"🧬",Mind:"🧠",Divine:"✦" };
const EL_CLR  ={ Fire:"#ff6b35",Lightning:"#fcd34d",Ice:"#7dd3fc",Water:"#38bdf8",Wind:"#a7f3d0",Blood:"#ef4444",Dark:"#8b5cf6",Light:"#fef08a",Soul:"#c4b5fd",Nature:"#4ade80",Ground:"#d97706",Arcane:"#818cf8",Physical:"#94a3b8","Lightning/Divine":"#fbbf24","Fire+Lightning+Ground":"#fb923c","Life/Death":"#86efac",Life:"#4ade80","Death/Command":"#94a3b8",Evolution:"#34d399",Mind:"#60a5fa",Divine:"#f5c85a" };
const CAT_ICON={ "Divine Ability":"✦","Unique Authority":"👑","Combat":"⚔️","Passive":"🔵","Sword Art":"⚔️","Utility":"🔧","Mana Craft":"🔮","Star Spell":"⭐","Manipulation":"🌀","Combination":"💥","Blessing":"🙏","Title":"🏅","Command":"👥","Spell":"🌑" };
const RARITY  ={ Common:{c:"#9ca3af",bg:"#1f2937"},Rare:{c:"#60a5fa",bg:"#172554"},Epic:{c:"#a78bfa",bg:"#2e1065"},Legendary:{c:"#fbbf24",bg:"#3d1f00"},Divine:{c:"#f0abfc",bg:"#3b0764"} };

// ── Skills (91 canonical Alok skills) ──────────────────────────────────────
const ALOK_SKILLS = [
  { id:"regen",       name:"Regeneration",                        element:"Life/Death",          category:"Divine Ability",     rank:"Divine",              starTier:null, description:"Regenerates body from damage and poisons. Can restore even from a death state, drawing upon both life and death." },
  { id:"incinbeam",   name:"Incineration Beam",                   element:"Fire",                category:"Divine Ability",     rank:"Divine",              starTier:null, description:"Shoots a beam of absolute flames that incinerates everything caught in its path." },
  { id:"thunj",       name:"Thunder's Judgement",                  element:"Lightning/Divine",    category:"Divine Ability",     rank:"Divine",              starTier:null, description:"An immensely powerful spear of pure divine lightning. 10,000m blast radius. Devastates the entire region." },
  { id:"soulabs",     name:"Soul Absorber",                        element:"Soul",                category:"Divine Ability",     rank:"Divine",              starTier:null, description:"Absorbs and stores souls, gaining their knowledge, skills, and essence permanently." },
  { id:"soulreb",     name:"Soul Rebirth",                         element:"Soul",                category:"Divine Ability",     rank:"Divine",              starTier:null, description:"Transforms a soul, wiping its memories to grant it a new beginning under a new form." },
  { id:"eternleg",    name:"Sovereign of Eternal Legions",         element:"Death/Command",       category:"Unique Authority",   rank:"Divine",              starTier:null, description:"You do not 'summon' undead — you RULE them. Conceptual command authority. Initial capacity: 54,000 units. Scales with INT." },
  { id:"soulevo",     name:"Soul Evolve",                          element:"Evolution",           category:"Unique Authority",   rank:"Divine",              starTier:null, description:"Initiate forced evolution on familiars and undead. Break level caps, reshape racial paths. Unique bloodline skill — Son of Life and Death." },
  { id:"genesis",     name:"Genesis of the Awakened",             element:"Life",                category:"Unique Authority",   rank:"Divine",              starTier:null, description:"Transform high-tier monster souls into new sentient beings, shaping their nature, instincts, and growth potential." },
  { id:"soulforg",    name:"Soulforged Vessel",                    element:"Soul",                category:"Unique Authority",   rank:"Divine",              starTier:null, description:"Imbue suitable objects, constructs, or corpses with souls, granting them new life and identity." },
  { id:"giantf",      name:"Giant Force",                          element:"Physical",            category:"Combat",             rank:"Rank A",              starTier:null, description:"Boosts all physical stats by 500% for 10 seconds. Extreme burst capacity." },
  { id:"percep",      name:"Perception / Dragon Vision",           element:"Mind",                category:"Passive",            rank:"Rank A (99.84%)",     starTier:null, description:"Greatly enhanced senses and battlefield awareness. Dragon-tier sensory upgrade — detects threats before they manifest." },
  { id:"swords",      name:"Swordsmanship",                        element:"Physical",            category:"Combat",             rank:"Rank B (78.41%)",     starTier:null, description:"High proficiency in sword combat. Refined technique and form." },
  { id:"valstyle",    name:"Astraean Valkyrie Sword Style",        element:"Physical",            category:"Sword Art",          rank:"Rank S",              starTier:null, description:"Royal sword art of the Valkyrie warriors from Brynhildr Astraean — the eternal Valkyrie empire." },
  { id:"grace",       name:"Graceful Strike (Form I)",             element:"Physical",            category:"Sword Art",          rank:"Form I",              starTier:null, description:"First form of Astraean style; a graceful mana-powered strike with greatly increased damage." },
  { id:"flowsev",     name:"Flowing Severance (Form II)",          element:"Physical",            category:"Sword Art",          rank:"Form II",             starTier:null, description:"Second form; circular slashes targeting limbs with deep mana cuts that continue bleeding." },
  { id:"elemblade",   name:"Elemental Blade Infusion",             element:"Physical",            category:"Sword Art",          rank:"Rank B (96.13%)",     starTier:null, description:"Apply fire, ice, or lightning to your weapon. Elemental effects scale with proficiency." },
  { id:"manaform",    name:"Mana Form",                            element:"Arcane",              category:"Mana Craft",         rank:"Rank C",              starTier:null, description:"Forms mana constructs with saved shape patterns. Effects scale with INT." },
  { id:"manaforces",  name:"Mana Force Strike",                    element:"Arcane",              category:"Combat",             rank:"Rank B (4.13%)",      starTier:null, description:"Increases punch power by 30% through precise mana reinforcement." },
  { id:"bloodman",    name:"Blood Manipulation",                   element:"Blood",               category:"Manipulation",       rank:"Rank C (14.25%)",     starTier:null, description:"Core blood affinity control: constructs, arrows, fists, spikes, mist." },
  { id:"bloodarr",    name:"Blood Arrow",                          element:"Blood",               category:"Manipulation",       rank:"Rank C",              starTier:1,    description:"High-velocity blood arrow with barrier-piercing power." },
  { id:"bloodfist",   name:"Blood Fist",                           element:"Blood",               category:"Manipulation",       rank:"Rank C",              starTier:1,    description:"Summons blood fists with boosted striking force and adjustable size." },
  { id:"bloodspk",    name:"Blood Spikes",                         element:"Blood",               category:"Manipulation",       rank:"Rank C",              starTier:2,    description:"Erupts spikes of blood from the ground or magic circles." },
  { id:"bloodmist",   name:"Blood Mist",                           element:"Blood",               category:"Manipulation",       rank:"Rank C",              starTier:3,    description:"Creates a blood mist that drains enemy mana and vitality. Allies are safe." },
  { id:"boneman",     name:"Bone Manipulation",                    element:"Physical",            category:"Manipulation",       rank:"Rank C (0%)",         starTier:null, description:"Forming bone constructs and controlling them." },
  { id:"flameman",    name:"Flame Manipulation",                   element:"Fire",                category:"Manipulation",       rank:"Rank B (83.16%)",     starTier:null, description:"Core flame affinity control. Unlocks: Fire Ball, Blast, Beam, Inferno Pulse, Inferno Crown." },
  { id:"fireball",    name:"Fire Ball",                            element:"Fire",                category:"Manipulation",       rank:"Rank B",              starTier:null, description:"Launches a concentrated fire orb at a target. Explodes on impact." },
  { id:"fireblast",   name:"Fire Blast",                           element:"Fire",                category:"Star Spell",         rank:"Rank B",              starTier:1,    description:"Powerful explosive fire impact. Sweeping explosion on hit." },
  { id:"embswp",      name:"Ember Sweep",                          element:"Fire",                category:"Star Spell",         rank:"Rank B",              starTier:2,    description:"Projects a sustained stream of flames." },
  { id:"flamebeam",   name:"Flame Beam",                           element:"Fire",                category:"Star Spell",         rank:"Rank B",              starTier:3,    description:"Concentrated fire beam attack from the hand." },
  { id:"firechains",  name:"Fire Chains",                          element:"Fire",                category:"Star Spell",         rank:"Rank B",              starTier:3,    description:"Summons flaming chains that seize and burn enemies." },
  { id:"flametornad", name:"Flame Tornado",                        element:"Fire",                category:"Star Spell",         rank:"Rank B",              starTier:3,    description:"Unleashes a tornado of flames." },
  { id:"infpulse",    name:"Inferno Pulse",                        element:"Fire",                category:"Star Spell",         rank:"Rank B",              starTier:3,    description:"Ring of intense flames that explodes outward, leaving burning streaks." },
  { id:"infcrown",    name:"Inferno Crown",                        element:"Fire",                category:"Star Spell",         rank:"Rank B",              starTier:4,    description:"Expanding crown of ultra-hot fire that detonates around the caster." },
  { id:"iceman",      name:"Ice Manipulation",                     element:"Ice",                 category:"Manipulation",       rank:"Rank C (54.68%)",     starTier:null, description:"Core frost affinity control. Unlocks: Icy Ball, Blast, Beam, Absolute Zero Field." },
  { id:"icyball",     name:"Icy Ball",                             element:"Ice",                 category:"Manipulation",       rank:"Rank C",              starTier:null, description:"Swirling ball of icy power that freezes on impact." },
  { id:"icyblast",    name:"Icy Blast",                            element:"Ice",                 category:"Star Spell",         rank:"Rank C",              starTier:1,    description:"Blast of frost power that freezes a broad impact zone." },
  { id:"frostwave",   name:"Frost Wave",                           element:"Ice",                 category:"Star Spell",         rank:"Rank C",              starTier:2,    description:"Wave of freezing power through the battlefield." },
  { id:"icebeam",     name:"Ice Beam",                             element:"Ice",                 category:"Star Spell",         rank:"Rank C",              starTier:3,    description:"Concentrated beam that freezes all targets in its path." },
  { id:"abszero",     name:"Absolute Zero Field",                  element:"Ice",                 category:"Star Spell",         rank:"Rank C",              starTier:4,    description:"Drops temperature over a wide area. Seals enemies in frozen mana." },
  { id:"lightman",    name:"Lightning Manipulation",               element:"Lightning",           category:"Manipulation",       rank:"Rank B (12.2%)",      starTier:null, description:"Core lightning affinity control. Unlocks: Zap, Bolt, Ball Lightning, Spear, Storm Breaker." },
  { id:"lightzap",    name:"Lightning Zap",                        element:"Lightning",           category:"Manipulation",       rank:"Rank B",              starTier:null, description:"Quick close-range lightning discharge." },
  { id:"lightbolt",   name:"Lightning Bolt",                       element:"Lightning",           category:"Star Spell",         rank:"Rank B",              starTier:1,    description:"Concentrated bolt of lightning fired at a target." },
  { id:"ballight",    name:"Ball Lightning",                       element:"Lightning",           category:"Star Spell",         rank:"Rank B",              starTier:2,    description:"Autonomous lightning spheres that seek and strike enemies." },
  { id:"lightspear",  name:"Lightning Spear",                      element:"Lightning",           category:"Star Spell",         rank:"Rank B",              starTier:3,    description:"Red lightning spear that devastates a wide area on impact, chaining to nearby foes." },
  { id:"stormbreak",  name:"Storm Breaker",                        element:"Lightning",           category:"Star Spell",         rank:"Rank B",              starTier:4,    description:"Ball of pure lightning rises and rains continuous strikes. Scales with mana invested." },
  { id:"thunddom",    name:"Thunder Dominion",                     element:"Lightning",           category:"Star Spell",         rank:"Rank B",              starTier:4,    description:"Summons a storm field with chained strikes and amplified lightning damage." },
  { id:"windman",     name:"Wind Manipulation",                    element:"Wind",                category:"Manipulation",       rank:"Rank D (64.23%)",     starTier:null, description:"Core wind affinity control. Bullet, arc slashes, burst bursts from feet for pseudo-flight." },
  { id:"windbull",    name:"Wind Bullet",                          element:"Wind",                category:"Star Spell",         rank:"Rank D",              starTier:1,    description:"Rapid wind burst for pressure or interruption." },
  { id:"windarcl",    name:"Arcs of Wind",                         element:"Wind",                category:"Star Spell",         rank:"Rank D",              starTier:3,    description:"Razor-thin compressed wind slashes. Multiplied greatly by a blade." },
  { id:"skyrend",     name:"Sky Rend",                             element:"Wind",                category:"Star Spell",         rank:"Rank D",              starTier:4,    description:"Violent wind shear that tears through multiple targets." },
  { id:"groundman",   name:"Ground Manipulation",                  element:"Ground",              category:"Manipulation",       rank:"Rank D (19.54%)",     starTier:null, description:"Core earth affinity control: stone constructs, terrain disruption." },
  { id:"stonegaunt",  name:"Stone Gauntlet",                       element:"Ground",              category:"Star Spell",         rank:"Rank D",              starTier:1,    description:"Creates a stone gauntlet for reinforced melee attacks." },
  { id:"seismic",     name:"Seismic Ruin",                         element:"Ground",              category:"Star Spell",         rank:"Rank D",              starTier:4,    description:"Slams the ground to trigger a destructive localized earthquake." },
  { id:"waterman",    name:"Water Manipulation",                   element:"Water",               category:"Manipulation",       rank:"Rank D (1%)",         starTier:null, description:"Core water affinity control. Sphere, blast, spikes, tidal cataclysm." },
  { id:"lightmag",    name:"Light Manipulation",                   element:"Light",               category:"Manipulation",       rank:"Rank D (4.32%)",      starTier:null, description:"Core light affinity control: radiant attacks, Angel's Condemnation." },
  { id:"lightball",   name:"Light Ball",                           element:"Light",               category:"Star Spell",         rank:"Rank C",              starTier:1,    description:"Solid projectile of condensed light." },
  { id:"angelcond",   name:"Angel's Condemnation",                 element:"Light",               category:"Star Spell",         rank:"Rank A",              starTier:3,    description:"Rains hundreds of swords of pure light that pierce and pursue enemies." },
  { id:"radjudge",    name:"Radiant Judgment",                     element:"Light",               category:"Star Spell",         rank:"Rank C",              starTier:4,    description:"Calls down holy light that scorches foes and purges darkness." },
  { id:"natureman",   name:"Nature Manipulation",                  element:"Nature",              category:"Manipulation",       rank:"Rank C (0.5%)",       starTier:null, description:"Core nature affinity: vines, roots, thorns, bark armor, sovereignty." },
  { id:"molttmp",     name:"Molten Tempest",                       element:"Fire+Lightning+Ground",category:"Combination",       rank:"Rank A (2.003%)",     starTier:4,    description:"Stomp covered in molten rock — spikes erupt, lightning arcs through them, continuous chain discharges. Extremely destructive." },
  { id:"chargaunt",   name:"Charged Gauntlet",                     element:"Fire+Lightning+Ground",category:"Combination",       rank:"Combined",            starTier:3,    description:"Stone gauntlet strikes infused with flame and arcing lightning." },
  { id:"multistoneg", name:"Multi-Elemental Stone Gauntlet",       element:"Fire+Lightning+Ground",category:"Combination",       rank:"Combined",            starTier:null, description:"Stone gauntlet infused with fire (Flaming Gauntlet) or ice (Frosty Gauntlet) or lightning." },
  { id:"dracointi",   name:"Draconic Intimidation",                element:"Physical",            category:"Combat",             rank:"Rank C",              starTier:null, description:"Emit a mana-charged roar. Inflicts [Fear], shatters morale, disrupts lower-tier spell casting." },
  { id:"dracomanacir",name:"Draconic Mana Circuit",               element:"Arcane",              category:"Passive",            rank:"Passive",             starTier:null, description:"Mana 30% easier to manipulate; casting speed greatly increased. The world recognizes you as a predator." },
  { id:"dracoclaw",   name:"Elemental Claw",                       element:"Physical",            category:"Combat",             rank:"Basic",               starTier:null, description:"Infuse hands/claws with any elemental mana. Adds massive magical damage and status effects (Burning, Freezing, Shocking) to physical strikes." },
  { id:"comdom",      name:"Commander's Dominion",                 element:"Mind",                category:"Passive",            rank:"Active/Passive",      starTier:null, description:"In a designated area: undead and allies get +30% all physical stats, movement speed, resistance. Telepathic tactics. Uses mana to maintain." },
  { id:"guidlight",   name:"Guiding Light",                        element:"Light",               category:"Passive",            rank:"Passive",             starTier:null, description:"Stable light orb that auto-follows, illuminates path. Adjusts brightness and position from mental intent." },
  { id:"thormrk",     name:"Divine Blessing: Thor's Mark",         element:"Lightning/Divine",    category:"Blessing",           rank:"Legendary Divine",    starTier:null, description:"⚡ +25% lightning attacks · Once/day localized storm · Immunity to paralysis/stun/shock · +40% speed while channeling · Hammer's Echo (AoE crit shockwave)" },
  { id:"lilblss",     name:"Blessing (Lilith)",                    element:"Mind",                category:"Blessing",           rank:"Blessing",            starTier:null, description:"Resistance to mental charms and mind magic. Granted by Lilith, Queen of Temptation." },
  { id:"evoTitle",    name:"Title: Evolver",                       element:"Evolution",           category:"Title",              rank:"Title",               starTier:null, description:"+25% evolution success rate for subordinates. −15% soul/mana evolution cost. Beings evolved by Alok gain a soul imprint boosting loyalty and growth." },
  { id:"lifeTitle",   name:"Title: Life Bringer",                  element:"Life",                category:"Title",              rank:"Title",               starTier:null, description:"+35% effectiveness to Life-aligned abilities. Boosts ally regen. Beings created by Alok gain permanent Affinity Bonus." },
  { id:"manameditation",name:"Basic Mana Meditation",             element:"Arcane",              category:"Utility",            rank:"Unranked",            starTier:null, description:"Core meditation for mana growth and control." },
  { id:"manabull",    name:"Mana Bullet",                          element:"Arcane",              category:"Mana Craft",         rank:"Rank D",              starTier:null, description:"Forms and fires a bullet of mana that can explode on impact." },
  { id:"manaswrd",    name:"Mana Sword",                           element:"Arcane",              category:"Mana Craft",         rank:"Rank C",              starTier:null, description:"Creates a temporary mana-forged sword." },
  { id:"manabl",      name:"Mana Blast",                           element:"Arcane",              category:"Star Spell",         rank:"Rank C (75%)",        starTier:1,    description:"Explosive mana blast with adjustable detonation timing. Radius: 25m base." },
];

// ── ALOK LEVEL 30 CANONICAL STATS ─────────────────────────────────────────────
const ALOK = {
  id:"alok", name:"Alok Aeonmorta", race:"Mixed", rank:"Divine", level:30, tier:"Tier One",
  stats:{ STR:730, AGI:710, VIT:850, INT:1320, MANA:132000, DIVINITY:85 },
  affinities:["Fire","Ice","Lightning"],
  equipment:["Eclipse Tyrant (Artifact #27, Bound — +140% Elemental Amp, 1-of-1)","Bracelet of Mana Confluence (+15% mana recovery)"],
  avatar:{ skin:SKIN_P[1], hair:HAIR_P[2], eyes:EYE_P[0], outfitColor:OUTFIT_P[1], hairStyle:"short", outfitStyle:"armor", accessory:"none" },
};

// ── ITEMS (14 items database) ─────────────────────────────────────────────────
const ITEMS_DB = [
  {id:"i1",name:"Eclipse Tyrant",rarity:"Divine",category:"Weapon",type:"Artifact Sword",stats:{elemental_amp:"140%",fire_res:"60%",lightning_res:"60%",frost_res:"50%"},description:"Numbered Artifact #27. Bound to Alok alone. Jet-black blade woven with all elemental veins. Elemental King's Judgement & Blizzard Thunderfirestorm ultimates (1/day each).",icon:"⚔️"},
  {id:"i2",name:"Bracelet of Mana Confluence",rarity:"Rare",category:"Accessory",type:"Bracelet",stats:{mana_regen:"+15%"},description:"Increases Alok's mana recovery rate by 15%. Harmonizes elemental mana flows.",icon:"📿"},
  {id:"i3",name:"Ring of Crimson Fortitude",rarity:"Epic",category:"Accessory",type:"Ring",stats:{regen:"+20%",all_res:"+10%"},description:"Serena's ring. Increases regeneration and elemental resistance.",icon:"💍"},
  {id:"i4",name:"Astraean Divine Sword",rarity:"Divine",category:"Weapon",type:"Sword",stats:{atk:4200,spd:180},description:"Legendary sword of the Valkyrie royalty, channeling divine lightning through its crystalline edge.",icon:"⚔️"},
  {id:"i5",name:"Staff of Eternal Flame",rarity:"Legendary",category:"Weapon",type:"Staff",stats:{int:3100,matk:2800},description:"Carved from a phoenix tree, permanently ablaze with undying flame.",icon:"🔥"},
  {id:"i6",name:"Void Bow",rarity:"Epic",category:"Weapon",type:"Bow",stats:{atk:1900,spd:320},description:"Crafted from the darkness between stars. Arrows fired fade from reality.",icon:"🏹"},
  {id:"i7",name:"Robe of Eternal Legion",rarity:"Legendary",category:"Armor",type:"Robe",stats:{def:1200,int:800,hp:5000},description:"Woven with the essence of undead legions. Commands their loyalty.",icon:"🧥"},
  {id:"i8",name:"Valkyrie Plate",rarity:"Epic",category:"Armor",type:"Heavy Armor",stats:{def:2800,str:400,hp:12000},description:"Forged in the celestial smithies of Brynhildr Astraean. Weighs nothing to the worthy.",icon:"🛡️"},
  {id:"i9",name:"Storm Crown",rarity:"Divine",category:"Accessory",type:"Helmet",stats:{int:2200,lightning:80,matk:1800},description:"Thor's blessing made manifest. Commands the storm itself.",icon:"👑"},
  {id:"i10",name:"Mana Crystal (Grade S)",rarity:"Epic",category:"Consumable",type:"Crystal",stats:{mp:50000},description:"Dense crystal saturated with pure mana. Shatters upon use.",icon:"🔮"},
  {id:"i11",name:"Elixir of Dragon Blood",rarity:"Legendary",category:"Consumable",type:"Potion",stats:{dragonint:5000,dur:"1h"},description:"Grants temporary dragon intelligence. The transformation is painful but extraordinary.",icon:"🧪"},
  {id:"i12",name:"Soul Anchor",rarity:"Rare",category:"Consumable",type:"Artifact",stats:{soulsave:1},description:"Prevents complete soul destruction upon death. Single use.",icon:"⚓"},
  {id:"i13",name:"Adamantium Lump",rarity:"Legendary",category:"Material",type:"Ore",stats:{hardness:"Max",magic_res:"Extreme"},description:"Nearly unbreakable black-green metal regarded as the stuff of legend. Alok possesses one — enough for a master weapon.",icon:"🪨"},
  {id:"i14",name:"Phylactery of Regeneration",rarity:"Epic",category:"Accessory",type:"Artifact",stats:{hp:15000,regen:500},description:"Stores life force for instant healing. Glows warmly when close to death.",icon:"💎"},
];

// ── Color utils ───────────────────────────────────────────────────────────────
function darken(hex,amt){const h=hex.replace("#","");const[r,g,b]=[0,2,4].map(i=>parseInt(h.slice(i,i+2),16));const d=v=>Math.max(0,Math.min(255,v-amt));return`#${[d(r),d(g),d(b)].map(v=>v.toString(16).padStart(2,"0")).join("")}`;}
function lighten(hex,amt){return darken(hex,-amt);}

// ── PIXEL AVATAR (reference-accurate 20×28 chibi) ────────────────────────────
function PixelAvatar({avatar,size="large",manifest={}}){
  const sc=size==="small"?3:size==="medium"?5:9;
  const W=20*sc,H=28*sc;
  const si=Math.max(0,SKIN_P.indexOf(avatar.skin));
  const sk=SKIN_P[si],skS=SKIN_S[si]??darken(sk,30),skD=darken(sk,55);
  const OUT="#3a1a00";
  const hair=avatar.hair,hairD=darken(hair,40),hairL=lighten(hair,30);
  const outfit=avatar.outfitColor,outfitD=darken(outfit,40),outfitL=lighten(outfit,30);
  const eye=avatar.eyes;
  const rects=[];
  const r=(x,y,w,h,color,op=1)=>rects.push({x:x*sc,y:y*sc,w:w*sc,h:h*sc,color,op});

  r(4,26,12,2,"#000",0.14);

  if(avatar.hairStyle==="long"||avatar.hairStyle==="braided"){r(2,5,16,2,hair);r(1,7,2,14,hair);r(17,7,2,14,hair);r(2,20,2,3,hairD);r(16,20,2,3,hairD);}
  if(avatar.hairStyle==="ponytail"){r(14,5,5,12,hair);r(15,16,4,4,hairD);}
  if(avatar.hairStyle==="bun"){r(5,2,10,5,hair);r(7,1,6,2,hair);}

  if(manifest.Dragon){r(1,13,2,8,"#2d6a2d",0.7);r(17,13,2,8,"#2d6a2d",0.7);}
  if(manifest.Angel){r(0,13,3,10,"#fef9c3",0.8);r(17,13,3,10,"#fef9c3",0.8);r(0,14,2,8,"#fef3c7",0.6);r(18,14,2,8,"#fef3c7",0.6);}
  if(manifest.Valkyrie){r(0,14,3,9,"#c4b5fd",0.7);r(17,14,3,9,"#c4b5fd",0.7);r(1,16,2,6,"#7c3aed",0.5);r(17,16,2,6,"#7c3aed",0.5);}

  r(5,21,4,5,darken(OUT,-8));r(11,21,4,5,darken(OUT,-8));
  r(4,23,6,3,"#1a1218");r(10,23,6,3,"#1a1218");
  r(4,21,1,3,OUT,0.6);r(15,21,1,3,OUT,0.6);r(4,26,6,1,OUT,0.5);r(10,26,6,1,OUT,0.5);

  if(avatar.outfitStyle==="jacket"||avatar.outfitStyle==="ranger"){
    r(4,14,12,7,outfit);r(4,14,2,7,outfitL,0.3);r(14,14,2,7,outfitL,0.2);r(9,14,2,7,outfitD,0.4);
    r(9,15,2,1,outfitL,0.5);r(9,17,2,1,outfitL,0.5);r(9,19,2,1,outfitL,0.5);
    if(avatar.outfitStyle==="ranger"){r(4,17,12,2,"#2d4a2d",0.6);r(8,17,4,2,"#4a3a20",0.8);}
  }else if(avatar.outfitStyle==="armor"){
    r(4,14,12,7,"#232330");r(5,14,10,7,outfit);
    r(3,14,4,3,outfitL);r(13,14,4,3,outfitL);r(3,14,1,3,OUT,0.5);r(17,14,1,3,OUT,0.5);
    r(7,14,6,6,lighten(outfit,10));r(8,15,4,4,outfitL);r(9,16,2,2,lighten(outfit,50),0.35);
    r(4,20,12,1,outfitD);
    if(manifest.Dragon){r(7,15,2,1,"#2d6a2d",0.8);r(11,15,2,1,"#2d6a2d",0.8);r(6,17,2,1,"#2d6a2d",0.6);}
  }else if(avatar.outfitStyle==="robe"||avatar.outfitStyle==="mage"){
    r(3,14,14,7,outfit);r(2,17,16,4,outfit);r(3,14,2,7,outfitL,0.3);r(15,14,2,7,outfitL,0.2);r(9,14,2,7,outfitD,0.35);
    r(2,17,1,4,outfitL,0.4);r(17,17,1,4,outfitL,0.4);r(3,20,14,1,outfitL,0.4);
  }else if(avatar.outfitStyle==="necromancer"){
    r(3,14,14,7,"#0a0a14");r(4,14,12,7,outfit,0.8);r(3,15,2,6,"#5b21b6");r(15,15,2,6,"#5b21b6");
    r(9,14,2,7,darken(outfit,20),0.55);r(9,16,2,2,"#e0e0e0");r(9,18,1,1,"#e0e0e0");r(10,18,1,1,"#e0e0e0");
  }
  r(3,14,1,7,OUT,0.3);r(16,14,1,7,OUT,0.3);r(4,21,12,1,OUT,0.25);

  r(2,14,3,5,outfit,0.8);r(15,14,3,5,outfit,0.8);
  r(2,18,3,4,sk);r(15,18,3,4,sk);r(2,21,3,2,skD);r(15,21,3,2,skD);
  r(1,14,1,9,OUT,0.3);r(18,14,1,9,OUT,0.3);

  r(8,12,4,3,sk);r(7,13,1,2,skS,0.4);r(12,13,1,2,skS,0.4);
  r(5,3,10,10,sk);r(4,4,1,8,sk);r(15,4,1,8,sk);r(5,2,10,2,sk);
  r(5,9,2,3,skS,0.4);r(13,9,2,3,skS,0.4);r(4,6,1,4,skS,0.3);r(15,6,1,4,skS,0.3);r(6,11,8,1,skD,0.18);
  r(3,7,2,3,sk);r(15,7,2,3,sk);r(3,7,1,1,skS,0.4);r(16,7,1,1,skS,0.4);
  if(avatar.race==="Elf"){r(2,6,1,2,sk);r(17,6,1,2,sk);r(1,5,1,1,sk);r(18,5,1,1,sk);}
  r(4,2,12,1,OUT,0.7);r(3,3,1,1,OUT,0.65);r(16,3,1,1,OUT,0.65);r(3,4,1,8,OUT,0.65);r(16,4,1,8,OUT,0.65);r(4,12,12,1,OUT,0.5);

  if(manifest.Dragon){r(4,5,2,3,"#2d6a2d",0.5);r(14,5,2,3,"#2d6a2d",0.5);r(8,3,4,1,"#1d5a1d",0.4);}
  if(manifest.Demon){r(5,2,2,3,"#6b1010",0.5);r(13,2,2,3,"#6b1010",0.5);r(5,0,2,4,"#4a0000");r(13,0,2,4,"#4a0000");r(5,0,1,2,"#2a0000");r(14,0,1,2,"#2a0000");}

  if(avatar.hairStyle==="short"){
    r(4,2,12,3,hair);r(3,3,2,4,hair);r(15,3,2,4,hair);r(5,2,4,1,hairL,0.5);
    r(4,2,12,1,OUT,0.75);r(3,2,1,2,OUT,0.65);r(16,2,1,2,OUT,0.65);r(4,4,3,1,hairD,0.3);r(13,4,3,1,hairD,0.3);
  }else if(avatar.hairStyle==="spiky"){
    r(4,2,12,2,hair);r(3,3,2,3,hair);r(15,3,2,3,hair);
    r(6,0,2,3,hair);r(9,0,2,4,hair);r(12,0,2,3,hair);r(7,0,1,1,hairL,0.6);r(10,0,1,1,hairL,0.6);
    r(6,0,1,1,OUT,0.6);r(9,0,1,1,OUT,0.6);r(12,0,1,1,OUT,0.6);
  }else if(avatar.hairStyle==="long"||avatar.hairStyle==="braided"){
    r(4,2,12,3,hair);r(3,3,2,3,hair);r(15,3,2,3,hair);r(5,2,4,1,hairL,0.4);r(4,2,12,1,OUT,0.75);
  }else if(avatar.hairStyle==="mohawk"){
    r(9,0,2,5,hair);r(8,1,1,3,hair);r(11,1,1,3,hair);r(4,3,4,1,hair);r(12,3,4,1,hair);r(9,0,1,1,hairL,0.6);
  }else if(avatar.hairStyle==="ponytail"){
    r(4,2,10,3,hair);r(3,3,2,3,hair);r(5,2,4,1,hairL,0.4);r(4,2,10,1,OUT,0.75);
  }else if(avatar.hairStyle==="bun"){
    r(4,2,12,3,hair);r(3,3,2,3,hair);r(15,3,2,3,hair);r(7,2,6,1,hairL,0.5);r(4,2,12,1,OUT,0.75);
  }

  r(5,7,3,2,"#f8fafc");r(12,7,3,2,"#f8fafc");
  r(6,7,2,2,eye);r(13,7,2,2,eye);
  r(6,8,1,1,darken(eye,80));r(13,8,1,1,darken(eye,80));
  r(7,7,1,1,"#fff",0.9);r(14,7,1,1,"#fff",0.9);
  r(5,7,1,2,OUT,0.4);r(8,7,1,2,OUT,0.4);r(12,7,1,2,OUT,0.4);r(15,7,1,2,OUT,0.4);
  r(5,6,3,1,OUT,0.35);r(12,6,3,1,OUT,0.35);r(5,9,3,1,OUT,0.28);r(12,9,3,1,OUT,0.28);
  r(5,5,3,1,hairD,0.85);r(12,5,3,1,hairD,0.85);
  if(avatar.rank==="Divine"){r(6,7,2,2,lighten(eye,30),0.25);r(13,7,2,2,lighten(eye,30),0.25);}

  r(9,10,2,1,skS,0.5);r(7,11,1,1,skD,0.3);r(8,11,4,1,darken(sk,50),0.45);r(12,11,1,1,skD,0.3);r(8,12,4,1,skS,0.25);

  if(avatar.accessory==="headband"){r(4,4,12,1,"#c0392b");r(3,4,1,1,"#c0392b");r(16,4,1,1,"#c0392b");r(9,3,2,3,"#e74c3c");r(4,4,3,1,"#e74c3c",0.4);}
  if(avatar.accessory==="cape"){r(1,15,2,10,"#6d28d9");r(17,15,2,10,"#6d28d9");r(0,19,3,6,"#5b21b6");r(17,19,3,6,"#5b21b6");}
  if(avatar.accessory==="horns"){r(4,1,2,4,sk);r(14,1,2,4,sk);r(4,0,2,2,"#d8d0c8");r(14,0,2,2,"#d8d0c8");r(5,0,1,2,"#c8c0b8");r(15,0,1,2,"#c8c0b8");}
  if(avatar.accessory==="halo"){r(5,0,10,2,"#fbbf24",0.3);r(5,1,10,1,"#fde68a",0.65);r(6,0,8,1,"#fef3c7",0.85);}
  if(avatar.accessory==="eyepatch"){r(4,6,5,4,"#111",0.92);r(4,8,1,1,"#333",0.7);r(9,8,1,1,"#333",0.7);}
  if(avatar.accessory==="scarf"){r(5,12,10,2,"#dc2626");r(3,13,4,3,"#dc2626");r(5,14,5,2,darken("#dc2626",25));}

  if(manifest.Valkyrie){r(3,14,1,7,"#7c3aed",0.5);r(16,14,1,7,"#7c3aed",0.5);}
  if(manifest.Dragon){r(2,18,3,4,darken(sk,10));r(15,18,3,4,darken(sk,10));r(2,18,1,1,"#2d6a2d",0.5);r(4,20,1,1,"#2d6a2d",0.5);r(15,18,1,1,"#2d6a2d",0.5);}
  if(avatar.race==="Vampire"||manifest.Demon){r(8,12,1,1,"#fff",0.9);r(11,12,1,1,"#fff",0.9);}

  return(
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{imageRendering:"pixelated",display:"block",shapeRendering:"crispEdges"}}>
      {rects.map((rc,i)=>(
        <rect key={i} x={rc.x} y={rc.y} width={rc.w} height={rc.h} fill={rc.color} opacity={rc.op}/>
      ))}
    </svg>
  );
}

// ── Storage ───────────────────────────────────────────────────────────────────
const SK="bookv1-v5";
const DEF_AVA={skin:SKIN_P[0],hair:HAIR_P[2],eyes:EYE_P[0],outfitColor:OUTFIT_P[1],hairStyle:"short",outfitStyle:"jacket",accessory:"none"};
function load(){try{const r=localStorage.getItem(SK);return r?JSON.parse(r):[];}catch{return[];}}
function save(c){try{localStorage.setItem(SK,JSON.stringify(c));}catch{}}

// ── UI atoms ──────────────────────────────────────────────────────────────────
function Swatch({color,active,onClick}){return(<button onClick={onClick} style={{width:22,height:22,borderRadius:3,background:color,flexShrink:0,cursor:"pointer",border:active?"2px solid #fff":"2px solid transparent",outline:active?`2px solid ${color}`:"none",outlineOffset:1,boxSizing:"border-box",transition:"all 0.12s"}}/>);}
function Chip({label,active,onClick,color}){return(<button onClick={onClick} style={{padding:"3px 9px",borderRadius:4,fontSize:11,cursor:"pointer",border:`1px solid ${active?(color||"#fff"):"#1e2535"}`,background:active?(color||"#fff")+"22":"transparent",color:active?(color||"#fff"):"#4a5568",transition:"all 0.12s"}}>{label}</button>);}
function PxT({text,color="#f5c85a",size=10}){return<span style={{fontFamily:"'Press Start 2P',monospace",fontSize:size,color,letterSpacing:"0.08em"}}>{text}</span>;}

// ── STAT BAR ──────────────────────────────────────────────────────────────────
function StatBar({label,value,max,color,note}){
  const pct=Math.min(100,(value/max)*100);
  return(
    <div style={{marginBottom:8}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
        <span style={{fontSize:10,color:"#6b7280",fontFamily:"monospace",textTransform:"uppercase"}}>{label}</span>
        <span style={{fontSize:11,color,fontWeight:700,fontFamily:"monospace"}}>{typeof value==="number"?value.toLocaleString():value}{note&&<span style={{fontSize:9,color:"#4a5568",fontWeight:400}}> {note}</span>}</span>
      </div>
      <div style={{height:5,background:"#1a2035",borderRadius:3,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${darken(color,20)},${color})`,borderRadius:3,transition:"width 0.4s"}}/>
      </div>
    </div>
  );
}

// ── DIVINE AURA CSS ───────────────────────────────────────────────────────────
const DIVINE_AURA_CSS = `
@keyframes starFloat{0%{opacity:0.4;transform:translateY(0)scale(1)}50%{opacity:1;transform:translateY(-4px)scale(1.3)}100%{opacity:0.4;transform:translateY(0)scale(1)}}
@keyframes rotateSlow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes pulse{0%,100%{opacity:0.6}50%{opacity:1}}
@keyframes borderGlow{0%,100%{box-shadow:0 0 20px #c084fc40,0 0 60px #f5c85a18}50%{box-shadow:0 0 40px #c084fc70,0 0 100px #f5c85a35}}
`;

function DivineStar({style}){return<div style={{position:"absolute",color:"#f5c85a",fontSize:10,animation:`starFloat ${2+Math.random()*2}s ease-in-out infinite`,animationDelay:`${Math.random()*3}s`,...style}}>✦</div>;}

// ── STATUS WINDOW ─────────────────────────────────────────────────────────────
function StatusWindow({char,onEdit,isAlok}){
  const rp=RANK_DATA[char.rank]??RANK_DATA.E;
  const [manifestState,setManifest]=useState({Dragon:false,Angel:false,Valkyrie:false,Demon:false});
  const [activeSkillTab,setActiveSkillTab]=useState("Divine Ability");
  const isDivine=char.rank==="Divine";

  const avatar={...char.avatar,rank:char.rank};
  const skills=isAlok?ALOK_SKILLS:[];
  const skillCats=[...new Set(skills.map(s=>s.category))];
  const shownSkills=skills.filter(s=>s.category===activeSkillTab);

  function toggleManifest(key){setManifest(m=>({...m,[key]:!m[key]}));}

  const affColors={Fire:"#ff6b35",Ice:"#7dd3fc",Lightning:"#fcd34d"};

  return(
    <div style={{
      background: isDivine
        ? "radial-gradient(ellipse at 20% 10%, #1a0a35 0%, #0e0718 60%, #12091f 100%)"
        : rp.bg,
      border:`1px solid ${rp.accent}45`,
      borderRadius:16,padding:"24px 20px",
      boxShadow: isDivine
        ? "0 0 60px #c084fc30,0 0 120px #f5c85a10,inset 0 0 40px #1a0a3520"
        : `0 0 30px ${rp.glow}15`,
      animation: isDivine ? "borderGlow 4s ease-in-out infinite" : "none",
      position:"relative",overflow:"hidden",
    }}>
      <style>{DIVINE_AURA_CSS}</style>

      {isDivine&&[
        {top:"8%",left:"5%"},{top:"15%",right:"8%"},{top:"40%",left:"3%"},
        {top:"60%",right:"5%"},{top:"80%",left:"8%"},{top:"25%",right:"15%"},
        {top:"70%",left:"20%"},{top:"50%",right:"20%"},{top:"90%",right:"12%"},
      ].map((s,i)=><DivineStar key={i} style={s}/>)}

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
        <div>
          <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:isDivine?13:11,color:isDivine?"#f5c85a":rp.accent,marginBottom:4,textShadow:isDivine?"0 0 20px #f5c85a80":"none"}}>
            {char.name}
          </div>
          <div style={{fontSize:11,color:rp.accent,marginBottom:2}}>{char.race} · Lv {char.level}</div>
          <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
            <span style={{
              fontSize:9,fontWeight:700,padding:"3px 10px",borderRadius:12,fontFamily:"monospace",letterSpacing:"0.08em",
              background: isDivine?"linear-gradient(135deg,#3b1068,#1a0a35)":"transparent",
              color:rp.accent,border:`1px solid ${rp.accent}60`,
              boxShadow: isDivine?`0 0 12px ${rp.accent}40`:"none",
            }}>{char.rank} — {rp.label}</span>
            {isAlok&&(char.affinities||["Fire","Ice","Lightning"]).map(af=>(
              <span key={af} style={{fontSize:9,color:affColors[af]??"#fff",background:`${affColors[af]??"#555"}22`,border:`1px solid ${affColors[af]??"#555"}50`,padding:"2px 8px",borderRadius:8,fontFamily:"monospace"}}>{EL_ICON[af]??""} {af}</span>
            ))}
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8}}>
          <div style={{display:"flex",justifyContent:"center"}}>
            <PixelAvatar avatar={avatar} size="large" manifest={manifestState}/>
          </div>
          {onEdit&&<button onClick={onEdit} style={{fontSize:10,color:"#4a5568",background:"transparent",border:"1px solid #1e2535",borderRadius:4,padding:"3px 10px",cursor:"pointer"}}>✏ Edit</button>}
        </div>
      </div>

      {isAlok&&(
        <div style={{marginBottom:18,background:"#ffffff06",border:"1px solid #c084fc20",borderRadius:10,padding:"12px 14px"}}>
          <div style={{fontSize:9,color:"#c084fc",fontFamily:"monospace",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:10}}>⬡ Racial Manifestation</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {[
              {key:"Dragon",icon:"🐉",label:"Dragonoid",color:"#4ade80",desc:"Scales · Claws"},
              {key:"Angel",icon:"✨",label:"Angel",color:"#fef08a",desc:"Wings · Aura"},
              {key:"Valkyrie",icon:"⚔️",label:"Valkyrie",color:"#c4b5fd",desc:"Wings · Trim"},
              {key:"Demon",icon:"🌑",label:"Demon",color:"#ef4444",desc:"Horns · Fangs"},
            ].map(({key,icon,label,color})=>(
              <button key={key} onClick={()=>toggleManifest(key)} style={{
                display:"flex",flexDirection:"column",alignItems:"flex-start",
                padding:"8px 12px",borderRadius:8,cursor:"pointer",
                background:manifestState[key]?`${color}18`:"transparent",
                border:`1px solid ${manifestState[key]?color+"60":"#1e2535"}`,
                color:manifestState[key]?color:"#4a5568",transition:"all 0.15s",minWidth:110,
              }}>
                <span style={{fontSize:18,marginBottom:2}}>{icon}</span>
                <span style={{fontSize:10,fontWeight:700,marginBottom:2}}>{label}</span>
                {manifestState[key]&&<span style={{fontSize:8,color,marginTop:3}}>● Active</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 20px",marginBottom:18}}>
        <div>
          <div style={{fontSize:9,color:rp.accent,fontFamily:"monospace",letterSpacing:"0.15em",marginBottom:10,textTransform:"uppercase"}}>⚔ Combat Stats</div>
          <StatBar label="STR" value={char.stats?.STR??730} max={2000} color="#f87171"/>
          <StatBar label="AGI" value={char.stats?.AGI??710} max={2000} color="#fbbf24"/>
          <StatBar label="VIT" value={char.stats?.VIT??850} max={2500} color="#34d399"/>
          <StatBar label="INT" value={char.stats?.INT??1320} max={5000} color="#818cf8"/>
        </div>
        <div>
          <div style={{fontSize:9,color:rp.accent,fontFamily:"monospace",letterSpacing:"0.15em",marginBottom:10,textTransform:"uppercase"}}>✦ Special Stats</div>
          <StatBar label="MANA" value={char.stats?.MANA??132000} max={200000} color="#c084fc" note="pool"/>
          <StatBar label="DIVINITY" value={char.stats?.DIVINITY??85} max={1000} color="#f5c85a"/>
        </div>
      </div>

      <div style={{marginBottom:18}}>
        <div style={{fontSize:9,color:"#4a5568",fontFamily:"monospace",marginBottom:6}}>MANA AURA — {char.rank}</div>
        <div style={{height:8,borderRadius:4,overflow:"hidden",background:"#0a0d16",position:"relative"}}>
          {isDivine?(
            <div style={{height:"100%",background:"linear-gradient(90deg,#2d1068,#c084fc,#f5c85a,#c084fc,#2d1068)",backgroundSize:"200% 100%",animation:"rotateSlow 3s linear infinite",borderRadius:4}}/>
          ):(
            <div style={{height:"100%",width:"100%",background:`linear-gradient(90deg,transparent,${rp.manaColor},transparent)`,borderRadius:4,animation:"pulse 2s ease-in-out infinite"}}/>
          )}
        </div>
      </div>

      {isAlok&&skills.length>0&&(
        <div>
          <div style={{fontSize:9,color:rp.accent,fontFamily:"monospace",letterSpacing:"0.15em",marginBottom:10,textTransform:"uppercase"}}>⭐ Skill Codex ({skills.length} skills)</div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>
            {skillCats.map(cat=>(
              <button key={cat} onClick={()=>setActiveSkillTab(cat)} style={{
                padding:"3px 9px",borderRadius:4,fontSize:10,cursor:"pointer",
                display:"flex",alignItems:"center",gap:4,
                background:activeSkillTab===cat?rp.accent+"28":"transparent",
                color:activeSkillTab===cat?rp.accent:"#374151",
                border:`1px solid ${activeSkillTab===cat?rp.accent+"60":"#1e2535"}`,
              }}>{CAT_ICON[cat]??""} {cat}</button>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:8,maxHeight:600,overflowY:"auto"}}>
            {shownSkills.map(sk=>{
              const elC=EL_CLR[sk.element]??"#6b7280";
              const elI=EL_ICON[sk.element]??"◈";
              const isDivSkill=sk.category==="Divine Ability"||sk.category==="Unique Authority";
              return(
                <div key={sk.id} style={{
                  background:isDivSkill?"#12091f":"#0c1018",
                  border:`1px solid ${elC}${isDivSkill?"55":"20"}`,
                  borderLeft:`3px solid ${elC}${isDivSkill?"ee":"88"}`,
                  borderRadius:8,padding:"10px 12px",
                }}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:6,marginBottom:6}}>
                    <div style={{display:"flex",alignItems:"center",gap:7,flex:1,minWidth:0}}>
                      <div style={{width:32,height:32,borderRadius:6,background:`${elC}15`,border:`1px solid ${elC}35`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{elI}</div>
                      <div style={{minWidth:0}}>
                        <div style={{color:"#e2e8f0",fontWeight:700,fontSize:11,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{sk.name}</div>
                        <div style={{display:"flex",gap:4,marginTop:2,flexWrap:"wrap"}}>
                          <span style={{fontSize:8,color:elC,background:`${elC}15`,padding:"1px 5px",borderRadius:6}}>{sk.element}</span>
                          <span style={{fontSize:8,color:"#374151",fontFamily:"monospace"}}>{sk.rank}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {sk.starTier&&(
                    <div style={{display:"flex",alignItems:"center",gap:2,marginBottom:5}}>
                      {Array.from({length:sk.starTier}).map((_,i)=><span key={i} style={{color:"#fbbf24",fontSize:10}}>★</span>)}
                    </div>
                  )}
                  <p style={{color:"#6b7280",fontSize:10,lineHeight:1.65,margin:0}}>{sk.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App(){
  const [tab,setTab]=useState("alok");
  const [chars,setChars]=useState(load);
  const [editId,setEditId]=useState(null);
  const [draft,setDraft]=useState({name:"",race:"Human",rank:"E",level:1,stats:{STR:50,AGI:50,VIT:55,INT:60,MANA:500,DIVINITY:0},avatar:{...DEF_AVA}});
  const [itemFilter,setItemFilter]=useState({category:"All",rarity:"All",search:""});
  const [expandItem,setExpandItem]=useState(null);

  function openBuilder(char=null){
    if(char){setDraft({name:char.name,race:char.race,rank:char.rank,level:char.level||1,stats:{...char.stats},avatar:{...char.avatar}});setEditId(char.id);}
    else{setDraft({name:"",race:"Human",rank:"E",level:1,stats:{STR:50,AGI:50,VIT:55,INT:60,MANA:500,DIVINITY:0},avatar:{...DEF_AVA}});setEditId(null);}
    setTab("builder");
  }
  function saveChar(){
    const name=draft.name.trim()||"Unknown Hero";
    const avatar={...draft.avatar,race:draft.race};
    if(editId){const upd=chars.map(c=>c.id===editId?{...c,name,race:draft.race,rank:draft.rank,level:draft.level,stats:{...draft.stats},avatar}:c);setChars(upd);save(upd);}
    else{const nc={id:Date.now().toString(),name,race:draft.race,rank:draft.rank,level:draft.level,stats:{...draft.stats},avatar,createdAt:new Date().toISOString()};const upd=[nc,...chars];setChars(upd);save(upd);}
    setTab("roster");
  }
  function delChar(id){const u=chars.filter(c=>c.id!==id);setChars(u);save(u);}
  function randomize(){
    const pick=a=>a[Math.floor(Math.random()*a.length)];
    setDraft(d=>({...d,race:pick(RACES),rank:pick(RANKS),avatar:{...d.avatar,skin:pick(SKIN_P),hair:pick(HAIR_P),eyes:pick(EYE_P),outfitColor:pick(OUTFIT_P),hairStyle:pick(HAIR_STYLES),outfitStyle:pick(OUTFIT_STYLES),accessory:pick(ACCESSORIES)}}));
  }
  const upA=(k,v)=>setDraft(d=>({...d,avatar:{...d.avatar,[k]:v}}));
  const upS=(k,v)=>setDraft(d=>({...d,stats:{...d.stats,[k]:Number(v)}}));
  const rp=RANK_DATA[draft.rank]??RANK_DATA.E;

  const filteredItems=useMemo(()=>ITEMS_DB.filter(it=>{
    if(itemFilter.category!=="All"&&it.category!==itemFilter.category)return false;
    if(itemFilter.rarity!=="All"&&it.rarity!==itemFilter.rarity)return false;
    if(itemFilter.search&&!it.name.toLowerCase().includes(itemFilter.search.toLowerCase()))return false;
    return true;
  }),[itemFilter]);

  const NAV_TABS=[
    {id:"alok",   label:"✦ Alok"},
    {id:"roster", label:"⚔ Roster"},
    {id:"skills", label:"⭐ Skills"},
    {id:"items",  label:"◈ Items"},
    tab==="builder"?{id:"builder",label:editId?"✏ Edit":"★ Builder"}:null,
  ].filter(Boolean);

  return(
    <div style={{minHeight:"100vh",background:"#080b12",color:"#fff"}}>
      <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet"/>
      <style>{DIVINE_AURA_CSS}</style>

      {/* NAV */}
      <div style={{background:"#0a0d16",borderBottom:"1px solid #0f1827",padding:"0 28px",display:"flex",alignItems:"stretch",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:3}}>
          <div style={{padding:"16px 12px 16px 0"}}><PxT text="◆ BOOK" size={11}/></div>
          <div style={{width:1,height:20,background:"#1e2535",alignSelf:"center",margin:"0 12px"}}/>
          {NAV_TABS.map(({id,label})=>(
            <button key={id} onClick={()=>{if(id!=="builder")setTab(id);}} style={{
              background:"none",border:"none",padding:"0 14px",minHeight:52,cursor:"pointer",fontSize:12,
              color:tab===id?"#f5c85a":"#374151",fontWeight:tab===id?700:400,
              borderBottom:tab===id?"2px solid #f5c85a":"2px solid transparent",transition:"all 0.15s",
            }}>{label}</button>
          ))}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <button onClick={()=>openBuilder()} style={{background:"#7c3aed22",border:"1px solid #7c3aed50",color:"#a78bfa",padding:"6px 14px",borderRadius:6,cursor:"pointer",fontSize:11,fontWeight:600}}>+ New Character</button>
        </div>
      </div>

      <div style={{maxWidth:1100,margin:"0 auto",padding:28}}>

        {/* ALOK STATUS */}
        {tab==="alok"&&(
          <div>
            <div style={{marginBottom:20,display:"flex",alignItems:"center",gap:12}}>
              <PxT text="ALOK AEONMORTA" color="#f5c85a" size={11}/>
              <span style={{fontSize:10,color:"#c084fc",fontFamily:"monospace",background:"#c084fc15",border:"1px solid #c084fc40",padding:"3px 10px",borderRadius:8}}>Divine Rank · Level 30</span>
            </div>
            <StatusWindow char={{...ALOK,stats:{...ALOK.stats}}} isAlok={true}/>
          </div>
        )}

        {/* ROSTER */}
        {tab==="roster"&&(
          <div>
            <div style={{marginBottom:20}}><PxT text="CHARACTER ROSTER"/></div>
            {chars.length===0&&(
              <div style={{textAlign:"center",padding:"60px 20px",border:"1px dashed #111827",borderRadius:12,color:"#374151"}}>
                <div style={{fontSize:32,marginBottom:10,opacity:0.2}}>⚔</div>
                <div style={{fontFamily:"monospace",fontSize:12}}>No characters yet — click + New Character</div>
              </div>
            )}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:16}}>
              {chars.map(char=>{
                const crp=RANK_DATA[char.rank]??RANK_DATA.E;
                return(
                  <div key={char.id}>
                    <StatusWindow char={char} onEdit={()=>openBuilder(char)} isAlok={false}/>
                    <button onClick={()=>delChar(char.id)} style={{marginTop:6,width:"100%",background:"#ef444410",border:"1px solid #ef444430",color:"#f87171",padding:"6px",borderRadius:6,cursor:"pointer",fontSize:11}}>Remove</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* BUILDER */}
        {tab==="builder"&&(
          <div style={{display:"grid",gridTemplateColumns:"270px 1fr",gap:24,alignItems:"start"}}>
            <div style={{position:"sticky",top:0}}>
              <div style={{background:rp.bg,border:`1px solid ${rp.accent}40`,borderRadius:14,padding:22,textAlign:"center"}}>
                <div style={{fontSize:9,color:rp.accent,letterSpacing:"0.18em",fontFamily:"monospace",marginBottom:10,textTransform:"uppercase"}}>Preview</div>
                <div style={{display:"flex",justifyContent:"center",marginBottom:16}}>
                  <PixelAvatar avatar={{...draft.avatar,rank:draft.rank}} size="large"/>
                </div>
                <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:8,color:"#f1f5f9",marginBottom:4}}>{draft.name||"New Hero"}</div>
                <div style={{fontSize:11,color:rp.accent,marginBottom:3}}>{draft.rank} · {draft.race} · Lv {draft.level}</div>
              </div>
              <button onClick={randomize} style={{marginTop:8,width:"100%",background:"#ffffff06",border:"1px solid #111827",color:"#374151",padding:10,borderRadius:8,cursor:"pointer",fontSize:12}}>🎲 Randomize</button>
              <div style={{display:"flex",gap:8,marginTop:8}}>
                <button onClick={saveChar} style={{flex:2,background:rp.accent,color:"#000",border:"none",padding:11,borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:13}}>{editId?"Save":"Create"}</button>
                <button onClick={()=>setTab("roster")} style={{flex:1,background:"transparent",border:"1px solid #111827",color:"#374151",padding:11,borderRadius:8,cursor:"pointer",fontSize:12}}>Cancel</button>
              </div>
            </div>

            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <section style={{background:"#0c1018",border:"1px solid #111827",borderRadius:12,padding:18}}>
                <div style={{fontSize:9,color:rp.accent,fontFamily:"monospace",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:14}}>Identity</div>
                <label style={{display:"block",marginBottom:12}}>
                  <div style={{fontSize:10,color:"#374151",marginBottom:5,fontFamily:"monospace"}}>Name</div>
                  <input value={draft.name} onChange={e=>setDraft(d=>({...d,name:e.target.value}))} placeholder="Character name..."
                    style={{width:"100%",background:"#141920",border:"1px solid #1e2535",color:"#e2e8f0",padding:"9px 12px",borderRadius:6,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
                </label>
                <label style={{display:"block",marginBottom:12}}>
                  <div style={{fontSize:10,color:"#374151",marginBottom:5,fontFamily:"monospace"}}>Level</div>
                  <input type="number" value={draft.level} min={1} max={2500} onChange={e=>setDraft(d=>({...d,level:Number(e.target.value)}))}
                    style={{width:"100%",background:"#141920",border:"1px solid #1e2535",color:"#e2e8f0",padding:"9px 12px",borderRadius:6,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
                </label>
                <div style={{marginBottom:12}}>
                  <div style={{fontSize:10,color:"#374151",fontFamily:"monospace",marginBottom:6}}>Race</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:5}}>{RACES.map(r=><Chip key={r} label={r} active={draft.race===r} onClick={()=>setDraft(d=>({...d,race:r}))} color={rp.accent}/>)}</div>
                </div>
                <div>
                  <div style={{fontSize:10,color:"#374151",fontFamily:"monospace",marginBottom:6}}>Rank</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:5}}>{RANKS.map(rk=>{const rc=RANK_DATA[rk];return<Chip key={rk} label={rk} active={draft.rank===rk} onClick={()=>setDraft(d=>({...d,rank:rk}))} color={rc.accent}/>;})}</div>
                </div>
              </section>

              <section style={{background:"#0c1018",border:"1px solid #111827",borderRadius:12,padding:18}}>
                <div style={{fontSize:9,color:rp.accent,fontFamily:"monospace",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:14}}>Stats</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  {[["STR","Strength"],["AGI","Agility"],["VIT","Vitality"],["INT","Intelligence"],["MANA","Mana Pool"],["DIVINITY","Divinity"]].map(([k,l])=>(
                    <label key={k}>
                      <div style={{fontSize:10,color:"#374151",marginBottom:4,fontFamily:"monospace"}}>{l}</div>
                      <input type="number" value={draft.stats[k]??0} onChange={e=>upS(k,e.target.value)} min={0}
                        style={{width:"100%",background:"#141920",border:"1px solid #1e2535",color:rp.accent,padding:"7px 10px",borderRadius:6,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
                    </label>
                  ))}
                </div>
              </section>

              <section style={{background:"#0c1018",border:"1px solid #111827",borderRadius:12,padding:18}}>
                <div style={{fontSize:9,color:rp.accent,fontFamily:"monospace",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:14}}>Appearance</div>
                <div style={{marginBottom:12}}>
                  <div style={{fontSize:10,color:"#374151",fontFamily:"monospace",marginBottom:6}}>Hair Style</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:5}}>{HAIR_STYLES.map(o=><Chip key={o} label={o} active={draft.avatar.hairStyle===o} onClick={()=>upA("hairStyle",o)} color={rp.accent}/>)}</div>
                </div>
                <div style={{marginBottom:12}}>
                  <div style={{fontSize:10,color:"#374151",fontFamily:"monospace",marginBottom:6}}>Outfit</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:5}}>{OUTFIT_STYLES.map(o=><Chip key={o} label={o} active={draft.avatar.outfitStyle===o} onClick={()=>upA("outfitStyle",o)} color={rp.accent}/>)}</div>
                </div>
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:10,color:"#374151",fontFamily:"monospace",marginBottom:6}}>Accessory</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:5}}>{ACCESSORIES.map(o=><Chip key={o} label={o} active={draft.avatar.accessory===o} onClick={()=>upA("accessory",o)} color={rp.accent}/>)}</div>
                </div>
                {[["Skin Tone",SKIN_P,"skin"],["Eye Color",EYE_P,"eyes"],["Hair Color",HAIR_P,"hair"],["Outfit Color",OUTFIT_P,"outfitColor"]].map(([label,pal,key])=>(
                  <div key={key} style={{marginBottom:14}}>
                    <div style={{fontSize:10,color:"#374151",fontFamily:"monospace",marginBottom:7}}>{label}</div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{pal.map(col=><Swatch key={col} color={col} active={draft.avatar[key]===col} onClick={()=>upA(key,col)}/>)}</div>
                  </div>
                ))}
              </section>
            </div>
          </div>
        )}

        {/* SKILLS */}
        {tab==="skills"&&(
          <div>
            <div style={{marginBottom:8}}><PxT text="ALOK'S SKILL CODEX"/></div>
            <div style={{fontSize:11,color:"#4a5568",marginBottom:18,fontFamily:"monospace"}}>{ALOK_SKILLS.length} skills — Son of Life & Death · Divine Rank</div>
            {Object.entries(
              ALOK_SKILLS.reduce((acc,sk)=>{if(!acc[sk.category])acc[sk.category]=[];acc[sk.category].push(sk);return acc;},{})
            ).map(([cat,catSkills])=>{
              const catColor=catSkills[0]?EL_CLR[catSkills[0].element]??"#6b7280":"#6b7280";
              return(
                <div key={cat} style={{marginBottom:24}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                    <span style={{fontSize:18}}>{CAT_ICON[cat]??""}</span>
                    <span style={{fontFamily:"'Press Start 2P',monospace",fontSize:9,color:catColor}}>{cat}</span>
                    <span style={{fontSize:10,color:"#374151",fontFamily:"monospace"}}>({catSkills.length})</span>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:8}}>
                    {catSkills.map(sk=>{
                      const elC=EL_CLR[sk.element]??"#6b7280";
                      const isDivSkill=sk.category==="Divine Ability"||sk.category==="Unique Authority";
                      return(
                        <div key={sk.id} style={{background:isDivSkill?"#12091f":"#0c1018",border:`1px solid ${elC}${isDivSkill?"55":"20"}`,borderLeft:`3px solid ${elC}${isDivSkill?"ee":"88"}`,borderRadius:8,padding:"10px 12px"}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:6,marginBottom:6}}>
                            <div style={{display:"flex",alignItems:"center",gap:7,flex:1,minWidth:0}}>
                              <div style={{width:30,height:30,borderRadius:6,background:`${elC}15`,border:`1px solid ${elC}35`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>{EL_ICON[sk.element]??"◈"}</div>
                              <div style={{minWidth:0}}>
                                <div style={{color:"#e2e8f0",fontWeight:700,fontSize:11,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{sk.name}</div>
                                <div style={{display:"flex",gap:4,marginTop:2}}>
                                  <span style={{fontSize:8,color:elC,background:`${elC}15`,padding:"1px 5px",borderRadius:6}}>{sk.element}</span>
                                  <span style={{fontSize:8,color:"#374151",fontFamily:"monospace"}}>{sk.rank}</span>
                                </div>
                              </div>
                            </div>
                            {sk.starTier&&<div style={{flexShrink:0}}>{Array.from({length:sk.starTier}).map((_,i)=><span key={i} style={{color:"#fbbf24",fontSize:10}}>★</span>)}</div>}
                          </div>
                          <p style={{color:"#6b7280",fontSize:10,lineHeight:1.65,margin:0}}>{sk.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ITEMS */}
        {tab==="items"&&(
          <div>
            <div style={{marginBottom:18}}><PxT text="ITEM COMPENDIUM"/></div>
            <div style={{display:"flex",gap:10,marginBottom:18,flexWrap:"wrap",alignItems:"center"}}>
              <input value={itemFilter.search} onChange={e=>setItemFilter(f=>({...f,search:e.target.value}))} placeholder="Search..."
                style={{background:"#0c1018",border:"1px solid #111827",color:"#e2e8f0",padding:"7px 12px",borderRadius:6,fontSize:12,outline:"none",minWidth:150}}/>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {["All","Weapon","Armor","Accessory","Consumable","Material"].map(cat=>(
                  <Chip key={cat} label={cat} active={itemFilter.category===cat} onClick={()=>setItemFilter(f=>({...f,category:cat}))}/>
                ))}
              </div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {["All","Common","Rare","Epic","Legendary","Divine"].map(rar=>{
                  const rc=rar==="All"?{c:"#374151"}:RARITY[rar];
                  return<Chip key={rar} label={rar} active={itemFilter.rarity===rar} onClick={()=>setItemFilter(f=>({...f,rarity:rar}))} color={rc.c}/>;
                })}
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:12}}>
              {filteredItems.map(item=>{
                const rc=RARITY[item.rarity]??RARITY.Common;
                const open=expandItem===item.id;
                return(
                  <div key={item.id} onClick={()=>setExpandItem(open?null:item.id)} style={{
                    background:`${rc.bg}ee`,border:`1px solid ${rc.c}${open?"70":"25"}`,
                    borderRadius:10,padding:14,cursor:"pointer",
                    boxShadow:open?`0 0 18px ${rc.c}25`:"none",transition:"all 0.18s",
                  }}
                    onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
                    onMouseLeave={e=>e.currentTarget.style.transform=""}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                      <span style={{fontSize:24,lineHeight:1}}>{item.icon}</span>
                      <span style={{fontSize:9,color:rc.c,background:`${rc.c}20`,padding:"2px 7px",borderRadius:8,fontFamily:"monospace"}}>{item.rarity}</span>
                    </div>
                    <div style={{color:"#e2e8f0",fontWeight:700,fontSize:12,marginBottom:3}}>{item.name}</div>
                    <div style={{color:"#374151",fontSize:10,marginBottom:open?12:0}}>{item.type} · {item.category}</div>
                    {open&&(
                      <div style={{borderTop:`1px solid ${rc.c}20`,paddingTop:10}}>
                        <p style={{color:"#6b7280",fontSize:11,lineHeight:1.65,margin:"0 0 10px"}}>{item.description}</p>
                        <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                          {Object.entries(item.stats).map(([k,v])=>(
                            <span key={k} style={{fontSize:10,background:"#ffffff06",border:`1px solid ${rc.c}28`,borderRadius:5,padding:"3px 8px",color:rc.c}}>
                              <span style={{color:"#374151",fontSize:9}}>{k.toUpperCase()} </span>{v}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
