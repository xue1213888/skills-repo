import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Agent configurations
const AGENTS = {
  claude: {
    label: "Claude Code",
    projectDir: ".claude/skills",
    globalDir: path.join(os.homedir(), ".claude/skills"),
  },
  codex: {
    label: "Codex",
    projectDir: ".codex/skills",
    globalDir: path.join(os.homedir(), ".codex/skills"),
  },
  opencode: {
    label: "OpenCode",
    projectDir: ".opencode/skills",
    globalDir: path.join(os.homedir(), ".opencode/skills"),
  },
  cursor: {
    label: "Cursor",
    projectDir: ".cursor/skills",
    globalDir: path.join(os.homedir(), ".cursor/skills"),
  },
  antigravity: {
    label: "Antigravity",
    projectDir: ".antigravity/skills",
    globalDir: path.join(os.homedir(), ".antigravity/skills"),
  },
};

const DEFAULT_REGISTRY_URL = "https://github.com/xue1213888/skills-repo";

function parseArgs(args) {
  const result = {
    skillName: null,
    agent: "claude",
    scope: "project",
    registry: process.env.SKILL_REGISTRY_URL || DEFAULT_REGISTRY_URL,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--agent' && i + 1 < args.length) {
      result.agent = args[++i];
    } else if (arg === '--scope' && i + 1 < args.length) {
      result.scope = args[++i];
    } else if (arg === '--registry' && i + 1 < args.length) {
      result.registry = args[++i];
    } else if (arg === '--help' || arg === '-h') {
      return { help: true };
    } else if (!arg.startsWith('-')) {
      result.skillName = arg;
    }
  }

  return result;
}

function printHelp() {
  console.log(`
Usage: npx aiskill add <skill-name> [options]

Install a skill from the registry

Arguments:
  <skill-name>         Name of the skill to install

Options:
  --agent <name>       Target agent (claude, codex, opencode, cursor, antigravity)
                       Default: claude
  --scope <scope>      Installation scope (project, global)
                       Default: project
  --registry <url>     Custom registry URL
                       Default: https://github.com/xue1213888/skills-repo
  --help, -h          Show this help message

Examples:
  npx aiskill add ui-ux-pro-max
  npx aiskill add ui-ux-pro-max --agent codex --scope global
`);
}

async function fetchSkillMetadata(registry, skillName) {
  try {
    // Fetch registry index to find skill location
    const registryUrl = registry.replace(/\.git$/, '');
    const indexUrl = `${registryUrl}/raw/main/registry/index.json`;

    const response = await fetch(indexUrl);
    if (!response.ok) {
      // Fallback to local file if fetch fails (for development)
      const localPath = path.resolve(__dirname, '../../registry/index.json');
      try {
        const content = await fs.readFile(localPath, 'utf-8');
        const index = JSON.parse(content);
        const skill = index.skills?.find(s => s.id === skillName);

        if (!skill) {
          throw new Error(`Skill "${skillName}" not found in registry`);
        }

        return skill;
      } catch (localErr) {
        throw new Error(`Failed to fetch registry index: ${response.statusText}`);
      }
    }

    const index = await response.json();
    const skill = index.skills?.find(s => s.id === skillName);

    if (!skill) {
      throw new Error(`Skill "${skillName}" not found in registry`);
    }

    return skill;
  } catch (err) {
    // Try local fallback for network errors
    const localPath = path.resolve(__dirname, '../../registry/index.json');
    try {
      const content = await fs.readFile(localPath, 'utf-8');
      const index = JSON.parse(content);
      const skill = index.skills?.find(s => s.id === skillName);

      if (!skill) {
        throw new Error(`Skill "${skillName}" not found in registry`);
      }

      return skill;
    } catch (localErr) {
      throw new Error(`Failed to fetch skill metadata: ${err.message}`);
    }
  }
}

async function installSkill(skillName, agent, scope, registry) {
  // Validate agent
  const agentConfig = AGENTS[agent];
  if (!agentConfig) {
    throw new Error(`Unknown agent "${agent}". Valid options: ${Object.keys(AGENTS).join(', ')}`);
  }

  // Validate scope
  if (scope !== 'project' && scope !== 'global') {
    throw new Error(`Invalid scope "${scope}". Valid options: project, global`);
  }

  console.log(`\n📦 Installing skill: ${skillName}`);
  console.log(`   Agent: ${agentConfig.label}`);
  console.log(`   Scope: ${scope}\n`);

  // Fetch skill metadata
  console.log('🔍 Fetching skill metadata...');
  const skill = await fetchSkillMetadata(registry, skillName);
  console.log(`   Found: ${skill.title}`);
  console.log(`   Category: ${skill.category}/${skill.subcategory}\n`);

  // Determine target directory
  const targetBaseDir = scope === 'project' ? agentConfig.projectDir : agentConfig.globalDir;
  const targetDir = path.join(targetBaseDir, skillName);

  // Check if skill already exists
  try {
    await fs.access(targetDir);
    console.log(`⚠️  Skill already exists at: ${targetDir}`);
    console.log('   Please remove it first or choose a different location.\n');
    process.exit(1);
  } catch {
    // Directory doesn't exist, proceed with installation
  }

  // Extract repo slug from registry URL
  const repoMatch = registry.match(/github\.com\/([^/]+\/[^/]+)/);
  if (!repoMatch) {
    throw new Error('Invalid registry URL format. Expected GitHub repository URL.');
  }
  const repoSlug = repoMatch[1].replace(/\.git$/, '');

  // Build installation command
  const skillPath = skill.repoPath;
  const pathParts = skillPath.split('/').filter(Boolean);
  const stripComponents = pathParts.length + 1; // +1 for repo root directory in tarball

  const tarballUrl = `${registry.replace(/\.git$/, '')}/archive/refs/heads/main.tar.gz`;
  const tarPath = `${repoSlug.replace('/', '-')}-main/${skillPath}`;

  console.log('📥 Downloading skill files...');

  // Create target directory
  await fs.mkdir(targetDir, { recursive: true });

  // Download and extract using curl + tar
  const command = `curl -sL "${tarballUrl}" | tar -xz --strip-components=${stripComponents} "${tarPath}" --exclude=".x_skill.yaml" -C "${targetDir}/"`;

  try {
    const { stderr } = await execAsync(command);
    if (stderr) {
      console.warn(`   Warning: ${stderr}`);
    }
  } catch (err) {
    // Clean up on failure
    await fs.rm(targetDir, { recursive: true, force: true });
    throw new Error(`Failed to download skill: ${err.message}`);
  }

  // Verify installation
  const files = await fs.readdir(targetDir);
  if (files.length === 0) {
    await fs.rm(targetDir, { recursive: true, force: true });
    throw new Error('Installation failed: No files were extracted');
  }

  console.log(`\n✅ Successfully installed skill to: ${targetDir}`);
  console.log(`   Files: ${files.length} files\n`);

  // Check for SKILL.md
  if (files.includes('SKILL.md')) {
    console.log('📖 To view instructions, run:');
    console.log(`   cat "${path.join(targetDir, 'SKILL.md')}"\n`);
  }
}

export async function addCommand(args) {
  const parsed = parseArgs(args);

  if (parsed.help) {
    printHelp();
    return;
  }

  if (!parsed.skillName) {
    console.error('Error: Missing required argument <skill-name>');
    console.error('Run "npx aiskill add --help" for usage information');
    process.exit(1);
  }

  await installSkill(parsed.skillName, parsed.agent, parsed.scope, parsed.registry);
}
