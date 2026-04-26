from __future__ import annotations

import json
import tkinter as tk
from tkinter import messagebox, simpledialog, ttk

from lore import ALOK_PROFILE, is_alok_profile
from rules import get_rank_gain, get_race_defaults, get_race_names, get_tier_benchmark, get_tier_for_level
from store import StoryStore

RANK_OPTIONS = ["E", "D", "C", "B", "A", "S", "SS-1", "SS-2", "SS-3", "Mythic-1", "Mythic-2", "Demi", "Divine"]
RACE_OPTIONS = ["human", "elf", "vampire", "dragonoid", "angel", "fairy", "valkyrie", "demon", "mixed"]
SKILL_RANKS = ["Rank D", "Rank C", "Rank B", "Rank A", "Rank S", "Divine"]


class App(ttk.Frame):
    def __init__(self, root: tk.Tk) -> None:
        super().__init__(root)
        self.root = root
        self.store = StoryStore()
        self.characters = []
        self.current_character_id: int | None = None
        self.current_skill_id: int | None = None
        self.character_lore = {}
        self.stat_tiles = {}
        self._build_style()
        self._build_layout()
        self.reload_characters()

    def _build_style(self) -> None:
        style = ttk.Style()
        style.theme_use("clam")
        base_bg = "#08111d"
        panel_bg = "#0d1726"
        accent = "#f59e0b"
        accent_alt = "#60a5fa"
        text = "#edf2f7"
        muted = "#9aa7b6"
        style.configure("TFrame", background=base_bg)
        style.configure("TLabel", background=base_bg, foreground=text)
        style.configure("Muted.TLabel", background=base_bg, foreground=muted)
        style.configure("Title.TLabel", background=base_bg, foreground=text)
        style.configure("Card.TFrame", background=panel_bg)
        style.configure("AccentCard.TFrame", background="#101f33")
        style.configure("TButton", padding=9, background=panel_bg, foreground=text)
        style.map("TButton", background=[("active", accent_alt)])
        style.configure("Treeview", rowheight=28, background="#0e1725", fieldbackground="#0e1725", foreground=text)
        style.configure("Treeview.Heading", background="#172337", foreground=text)
        style.configure("TLabelframe", background=base_bg, foreground=text)
        style.configure("TLabelframe.Label", background=base_bg, foreground=text)
        style.configure("TNotebook", background=base_bg, borderwidth=0)
        style.configure("TNotebook.Tab", padding=(16, 10), background="#132033", foreground=text)
        style.map("TNotebook.Tab", background=[("selected", "#24364e")], foreground=[("selected", "#ffffff")])
        self.root.configure(bg=base_bg)

    def _build_layout(self) -> None:
        self.pack(fill="both", expand=True)
        self.root.title("Story App")
        self.root.geometry("1420x900")
        self.root.minsize(1280, 840)

        header = ttk.Frame(self)
        header.pack(fill="x", padx=18, pady=(18, 10))
        header_left = ttk.Frame(header)
        header_left.pack(side="left", fill="x", expand=True)
        ttk.Label(header_left, text="Story App", style="Title.TLabel", font=("Segoe UI", 24, "bold")).pack(anchor="w")
        ttk.Label(header_left, text="Local character manager with stats, skills, history, and progression", style="Muted.TLabel", font=("Segoe UI", 10)).pack(anchor="w", pady=(2, 0))

        self.system_badge = ttk.Label(header, text="Idle", style="Title.TLabel", font=("Segoe UI", 11, "bold"), padding=(14, 8))
        self.system_badge.pack(side="right")

        body = ttk.Frame(self)
        body.pack(fill="both", expand=True, padx=16, pady=12)

        self.left_panel = ttk.Frame(body)
        self.left_panel.pack(side="left", fill="y", padx=(0, 12))
        self.left_panel.configure(width=280)

        self.character_list = tk.Listbox(self.left_panel, height=28, bg="#111827", fg="#e5e7eb", selectbackground="#2563eb", highlightthickness=0, relief="flat")
        self.character_list.pack(fill="both", expand=True)
        self.character_list.bind("<<ListboxSelect>>", self.on_character_select)

        button_row = ttk.Frame(self.left_panel)
        button_row.pack(fill="x", pady=(10, 0))
        ttk.Button(button_row, text="New Character", command=self.create_character).pack(fill="x", pady=(0, 6))
        ttk.Button(button_row, text="Save Character", command=self.save_character).pack(fill="x", pady=(0, 6))
        ttk.Button(button_row, text="Refresh", command=self.reload_characters).pack(fill="x")

        self.notebook = ttk.Notebook(body)
        self.notebook.pack(side="left", fill="both", expand=True)

        self.overview_tab = ttk.Frame(self.notebook)
        self.skills_tab = ttk.Frame(self.notebook)
        self.history_tab = ttk.Frame(self.notebook)
        self.progress_tab = ttk.Frame(self.notebook)
        self.notebook.add(self.overview_tab, text="Character Sheet")
        self.notebook.add(self.skills_tab, text="Skills")
        self.notebook.add(self.history_tab, text="History")
        self.notebook.add(self.progress_tab, text="Progression")

        self._build_overview_tab()
        self._build_skills_tab()
        self._build_history_tab()
        self._build_progress_tab()

    def _build_overview_tab(self) -> None:
        form = ttk.Frame(self.overview_tab)
        form.pack(fill="both", expand=True, padx=16, pady=16)

        top = ttk.Frame(form)
        top.pack(fill="both", expand=True)

        left = ttk.Frame(top, style="Card.TFrame")
        left.pack(side="left", fill="both", expand=True, padx=(0, 10))

        right = ttk.Frame(top, style="Card.TFrame")
        right.pack(side="left", fill="y", padx=(10, 0))
        right.configure(width=390)

        self.fields = {}
        labels = [
            ("name", "Name"),
            ("race", "Race"),
            ("rank", "Rank"),
            ("level", "Level"),
            ("str", "STR"),
            ("agi", "AGI"),
            ("vit", "VIT"),
            ("intelligence", "INT"),
            ("divinity", "Divinity"),
        ]

        form_grid = ttk.Frame(left)
        form_grid.pack(fill="x", padx=18, pady=16)
        ttk.Label(form_grid, text="Character Sheet", font=("Segoe UI", 16, "bold")).grid(row=0, column=0, columnspan=4, sticky="w", pady=(0, 12))
        for index, (field, label) in enumerate(labels):
            row = index // 2 + 1
            column = (index % 2) * 2
            ttk.Label(form_grid, text=label, style="Muted.TLabel").grid(row=row, column=column, sticky="w", padx=(0, 8), pady=7)
            if field == "race":
                widget = ttk.Combobox(form_grid, values=RACE_OPTIONS, state="readonly")
            elif field == "rank":
                widget = ttk.Combobox(form_grid, values=RANK_OPTIONS, state="readonly")
            else:
                widget = ttk.Entry(form_grid)
            widget.grid(row=row, column=column + 1, sticky="ew", padx=(0, 18), pady=7)
            self.fields[field] = widget

        form_grid.columnconfigure(1, weight=1)
        form_grid.columnconfigure(3, weight=1)

        ttk.Label(left, text="Notes", style="Muted.TLabel").pack(anchor="w", padx=18, pady=(0, 6))
        self.notes = tk.Text(left, height=10, bg="#0e1725", fg="#edf2f7", insertbackground="#edf2f7", relief="flat", wrap="word")
        self.notes.pack(fill="both", expand=True, padx=18, pady=(0, 18))

        ttk.Label(right, text="System Window", font=("Segoe UI", 15, "bold")).pack(anchor="w", padx=18, pady=(16, 12))

        self.hero_name = ttk.Label(right, text="No character selected", font=("Segoe UI", 15, "bold"), style="Title.TLabel")
        self.hero_name.pack(anchor="w", padx=18)
        self.hero_subtitle = ttk.Label(right, text="", style="Muted.TLabel")
        self.hero_subtitle.pack(anchor="w", padx=18, pady=(2, 0))

        stat_row = ttk.Frame(right)
        stat_row.pack(fill="x", padx=18, pady=(16, 10))
        for column, key in enumerate(["str", "agi", "vit", "intelligence", "divinity"]):
            tile = ttk.Frame(stat_row, style="AccentCard.TFrame")
            tile.grid(row=0, column=column, padx=(0, 8), sticky="nsew")
            stat_row.columnconfigure(column, weight=1)
            ttk.Label(tile, text=key.upper(), style="Muted.TLabel").pack(anchor="w", padx=12, pady=(10, 0))
            label = ttk.Label(tile, text="0", font=("Segoe UI", 14, "bold"), style="Title.TLabel")
            label.pack(anchor="w", padx=12, pady=(2, 10))
            self.stat_tiles[key] = label

        self.special_badge = ttk.Label(right, text="Canon profile inactive", style="Muted.TLabel", font=("Segoe UI", 10, "bold"))
        self.special_badge.pack(anchor="w", padx=18, pady=(6, 6))

        ttk.Label(right, text="Signature Archive", style="Muted.TLabel").pack(anchor="w", padx=18, pady=(8, 6))
        signature_wrap = ttk.Frame(right, style="Card.TFrame")
        signature_wrap.pack(fill="both", expand=True, padx=18, pady=(0, 18))
        signature_scroll = ttk.Scrollbar(signature_wrap, orient="vertical")
        signature_scroll.pack(side="right", fill="y")
        self.signature_text = tk.Text(signature_wrap, height=14, bg="#0e1725", fg="#edf2f7", insertbackground="#edf2f7", relief="flat", wrap="word", yscrollcommand=signature_scroll.set)
        self.signature_text.pack(side="left", fill="both", expand=True)
        signature_scroll.config(command=self.signature_text.yview)
        self.signature_text.configure(state="disabled")

    def _build_skills_tab(self) -> None:
        frame = ttk.Frame(self.skills_tab)
        frame.pack(fill="both", expand=True, padx=16, pady=16)

        columns = ("name", "rank", "description")
        self.skill_tree = ttk.Treeview(frame, columns=columns, show="headings", selectmode="browse")
        self.skill_tree.heading("name", text="Skill")
        self.skill_tree.heading("rank", text="Rank")
        self.skill_tree.heading("description", text="What it does")
        self.skill_tree.column("name", width=220)
        self.skill_tree.column("rank", width=120)
        self.skill_tree.column("description", width=560)
        self.skill_tree.pack(fill="both", expand=True)

        button_row = ttk.Frame(frame)
        button_row.pack(fill="x", pady=(12, 0))
        ttk.Button(button_row, text="Add Skill", command=self.add_skill).pack(side="left", padx=(0, 8))
        ttk.Button(button_row, text="Edit Skill", command=self.edit_skill).pack(side="left", padx=(0, 8))
        ttk.Button(button_row, text="Delete Skill", command=self.delete_skill).pack(side="left")

    def _build_history_tab(self) -> None:
        frame = ttk.Frame(self.history_tab)
        frame.pack(fill="both", expand=True, padx=16, pady=16)
        columns = ("date", "kind", "summary")
        self.history_tree = ttk.Treeview(frame, columns=columns, show="headings")
        self.history_tree.heading("date", text="Date")
        self.history_tree.heading("kind", text="Type")
        self.history_tree.heading("summary", text="What Changed")
        self.history_tree.column("date", width=180)
        self.history_tree.column("kind", width=100)
        self.history_tree.column("summary", width=760)
        self.history_tree.pack(fill="both", expand=True)

    def _build_progress_tab(self) -> None:
        frame = ttk.Frame(self.progress_tab)
        frame.pack(fill="both", expand=True, padx=16, pady=16)
        self.progress_title = ttk.Label(frame, text="Select a character to see progression details", font=("Segoe UI", 15, "bold"))
        self.progress_title.pack(anchor="w", pady=(0, 12))
        self.progress_summary = ttk.Label(frame, text="", justify="left")
        self.progress_summary.pack(anchor="w", pady=(0, 12))
        self.progress_text = tk.Text(frame, height=18, bg="#111827", fg="#e5e7eb", insertbackground="#e5e7eb", relief="flat", wrap="word")
        self.progress_text.pack(fill="both", expand=True)
        self.progress_text.insert("1.0", "This tab will show rank gains, tier benchmarks, and projected growth.")
        self.progress_text.configure(state="disabled")

    def reload_characters(self) -> None:
        self.characters = self.store.list_characters()
        self.character_list.delete(0, tk.END)
        for character in self.characters:
            label = f"{character['name']} | {character['race']} | Lv {character['level']} | {character['rank']}"
            self.character_list.insert(tk.END, label)
        if self.characters:
            self.character_list.selection_set(0)
            self.load_character(self.characters[0]["id"])
        else:
            self.current_character_id = None
            self._clear_form()

    def on_character_select(self, _event: tk.Event) -> None:
        selection = self.character_list.curselection()
        if not selection:
            return
        index = selection[0]
        if index < len(self.characters):
            self.load_character(self.characters[index]["id"])

    def load_character(self, character_id: int) -> None:
        character = self.store.get_character(character_id)
        if not character:
            return
        self.current_character_id = character_id
        self.current_skill_id = None
        self.system_badge.configure(text=f"Lv {character['level']} {character['rank']}")
        self._set_field("name", character["name"])
        self._set_field("race", character["race"])
        self._set_field("rank", character["rank"])
        self._set_field("level", character["level"])
        self._set_field("str", character["str"])
        self._set_field("agi", character["agi"])
        self._set_field("vit", character["vit"])
        self._set_field("intelligence", character["intelligence"])
        self._set_field("divinity", character["divinity"])
        self.notes.delete("1.0", tk.END)
        self.notes.insert("1.0", character.get("notes", ""))
        self.load_skills()
        self.load_history()
        self.refresh_progression()
        self.refresh_system_window(character)

    def _set_field(self, field: str, value) -> None:
        widget = self.fields[field]
        widget.delete(0, tk.END)
        widget.insert(0, str(value))

    def _clear_form(self) -> None:
        for field in self.fields:
            self._set_field(field, "")
        self.notes.delete("1.0", tk.END)
        self.skill_tree.delete(*self.skill_tree.get_children())
        self.history_tree.delete(*self.history_tree.get_children())
        self.hero_name.configure(text="No character selected")
        self.hero_subtitle.configure(text="")
        self.system_badge.configure(text="Idle")
        for label in self.stat_tiles.values():
            label.configure(text="0")
        self.progress_title.configure(text="No character selected")
        self._set_progress_text("")
        self._set_signature_text("")

    def _read_form(self) -> dict:
        return {
            "name": self.fields["name"].get().strip() or "Unnamed",
            "race": self.fields["race"].get().strip() or "mixed",
            "rank": self.fields["rank"].get().strip() or "E",
            "level": int(self.fields["level"].get() or 1),
            "str": int(self.fields["str"].get() or 0),
            "agi": int(self.fields["agi"].get() or 0),
            "vit": int(self.fields["vit"].get() or 0),
            "intelligence": int(self.fields["intelligence"].get() or 0),
            "divinity": int(self.fields["divinity"].get() or 0),
            "notes": self.notes.get("1.0", tk.END).strip(),
        }

    def create_character(self) -> None:
        defaults = get_race_defaults("human")
        payload = {
            "name": simpledialog.askstring("New Character", "Character name:", parent=self.root) or "New Character",
            "race": "human",
            "rank": "E",
            "level": 1,
            "str": defaults["str"],
            "agi": defaults["agi"],
            "vit": defaults["vit"],
            "intelligence": defaults["intelligence"],
            "divinity": defaults["divinity"],
            "notes": "",
        }
        character_id = self.store.create_character(payload)
        self.reload_characters()
        self.load_character(character_id)

    def save_character(self) -> None:
        if self.current_character_id is None:
            messagebox.showinfo("Story App", "Select or create a character first.")
            return
        payload = self._read_form()
        self.store.update_character(self.current_character_id, payload)
        self.reload_characters()
        self.load_character(self.current_character_id)

    def load_skills(self) -> None:
        self.skill_tree.delete(*self.skill_tree.get_children())
        if self.current_character_id is None:
            return
        for skill in self.store.list_skills(self.current_character_id):
            self.skill_tree.insert("", tk.END, iid=str(skill["id"]), values=(skill["name"], skill["rank"], skill["description"]))

    def load_history(self) -> None:
        self.history_tree.delete(*self.history_tree.get_children())
        if self.current_character_id is None:
            return
        for entry in self.store.list_history(self.current_character_id):
            self.history_tree.insert("", tk.END, values=(entry["created_at"], entry["kind"], entry["summary"]))

    def add_skill(self) -> None:
        if self.current_character_id is None:
            messagebox.showinfo("Story App", "Select a character first.")
            return
        dialog = SkillDialog(self.root, title="Add Skill")
        result = dialog.result
        if not result:
            return
        self.store.add_skill(self.current_character_id, result["name"], result["rank"], result["description"])
        self.load_skills()
        self.load_history()

    def edit_skill(self) -> None:
        if self.current_character_id is None:
            return
        selection = self.skill_tree.selection()
        if not selection:
            messagebox.showinfo("Story App", "Choose a skill to edit.")
            return
        skill_id = int(selection[0])
        skill = next((item for item in self.store.list_skills(self.current_character_id) if item["id"] == skill_id), None)
        if not skill:
            return
        dialog = SkillDialog(self.root, title="Edit Skill", initial=skill)
        result = dialog.result
        if not result:
            return
        self.store.update_skill(skill_id, result["name"], result["rank"], result["description"])
        self.load_skills()
        self.load_history()

    def delete_skill(self) -> None:
        if self.current_character_id is None:
            return
        selection = self.skill_tree.selection()
        if not selection:
            return
        skill_id = int(selection[0])
        if messagebox.askyesno("Story App", "Delete the selected skill?"):
            self.store.delete_skill(skill_id)
            self.load_skills()
            self.load_history()

    def refresh_progression(self) -> None:
        if self.current_character_id is None:
            self.progress_title.configure(text="No character selected")
            self._set_progress_text("")
            return
        character = self.store.get_character(self.current_character_id)
        if not character:
            return
        tier_name, tier_desc = get_tier_for_level(character["level"])
        gain = get_rank_gain(character["rank"])
        benchmark = get_tier_benchmark(character["level"])
        self.progress_title.configure(text=f"{character['name']} | {tier_name}")
        summary = (
            f"Race: {character['race']}\n"
            f"Rank: {character['rank']}\n"
            f"Level: {character['level']}\n"
            f"Attribute points gained per level: {gain}\n"
            f"Tier description: {tier_desc}\n"
            f"Benchmark at this tier level: physical {benchmark['physical']} | vitality {benchmark['vitality']} | intelligence {benchmark['intelligence']} | attribute points {benchmark['attribute_points']}"
        )
        self.progress_summary.configure(text=summary)
        lines = [
            "Race starting bias:",
            json.dumps(get_race_defaults(character["race"]), indent=2),
            "",
            "Manual awakening is kept separate for now.",
            "Tier progressions can be applied as a separate jump when you decide to record them.",
            "",
            f"Current stats: STR {character['str']}, AGI {character['agi']}, VIT {character['vit']}, INT {character['intelligence']}, Divinity {character['divinity']}",
        ]
        self._set_progress_text("\n".join(lines))

    def refresh_system_window(self, character: dict) -> None:
        total_power = character["str"] + character["agi"] + character["vit"] + character["intelligence"] + character["divinity"]
        self.hero_name.configure(text=character["name"])
        self.hero_subtitle.configure(text=f"{character['race']} • {character['rank']} • Level {character['level']} • Total power {total_power:,}")

        for key, value in (
            ("str", character["str"]),
            ("agi", character["agi"]),
            ("vit", character["vit"]),
            ("intelligence", character["intelligence"]),
            ("divinity", character["divinity"]),
        ):
            self.stat_tiles[key].configure(text=f"{value:,}")

        if is_alok_profile(character["name"]):
            self.special_badge.configure(text="Canon profile active: Alok is the main focus", foreground="#f8c36d")
            profile = ALOK_PROFILE
            sections = [
                f"Tower points: {profile['tower_points']:,}",
                f"Total INT: {profile['total_int']:,}",
                f"Affinity: {profile['affinity']} ({profile['affinity_note']})",
                "",
                "Divine abilities:",
            ]
            for ability in profile["divine_abilities"]:
                sections.append(f"- {ability['name']} [{ability['rank']}]\n  {ability['description']}")
            sections.extend([
                "",
                "Skill archive:",
            ])
            for skill in profile["skills"]:
                sections.append(f"- {skill['name']} [{skill['rank']}]\n  {skill['description']}")
            sections.extend([
                "",
                f"Titles: {', '.join(profile['titles'])}",
            ])
            self._set_signature_text("\n".join(sections))
        else:
            self.special_badge.configure(text="Standard profile", foreground="#9aa7b6")
            self._set_signature_text(
                "Use this panel for a curated character summary, signature skills, and canon notes.\n\n"
                "For special characters, this area can show the lore archive and unique powers."
            )

    def _set_progress_text(self, text: str) -> None:
        self.progress_text.configure(state="normal")
        self.progress_text.delete("1.0", tk.END)
        self.progress_text.insert("1.0", text)
        self.progress_text.configure(state="disabled")

    def _set_signature_text(self, text: str) -> None:
        self.signature_text.configure(state="normal")
        self.signature_text.delete("1.0", tk.END)
        self.signature_text.insert("1.0", text)
        self.signature_text.configure(state="disabled")


class SkillDialog:
    def __init__(self, parent: tk.Tk, title: str, initial: dict | None = None) -> None:
        self.result = None
        self.window = tk.Toplevel(parent)
        self.window.title(title)
        self.window.configure(bg="#0f172a")
        self.window.transient(parent)
        self.window.grab_set()
        self.window.resizable(False, False)

        frame = ttk.Frame(self.window)
        frame.pack(fill="both", expand=True, padx=16, pady=16)

        ttk.Label(frame, text="Skill Name").grid(row=0, column=0, sticky="w", pady=6)
        ttk.Label(frame, text="Rank").grid(row=1, column=0, sticky="w", pady=6)
        ttk.Label(frame, text="Description").grid(row=2, column=0, sticky="nw", pady=6)

        self.name = ttk.Entry(frame, width=40)
        self.rank = ttk.Combobox(frame, values=SKILL_RANKS, state="readonly", width=37)
        self.description = tk.Text(frame, width=46, height=8, bg="#111827", fg="#e5e7eb", insertbackground="#e5e7eb", relief="flat", wrap="word")

        self.name.grid(row=0, column=1, sticky="ew", pady=6)
        self.rank.grid(row=1, column=1, sticky="ew", pady=6)
        self.description.grid(row=2, column=1, sticky="ew", pady=6)

        action_row = ttk.Frame(frame)
        action_row.grid(row=3, column=0, columnspan=2, sticky="e", pady=(10, 0))
        ttk.Button(action_row, text="Cancel", command=self._cancel).pack(side="right", padx=(8, 0))
        ttk.Button(action_row, text="Save", command=self._save).pack(side="right")

        if initial:
            self.name.insert(0, initial.get("name", ""))
            self.rank.set(initial.get("rank", "Rank C"))
            self.description.insert("1.0", initial.get("description", ""))
        else:
            self.rank.set("Rank C")

        self.window.wait_window()

    def _save(self) -> None:
        self.result = {
            "name": self.name.get().strip() or "Unnamed Skill",
            "rank": self.rank.get().strip() or "Rank C",
            "description": self.description.get("1.0", tk.END).strip(),
        }
        self.window.destroy()

    def _cancel(self) -> None:
        self.window.destroy()


if __name__ == "__main__":
    root = tk.Tk()
    app = App(root)
    root.mainloop()
