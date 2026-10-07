/**
 * A small, safe markdown for the assistant's replies: paragraphs, **bold**, *italic*, `code`, code blocks, lists,
 * quotes, small headings and links. It produces a tree of plain data that the interface turns into elements; there is
 * no HTML anywhere in it, so nothing the model (or a visitor, through the model) writes can inject markup, and a link
 * is kept only if it is http(s), mailto, an anchor or a path on this site.
 *
 * It is written for text that arrives in pieces: a code block that has not been closed yet is still a code block, and
 * a mark that has not been closed yet stays as the characters it is until it is.
 */

export type Inline =
  | { t: "text"; v: string }
  | { t: "strong"; c: Inline[] }
  | { t: "em"; c: Inline[] }
  | { t: "code"; v: string }
  | { t: "link"; href: string; c: Inline[] }
  | { t: "br" };

export type Block =
  | { t: "p"; c: Inline[] }
  | { t: "h"; c: Inline[] }
  | { t: "ul"; items: Inline[][] }
  | { t: "ol"; items: Inline[][] }
  | { t: "quote"; c: Inline[] }
  | { t: "code"; lang: string; v: string };

/** The only kinds of address a link may have. */
export function safeHref(url: string): string | null {
  const u = url.trim();
  if (/^https?:\/\/[^\s]+$/i.test(u)) return u;
  if (/^mailto:[^\s]+$/i.test(u)) return u;
  if (/^#[\w-]+$/.test(u)) return u;
  if (/^\/(?!\/)[\w\-./?=&%#]*$/.test(u)) return u;
  return null;
}

const boundary = (ch: string | undefined) => ch === undefined || /[\s.,;:!?()[\]{}"'\-–—]/.test(ch);

export function parseInline(src: string): Inline[] {
  const out: Inline[] = [];
  let text = "";
  const flush = () => {
    if (text) {
      out.push({ t: "text", v: text });
      text = "";
    }
  };

  let i = 0;
  while (i < src.length) {
    const ch = src[i];

    if (ch === "`") {
      const end = src.indexOf("`", i + 1);
      if (end > i + 1) {
        flush();
        out.push({ t: "code", v: src.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }

    if (ch === "*" && src[i + 1] === "*") {
      const end = src.indexOf("**", i + 2);
      if (end > i + 2) {
        flush();
        out.push({ t: "strong", c: parseInline(src.slice(i + 2, end)) });
        i = end + 2;
        continue;
      }
    }

    if (ch === "*" && src[i + 1] !== undefined && src[i + 1] !== " " && src[i + 1] !== "*") {
      let end = i + 1;
      while (end < src.length) {
        end = src.indexOf("*", end);
        if (end === -1 || (src[end + 1] !== "*" && src[end - 1] !== "*" && src[end - 1] !== " ")) break;
        end += 1;
      }
      if (end > i + 1) {
        flush();
        out.push({ t: "em", c: parseInline(src.slice(i + 1, end)) });
        i = end + 1;
        continue;
      }
    }

    if (ch === "_" && boundary(src[i - 1]) && src[i + 1] !== undefined && src[i + 1] !== " " && src[i + 1] !== "_") {
      const end = src.indexOf("_", i + 1);
      if (end > i + 1 && boundary(src[end + 1]) && src[end - 1] !== " ") {
        flush();
        out.push({ t: "em", c: parseInline(src.slice(i + 1, end)) });
        i = end + 1;
        continue;
      }
    }

    if (ch === "[") {
      const m = /^\[([^\]\n]+)\]\(([^)\s]+)\)/.exec(src.slice(i));
      if (m) {
        const href = safeHref(m[2]);
        flush();
        if (href) out.push({ t: "link", href, c: parseInline(m[1]) });
        else out.push({ t: "text", v: m[1] });
        i += m[0].length;
        continue;
      }
    }

    if (ch === "h" && (src.startsWith("http://", i) || src.startsWith("https://", i)) && boundary(src[i - 1])) {
      const m = /^https?:\/\/[^\s<>]+/.exec(src.slice(i));
      if (m) {
        const url = m[0].replace(/[.,;:!?)\]]+$/, "");
        const href = safeHref(url);
        if (href) {
          flush();
          out.push({ t: "link", href, c: [{ t: "text", v: url }] });
          i += url.length;
          continue;
        }
      }
    }

    text += ch;
    i += 1;
  }
  flush();
  return out;
}

/** Lines of one paragraph, with a line break between them (a chat reply keeps the writer's line breaks). */
function paragraph(lines: string[]): Inline[] {
  const out: Inline[] = [];
  lines.forEach((line, n) => {
    if (n > 0) out.push({ t: "br" });
    out.push(...parseInline(line));
  });
  return out;
}

const FENCE = /^\s*```\s*([\w+#.-]*)\s*$/;
const BULLET = /^\s*[-*•]\s+(.*)$/;
const ORDERED = /^\s*\d+[.)]\s+(.*)$/;
const QUOTE = /^\s*>\s?(.*)$/;
const HEADING = /^\s*#{1,3}\s+(.*)$/;

export function parseMarkdown(src: string): Block[] {
  const lines = src.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i += 1;
      continue;
    }

    const fence = FENCE.exec(line);
    if (fence) {
      const body: string[] = [];
      i += 1;
      while (i < lines.length && !FENCE.test(lines[i])) {
        body.push(lines[i]);
        i += 1;
      }
      i += 1; // the closing fence, or the end of what has arrived so far
      blocks.push({ t: "code", lang: fence[1], v: body.join("\n") });
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      blocks.push({ t: "h", c: parseInline(heading[1]) });
      i += 1;
      continue;
    }

    if (BULLET.test(line) || ORDERED.test(line)) {
      const ordered = ORDERED.test(line) && !BULLET.test(line);
      const items: Inline[][] = [];
      while (i < lines.length) {
        const m = (ordered ? ORDERED : BULLET).exec(lines[i]);
        if (!m) break;
        items.push(parseInline(m[1]));
        i += 1;
      }
      blocks.push({ t: ordered ? "ol" : "ul", items });
      continue;
    }

    if (QUOTE.test(line)) {
      const quoted: string[] = [];
      while (i < lines.length && QUOTE.test(lines[i])) {
        quoted.push((QUOTE.exec(lines[i]) as RegExpExecArray)[1]);
        i += 1;
      }
      blocks.push({ t: "quote", c: paragraph(quoted) });
      continue;
    }

    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !FENCE.test(lines[i]) &&
      !HEADING.test(lines[i]) &&
      !BULLET.test(lines[i]) &&
      !ORDERED.test(lines[i]) &&
      !QUOTE.test(lines[i])
    ) {
      para.push(lines[i]);
      i += 1;
    }
    blocks.push({ t: "p", c: paragraph(para) });
  }

  return blocks;
}

const inlineText = (nodes: Inline[]): string =>
  nodes
    .map((n) => (n.t === "text" || n.t === "code" ? n.v : n.t === "br" ? "\n" : inlineText(n.c)))
    .join("");

/** The words of a reply without the marks, for reading aloud. Code blocks are skipped: they are not prose. */
export function plainText(src: string): string {
  return parseMarkdown(src)
    .map((b) => {
      switch (b.t) {
        case "code":
          return "";
        case "ul":
        case "ol":
          return b.items.map(inlineText).join(". ");
        default:
          return inlineText(b.c);
      }
    })
    .filter(Boolean)
    .join("\n")
    .trim();
}
