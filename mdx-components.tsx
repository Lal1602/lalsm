import type { MDXComponents } from "mdx/types";
import Link from "next/link";

/**
 * Global MDX element mapping. Blog posts get their look from the .blog-prose
 * rules in blog.css; this file only swaps plain anchors for next/link and keeps
 * external links safe.
 */
const components: MDXComponents = {
  a: ({ href = "", children, ...rest }) => {
    const isExternal = /^https?:\/\//.test(href);
    if (isExternal) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} {...rest}>
        {children}
      </Link>
    );
  },
};

export function useMDXComponents(): MDXComponents {
  return components;
}
