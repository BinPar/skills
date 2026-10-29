"""Static instances of the brand variable fonts for binpar-documents.

Chrome embeds variable fonts in PDFs as Type 3; static TTFs embed as TrueType,
which prints and previews cleanly. Usage: python tools/make-static-fonts.py  (needs fonttools)
"""
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "skills/binpar-brand-design-system/assets/fonts"
OUT = ROOT / "skills/binpar-documents/assets/fonts"
OUT.mkdir(parents=True, exist_ok=True)

JOBS = [
    ("Sora-Variable.ttf", "Sora", (600, 700, 800)),
    ("PlusJakartaSans-Variable.ttf", "PlusJakartaSans", (400, 500, 600, 700)),
    ("PlusJakartaSans-Italic-Variable.ttf", "PlusJakartaSans-Italic", (400, 600)),
]

for src, family, weights in JOBS:
    for w in weights:
        font = TTFont(SRC / src)
        static = instantiateVariableFont(font, {"wght": w}, updateFontNames=True)
        static.save(OUT / f"{family}-{w}.ttf")
        print(f"{family}-{w}.ttf")
