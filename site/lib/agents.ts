import fs from "node:fs/promises";
import path from "node:path";

import { DEFAULT_AGENT_CONFIGS, type AgentConfig } from "@/lib/agent-config";

type AgentsFile = {
  specVersion?: number;
  agents?: unknown;
};

async function readJsonFile<T>(absPath: string): Promise<T> {
  const raw = await fs.readFile(absPath, "utf8");
  return JSON.parse(raw) as T;
}

async function tryReadJson<T>(absPath: string): Promise<T | null> {
  try {
    return await readJsonFile<T>(absPath);
  } catch {
    return null;
  }
}

function siteRoot() {
  return process.cwd();
}

function normalizeAgents(input: unknown): AgentConfig[] {
  if (!Array.isArray(input)) return [];
  const out: AgentConfig[] = [];

  const readString = (obj: unknown, key: string) => {
    if (!obj || typeof obj !== "object") return "";
    const v = (obj as Record<string, unknown>)[key];
    return typeof v === "string" ? v.trim() : "";
  };

  for (const a of input) {
    const id = readString(a, "id");
    const label = readString(a, "label");
    const projectDir = readString(a, "projectDir");
    const globalDir = readString(a, "globalDir");

    if (!id || !label || !projectDir || !globalDir) continue;
    out.push({ id, label, projectDir, globalDir });
  }

  return out;
}

export async function loadAgentConfigs(): Promise<AgentConfig[]> {
  // Prefer the site-local public artifact, fall back to repo-root config.
  const a = path.join(siteRoot(), "public", "registry", "agents.json");
  const b = path.join(siteRoot(), "..", "registry", "agents.json");

  const fromA = await tryReadJson<AgentsFile>(a);
  const parsedA = normalizeAgents(fromA?.agents);
  if (parsedA.length > 0) return parsedA;

  const fromB = await tryReadJson<AgentsFile>(b);
  const parsedB = normalizeAgents(fromB?.agents);
  if (parsedB.length > 0) return parsedB;

  return DEFAULT_AGENT_CONFIGS;
}
