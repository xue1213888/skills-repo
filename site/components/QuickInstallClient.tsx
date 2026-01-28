"use client";

import { CommandBlockClient } from "@/components/CommandBlockClient";

export function QuickInstallClient({
  skillId,
  sourceRepo,
}: {
  skillId: string;
  sourceRepo?: string;
  declaredAgents?: string[];
  agentConfigs?: unknown[];
}) {
  // Generate the installation command using skills.sh CLI
  // Format: npx skills add <repo-url> --skill <skill-id>
  const cmd = sourceRepo
    ? `npx skills add ${sourceRepo} --skill ${skillId}`
    : "# Source repository not configured";

  return <CommandBlockClient command={cmd} />;
}
