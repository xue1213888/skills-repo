"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

// Map file extensions to language identifiers
const EXT_TO_LANG: Record<string, string> = {
  ".js": "javascript",
  ".jsx": "jsx",
  ".ts": "typescript",
  ".tsx": "tsx",
  ".py": "python",
  ".rb": "ruby",
  ".go": "go",
  ".rs": "rust",
  ".java": "java",
  ".c": "c",
  ".cpp": "cpp",
  ".h": "c",
  ".hpp": "cpp",
  ".cs": "csharp",
  ".php": "php",
  ".swift": "swift",
  ".kt": "kotlin",
  ".scala": "scala",
  ".sh": "bash",
  ".bash": "bash",
  ".zsh": "bash",
  ".fish": "bash",
  ".ps1": "powershell",
  ".sql": "sql",
  ".html": "html",
  ".htm": "html",
  ".xml": "xml",
  ".css": "css",
  ".scss": "scss",
  ".sass": "sass",
  ".less": "less",
  ".json": "json",
  ".yaml": "yaml",
  ".yml": "yaml",
  ".toml": "toml",
  ".ini": "ini",
  ".md": "markdown",
  ".mdx": "mdx",
  ".graphql": "graphql",
  ".gql": "graphql",
  ".dockerfile": "dockerfile",
  ".makefile": "makefile",
  ".cmake": "cmake",
  ".lua": "lua",
  ".r": "r",
  ".m": "objectivec",
  ".mm": "objectivec",
  ".pl": "perl",
  ".ex": "elixir",
  ".exs": "elixir",
  ".erl": "erlang",
  ".clj": "clojure",
  ".hs": "haskell",
  ".ml": "ocaml",
  ".fs": "fsharp",
  ".vue": "vue",
  ".svelte": "svelte",
};

// Custom theme based on oneDark with better contrast
const customTheme = {
  ...oneDark,
  'pre[class*="language-"]': {
    ...oneDark['pre[class*="language-"]'],
    background: "#0f172a",
    margin: 0,
    padding: "20px",
    borderRadius: "12px",
    fontSize: "13px",
    lineHeight: 1.6,
  },
  'code[class*="language-"]': {
    ...oneDark['code[class*="language-"]'],
    background: "transparent",
    fontSize: "13px",
    lineHeight: 1.6,
  },
};

export function getLanguageFromExt(ext: string): string {
  const normalized = ext.toLowerCase();
  return EXT_TO_LANG[normalized] || "text";
}

export function getLanguageFromFilename(filename: string): string {
  const ext = filename.includes(".") ? `.${filename.split(".").pop()?.toLowerCase()}` : "";
  return getLanguageFromExt(ext);
}

export function CodeBlock({
  code,
  language = "text",
  showLineNumbers = true,
}: {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
}) {
  return (
    <SyntaxHighlighter
      language={language}
      style={customTheme}
      showLineNumbers={showLineNumbers}
      wrapLines
      lineNumberStyle={{
        minWidth: "2.5em",
        paddingRight: "1em",
        color: "#64748b",
        userSelect: "none",
      }}
      customStyle={{
        margin: 0,
        borderRadius: "12px",
        background: "#0f172a",
      }}
    >
      {code}
    </SyntaxHighlighter>
  );
}

// For use in markdown rendering
export function MarkdownCodeBlock({
  inline,
  className,
  children,
  ...props
}: {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}) {
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "text";
  const code = String(children).replace(/\n$/, "");

  if (inline) {
    return (
      <code
        className={className}
        style={{
          background: "var(--color-accent-muted)",
          color: "var(--color-accent)",
          padding: "0.125rem 0.375rem",
          borderRadius: "6px",
          fontSize: "0.875em",
          fontFamily: "var(--font-mono)",
        }}
        {...props}
      >
        {children}
      </code>
    );
  }

  return (
    <CodeBlock code={code} language={language} showLineNumbers={code.split("\n").length > 3} />
  );
}
