"use client";

import { useMemo, useState } from "react";

import { REPO_REF, REPO_SLUG } from "@/lib/config";
import { DEFAULT_AGENT_CONFIGS, type AgentConfig } from "@/lib/agent-config";

import { CommandBlockClient } from "@/components/CommandBlockClient";

type InstallScope = "project" | "global";

export function QuickInstallClient({
  skillId,
  declaredAgents,
  agentConfigs,
}: {
  skillId: string;
  declaredAgents?: string[];
  agentConfigs?: AgentConfig[];
}) {
  const agents = useMemo(() => (agentConfigs?.length ? agentConfigs : DEFAULT_AGENT_CONFIGS), [agentConfigs]);
  const declared = useMemo(() => new Set((declaredAgents ?? []).filter(Boolean)), [declaredAgents]);
  const defaultAgent = declaredAgents?.find((a) => agents.some((x) => x.id === a)) ?? agents[0]?.id ?? "codex";
  const [agent, setAgent] = useState(defaultAgent);
  const [scope, setScope] = useState<InstallScope>("project");

  const agentConfig = agents.find((a) => a.id === agent) ?? agents[0] ?? DEFAULT_AGENT_CONFIGS[0];
  const targetDir = scope === "project" ? agentConfig.projectDir : agentConfig.globalDir;

  // Generate the installation command
  const cmd = useMemo(() => {
    if (!REPO_SLUG) {
      return `# Registry URL not configured`;
    }

    // NPX method using GitHub
    const scopeFlag = scope === "global" ? " --scope global" : "";
    const refFlag = REPO_REF && REPO_REF !== "main" ? ` --ref ${REPO_REF}` : "";
    return `# Install ${skillId} to ${targetDir}
npx github:${REPO_SLUG} add ${skillId} --agent ${agent}${scopeFlag}${refFlag}`;
  }, [skillId, targetDir, agent, scope]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Agent selector */}
      <div>
        <label className="text-foreground" style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "8px" }}>
          Agent
        </label>
        <select
          value={agent}
          onChange={(e) => setAgent(e.target.value)}
          className="text-foreground bg-background-secondary border-border"
          style={{
            width: "100%",
            height: "40px",
            padding: "0 12px",
            borderRadius: "8px",
            border: "1px solid var(--color-border)",
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          {agents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.label}
              {declared.size > 0 && !declared.has(a.id) ? " (not declared)" : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Scope selector */}
      <div>
        <label className="text-foreground" style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "8px" }}>
          Scope
        </label>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            onClick={() => setScope("project")}
            className={scope === "project" ? "bg-accent" : "bg-background-secondary border-border"}
            style={{
              flex: 1,
              padding: "8px 12px",
              borderRadius: "8px",
              border: scope === "project" ? "none" : "1px solid var(--color-border)",
              color: scope === "project" ? "white" : "var(--color-text)",
              fontWeight: 500,
              fontSize: "14px",
              cursor: "pointer",
              transition: "all 150ms",
            }}
          >
            Project
          </button>
          <button
            type="button"
            onClick={() => setScope("global")}
            className={scope === "global" ? "bg-accent" : "bg-background-secondary border-border"}
            style={{
              flex: 1,
              padding: "8px 12px",
              borderRadius: "8px",
              border: scope === "global" ? "none" : "1px solid var(--color-border)",
              color: scope === "global" ? "white" : "var(--color-text)",
              fontWeight: 500,
              fontSize: "14px",
              cursor: "pointer",
              transition: "all 150ms",
            }}
          >
            Global
          </button>
        </div>
      </div>

      {/* Target directory display */}
      <div
        className="bg-background-secondary border-border"
        style={{
          padding: "12px",
          borderRadius: "8px",
          border: "1px solid var(--color-border)",
        }}
      >
        <div className="text-muted" style={{ fontSize: "12px", marginBottom: "4px" }}>
          Install to:
        </div>
        <code className="text-accent" style={{ fontSize: "13px", fontFamily: "var(--font-mono)" }}>
          {targetDir}/{skillId}
        </code>
      </div>

      {/* Install command */}
      <div>
        <label className="text-foreground" style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "8px" }}>
          Install Command
        </label>
        <CommandBlockClient command={cmd} />
      </div>

      {/* Note */}
      <p className="text-muted" style={{ fontSize: "12px", margin: 0, lineHeight: 1.5 }}>
        Uses{" "}
        <code className="text-accent" style={{ fontSize: "11px", padding: "1px 4px", borderRadius: "4px", backgroundColor: "var(--color-accent-muted)" }}>
          npx
        </code>{" "}
        to install directly from GitHub. No npm installation required. The{" "}
        <code className="text-accent" style={{ fontSize: "11px", padding: "1px 4px", borderRadius: "4px", backgroundColor: "var(--color-accent-muted)" }}>
          .x_skill.yaml
        </code>{" "}
        file is excluded (internal metadata).
      </p>
    </div>
  );
}
