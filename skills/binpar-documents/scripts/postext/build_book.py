#!/usr/bin/env python3
"""BinPar Markdown (binpar-documents syntax) -> postext book folder.

Usage: build_book.py input.md -o book_dir [--pdf out.pdf] [--images pages_dir]

Postext does the pagination (keep-with-next headings, widows/orphans, table
splits with repeated header), so headings never strand at a page foot.
"""
import argparse
import json
import math
import re
import shutil
import struct
import subprocess
import sys
from pathlib import Path

SKILL = Path(__file__).resolve().parents[2]
ASSETS = SKILL / "assets"
CONFIG = ASSETS / "postext" / "config.json"

CALLOUTS = {
    "NOTE": ("note", "Nota"),
    "TIP": ("tip", "Recomendación"),
    "IMPORTANT": ("important", "Importante"),
    "WARNING": ("warning", "Atención"),
    "CAUTION": ("warning", "Atención"),
}
SPANISH_MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio",
                  "agosto", "septiembre", "octubre", "noviembre", "diciembre"]


def parse_frontmatter(text):
    meta = {}
    if text.startswith("---\n"):
        end = text.index("\n---", 4)
        for line in text[4:end].splitlines():
            m = re.match(r"^([A-Za-z_]+):\s*(.*)$", line)
            if m:
                v = m.group(2).strip()
                if len(v) >= 2 and v[0] == v[-1] and v[0] in "\"'":
                    v = v[1:-1]
                meta[m.group(1)] = v
        text = text[end + 4:].lstrip("\n")
    return meta, text


def attr(v):
    # attribute values cannot hold the quote or a closing brace
    return str(v).replace('"', "'").replace("}", ")")


LINK = re.compile(r"(?<!\[)\[((?:[^\[\]]|\[[^\]]*\])+)\]\((https?://[^)\s]+)\)")


def inline(s, cell=False):
    # ==x== -> teal mark band; links -> teal text (postext sets link text like body text).
    # Table cells ignore marks, so their links get a trailing arrow instead.
    s = re.sub(r"==(.+?)==", r':mark[\1]{style="mark"}', s)
    if cell:
        return LINK.sub("[\\1\u00a0\u2197](\\2)", s)
    return LINK.sub(r':mark[[\1](\2)]{style="link"}', s)


def split_row(line):
    line = line.strip()
    if line.startswith("|"):
        line = line[1:]
    if line.endswith("|"):
        line = line[:-1]
    return [c.strip() for c in re.split(r"(?<!\\)\|", line)]


def plain_len(s):
    s = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", s)
    return len(re.sub(r"[*_`]", "", s))


def table_resource(rid, lines):
    header = split_row(lines[0])
    seps = split_row(lines[1])
    aligns = []
    for s in seps:
        if s.startswith(":") and s.endswith(":"):
            aligns.append("center")
        elif s.endswith(":"):
            aligns.append("right")
        else:
            aligns.append("left")
    body = [split_row(l) for l in lines[2:]]
    n = len(header)
    body = [(r + [""] * n)[:n] for r in body]
    # weights: long prose columns get room, short code-like ones stay narrow
    widths = []
    for c in range(n):
        lens = [plain_len(header[c]) * 0.8] + [plain_len(r[c]) for r in body]
        avg = sum(lens) / len(lens)
        # longest word must fit unbroken, or cells hyphenate into "Con-fir-ma-do"
        longest = max(len(w) for cell in [header[c]] + [r[c] for r in body]
                      for w in re.sub(r"\]\([^)]*\)|[\[*_`]", " ", cell).split() or [""])
        weight = max(6.0, min(60.0, math.sqrt(max(lens)) * 3 + avg * 0.6))
        widths.append(round(max(weight, longest * 2.0), 1))
    rows = [[{"content": inline(h, True), "isHeader": True, "align": aligns[i]} for i, h in enumerate(header)]]
    for r in body:
        rows.append([{"content": inline(c, True), "align": aligns[i]} for i, c in enumerate(r)])
    return {
        "id": rid, "typeId": "cuadro", "kind": "table",
        "placement": {"position": "here", "span": "column"},
        "table": {"model": {"headerRowCount": 1, "columnWidths": widths, "rows": rows}},
    }


def image_size(path):
    # pixel size from PNG/JPEG headers (postext needs it; no Pillow dependency)
    b = path.read_bytes()
    if b[:8] == b"\x89PNG\r\n\x1a\n":
        return struct.unpack(">II", b[16:24])
    if b[:2] == b"\xff\xd8":
        i = 2
        while i < len(b):
            marker, seg = b[i + 1], struct.unpack(">H", b[i + 2:i + 4])[0]
            if marker in (0xC0, 0xC1, 0xC2):
                h, w = struct.unpack(">HH", b[i + 5:i + 9])
                return w, h
            i += 2 + seg
    raise ValueError(f"unsupported image (PNG/JPEG/SVG only): {path}")


class Figures:
    def __init__(self, src_dir, resources):
        self.src_dir, self.resources, self.files, self.n = src_dir, resources, {}, 0

    def add(self, caption="", alt="", path=None, svg=None):
        self.n += 1
        rid = f"f{self.n:02d}"
        res = {"id": rid, "typeId": "ilustracion", "altText": alt or caption or "Figura",
               "placement": {"position": "here", "span": "column"}}
        if caption:
            res["caption"] = inline(caption, True)
        if svg is not None:
            self.files[f"{rid}.svg"] = svg.encode()
            res.update(kind="svg", file=f"resources/{rid}.svg")
        else:
            src = Path(path.replace("{{assets}}", str(ASSETS)))
            src = src if src.is_absolute() else self.src_dir / src
            ext = src.suffix.lower()
            self.files[f"{rid}{ext}"] = src.read_bytes()
            res["file"] = f"resources/{rid}{ext}"
            if ext == ".svg":
                res["kind"] = "svg"
            else:
                w, h = image_size(src)
                res.update(kind="bitmap", width=w, height=h, resolution=300)
        self.resources.append(res)
        return ["", f'::resource{{id="{rid}"}}', ""]


def html_block(lines, i):
    # raw HTML runs until a blank line
    block = []
    while i < len(lines) and lines[i].strip():
        block.append(lines[i])
        i += 1
    return "\n".join(block), i


def strip_tags(h):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", h)).strip()


def convert_body(text, resources, short_title, figures):
    out, lines, i, tcount = [], text.splitlines(), 0, len(resources)
    after_h1 = False
    while i < len(lines):
        line = lines[i]
        s = line.strip()
        # GFM table
        if s.startswith("|") and i + 1 < len(lines) and re.match(r"^\|?\s*:?-{3,}", lines[i + 1].strip()):
            block = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                block.append(lines[i])
                i += 1
            tcount += 1
            rid = f"t{tcount:02d}"
            resources.append(table_resource(rid, block))
            out += ["", f'::resource{{id="{rid}"}}', ""]
            after_h1 = False
            continue
        # GitHub alert -> callout
        m = re.match(r"^>\s*\[!(\w+)\]\s*(.*)$", s)
        if m and m.group(1).upper() in CALLOUTS:
            ctype, default_title = CALLOUTS[m.group(1).upper()]
            title = m.group(2).strip() or default_title
            i += 1
            paras, cur = [], []
            while i < len(lines) and lines[i].strip().startswith(">"):
                t = re.sub(r"^\s*>\s?", "", lines[i])
                if t.strip():
                    cur.append(t.strip())
                elif cur:
                    paras.append(" ".join(cur))
                    cur = []
                i += 1
            if cur:
                paras.append(" ".join(cur))
            out += ["", f':::callout{{type="{ctype}" title="{attr(title)}"}}']
            for p in paras:
                out += [inline(p), ""]
            out += [":::", ""]
            after_h1 = False
            continue
        if re.match(r'^<div class="page-break"></div>$', s):
            out += ["", ":::pagebreak", ""]
            i += 1
            continue
        img = re.match(r"^!\[([^\]]*)\]\(([^)\s]+)(?:\s+\"([^\"]*)\")?\)$", s)
        if img:
            out += figures.add(caption=img.group(3) or "", alt=img.group(1), path=img.group(2))
            i += 1
            continue
        if s.startswith("<"):
            html, i = html_block(lines, i)
            svg = re.search(r"<svg[\s\S]*</svg>", html)
            src = re.search(r'<img[^>]*src="([^"]+)"', html)
            cap = re.search(r"<figcaption>([\s\S]*?)</figcaption>", html) or \
                re.search(r'class="chart-title">([\s\S]*?)</p>', html)
            caption = strip_tags(cap.group(1)) if cap else ""
            kpis = re.findall(r'class="kpi">\s*<b>([\s\S]*?)</b>\s*<span>([\s\S]*?)</span>', html)
            cards = re.findall(r'class="card">\s*<h4>([\s\S]*?)</h4>([\s\S]*?)</div>', html)
            if kpis:
                # KPI row -> two-column table (figure | meaning)
                tcount += 1
                rid = f"t{tcount:02d}"
                rows = ["| Cifra | Qué mide |", "|---|---|"] + \
                    [f"| **{strip_tags(v)}** | {strip_tags(t)} |" for v, t in kpis]
                resources.append(table_resource(rid, rows))
                out += ["", f'::resource{{id="{rid}"}}', ""]
            elif "signature" in html:
                sig = re.findall(r"<div><b>([\s\S]*?)</b>([\s\S]*?)</div>", html)
                tcount += 1
                rid = f"t{tcount:02d}"
                rows = ["| " + " | ".join(strip_tags(b) for b, _ in sig) + " |", "|" + "---|" * len(sig),
                        "| " + " | ".join("\u00a0" for _ in sig) + " |",
                        "| " + " | ".join(strip_tags(n) for _, n in sig) + " |"]
                resources.append(table_resource(rid, rows))
                out += ["", f'::resource{{id="{rid}"}}', ""]
            elif cards:
                for title, body in cards:
                    out += ["", f':::callout{{type="note" title="{attr(strip_tags(title))}"}}',
                            inline(strip_tags(body)), ":::", ""]
            elif svg:
                body = svg.group(0)
                if "xmlns=" not in body:
                    body = body.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"', 1)
                out += figures.add(caption=caption, svg=body)
            elif src:
                alt = re.search(r'alt="([^"]*)"', html)
                out += figures.add(caption=caption, alt=alt.group(1) if alt else "", path=src.group(1))
            else:
                print(f"warning: raw HTML dropped (postext has no equivalent): {strip_tags(html)[:70]}",
                      file=sys.stderr)
            after_h1 = False
            continue
        h = re.match(r"^(#{1,6})\s+(.*)$", line)
        if h:
            level, title = len(h.group(1)), h.group(2).strip()
            title = title.replace("==", "")
            if level == 1:
                out.append(f'# {title} {{short="{attr(short_title)}"}}')
                after_h1 = True
            else:
                out.append(f"{h.group(1)} {title}")
                after_h1 = False
            i += 1
            continue
        # first paragraph after a chapter title = lede
        if after_h1 and s and not s.startswith(("-", "*", "+", ">", ":::")) and not re.match(r"^\d+\.", s):
            para = []
            while i < len(lines) and lines[i].strip():
                para.append(lines[i].strip())
                i += 1
            out += [":::paragraphs{style=\"lede\"}", inline(" ".join(para)), ":::"]
            after_h1 = False
            continue
        if s:
            after_h1 = False
        out.append(inline(line))
        i += 1
    return "\n".join(out)


def inline_svg_classes(svg):
    # postext's SVG rasteriser ignores <style> class rules
    rules = dict(re.findall(r"\.(st\d+)\s*\{\s*fill:\s*([^;]+);", svg))
    for cls, fill in rules.items():
        svg = svg.replace(f'class="{cls}"', f'fill="{fill.strip()}"')
    return re.sub(r"<style>.*?</style>", "", svg, flags=re.S)


def split_chapters(body):
    chapters, cur = [], []
    for line in body.splitlines():
        if line.startswith("# ") and cur:
            chapters.append("\n".join(cur).strip() + "\n")
            cur = []
        cur.append(line)
    if cur:
        chapters.append("\n".join(cur).strip() + "\n")
    return chapters


def slug(s):
    s = re.sub(r"\{.*\}$", "", s).strip().lower()
    s = re.sub(r"[^a-z0-9áéíóúñü]+", "-", s)
    return s.strip("-")[:40] or "chapter"


def config_for(meta):
    config = json.loads(CONFIG.read_text())
    h1 = next(l for l in config["headings"]["levels"] if l["level"] == 1)
    if meta.get("numbered", "true") == "false":
        h1["numberingTemplate"] = ""
    if meta.get("chapter_breaks", "true") == "false":
        h1["breakBefore"] = {"enabled": False, "parity": "any"}
        h1["spanBreak"] = False
    return config


def build(src, out_dir):
    meta, text = parse_frontmatter(Path(src).read_text())
    raw_title = meta.get("title", "Documento")
    accent = ""
    m = re.search(r"==(.+?)==", raw_title)
    if m:
        accent = m.group(1).strip()
    title_main = re.sub(r"\s*==.+?==\s*", " ", raw_title).strip()
    full_title = raw_title.replace("==", "")
    short = meta.get("short_title", full_title)
    conf = meta.get("confidential", "")
    conf_label = "Confidencial" if conf.lower() == "true" else ("" if conf.lower() in ("", "false") else conf)

    resources = [
        {"id": "logo-dark", "typeId": "figure", "kind": "svg", "file": "resources/logo-dark.svg",
         "altText": "BinPar", "placement": {"position": "here"}},
        {"id": "isotipo", "typeId": "figure", "kind": "svg", "file": "resources/isotipo.svg",
         "altText": "BinPar", "placement": {"position": "here"}},
    ]
    figures = Figures(Path(src).resolve().parent, resources)
    body = convert_body(text, resources, short, figures)
    chapters_md = split_chapters(body)

    fm = ["---", f'title: "{full_title}"']
    if meta.get("subtitle"):
        fm.append(f'subtitle: "{meta["subtitle"]}"')
    fm += [f'author: "{meta.get("author", "BinPar")}"', f'publishDate: "{meta.get("date", "")}"', "---", ""]
    cover_attrs = {
        "eyebrow": meta.get("eyebrow", "Documento"), "accent": accent,
        "client": meta.get("client", ""), "version": meta.get("version", ""),
        "conf": conf_label,
    }
    cover = fm + [f"# {title_main} " + "{style=\"cover\" toc=\"false\" "
                  + " ".join(f'{k}="{attr(v)}"' for k, v in cover_attrs.items()) + "}", ""]
    files = [("00-portada", "\n".join(cover))]
    toc_mode = meta.get("toc", "auto")
    if toc_mode == "true" or (toc_mode == "auto" and len(chapters_md) >= 3):
        files.append(("01-indice", f'# Índice {{style="contents" toc="false" short="{attr(short)}"}}\n\n:::toc\n'))
    for n, ch in enumerate(chapters_md, start=1):
        files.append((f"{n + 1:02d}-{slug(ch.splitlines()[0][2:])}", ch))
    if meta.get("backcover", "true") != "false":
        contact = meta.get("contact", "binpar.com")
        files.append(("99-contraportada", f'# BinPar {{style="back" toc="false" contact="{attr(contact)}"}}\n'))

    out = Path(out_dir)
    if out.exists():
        shutil.rmtree(out)
    (out / "chapters" / "es").mkdir(parents=True)
    (out / "resources").mkdir()
    (out / "fonts").mkdir()
    for name, data in figures.files.items():
        (out / "resources" / name).write_bytes(data)
    for src_name, dst in (("binpar-logo-dark.svg", "logo-dark.svg"), ("binpar-isotipo-light.svg", "isotipo.svg")):
        (out / "resources" / dst).write_text(inline_svg_classes((ASSETS / "logos" / src_name).read_text()))
    fonts = {}
    for f in sorted((ASSETS / "fonts").glob("*.ttf")):
        shutil.copy(f, out / "fonts" / f.name)
        fam = "Plus Jakarta Sans" if f.name.startswith("PlusJakarta") else "Sora"
        w = int(re.search(r"(\d{3})", f.name).group(1))
        fonts.setdefault(fam, []).append(
            {"weight": w, "style": "italic" if "Italic" in f.name else "normal", "file": f"fonts/{f.name}"})
    chapters = []
    for name, md in files:
        p = out / "chapters" / "es" / f"{name}.md"
        p.write_text(md)
        first = next((l for l in md.splitlines() if l.startswith("# ")), name)
        chapters.append({"title": re.sub(r"\s*\{.*\}$", "", first[2:]), "file": f"chapters/es/{p.name}"})
    preset = {
        "version": 2, "configVersion": 19, "id": slug(Path(src).stem) or "binpar-doc",
        "name": full_title, "locale": "es", "locales": ["es"], "view": {"canvasScope": "book"},
        "chapters": chapters, "config": config_for(meta),
        "resources": resources,
        "fonts": [{"name": k, "variants": v} for k, v in fonts.items()],
    }
    (out / "preset.json").write_text(json.dumps(preset, ensure_ascii=False, indent=1))
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("input")
    ap.add_argument("-o", "--out", required=True, help="book folder to write")
    ap.add_argument("--pdf")
    ap.add_argument("--images", help="folder for one PNG per page")
    a = ap.parse_args()
    if not shutil.which("postext"):
        sys.exit("postext CLI not found: see SKILL.md › Requirements")
    book = build(a.input, a.out)
    subprocess.run(["postext", "check", str(book), "--offline", "-q"])
    if a.pdf:
        subprocess.run(["postext", "pdf", str(book), "-o", a.pdf, "--offline"], check=True)
    if a.images:
        Path(a.images).mkdir(parents=True, exist_ok=True)
        subprocess.run(["postext", "images", str(book), "-o", a.images, "--dpi", "80", "--offline"], check=True)


if __name__ == "__main__":
    main()
