from __future__ import annotations

ALOK_PROFILE = {
    "name": "Alok Aeonmorta",
    "rank": "Divine",
    "level": 135,
    "race": "mixed",
    "stats": {
        "str": 7449,
        "agi": 9560,
        "vit": 10020,
        "intelligence": 15190,
        "divinity": 8420,
    },
    "total_int": 69540,
    "tower_points": 394345250,
    "affinity": "Lightning, Flame, Frost, Blood",
    "affinity_note": "150% increase in damage, 100% increase in resistance",
    "divine_abilities": [
        {
            "name": "Regeneration (Divine)",
            "rank": "Divine",
            "description": "Regenerates the body from damage and poisons and can restore from a death state.",
        },
        {
            "name": "Incineration Beam",
            "rank": "Divine",
            "description": "Shoots a beam of absolute flames that incinerate monsters caught.",
        },
        {
            "name": "Thunder's Judgement",
            "rank": "Divine",
            "description": "Pure divine lightning that releases complete destruction over a vast area.",
        },
        {
            "name": "Soul Absorber",
            "rank": "Divine",
            "description": "Absorb and store souls, gaining their knowledge, skills, and essence.",
        },
        {
            "name": "Soul Rebirth",
            "rank": "Divine",
            "description": "Transform a soul, wiping its memories to grant it a new beginning.",
        },
        {
            "name": "Sovereign of Eternal Legions",
            "rank": "Divine",
            "description": "Rules undead and soul-bound familiars with conceptual authority and legion bonuses.",
        },
    ],
    "skills": [
        {
            "name": "Perception",
            "rank": "Rank A",
            "description": "Greatly enhanced senses.",
        },
        {
            "name": "Giant Force",
            "rank": "Rank A",
            "description": "For 10 seconds increases all physical stats by 500%.",
        },
        {
            "name": "Basic Mana Meditation",
            "rank": "Rank C",
            "description": "Gather mana to the core and increase the mana pool over time.",
        },
        {
            "name": "Basic Combat",
            "rank": "Rank C",
            "description": "Refines combat techniques.",
        },
        {
            "name": "Swordsmanship",
            "rank": "Rank B",
            "description": "Proficiency with sword combat increases.",
        },
        {
            "name": "Astraean Valkyrie Sword Style",
            "rank": "Rank S",
            "description": "Sword art of the Valkyrie Royals and warriors from Brynhildr Astraean.",
        },
        {
            "name": "Mana Form",
            "rank": "Rank C",
            "description": "Forms shapes using mana; scale with intelligence and mastery.",
        },
        {
            "name": "Mana Bullet",
            "rank": "Rank D",
            "description": "Forms a bullet of mana and shoots at a target with explosive impact.",
        },
        {
            "name": "Mana Sword",
            "rank": "Rank C",
            "description": "Creates a temporary sword with mana.",
        },
        {
            "name": "Basic Marksmanship",
            "rank": "Rank D",
            "description": "Increases accuracy with ranged weapons and angle tracking.",
        },
        {
            "name": "Mana Blast",
            "rank": "Rank C",
            "description": "Forms and releases an explosive blast of mana.",
        },
        {
            "name": "Angel's Condemnation",
            "rank": "Rank A",
            "description": "Rains down hundreds of swords of pure light that pierce through enemies.",
        },
        {
            "name": "Blood Manipulation",
            "rank": "Rank C",
            "description": "Creates blood constructs and unlocks offensive blood techniques.",
        },
        {
            "name": "Lightning Manipulation",
            "rank": "Rank B",
            "description": "Unlocks lightning attacks, chained strikes, and storm-scale spells.",
        },
        {
            "name": "Flame Manipulation",
            "rank": "Rank B",
            "description": "Fireball, fire blast, beam, tornado, and inferno techniques.",
        },
        {
            "name": "Ice Manipulation",
            "rank": "Rank C",
            "description": "Unlocks frost blasts, beams, and absolute zero field effects.",
        },
        {
            "name": "Wind Manipulation",
            "rank": "Rank D",
            "description": "Wind bullets, arcs, and sky-rending pressure slashes.",
        },
        {
            "name": "Nature Manipulation",
            "rank": "Rank C",
            "description": "Vines, roots, thorn shots, bark armor, and worldroot growth.",
        },
        {
            "name": "Ground Manipulation",
            "rank": "Rank D",
            "description": "Stone gauntlets and seismic terrain rupture.",
        },
        {
            "name": "Water Manipulation",
            "rank": "Rank D",
            "description": "Water spheres, blasts, spikes, and tidal cataclysms.",
        },
        {
            "name": "Light Manipulation",
            "rank": "Rank C",
            "description": "Light balls, holy rain, and radiant judgment.",
        },
        {
            "name": "Guiding Light",
            "rank": "Passive",
            "description": "A stable orb of light that floats ahead and provides illumination.",
        },
        {
            "name": "Blessing: Mental Ward",
            "rank": "Blessing",
            "description": "Resistance to mental charms and mind magic.",
        },
        {
            "name": "Thor's Mark of the Storm Sovereign",
            "rank": "Legendary Divine Blessing",
            "description": "Amplifies lightning attacks, grants storm domain, and boosts movement.",
        },
    ],
    "titles": ["Evolver", "Life Bringer"],
}


def is_alok_profile(name: str) -> bool:
    return name.strip().lower() == ALOK_PROFILE["name"].lower()


def alok_skill_rows() -> list[tuple[str, str, str]]:
    return [(entry["name"], entry["rank"], entry["description"]) for entry in ALOK_PROFILE["skills"]]
