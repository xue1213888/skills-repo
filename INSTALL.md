# Skill Installation Guide

## Overview

This repository provides multiple ways to install agent skills to your local development environment.

## Installation Methods

### Method 1: NPX Command (Recommended)

The easiest way to install skills is using npx, which requires no setup:

```bash
# Option A: Use from GitHub directly (no npm install needed)
npx github:xue1213888/skills-repo add ui-ux-pro-max --agent claude --scope project

# Option B: Use from npm (after published)
npx aiskill add ui-ux-pro-max --agent claude --scope project

# List all available skills
npx github:xue1213888/skills-repo list

# Remove a skill
npx github:xue1213888/skills-repo remove ui-ux-pro-max --agent claude --scope project
```

**What it does:**
1. Automatically downloads the skill from the registry
2. Installs to the correct agent directory
3. Excludes internal metadata (`.x_skill.yaml`)
4. Works with any agent without configuration

**Available options:**
- `--agent`: Target agent (claude, codex, opencode, cursor, antigravity)
- `--scope`: Installation scope (project, global)

### Method 2: One-Line Install

For direct installation without npx, use this curl command:

**Example:**
```bash
# Install ui-ux-pro-max to Claude Code project skills
mkdir -p ".claude/skills/ui-ux-pro-max"
curl -sL "https://github.com/xue1213888/skills-repo/archive/refs/heads/main.tar.gz" | \
  tar -xz --strip-components=5 \
  "skills-repo-main/skills/design/ui-ux/ui-ux-pro-max" \
  --exclude=".x_skill.yaml" \
  -C ".claude/skills/ui-ux-pro-max/"
```

**What it does:**
1. Creates the target directory
2. Downloads the repository as a tarball
3. Extracts only the specific skill files
4. Excludes internal metadata (`.x_skill.yaml`)

**Supported Agents:**
- `claude` - Claude Code
- `codex` - Codex
- `opencode` - OpenCode
- `cursor` - Cursor
- `antigravity` - Antigravity

**Supported Scopes:**
- `project` - Install to `.agent/skills/` in current directory
- `global` - Install to `~/.agent/skills/` in home directory

### Method 3: Manual Installation

1. Navigate to the Skills Registry website
2. Browse or search for the skill you want
3. Click on the skill card to view details
4. Copy the install command from the skill detail page
5. Run the command in your terminal

## Directory Structure

Skills are installed in the following locations:

**Project Scope:**
```
your-project/
├── .claude/skills/
│   └── skill-name/
├── .codex/skills/
│   └── skill-name/
└── ...
```

**Global Scope:**
```
~/
├── .claude/skills/
│   └── skill-name/
├── .codex/skills/
│   └── skill-name/
└── ...
```

## What Gets Installed

When you install a skill, the following files are copied:
- `SKILL.md` - Skill documentation and instructions
- All supporting files (scripts, configs, templates, etc.)

The `.x_skill.yaml` file is **excluded** as it's internal metadata used only by the registry.

## Verification

After installation, verify the skill was installed correctly:

```bash
# Using npx
npx aiskill list

# Or check manually
ls -la .claude/skills/skill-name/
cat .claude/skills/skill-name/SKILL.md
```

## Troubleshooting

**Permission denied:**
```bash
# Make sure you have write permissions
chmod +w .claude/skills/
```

**Skill already exists:**
```bash
# Remove existing installation first
rm -rf .claude/skills/skill-name/
```

**Network issues:**
```bash
# Try with verbose output
curl -v "https://github.com/xue1213888/skills-repo/archive/refs/heads/main.tar.gz"
```

## Advanced Usage

### Using environment variables

```bash
# Set custom registry
export SKILL_REGISTRY_URL=https://github.com/your-org/your-skills-repo
npx aiskill add skill-name
```

### Install from a specific branch or commit

For direct curl method, replace 'main' with your branch/tag/commit:

```bash
# Replace 'main' with your branch/tag/commit
curl -sL "https://github.com/xue1213888/skills-repo/archive/refs/heads/develop.tar.gz" | \
  tar -xz --strip-components=5 \
  "skills-repo-develop/skills/design/ui-ux/ui-ux-pro-max" \
  --exclude=".x_skill.yaml" \
  -C ".claude/skills/ui-ux-pro-max/"
```

### Batch install multiple skills

```bash
# Install multiple skills at once
for skill in "skill-1" "skill-2" "skill-3"; do
  npx aiskill add "$skill" --agent claude --scope project
done
```

## Publishing to NPM

To publish the CLI tool to npm:

```bash
# Login to npm (first time only)
npm login

# Publish the package
npm publish

# After publishing, users can install directly
npx aiskill add <skill-name>
```

## Contributing

If you encounter issues with the installation process, please [open an issue](https://github.com/xue1213888/skills-repo/issues).
