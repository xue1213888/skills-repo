# Quick Start Guide

## Using the CLI Tool

### From GitHub (No npm publish needed)

The easiest way to use the tool is directly from GitHub using npx:

```bash
# Install a skill
npx github:xue1213888/skills-repo add ui-ux-pro-max --agent claude --scope project

# List all available skills
npx github:xue1213888/skills-repo list

# Remove a skill
npx github:xue1213888/skills-repo remove ui-ux-pro-max
```

### From npm (After publishing)

If you publish to npm, users can use the shorter command:

```bash
# Publish the package
npm publish

# Users can then use
npx aiskill add ui-ux-pro-max
npx aiskill list
npx aiskill remove ui-ux-pro-max
```

## Supported Agents

- **claude** - Claude Code (`.claude/skills/`)
- **codex** - Codex (`.codex/skills/`)
- **opencode** - OpenCode (`.opencode/skills/`)
- **cursor** - Cursor (`.cursor/skills/`)
- **antigravity** - Antigravity (`.antigravity/skills/`)

## Installation Scopes

- **project** - Installs to current directory (`.agent/skills/`)
- **global** - Installs to home directory (`~/.agent/skills/`)

## Common Examples

```bash
# Install to Claude Code in current project
npx github:xue1213888/skills-repo add ui-ux-pro-max

# Install to Codex globally
npx github:xue1213888/skills-repo add ui-ux-pro-max --agent codex --scope global

# Install to Cursor in current project
npx github:xue1213888/skills-repo add ui-ux-pro-max --agent cursor

# List all skills with details
npx github:xue1213888/skills-repo list

# List as JSON
npx github:xue1213888/skills-repo list --json

# Remove from Claude Code
npx github:xue1213888/skills-repo remove ui-ux-pro-max
```

## Advanced Usage

### Use custom registry

```bash
export SKILL_REGISTRY_URL=https://github.com/your-org/your-repo
npx github:xue1213888/skills-repo add skill-name
```

### Batch install

```bash
for skill in "skill-1" "skill-2" "skill-3"; do
  npx github:xue1213888/skills-repo add "$skill" --agent claude
done
```

## Benefits of Using GitHub URL

1. **No npm publish required** - Users can use the tool immediately
2. **Always latest version** - npx fetches from main branch
3. **Easy to test** - Test changes before publishing to npm
4. **Works anywhere** - As long as GitHub is accessible

## When to Publish to npm

Consider publishing to npm when:
- You want a shorter, memorable command (`aiskill` vs `github:xue1213888/skills-repo`)
- You need version control for breaking changes
- You want to publish to the npm registry for discoverability
- Users prefer npm-based installation

Both methods work perfectly - choose based on your needs!
