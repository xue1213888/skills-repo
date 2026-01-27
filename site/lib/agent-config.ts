export type AgentConfig = {
  id: string;
  label: string;
  projectDir: string;
  globalDir: string;
};

export const DEFAULT_AGENT_CONFIGS: AgentConfig[] = [
  { id: "codex", label: "Codex", projectDir: ".codex/skills", globalDir: "~/.codex/skills" },
  { id: "claude", label: "Claude Code", projectDir: ".claude/skills", globalDir: "~/.claude/skills" },
  { id: "opencode", label: "OpenCode", projectDir: ".opencode/skills", globalDir: "~/.opencode/skills" },
  { id: "cursor", label: "Cursor", projectDir: ".cursor/skills", globalDir: "~/.cursor/skills" },
  { id: "antigravity", label: "Antigravity", projectDir: ".antigravity/skills", globalDir: "~/.antigravity/skills" }
];

