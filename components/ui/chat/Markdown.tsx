"use client";

import { Fragment, memo, useRef, useState } from "react";
import { parseMarkdown, type Block, type Inline } from "@/lib/chat/markdown";

/**
 * Renders the assistant's reply from lib/chat/markdown.ts. It builds elements from plain data (never HTML), so a
 * reply cannot carry markup; a link opens in a new tab if it leaves the site and in place if it stays on it.
 */

function Inlines({ nodes }: { nodes: Inline[] }) {
  return (
    <>
      {nodes.map((n, i) => {
        switch (n.t) {
          case "text":
            return <Fragment key={i}>{n.v}</Fragment>;
          case "br":
            return <br key={i} />;
          case "strong":
            return (
              <strong key={i}>
                <Inlines nodes={n.c} />
              </strong>
            );
          case "em":
            return (
              <em key={i}>
                <Inlines nodes={n.c} />
              </em>
            );
          case "code":
            return <code key={i}>{n.v}</code>;
          case "link": {
            const external = /^https?:/i.test(n.href);
            return (
              <a key={i} href={n.href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                <Inlines nodes={n.c} />
              </a>
            );
          }
        }
      })}
    </>
  );
}

function CodeBlock({ lang, value, copyLabel, copiedLabel }: { lang: string; value: string; copyLabel: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number>(0);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1400);
    } catch {
      // no clipboard permission: the text is still selectable
    }
  };
  return (
    <figure className="ai-code">
      <figcaption>
        <span>{lang || "code"}</span>
        <button type="button" onClick={copy} data-copied={copied ? "" : undefined} aria-label={copied ? copiedLabel : copyLabel}>
          {copied ? copiedLabel : copyLabel}
        </button>
      </figcaption>
      <pre tabIndex={0}>
        <code>{value}</code>
      </pre>
    </figure>
  );
}

function BlockView({ block, copyLabel, copiedLabel }: { block: Block; copyLabel: string; copiedLabel: string }) {
  switch (block.t) {
    case "p":
      return (
        <p>
          <Inlines nodes={block.c} />
        </p>
      );
    case "h":
      return (
        <h4>
          <Inlines nodes={block.c} />
        </h4>
      );
    case "quote":
      return (
        <blockquote>
          <Inlines nodes={block.c} />
        </blockquote>
      );
    case "ul":
    case "ol": {
      const List = block.t;
      return (
        <List>
          {block.items.map((item, i) => (
            <li key={i}>
              <Inlines nodes={item} />
            </li>
          ))}
        </List>
      );
    }
    case "code":
      return <CodeBlock lang={block.lang} value={block.v} copyLabel={copyLabel} copiedLabel={copiedLabel} />;
  }
}

function Markdown({ text, copyLabel, copiedLabel }: { text: string; copyLabel: string; copiedLabel: string }) {
  const blocks = parseMarkdown(text);
  return (
    <>
      {blocks.map((b, i) => (
        <BlockView key={i} block={b} copyLabel={copyLabel} copiedLabel={copiedLabel} />
      ))}
    </>
  );
}

export default memo(Markdown);
