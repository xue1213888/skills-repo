# Skills Registry

Open-source repository for managing a community skills registry:

- 2-level categories: `skills/<category>/<subcategory>/<skill-id>/`
- per-skill registry metadata: `.x_skill.yaml` (structured, repo-managed) + `SKILL.md` (human instructions)
- static site (Next.js static export) for browsing/searching skills + importer UI
- importer: paste a GitHub repo URL -> select skills -> open an import issue -> GitHub Action opens a PR
- **NPX CLI tool** to install skills into agent CLIs (claude, codex, opencode, cursor, antigravity)

## Quick Start

### Install a Skill

```bash
# Install a skill using npx from GitHub (no npm install needed)
npx github:xue1213888/skills-repo add ui-ux-pro-max --agent claude --scope project

# List all available skills
npx github:xue1213888/skills-repo list

# Remove a skill
npx github:xue1213888/skills-repo remove ui-ux-pro-max
```

**Alternative:** If published to npm, you can use the shorter command:
```bash
npx aiskill add ui-ux-pro-max --agent claude --scope project
```

See [INSTALL.md](INSTALL.md) for detailed installation instructions.

Design + architecture spec:

- `docs/RFC-0001-skills-registry.md`
- 部署与使用手册（中文）：`docs/DEPLOYMENT.zh-CN.md`

## Repository Layout

```txt
skills/      # source of truth: community skills
schemas/     # JSON Schemas (.x_skill.yaml)
scripts/     # build/validate utilities
cli/         # npx CLI tool (aiskill command)
site/        # Next.js static site
docs/        # RFCs and contributor docs
registry/    # generated indexes for the site/tooling
```

Note: `.codex/` is currently a legacy folder used by local tooling; the canonical skill sources live under `skills/`.

## Adding a Skill (v1)

1. Create a folder: `skills/<category>/<subcategory>/<skill-id>/`
2. Add:
   - `SKILL.md`
   - `.x_skill.yaml` (see `schemas/skill.schema.json`)

## Local Dev

From repo root:

```bash
# install tooling deps
npm install

# validate + build generated registry JSON into `registry/` and `site/public/registry/`
npm run validate
npm run build:registry

# configure site environment variables
cd site
cp .env.example .env.local
# Edit .env.local and set NEXT_PUBLIC_REPO_SLUG to your GitHub username/repo

# run the Next.js site
npm install
npm run dev
```

The site will be available at http://localhost:3000
