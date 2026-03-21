import type { Components } from "react-markdown";

export const summaryMarkdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="text-2xl font-semibold leading-tight text-[var(--text-h)]">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl font-semibold leading-tight text-[var(--text-h)]">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg font-semibold leading-tight text-[var(--text-h)]">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="text-sm leading-7 text-foreground">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-[var(--text-h)]">{children}</strong>
  ),
  ul: ({ children }) => (
    <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-foreground">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal space-y-2 pl-5 text-sm leading-7 text-foreground">
      {children}
    </ol>
  ),
  li: ({ children }) => <li>{children}</li>,
};
