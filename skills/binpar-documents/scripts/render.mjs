#!/usr/bin/env node
// BinPar PDF renderer.
//   node render.mjs doc.md   [-o doc.pdf] [--preview dir] [--html doc.html]
//   node render.mjs page.html [-o page.pdf] [--preview dir]
// .md  → branded A4 document (cover, index, chapters, back cover) laid out by Paged.js.
// .html → free layout: brand fonts/tokens/components injected, printed with the page's own @page.
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, extname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { launchChrome } from "./lib/chrome.mjs";
import { escapeHtml, parseFrontmatter, renderInline, renderMarkdown } from "./lib/markdown.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ASSETS = resolve(HERE, "../assets");
const asset = (p) => pathToFileURL(join(ASSETS, p)).href;

function parseArgs(argv) {
  const args = { input: null, out: null, preview: null, html: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-o" || a === "--out") args.out = argv[++i];
    else if (a === "--preview") args.preview = argv[++i];
    else if (a === "--html") args.html = argv[++i];
    else if (a === "-h" || a === "--help") args.help = true;
    else if (!args.input) args.input = a;
    else throw new Error(`Unexpected argument: ${a}`);
  }
  return args;
}

// Inline CSS (Paged.js can't fetch file:// stylesheets); rebase font urls to absolute.
function css(name) {
  const file = join(ASSETS, "css", name);
  return readFileSync(file, "utf8").replace(/url\("\.\.\/([^"]+)"\)/g, (_, p) => `url("${asset(p)}")`);
}

// Footer right: current chapter + zero-padded page number ("CONTEXTO  05").
const PAGE_MARK = `
let chapter = "";
class PageMark extends Paged.Handler {
  afterPageLayout(page) {
    if (page.classList.contains("pagedjs_cover_page")) return;
    const h = page.querySelector("main h1 .t, .toc");
    if (h) chapter = h.classList.contains("toc") ? "Índice" : h.textContent.trim();
    const box = page.querySelector(".pagedjs_margin-bottom-right");
    if (!box) return;
    box.classList.add("hasContent");
    const n = String(page.dataset.pageNumber).padStart(2, "0");
    const mark = document.createElement("span");
    mark.className = "page-mark";
    mark.innerHTML = chapter.replace(/[&<>]/g, "") + "<b>" + n + "</b>";
    box.querySelector(".pagedjs_margin-content").appendChild(mark);
  }
}
// Split tables repeat their header on the next page.
class RepeatTableHeaders extends Paged.Handler {
  afterPageLayout(page, _p, _b, chunker) {
    for (const table of page.querySelectorAll("table[data-split-from]")) {
      const head = chunker.source.querySelector('[data-ref="' + table.dataset.ref + '"] thead');
      if (head && !table.querySelector("thead")) table.insertBefore(head.cloneNode(true), table.firstChild);
    }
  }
}
Paged.registerHandlers(PageMark, RepeatTableHeaders);`;

const spanishDate = () =>
  new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric" }).format(new Date());

function buildDocument(src, inputPath) {
  const { data, body: rawBody } = parseFrontmatter(src);
  let body = rawBody;
  let title = data.title;
  if (!title) {
    const m = body.match(/^#\s+(.+)\n?/m);
    if (!m) throw new Error("No title: add `title:` to the frontmatter or start with a `# H1`.");
    title = m[1].trim();
    body = body.replace(m[0], "");
  }

  const numbered = data.numbered !== false;
  const tocDepth = Number(data.toc_depth ?? 2);
  const { html, toc, warnings } = renderMarkdown(body, { numbered, tocDepth, chapterBreaks: data.chapter_breaks !== false });
  const chapters = toc.filter((e) => e.level === 1).length;
  const showToc = data.toc === true || (data.toc !== false && chapters >= 3);

  const titleHtml = renderInline(title) + (data.title_accent ? `<br><span class="accent">${renderInline(data.title_accent)}</span>` : "");
  const plainTitle = (data.short_title ?? `${title}${data.title_accent ? ` ${data.title_accent}` : ""}`).replace(/==/g, "");
  const coverTheme = data.cover === "light" ? "light" : "dark";
  const meta = [
    ["Cliente", data.client],
    ["Fecha", data.date ?? spanishDate()],
    ["Versión", data.version],
    ["Elaborado por", data.author ?? "BinPar"],
  ].filter(([, v]) => v);

  const cover = `
<section class="cover cover--${coverTheme}">
  <img class="cover-logo" src="${asset(`logos/binpar-logo-${coverTheme}.svg`)}" alt="BinPar">
  ${data.confidential ? `<span class="cover-flag">${escapeHtml(data.confidential === true ? "Confidencial" : data.confidential)}</span>` : ""}
  <div class="cover-main">
    <p class="eyebrow">${escapeHtml(data.eyebrow ?? data.type ?? "Documento")}</p>
    <h1 class="cover-title">${titleHtml}</h1>
    ${data.subtitle ? `<p class="cover-lede">${renderInline(data.subtitle)}</p>` : ""}
  </div>
  <dl class="cover-meta">${meta.map(([k, v]) => `<div><dt>${k}</dt><dd>${renderInline(v)}</dd></div>`).join("")}</dl>
</section>`;

  const tocHtml = showToc
    ? `
<nav class="toc">
  <p class="eyebrow">Contenido</p>
  <h2 class="doc-title" style="margin-top:6mm">Índice del <span class="accent">documento.</span></h2>
  <ol>${toc
    .filter((e) => e.level <= tocDepth)
    .map(
      (e) =>
        `<li class="l${e.level}"><a href="#${e.id}"><span class="n">${e.level === 1 ? e.num : ""}</span><span class="t">${escapeHtml(e.text)}</span></a></li>`
    )
    .join("")}</ol>
</nav>`
    : "";

  const back =
    data.backcover === false
      ? ""
      : `
<section class="backcover">
  <img src="${asset("logos/binpar-isotipo-dark.svg")}" alt="BinPar">
  <div class="site">${escapeHtml(data.contact ?? "binpar.com")}</div>
  <div class="legal">© ${new Date().getFullYear()} BinPar · Todos los derechos reservados</div>
</section>`;

  const footer = `<div class="footer-brand"><img src="${asset("logos/binpar-isotipo-light.svg")}" alt=""><span><b>BinPar</b> · ${escapeHtml(plainTitle)}</span></div>`;

  const doc = `<!doctype html>
<html lang="${escapeHtml(data.lang ?? "es")}">
<head>
<meta charset="utf-8">
<base href="${pathToFileURL(dirname(inputPath)).href}/">
<title>${escapeHtml(plainTitle)} · BinPar</title>
<style>${css("print-fonts.css")}</style>
<style>${css("tokens.css")}</style>
<style>${css("document.css")}</style>
<script>window.PagedConfig = { auto: true, after: () => { window.__binparDone = true; } };</script>
<script src="${pathToFileURL(join(HERE, "vendor/paged.polyfill.min.js")).href}"></script>
<script>${PAGE_MARK}</script>
</head>
<body>
${cover}
${tocHtml}
<main>
${footer}
${html}
</main>
${back}
</body>
</html>`;
  return { doc, warnings, title: plainTitle };
}

function wrapHtml(src, inputPath) {
  const inject = `<base href="${pathToFileURL(dirname(inputPath)).href}/">
<style>${css("print-fonts.css")}</style>
<style>${css("tokens.css")}</style>
<style>${css("components.css")}</style>`;
  if (/<head[^>]*>/i.test(src)) return src.replace(/<head[^>]*>/i, (m) => `${m}\n${inject}`);
  return `<!doctype html><html lang="es"><head><meta charset="utf-8">${inject}</head><body>${src}</body></html>`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.input) {
    console.log("Usage: node render.mjs <input.md|input.html> [-o out.pdf] [--preview dir] [--html out.html]");
    process.exit(args.help ? 0 : 1);
  }
  const input = resolve(args.input);
  const ext = extname(input).toLowerCase();
  const out = resolve(args.out ?? join(dirname(input), `${basename(input, ext)}.pdf`));
  // {{assets}} lets documents reference the bundled logos/icons/fonts.
  const src = readFileSync(input, "utf8").replaceAll("{{assets}}", pathToFileURL(ASSETS).href);
  const isMarkdown = ext === ".md" || ext === ".markdown";

  let html;
  if (isMarkdown) {
    const built = buildDocument(src, input);
    html = built.doc;
    if (built.warnings > 1) console.warn(`⚠ ${built.warnings} [!WARNING] callouts: yellow is for one element per document.`);
  } else {
    html = wrapHtml(src, input);
  }
  if (args.html) writeFileSync(resolve(args.html), html);

  const tmp = mkdtempSync(join(tmpdir(), "binpar-doc-"));
  const page_ = join(tmp, "index.html");
  writeFileSync(page_, html);

  const browser = await launchChrome();
  try {
    const page = await browser.newPage({ width: 1240, height: 1754 });
    await page.goto(pathToFileURL(page_).href);
    if (isMarkdown) await page.waitFor("window.__binparDone === true", 120000);
    const broken = await page.evaluate(
      "[...document.images].filter(i => !i.complete || !i.naturalWidth).map(i => i.getAttribute('src'))"
    );
    if (broken.length) console.warn(`⚠ Images not loaded: ${broken.join(", ")}`);
    if (page.errors.length) console.warn(`⚠ Page errors:\n  ${page.errors.join("\n  ")}`);

    const pdf = await page.pdf();
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, pdf);

    let pages = 0;
    if (args.preview) {
      const dir = resolve(args.preview);
      mkdirSync(dir, { recursive: true });
      const sel = isMarkdown ? ".pagedjs_page" : "body";
      const rects = await page.evaluate(
        `[...document.querySelectorAll(${JSON.stringify(sel)})].map(e => { const r = e.getBoundingClientRect(); return { x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height }; })`
      );
      pages = rects.length;
      for (const [i, clip] of rects.entries()) {
        writeFileSync(join(dir, `page-${String(i + 1).padStart(2, "0")}.png`), await page.screenshot({ clip }));
      }
    } else if (isMarkdown) {
      pages = await page.evaluate("document.querySelectorAll('.pagedjs_page').length");
    }
    console.log(`✓ ${out}${pages ? ` (${pages} pages)` : ""}${args.preview ? `\n  previews: ${resolve(args.preview)}` : ""}`);
  } finally {
    await browser.close();
    rmSync(tmp, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error(`✗ ${err.message}`);
  process.exit(1);
});
