from __future__ import annotations

from dataclasses import dataclass

RACES = {
    "human": {"label": "Human", "stats": {"str": 50, "agi": 50, "vit": 55, "intelligence": 60, "divinity": 0}},
    "elf": {"label": "Elf", "stats": {"str": 44, "agi": 58, "vit": 48, "intelligence": 82, "divinity": 0}},
    "vampire": {"label": "Vampire", "stats": {"str": 60, "agi": 56, "vit": 64, "intelligence": 82, "divinity": 0}},
    "dragonoid": {"label": "Dragonoid", "stats": {"str": 72, "agi": 52, "vit": 78, "intelligence": 70, "divinity": 0}},
    "angel": {"label": "Angel", "stats": {"str": 55, "agi": 56, "vit": 66, "intelligence": 90, "divinity": 5}},
    "fairy": {"label": "Fairy", "stats": {"str": 34, "agi": 72, "vit": 40, "intelligence": 86, "divinity": 0}},
    "valkyrie": {"label": "Valkyrie", "stats": {"str": 62, "agi": 70, "vit": 68, "intelligence": 78, "divinity": 0}},
    "demon": {"label": "Demon", "stats": {"str": 68, "agi": 54, "vit": 70, "intelligence": 88, "divinity": 0}},
    "mixed": {"label": "Mixed", "stats": {"str": 50, "agi": 50, "vit": 50, "intelligence": 50, "divinity": 0}},
}

RANK_ATTRIBUTE_GAIN = {
    "E": 2,
    "D": 3,
    "C": 4,
    "B": 5,
    "A": 7,
    "S": 10,
    "SS-1": 12,
    "SS-2": 14,
    "SS-3": 16,
    "Mythic-1": 18,
    "Mythic-2": 20,
    "Demi": 25,
    "Divine": 30,
}

PLAYER_TIERS = [
    (1, 50, "Tier One", "Novice; new adventurers; basic skills"),
    (51, 100, "Tier Two", "Intermediate; skilled fighters; minor elites"),
    (101, 200, "Tier Three", "Advanced; veteran players; low-ranked bosses"),
    (201, 400, "Tier Four", "High-tier; regional champions; elite commanders"),
    (401, 700, "Tier Five", "World-class; legendary heroes; rare monsters"),
    (701, 1000, "Tier Six", "Pinnacle mortals; mythic-adjacent beings"),
    (1001, 1200, "Tier Seven", "Lord-level entities"),
    (1201, 1500, "Tier Eight", "World-shaper emperor tier"),
    (1501, 999999, "God/Demon Class", "True gods; high demons; supreme entities"),
]

TIER_BENCHMARKS = [
    (20, 180, 260, 320, 120),
    (50, 350, 600, 750, 250),
    (100, 1000, 2000, 2200, 550),
    (200, 5000, 10000, 12500, 2000),
    (400, 15000, 35000, 35000, 10000),
    (700, 45000, 90000, 110000, 25000),
    (1000, 120000, 260000, 300000, 60000),
    (1200, 300000, 700000, 800000, 150000),
    (1500, 900000, 2200000, 2500000, 400000),
]

STAR_SPELLS = {
    1: (250, 75, "5 meters", "1 meter", 1, "Senior Mage"),
    2: (750, 500, "10 meters", "2.5 meters", 1, "Elite Mage"),
    3: (2000, 1500, "30 meters", "10 meters", 3, "Grand Mage"),
    4: (5000, 3500, "250 meters", "50 meters", 7, "Great Mage"),
    5: (20000, 15000, "1,000 meters", "250 meters", 20, "Archmage"),
    6: (50000, 35000, "5,000 meters", "1,000 meters", 50, "Supreme Mage"),
    7: (200000, 150000, "10,000 meters", "2,500 meters", 100, "Mythic Mage"),
    8: (1000000, 750000, "1,000 kilometers", "100 kilometers", 250, "Divine Mage"),
}


def get_race_names() -> list[str]:
    return [entry["label"] for entry in RACES.values()]


def get_race_defaults(race_name: str) -> dict[str, int]:
    key = normalize_key(race_name)
    return dict(RACES.get(key, RACES["mixed"]) ["stats"])


def get_rank_gain(rank: str) -> int:
    return RANK_ATTRIBUTE_GAIN.get(rank, 0)


def get_tier_for_level(level: int) -> tuple[str, str]:
    for minimum, maximum, tier_name, description in PLAYER_TIERS:
        if minimum <= level <= maximum:
            return tier_name, description
    return PLAYER_TIERS[-1][2], PLAYER_TIERS[-1][3]


def get_tier_benchmark(level: int) -> dict[str, int | str]:
    benchmark = TIER_BENCHMARKS[0]
    for entry in TIER_BENCHMARKS:
        if level >= entry[0]:
            benchmark = entry
    return {
        "level": benchmark[0],
        "physical": benchmark[1],
        "vitality": benchmark[2],
        "intelligence": benchmark[3],
        "attribute_points": benchmark[4],
    }


def normalize_key(value: str) -> str:
    return value.strip().lower().replace(" ", "_")


def format_stat_delta(before: int, after: int) -> str:
    difference = after - before
    if difference == 0:
        return "no change"
    sign = "+" if difference > 0 else ""
    return f"{sign}{difference}"
