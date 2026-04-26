from __future__ import annotations

import json
import sqlite3
from datetime import datetime
from pathlib import Path

from rules import get_race_defaults

APP_DIR = Path(__file__).resolve().parent
DATA_DIR = APP_DIR / "data"
DB_PATH = DATA_DIR / "story_app.sqlite3"

CHARACTER_COLUMNS = ["name", "race", "rank", "level", "str", "agi", "vit", "intelligence", "divinity", "notes"]


def utc_now() -> str:
    return datetime.utcnow().isoformat(timespec="seconds") + "Z"


class StoryStore:
    def __init__(self, db_path: Path | None = None) -> None:
        self.db_path = db_path or DB_PATH
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        self._initialize()

    def connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self.db_path)
        connection.row_factory = sqlite3.Row
        return connection

    def _initialize(self) -> None:
        with self.connect() as connection:
            connection.executescript(
                """
                CREATE TABLE IF NOT EXISTS characters (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    race TEXT NOT NULL,
                    rank TEXT NOT NULL,
                    level INTEGER NOT NULL DEFAULT 1,
                    str INTEGER NOT NULL DEFAULT 0,
                    agi INTEGER NOT NULL DEFAULT 0,
                    vit INTEGER NOT NULL DEFAULT 0,
                    intelligence INTEGER NOT NULL DEFAULT 0,
                    divinity INTEGER NOT NULL DEFAULT 0,
                    notes TEXT NOT NULL DEFAULT '',
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS skills (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    character_id INTEGER NOT NULL,
                    name TEXT NOT NULL,
                    rank TEXT NOT NULL,
                    description TEXT NOT NULL DEFAULT '',
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    FOREIGN KEY(character_id) REFERENCES characters(id) ON DELETE CASCADE
                );

                CREATE TABLE IF NOT EXISTS history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    character_id INTEGER NOT NULL,
                    kind TEXT NOT NULL,
                    summary TEXT NOT NULL,
                    before_json TEXT NOT NULL DEFAULT '{}',
                    after_json TEXT NOT NULL DEFAULT '{}',
                    created_at TEXT NOT NULL,
                    FOREIGN KEY(character_id) REFERENCES characters(id) ON DELETE CASCADE
                );
                """
            )
            self._seed_demo_character(connection)

    def _seed_demo_character(self, connection: sqlite3.Connection) -> None:
        cursor = connection.execute("SELECT COUNT(*) AS total FROM characters")
        if cursor.fetchone()["total"]:
            return

        defaults = get_race_defaults("mixed")
        now = utc_now()
        connection.execute(
            """
            INSERT INTO characters (name, race, rank, level, str, agi, vit, intelligence, divinity, notes, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                "Alok Aeonmorta",
                "mixed",
                "Divine",
                135,
                7449,
                9560,
                10020,
                18190,
                8420,
                "Seeded from the source notes for the first test character.",
                now,
                now,
            ),
        )
        character_id = connection.execute("SELECT last_insert_rowid() AS id").fetchone()["id"]
        sample_skills = [
            ("Regeneration (Divine)", "Divine", "Regenerates body from damage and poisons. Can restore the body even from a death state."),
            ("Incineration Beam", "Divine", "Shoots a beam of absolute flames that incinerate monsters caught."),
            ("Thunder's Judgement", "Divine", "Unleashes complete destruction across a massive area."),
            ("Soul Absorber", "Divine", "Absorb and store souls, gaining knowledge, skills, and essence."),
            ("Soul Rebirth", "Divine", "Transforms a soul and wipes its memories to grant a new beginning."),
            ("Sovereign of Eternal Legions", "Divine", "Rules undead and soul-bound familiars within the Eternal Legion."),
        ]
        for name, rank, description in sample_skills:
            self.add_skill(character_id, name, rank, description, connection=connection)
        self.log_history(
            character_id,
            "seed",
            "Seeded demo character Alok Aeonmorta",
            before={},
            after={"name": "Alok Aeonmorta", "race": "mixed", "rank": "Divine"},
            connection=connection,
        )
        _ = defaults

    def list_characters(self) -> list[dict]:
        with self.connect() as connection:
            rows = connection.execute(
                "SELECT * FROM characters ORDER BY level DESC, name ASC"
            ).fetchall()
            return [dict(row) for row in rows]

    def get_character(self, character_id: int) -> dict | None:
        with self.connect() as connection:
            row = connection.execute("SELECT * FROM characters WHERE id = ?", (character_id,)).fetchone()
            return dict(row) if row else None

    def create_character(self, payload: dict) -> int:
        now = utc_now()
        values = self._character_values(payload)
        with self.connect() as connection:
            cursor = connection.execute(
                """
                INSERT INTO characters (name, race, rank, level, str, agi, vit, intelligence, divinity, notes, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (*values, now, now),
            )
            character_id = cursor.lastrowid
            self.log_history(character_id, "character", f"Created character {payload.get('name', 'Unknown')}", before={}, after=payload, connection=connection)
            return character_id

    def update_character(self, character_id: int, payload: dict) -> None:
        current = self.get_character(character_id) or {}
        values = self._character_values(payload)
        now = utc_now()
        with self.connect() as connection:
            connection.execute(
                """
                UPDATE characters
                SET name = ?, race = ?, rank = ?, level = ?, str = ?, agi = ?, vit = ?, intelligence = ?, divinity = ?, notes = ?, updated_at = ?
                WHERE id = ?
                """,
                (*values, now, character_id),
            )
            self.log_history(character_id, "character", self._summarize_diff(current, payload), before=current, after=payload, connection=connection)

    def _character_values(self, payload: dict) -> tuple:
        return (
            payload.get("name", "Unnamed"),
            payload.get("race", "mixed"),
            payload.get("rank", "E"),
            int(payload.get("level", 1)),
            int(payload.get("str", 0)),
            int(payload.get("agi", 0)),
            int(payload.get("vit", 0)),
            int(payload.get("intelligence", 0)),
            int(payload.get("divinity", 0)),
            payload.get("notes", ""),
        )

    def list_skills(self, character_id: int) -> list[dict]:
        with self.connect() as connection:
            rows = connection.execute(
                "SELECT * FROM skills WHERE character_id = ? ORDER BY name ASC",
                (character_id,),
            ).fetchall()
            return [dict(row) for row in rows]

    def add_skill(self, character_id: int, name: str, rank: str, description: str, connection: sqlite3.Connection | None = None) -> int:
        now = utc_now()
        owned_connection = connection or self.connect()
        close_connection = connection is None
        try:
            cursor = owned_connection.execute(
                """
                INSERT INTO skills (character_id, name, rank, description, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (character_id, name, rank, description, now, now),
            )
            skill_id = cursor.lastrowid
            self.log_history(character_id, "skill", f"Added skill {name} ({rank})", before={}, after={"name": name, "rank": rank, "description": description}, connection=owned_connection)
            return skill_id
        finally:
            if close_connection:
                owned_connection.close()

    def update_skill(self, skill_id: int, name: str, rank: str, description: str) -> None:
        with self.connect() as connection:
            current = connection.execute("SELECT * FROM skills WHERE id = ?", (skill_id,)).fetchone()
            if not current:
                return
            connection.execute(
                "UPDATE skills SET name = ?, rank = ?, description = ?, updated_at = ? WHERE id = ?",
                (name, rank, description, utc_now(), skill_id),
            )
            self.log_history(current["character_id"], "skill", self._summarize_diff(dict(current), {"name": name, "rank": rank, "description": description}), before=dict(current), after={"name": name, "rank": rank, "description": description}, connection=connection)

    def delete_skill(self, skill_id: int) -> None:
        with self.connect() as connection:
            current = connection.execute("SELECT * FROM skills WHERE id = ?", (skill_id,)).fetchone()
            if not current:
                return
            connection.execute("DELETE FROM skills WHERE id = ?", (skill_id,))
            self.log_history(current["character_id"], "skill", f"Deleted skill {current['name']}", before=dict(current), after={}, connection=connection)

    def list_history(self, character_id: int) -> list[dict]:
        with self.connect() as connection:
            rows = connection.execute(
                "SELECT * FROM history WHERE character_id = ? ORDER BY created_at DESC, id DESC",
                (character_id,),
            ).fetchall()
            return [dict(row) for row in rows]

    def log_history(self, character_id: int, kind: str, summary: str, before: dict, after: dict, connection: sqlite3.Connection | None = None) -> None:
        owned_connection = connection or self.connect()
        close_connection = connection is None
        try:
            owned_connection.execute(
                """
                INSERT INTO history (character_id, kind, summary, before_json, after_json, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (character_id, kind, summary, json.dumps(before, ensure_ascii=False), json.dumps(after, ensure_ascii=False), utc_now()),
            )
        finally:
            if close_connection:
                owned_connection.close()

    def _summarize_diff(self, before: dict, after: dict) -> str:
        changes = []
        for field in CHARACTER_COLUMNS:
            if before.get(field) != after.get(field):
                changes.append(f"{field}: {before.get(field)} -> {after.get(field)}")
        return "; ".join(changes) if changes else "No visible changes"
