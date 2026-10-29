// Markdown → document HTML: numbered chapters, TOC entries, two-tone ==accent==, alert callouts.
import { Marked } from "../vendor/marked.esm.js";

export function parseFrontmatter(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { data: {}, body: src };
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    let v = kv[2].trim();
    if (/^(["']).*\1$/.test(v)) v = v.slice(1, -1);
    else if (v === "true" || v === "false") v = v === "true";
    data[kv[1]] = v;
  }
  return { data, body: src.slice(m[0].length) };
}

export const escapeHtml = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

const stripTags = (html) =>
  html
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

const slugify = (s) =>
  stripTags(s)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "section";

const ALERTS = {
  NOTE: ["note", "Nota"],
  TIP: ["note", "Recomendación"],
  IMPORTANT: ["important", "Importante"],
  WARNING: ["warning", "Atención"],
  CAUTION: ["warning", "Atención"],
};

const accent = {
  name: "accent",
  level: "inline",
  start: (src) => src.indexOf("=="),
  tokenizer(src) {
    const m = /^==(?=\S)([\s\S]*?\S)==/.exec(src);
    if (m) return { type: "accent", raw: m[0], tokens: this.lexer.inlineTokens(m[1]) };
  },
  renderer(token) {
    return `<span class="accent">${this.parser.parseInline(token.tokens)}</span>`;
  },
};

// Inline-only render, for cover titles and metadata.
export function renderInline(md) {
  return new Marked({ extensions: [accent] }).parseInline(String(md ?? ""));
}

export function renderMarkdown(md, { numbered = true, tocDepth = 2, chapterBreaks = true } = {}) {
  const toc = [];
  const seen = new Map();
  let chapter = 0;
  let warnings = 0;

  const marked = new Marked({ gfm: true });
  marked.use({
    extensions: [accent],
    renderer: {
      heading({ tokens, depth }) {
        const inner = this.parser.parseInline(tokens);
        let id = slugify(inner);
        const n = seen.get(id) ?? 0;
        seen.set(id, n + 1);
        if (n) id += `-${n + 1}`;
        const text = stripTags(inner).trim();
        if (depth === 1) {
          chapter += 1;
          const num = String(chapter).padStart(2, "0");
          toc.push({ level: 1, id, text, num: numbered ? num : "" });
          const numHtml = numbered ? `<span class="num">${num}</span>` : "";
          const cls = chapterBreaks ? "" : ' class="flow"';
          return `<h1 id="${id}"${cls}>${numHtml}<span class="t">${inner}</span></h1>\n`;
        }
        if (depth <= tocDepth) toc.push({ level: depth, id, text });
        return `<h${depth} id="${id}">${inner}</h${depth}>\n`;
      },
      blockquote({ tokens }) {
        const body = this.parser.parse(tokens);
        const m = body.match(/^<p>\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*([^\n<]*)\n?/);
        if (!m) return `<blockquote>\n${body}</blockquote>\n`;
        const [kind, label] = ALERTS[m[1]];
        if (kind === "warning") warnings += 1;
        const title = m[2].trim() || label;
        const rest = body.slice(m[0].length).replace(/^<\/p>\n?/, "");
        const content = rest.startsWith("<") || !rest.trim() ? rest : `<p>${rest}`;
        return `<div class="callout callout--${kind}"><div class="callout-title">${title}</div>${content}</div>\n`;
      },
    },
  });

  const html = marked.parse(md);
  return { html, toc, warnings };
}
