"use client";

import { useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";

export type FilePreview =
  | { kind: "skip"; reason: string }
  | { kind: "binary"; reason: string }
  | { kind: "text"; text: string; truncated: boolean }
  | { kind: "markdown"; text: string; truncated: boolean }
  | { kind: "csv"; headers: string[]; rows: string[][]; truncated: boolean };

export type FileMeta = {
  path: string;
  name: string;
  size: number;
  ext: string;
  githubUrl: string;
  preview: FilePreview;
};

const MARKDOWN_COMPONENTS: Components = {
  table({ node, ...props }) {
    void node;
    return (
      <div className="markdown-table-wrap">
        <table {...props} />
      </div>
    );
  }
};

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  const num = i === 0 ? `${Math.round(v)}` : v.toFixed(v >= 10 ? 1 : 2);
  return `${num} ${units[i]}`;
}

export function FilePreviewModal({
  file,
  onClose
}: {
  file: FileMeta | null;
  onClose: () => void;
}) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (file) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [file, handleKeyDown]);

  if (!file) return null;

  const preview = file.preview;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-border bg-background-secondary/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-accent-muted flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
              </svg>
            </div>
            <div className="min-w-0">
              <h3 className="font-heading font-semibold text-foreground truncate">{file.name}</h3>
              <div className="flex items-center gap-2 text-xs text-muted">
                <span>{file.path}</span>
                <span className="w-1 h-1 rounded-full bg-muted" />
                <span>{formatBytes(file.size)}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-muted hover:text-foreground hover:bg-card transition-colors shrink-0"
            aria-label="Close"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-5">
          {preview.kind === "skip" && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-background-secondary flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
              </div>
              <p className="text-secondary">{preview.reason}</p>
            </div>
          )}

          {preview.kind === "binary" && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-background-secondary flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <path d="M14 2v6h6" />
                </svg>
              </div>
              <p className="text-secondary">{preview.reason}</p>
            </div>
          )}

          {preview.kind === "csv" && (
            <div className="space-y-3">
              <div className="overflow-auto border border-border rounded-xl bg-background-secondary">
                <table className="w-full border-collapse font-mono text-sm">
                  <thead>
                    <tr>
                      {preview.headers.map((h, i) => (
                        <th
                          key={`h-${i}`}
                          className="sticky top-0 bg-card py-3 px-4 border-b border-border text-left whitespace-nowrap text-foreground font-medium"
                        >
                          {h || `col_${i + 1}`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.map((r, idx) => (
                      <tr key={`r-${idx}`} className="hover:bg-card/50 transition-colors">
                        {preview.headers.map((_, i) => (
                          <td
                            key={`r-${idx}-c-${i}`}
                            className="py-3 px-4 border-t border-border text-left whitespace-nowrap text-secondary"
                          >
                            {r[i] ?? ""}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {preview.truncated && (
                <p className="text-muted text-sm text-center">Preview truncated. View full file on GitHub.</p>
              )}
            </div>
          )}

          {preview.kind === "markdown" && (
            <div className="space-y-3">
              <article className="markdown prose-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={MARKDOWN_COMPONENTS}>
                  {preview.text}
                </ReactMarkdown>
              </article>
              {preview.truncated && (
                <p className="text-muted text-sm text-center">Preview truncated. View full file on GitHub.</p>
              )}
            </div>
          )}

          {preview.kind === "text" && (
            <div className="space-y-3">
              <pre className="overflow-auto bg-[#0f172a] text-[#e2e8f0] rounded-xl p-5 font-mono text-sm leading-relaxed">
                <code>{preview.text}</code>
              </pre>
              {preview.truncated && (
                <p className="text-muted text-sm text-center">Preview truncated. View full file on GitHub.</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-t border-border bg-background-secondary/50">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-xs font-mono text-muted bg-card border border-border">
              {file.ext || "file"}
            </span>
            {preview.kind !== "skip" && preview.kind !== "binary" && "truncated" in preview && preview.truncated && (
              <span className="px-2.5 py-1 rounded-md text-xs font-mono text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                Truncated
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {file.githubUrl && (
              <a
                href={file.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white font-medium text-sm hover:bg-accent-hover transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                </svg>
                View on GitHub
              </a>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-border bg-card text-foreground font-medium text-sm hover:border-border-hover transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
