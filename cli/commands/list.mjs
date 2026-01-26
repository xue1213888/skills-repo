import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_REGISTRY_URL = "https://github.com/xue1213888/skills-repo";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseArgs(args) {
  const result = {
    registry: process.env.SKILL_REGISTRY_URL || DEFAULT_REGISTRY_URL,
    format: 'table', // table or json
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--registry' && i + 1 < args.length) {
      result.registry = args[++i];
    } else if (arg === '--json') {
      result.format = 'json';
    } else if (arg === '--help' || arg === '-h') {
      return { help: true };
    }
  }

  return result;
}

function printHelp() {
  console.log(`
Usage: npx aiskill list [options]

List all available skills in the registry

Options:
  --registry <url>     Custom registry URL
                       Default: https://github.com/xue1213888/skills-repo
  --json               Output in JSON format
  --help, -h          Show this help message

Examples:
  npx aiskill list
  npx aiskill list --json
`);
}

async function fetchSkills(registry) {
  try {
    const registryUrl = registry.replace(/\.git$/, '');
    const indexUrl = `${registryUrl}/raw/main/registry/index.json`;

    const response = await fetch(indexUrl);
    if (!response.ok) {
      // Fallback to local file if fetch fails (for development)
      const localPath = path.resolve(__dirname, '../../registry/index.json');
      try {
        const content = await fs.readFile(localPath, 'utf-8');
        const index = JSON.parse(content);
        return index.skills || [];
      } catch (localErr) {
        throw new Error(`Failed to fetch registry: ${response.statusText}`);
      }
    }

    const index = await response.json();
    return index.skills || [];
  } catch (err) {
    // Try local fallback for network errors
    const localPath = path.resolve(__dirname, '../../registry/index.json');
    try {
      const content = await fs.readFile(localPath, 'utf-8');
      const index = JSON.parse(content);
      return index.skills || [];
    } catch (localErr) {
      throw new Error(`Failed to fetch skills: ${err.message}`);
    }
  }
}

function printTable(skills) {
  if (skills.length === 0) {
    console.log('No skills found in registry.');
    return;
  }

  console.log(`\n📚 Available Skills (${skills.length} total)\n`);

  // Group by category
  const byCategory = {};
  for (const skill of skills) {
    const cat = skill.category || 'uncategorized';
    if (!byCategory[cat]) {
      byCategory[cat] = [];
    }
    byCategory[cat].push(skill);
  }

  // Print each category
  for (const [category, categorySkills] of Object.entries(byCategory).sort()) {
    console.log(`\n${category.toUpperCase()}`);
    console.log('─'.repeat(60));

    for (const skill of categorySkills.sort((a, b) => a.id.localeCompare(b.id))) {
      const agents = skill.agents?.length > 0 ? ` [${skill.agents.join(', ')}]` : '';
      console.log(`  ${skill.id.padEnd(30)} ${skill.subcategory}${agents}`);
      if (skill.description) {
        const desc = skill.description.length > 80
          ? skill.description.slice(0, 77) + '...'
          : skill.description;
        console.log(`    ${desc}`);
      }
      console.log();
    }
  }

  console.log(`\nTo install a skill, run: npx aiskill add <skill-name>\n`);
}

export async function listCommand(args) {
  const parsed = parseArgs(args);

  if (parsed.help) {
    printHelp();
    return;
  }

  console.log('🔍 Fetching skills from registry...');
  const skills = await fetchSkills(parsed.registry);

  if (parsed.format === 'json') {
    console.log(JSON.stringify(skills, null, 2));
  } else {
    printTable(skills);
  }
}
