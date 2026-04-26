from __future__ import annotations

RANK_COLORS = {
    "E": {"base": "#1d2230", "panel": "#273041", "accent": "#7c8aa1", "accent_soft": "#3a4558", "glow": "#c7d2fe", "text": "#f5f7fb"},
    "D": {"base": "#16273a", "panel": "#20384f", "accent": "#4f8cc9", "accent_soft": "#2d5378", "glow": "#dbeafe", "text": "#f4f8fb"},
    "C": {"base": "#17312f", "panel": "#214542", "accent": "#50a7a1", "accent_soft": "#2d5d5a", "glow": "#d1fae5", "text": "#f2fbfa"},
    "B": {"base": "#2b2a14", "panel": "#3d3820", "accent": "#d4a02f", "accent_soft": "#6f5a1d", "glow": "#fde68a", "text": "#fffaf0"},
    "A": {"base": "#352047", "panel": "#4a2f67", "accent": "#b06cff", "accent_soft": "#6b3f94", "glow": "#e9d5ff", "text": "#fcf7ff"},
    "S": {"base": "#3d1e13", "panel": "#5a2f1f", "accent": "#ff8a3d", "accent_soft": "#8a4628", "glow": "#fed7aa", "text": "#fff9f4"},
    "SS-1": {"base": "#1f2c4d", "panel": "#2d416d", "accent": "#5db3ff", "accent_soft": "#355f94", "glow": "#bfdbfe", "text": "#f5faff"},
    "SS-2": {"base": "#1d2240", "panel": "#2b3360", "accent": "#7a84ff", "accent_soft": "#3e4f8a", "glow": "#c7d2fe", "text": "#f7f7ff"},
    "SS-3": {"base": "#3a1531", "panel": "#5a224d", "accent": "#ff6bc8", "accent_soft": "#8b356f", "glow": "#f9a8d4", "text": "#fff7fb"},
    "Mythic-1": {"base": "#311d36", "panel": "#482553", "accent": "#d96cff", "accent_soft": "#7a3d8d", "glow": "#f0abfc", "text": "#fcf6ff"},
    "Mythic-2": {"base": "#12364c", "panel": "#1b4f70", "accent": "#53d0ff", "accent_soft": "#27688f", "glow": "#bae6fd", "text": "#f1fbff"},
    "Demi": {"base": "#1c1a2c", "panel": "#2d2947", "accent": "#9c7bff", "accent_soft": "#52428c", "glow": "#ddd6fe", "text": "#faf7ff"},
    "Divine": {"base": "#1a1033", "panel": "#26164a", "accent": "#f5c85a", "accent_soft": "#4f2f77", "glow": "#fff0b8", "text": "#fffdf6"},
}

DEFAULT_RANK = "E"


def get_rank_colors(rank: str) -> dict[str, str]:
    return RANK_COLORS.get(rank, RANK_COLORS[DEFAULT_RANK])
