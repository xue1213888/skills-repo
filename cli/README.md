# aiskill CLI

Command-line tool for installing and managing AI agent skills.

## Installation

No installation required! Use with npx directly from GitHub:

```bash
# Use from GitHub (no npm install needed)
npx github:xue1213888/skills-repo <command> [options]

# Or if published to npm
npx aiskill <command> [options]
```

## Commands

### add - Install a skill

```bash
npx aiskill add <skill-name> [options]
```

**Options:**
- `--agent <name>` - Target agent (claude, codex, opencode, cursor, antigravity). Default: claude
- `--scope <scope>` - Installation scope (project, global). Default: project
- `--registry <url>` - Custom registry URL

**Examples:**
```bash
# From GitHub
npx github:xue1213888/skills-repo add ui-ux-pro-max

# Install to Codex globally
npx github:xue1213888/skills-repo add ui-ux-pro-max --agent codex --scope global

# Install from custom registry
npx github:xue1213888/skills-repo add ui-ux-pro-max --registry https://github.com/your-org/your-repo
```

### list - List available skills

```bash
npx aiskill list [options]
```

**Options:**
- `--registry <url>` - Custom registry URL
- `--json` - Output in JSON format

**Examples:**
```bash
# List all skills
npx aiskill list

# Output as JSON
npx aiskill list --json
```

### remove - Remove an installed skill

```bash
npx aiskill remove <skill-name> [options]
```

**Options:**
- `--agent <name>` - Target agent. Default: claude
- `--scope <scope>` - Installation scope. Default: project

**Examples:**
```bash
# Remove from Claude Code (project)
npx aiskill remove ui-ux-pro-max

# Remove from Codex globally
npx aiskill remove ui-ux-pro-max --agent codex --scope global
```

## Supported Agents

- **Claude Code** - `.claude/skills/`
- **Codex** - `.codex/skills/`
- **OpenCode** - `.opencode/skills/`
- **Cursor** - `.cursor/skills/`
- **Antigravity** - `.antigravity/skills/`

## Installation Scopes

- **project** - Installs to agent's skills directory in current project (`.agent/skills/`)
- **global** - Installs to agent's skills directory in home directory (`~/.agent/skills/`)

## Environment Variables

- `SKILL_REGISTRY_URL` - Custom registry URL (default: https://github.com/xue1213888/skills-repo)

## Publishing

To publish this package to npm:

```bash
# Update version in package.json
npm version patch|minor|major

# Publish to npm
npm publish

# Users can now use
npx aiskill add <skill-name>
```

## Development

```bash
# Run locally
node cli/index.mjs add ui-ux-pro-max --agent claude

# Make executable
chmod +x cli/index.mjs

# Test as if installed
./cli/index.mjs --help
```
