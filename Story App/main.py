from __future__ import annotations

import json
import tkinter as tk
from tkinter import messagebox, simpledialog, ttk

from lore import ALOK_PROFILE, is_alok_profile
from rank_colors import get_rank_colors
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
        self.system_mode = "status"
        self.palette = get_rank_colors("E")
        self._build_style()
        self._build_layout()
        self.reload_characters()

    def _build_style(self) -> None:
        style = ttk.Style()
        style.theme_use("clam")
        base_bg = self.palette["base"]
        panel_bg = self.palette["panel"]
        accent = self.palette["accent"]
        accent_soft = self.palette["accent_soft"]
        text = self.palette["text"]
        muted = "#a8b6c6"
        style.configure("TFrame", background=base_bg)
        style.configure("TLabel", background=base_bg, foreground=text)
        style.configure("Muted.TLabel", background=base_bg, foreground=muted)
        style.configure("Title.TLabel", background=base_bg, foreground=text)
        style.configure("Card.TFrame", background=panel_bg)
        style.configure("AccentCard.TFrame", background=accent_soft)
        style.configure("TButton", padding=9, background=panel_bg, foreground=text)
        style.map("TButton", background=[("active", accent_soft)])
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
        self._style_badge(self.system_badge, self.palette["panel"], self.palette["accent"], self.palette["text"])

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
        right.pack(side="left", fill="both", padx=(10, 0))
        right.configure(width=460)

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

        self.system_shell = ttk.Frame(right, style="Card.TFrame")
        self.system_shell.place(relx=0.5, rely=0.5, anchor="center", relwidth=0.92, relheight=0.93)

        self.system_header = ttk.Frame(self.system_shell, style="Card.TFrame")
        self.system_header.pack(fill="x", padx=16, pady=(16, 8))
        ttk.Label(self.system_header, text="STATUS", font=("Segoe UI", 26, "bold")).pack(anchor="center")

        self.system_name = ttk.Label(self.system_header, text="No character selected", font=("Segoe UI", 16, "bold"), style="Title.TLabel")
        self.system_name.pack(anchor="center", pady=(4, 0))
        self.system_meta = ttk.Label(self.system_header, text="", style="Muted.TLabel", justify="center")
        self.system_meta.pack(anchor="center", pady=(2, 0))

        self.system_button_row = ttk.Frame(self.system_shell, style="Card.TFrame")
        self.system_button_row.pack(fill="x", padx=16, pady=(6, 10))
        self.status_button = ttk.Button(self.system_button_row, text="Status", command=lambda: self.set_system_mode("status"))
        self.skills_button = ttk.Button(self.system_button_row, text="Skills", command=lambda: self.set_system_mode("skills"))
        self.status_button.pack(side="left", padx=(0, 8))
        self.skills_button.pack(side="left")

        self.system_content = ttk.Frame(self.system_shell, style="Card.TFrame")
        self.system_content.pack(fill="both", expand=True, padx=16, pady=(0, 16))
        self.system_content.grid_columnconfigure(0, weight=1)

        self.status_view = ttk.Frame(self.system_content, style="Card.TFrame")
        self.status_view.grid(row=0, column=0, sticky="nsew")

        self.skills_view = ttk.Frame(self.system_content, style="Card.TFrame")
        self.skills_view.grid(row=0, column=0, sticky="nsew")

        self._build_status_view()
        self._build_skills_view()
        self.set_system_mode("status")

    def _build_status_view(self) -> None:
        self.hero_name = ttk.Label(self.status_view, text="No character selected", font=("Segoe UI", 15, "bold"), style="Title.TLabel")
        self.hero_name.pack(anchor="w", pady=(0, 2))
        self.hero_subtitle = ttk.Label(self.status_view, text="", style="Muted.TLabel")
        self.hero_subtitle.pack(anchor="w", pady=(0, 8))

        summary_strip = ttk.Frame(self.status_view, style="Card.TFrame")
        summary_strip.pack(fill="x", pady=(4, 12))

        self.summary_fields = {}
        summary_labels = ["Name", "Level", "Job", "Fatigue", "Title", "HP", "MP", "Remaining Points"]
        for index, field in enumerate(summary_labels):
            tile = ttk.Frame(summary_strip, style="AccentCard.TFrame")
            tile.grid(row=index // 2, column=index % 2, sticky="nsew", padx=6, pady=6)
            ttk.Label(tile, text=field.upper(), style="Muted.TLabel", font=("Segoe UI", 8, "bold")).pack(anchor="w", padx=12, pady=(10, 0))
            label = ttk.Label(tile, text="-", font=("Segoe UI", 13, "bold"), style="Title.TLabel")
            label.pack(anchor="w", padx=12, pady=(2, 10))
            self.summary_fields[field.lower().replace(" ", "_")] = label

        summary_strip.columnconfigure(0, weight=1)
        summary_strip.columnconfigure(1, weight=1)

        stat_row = ttk.Frame(self.status_view, style="Card.TFrame")
        stat_row.pack(fill="x", pady=(8, 12))
        for column, key in enumerate(["str", "agi", "vit", "intelligence", "divinity"]):
            tile = ttk.Frame(stat_row, style="AccentCard.TFrame")
            tile.grid(row=0, column=column, padx=6, sticky="nsew")
            stat_row.columnconfigure(column, weight=1)
            ttk.Label(tile, text=key.upper(), style="Muted.TLabel", font=("Segoe UI", 8, "bold")).pack(anchor="w", padx=12, pady=(10, 0))
            label = ttk.Label(tile, text="0", font=("Segoe UI", 14, "bold"), style="Title.TLabel")
            label.pack(anchor="w", padx=12, pady=(2, 10))
            self.stat_tiles[key] = label

        self.special_badge = ttk.Label(self.status_view, text="Canon profile inactive", style="Muted.TLabel", font=("Segoe UI", 10, "bold"))
        self.special_badge.pack(anchor="w", pady=(4, 6))

        ttk.Label(self.status_view, text="Signature Archive", style="Muted.TLabel").pack(anchor="w", pady=(6, 6))
        signature_wrap = ttk.Frame(self.status_view, style="Card.TFrame")
        signature_wrap.pack(fill="both", expand=True)
        signature_scroll = ttk.Scrollbar(signature_wrap, orient="vertical")
        signature_scroll.pack(side="right", fill="y")
        self.signature_text = tk.Text(signature_wrap, height=14, bg="#0e1725", fg="#edf2f7", insertbackground="#edf2f7", relief="flat", wrap="word", yscrollcommand=signature_scroll.set)
        self.signature_text.pack(side="left", fill="both", expand=True)
        signature_scroll.config(command=self.signature_text.yview)
        self.signature_text.configure(state="disabled")

    def _build_skills_view(self) -> None:
        ttk.Label(self.skills_view, text="SKILLS", font=("Segoe UI", 22, "bold")).pack(anchor="center", pady=(6, 8))
        ttk.Label(self.skills_view, text="Press Skills to inspect the current character's full skill list.", style="Muted.TLabel").pack(anchor="center", pady=(0, 10))

        skills_wrap = ttk.Frame(self.skills_view, style="Card.TFrame")
        skills_wrap.pack(fill="both", expand=True)
        skills_scroll = ttk.Scrollbar(skills_wrap, orient="vertical")
        skills_scroll.pack(side="right", fill="y")

        self.skills_text = tk.Text(skills_wrap, bg="#0e1725", fg="#edf2f7", insertbackground="#edf2f7", relief="flat", wrap="word", yscrollcommand=skills_scroll.set)
        self.skills_text.pack(side="left", fill="both", expand=True)
        skills_scroll.config(command=self.skills_text.yview)
        self.skills_text.configure(state="disabled")

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
        self.apply_rank_theme(character["rank"])
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

        title = "Eternal Legion Sovereign" if is_alok_profile(character["name"]) else character["rank"]
        fatigue = max(0, 100 - min(100, character["level"] // 2))
        hp = character["vit"] * 25 + character["str"] * 8
        mp = character["intelligence"] * 25 + character["divinity"] * 4
        remaining_points = 0

        self.summary_fields["name"].configure(text=character["name"])
        self.summary_fields["level"].configure(text=str(character["level"]))
        self.summary_fields["job"].configure(text=character["rank"])
        self.summary_fields["fatigue"].configure(text=str(fatigue))
        self.summary_fields["title"].configure(text=title)
        self.summary_fields["hp"].configure(text=f"{hp:,}")
        self.summary_fields["mp"].configure(text=f"{mp:,}")
        self.summary_fields["remaining_points"].configure(text=str(remaining_points))

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

        self._render_skill_view(character)

    def _render_skill_view(self, character: dict) -> None:
        skills = self.store.list_skills(character["id"])
        if is_alok_profile(character["name"]):
            display_lines = [
                f"{ALOK_PROFILE['name']} - Divine archive",
                "",
                "Skills:",
            ]
            for skill in skills:
                display_lines.append(f"- {skill['name']} [{skill['rank']}]")
                display_lines.append(f"  {skill['description']}")
                display_lines.append("")
            display_lines.extend([
                "Divine abilities:",
            ])
            for ability in ALOK_PROFILE["divine_abilities"]:
                display_lines.append(f"- {ability['name']} [{ability['rank']}]")
                display_lines.append(f"  {ability['description']}")
                display_lines.append("")
        else:
            display_lines = [
                f"{character['name']} - Skill archive",
                "",
            ]
            if skills:
                for skill in skills:
                    display_lines.append(f"- {skill['name']} [{skill['rank']}] : {skill['description']}")
            else:
                display_lines.append("No skills saved yet.")
        self._set_skills_text("\n".join(display_lines))

    def set_system_mode(self, mode: str) -> None:
        self.system_mode = mode
        if mode == "skills":
            self.status_view.grid_remove()
            self.skills_view.grid()
            self.skills_button.state(["pressed"])
            self.status_button.state(["!pressed"])
        else:
            self.skills_view.grid_remove()
            self.status_view.grid()
            self.status_button.state(["pressed"])
            self.skills_button.state(["!pressed"])

    def apply_rank_theme(self, rank: str) -> None:
        self.palette = get_rank_colors(rank)
        style = ttk.Style()
        base_bg = self.palette["base"]
        panel_bg = self.palette["panel"]
        accent = self.palette["accent"]
        accent_soft = self.palette["accent_soft"]
        text = self.palette["text"]
        style.configure("TFrame", background=base_bg)
        style.configure("TLabel", background=base_bg, foreground=text)
        style.configure("Muted.TLabel", background=base_bg, foreground="#b5c3d3")
        style.configure("Title.TLabel", background=base_bg, foreground=text)
        style.configure("Card.TFrame", background=panel_bg)
        style.configure("AccentCard.TFrame", background=accent_soft)
        style.configure("Treeview", rowheight=28, background=panel_bg, fieldbackground=panel_bg, foreground=text)
        style.configure("Treeview.Heading", background=accent_soft, foreground=text)
        style.configure("TNotebook", background=base_bg, borderwidth=0)
        style.configure("TNotebook.Tab", padding=(16, 10), background=panel_bg, foreground=text)
        style.map("TNotebook.Tab", background=[("selected", accent_soft)], foreground=[("selected", "#ffffff")])
        self.root.configure(bg=base_bg)
        self._style_badge(self.system_badge, panel_bg, accent, text)
        self._style_panel_text(self.hero_name, text)
        self._style_panel_text(self.hero_subtitle, "#d7e0ec")
        self._style_panel_text(self.progress_title, text)
        self._style_panel_text(self.progress_summary, "#d7e0ec")
        self._style_panel_text(self.special_badge, accent)

    def _style_badge(self, widget: ttk.Label, background: str, foreground: str, text_color: str) -> None:
        widget.configure(background=background, foreground=foreground)
        widget.configure(style="Title.TLabel")

    def _style_panel_text(self, widget: ttk.Label, foreground: str) -> None:
        widget.configure(foreground=foreground)

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

    def _set_skills_text(self, text: str) -> None:
        self.skills_text.configure(state="normal")
        self.skills_text.delete("1.0", tk.END)
        self.skills_text.insert("1.0", text)
        self.skills_text.configure(state="disabled")


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
