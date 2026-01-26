"use client";

import { useState } from "react";

import { FilePreviewModal } from "./FilePreviewModal";
import type { FileMeta, FilePreview } from "./FilePreviewModal";

type FileTreeNode = {
  name: string;
  path: string;
  children: FileTreeNode[];
  isFile: boolean;
};

type SerializedFileMeta = {
  path: string;
  name: string;
  size: number;
  ext: string;
  githubUrl: string;
  preview: FilePreview;
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

function countFiles(node: FileTreeNode): number {
  if (node.isFile) return 1;
  let total = 0;
  for (const child of node.children) total += countFiles(child);
  return total;
}

function TreeNode({
  node,
  fileMeta,
  onFileClick
}: {
  node: FileTreeNode;
  fileMeta: Map<string, SerializedFileMeta>;
  onFileClick: (file: FileMeta) => void;
}) {
  if (!node.isFile) {
    return (
      <li className="my-1">
        <details open={false}>
          <summary className="cursor-pointer list-none flex items-center gap-2 px-2 py-1.5 rounded-lg min-w-0 hover:bg-card transition-colors">
            <svg className="w-4 h-4 text-muted shrink-0 transition-transform [details[open]>&]:rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
            <svg className="w-4 h-4 text-accent shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
            </svg>
            <span className="text-foreground font-medium min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
              {node.name}
            </span>
            <span className="ml-auto text-muted text-xs shrink-0">{countFiles(node)} files</span>
          </summary>
          <ul className="m-0 pl-5 list-none">
            {node.children.map((child) => (
              <TreeNode key={child.path} node={child} fileMeta={fileMeta} onFileClick={onFileClick} />
            ))}
          </ul>
        </details>
      </li>
    );
  }

  const meta = fileMeta.get(node.path);
  const size = meta?.size ?? 0;
  const isSkillMd = node.path === "SKILL.md";

  const handleClick = () => {
    if (meta && !isSkillMd) {
      onFileClick(meta);
    }
  };

  // Get file icon based on extension
  const getFileIcon = () => {
    const ext = meta?.ext?.toLowerCase() ?? "";
    if (ext === ".md") {
      return (
        <svg className="w-4 h-4 text-blue-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
        </svg>
      );
    }
    if (ext === ".csv") {
      return (
        <svg className="w-4 h-4 text-green-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <path d="M14 2v6h6M8 13h2M8 17h2M14 13h2M14 17h2" />
        </svg>
      );
    }
    if ([".js", ".ts", ".tsx", ".jsx", ".py", ".json", ".yaml", ".yml"].includes(ext)) {
      return (
        <svg className="w-4 h-4 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <path d="M14 2v6h6M10 12l-2 2 2 2M14 12l2 2-2 2" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4 text-muted shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 2v6h6" />
      </svg>
    );
  };

  if (isSkillMd) {
    return (
      <li className="my-1">
        <a
          href="#instructions"
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg min-w-0 hover:bg-card transition-colors group"
        >
          <div className="w-4" />
          {getFileIcon()}
          <span className="text-foreground min-w-0 overflow-hidden text-ellipsis whitespace-nowrap group-hover:text-accent transition-colors">
            {node.name}
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium text-accent bg-accent-muted ml-1">
            Instructions
          </span>
          <span className="ml-auto text-muted text-xs shrink-0">{formatBytes(size)}</span>
        </a>
      </li>
    );
  }

  return (
    <li className="my-1">
      <button
        onClick={handleClick}
        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg min-w-0 hover:bg-card transition-colors text-left group"
      >
        <div className="w-4" />
        {getFileIcon()}
        <span className="text-foreground min-w-0 overflow-hidden text-ellipsis whitespace-nowrap group-hover:text-accent transition-colors">
          {node.name}
        </span>
        <span className="ml-auto text-muted text-xs shrink-0">{formatBytes(size)}</span>
      </button>
    </li>
  );
}

export function FileTreeClient({
  tree,
  fileMeta
}: {
  tree: FileTreeNode[];
  fileMeta: SerializedFileMeta[];
}) {
  const [selectedFile, setSelectedFile] = useState<FileMeta | null>(null);

  const fileMetaMap = new Map(fileMeta.map((f) => [f.path, f]));

  return (
    <>
      <ul className="m-0 p-0 list-none font-mono text-sm">
        {tree.map((node) => (
          <TreeNode
            key={node.path}
            node={node}
            fileMeta={fileMetaMap}
            onFileClick={setSelectedFile}
          />
        ))}
      </ul>

      <FilePreviewModal file={selectedFile} onClose={() => setSelectedFile(null)} />
    </>
  );
}
