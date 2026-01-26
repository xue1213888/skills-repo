# Skills Registry Workflow

This document explains the complete workflow for managing skills in the registry.

## Overview

The Skills Registry consists of three main parts:

1. **Skills sources** (`skills/` directory) - The actual skill content
2. **Registry files** (`registry/*.json`) - Generated index files for CLI and website
3. **Static website** (`site/`) - Next.js site for browsing skills

## Why Registry Files Are Committed

The `registry/*.json` files are **generated but must be committed** to Git because:

- **CLI Distribution**: When users run `npx github:xxx`, npx downloads code from GitHub. The CLI tool reads these files to fetch skill metadata.
- **Website Build**: The Next.js site reads these files during build to generate static pages.
- **GitHub Raw URLs**: The CLI tool fetches `https://raw.githubusercontent.com/.../registry/index.json`

## Adding or Updating Skills

### 1. Add/Modify Skill Files

```bash
# Create or edit skill
mkdir -p skills/category/subcategory/skill-name
cd skills/category/subcategory/skill-name

# Create required files
# - SKILL.md (skill instructions)
# - .x_skill.yaml (metadata)
# - other supporting files
```

### 2. Validate and Build Registry

```bash
# Return to repo root
cd /path/to/skills-repo

# Validate skill metadata
npm run validate

# Build registry files
npm run build:registry
```

This generates:
- `registry/index.json` - Complete skill list
- `registry/categories.json` - Category hierarchy
- `registry/search-index.json` - Search index

### 3. Commit Everything

```bash
# Stage skill files AND registry files
git add skills/category/subcategory/skill-name/
git add registry/*.json

# Commit
git commit -m "feat: add skill-name"

# Push to GitHub
git push origin main
```

### 4. Verify

After pushing, verify the CLI tool works:

```bash
# This should show your new skill
npx github:your-username/skills-repo list

# Try installing it
npx github:your-username/skills-repo add skill-name --agent claude
```

## Local Development

### First-Time Setup

```bash
# Install dependencies
npm install

# Configure site
cd site
cp .env.example .env.local
# Edit .env.local: set NEXT_PUBLIC_REPO_SLUG
npm install
cd ..
```

### Daily Development

```bash
# Run dev server (automatically rebuilds registry)
npm run dev:site
```

The dev server runs at http://localhost:3000

### When Skills Change

If you add/modify skills while the dev server is running:

```bash
# In another terminal
npm run build:registry

# Refresh browser to see changes
```

## Production Build

### Local Build

```bash
# Build registry
npm run build:registry

# Build site (uses prebuild hook to rebuild registry)
npm run build:site

# Output is in site/out/
```

### CI/CD (GitHub Actions)

The `.github/workflows/deploy.yml` handles this automatically:

```yaml
- name: Build registry artifacts
  run: npm run build:registry

- name: Build site
  env:
    NEXT_PUBLIC_REPO_SLUG: ${{ github.repository }}
  run: npm run build --prefix site
```

When you push to main:
1. GitHub Actions builds registry
2. GitHub Actions builds website
3. Website deploys to GitHub Pages
4. CLI tool reads from GitHub raw URLs

## Troubleshooting

### CLI Tool Shows "Not Found"

**Symptom**: `npx github:xxx list` returns 404 error

**Cause**: Registry files not committed to GitHub

**Fix**:
```bash
npm run build:registry
git add registry/*.json
git commit -m "chore: update registry"
git push
```

### Website Shows Old Data

**Symptom**: Website doesn't reflect latest skills

**Cause**: Registry not rebuilt before site build

**Fix**:
```bash
# Rebuild registry
npm run build:registry

# Rebuild site (includes prebuild hook)
npm run build:site
```

### Registry Build Fails

**Symptom**: `npm run build:registry` errors

**Cause**: Invalid skill metadata

**Fix**:
```bash
# Validate first to see errors
npm run validate

# Fix the reported issues in .x_skill.yaml files
# Then rebuild
npm run build:registry
```

## Best Practices

1. **Always run `npm run validate` before committing**
   - Catches metadata errors early
   - Ensures skill files are valid

2. **Commit registry files with skill changes**
   - Don't commit skills without updating registry
   - Don't commit registry without pushing to GitHub

3. **Use the provided npm scripts**
   - `npm run dev:site` - Auto-rebuilds registry
   - `npm run build:site` - Production build with registry
   - `npm run validate` - Check before commit

4. **Test CLI after pushing**
   - Verify skills appear in `npx github:xxx list`
   - Test installation with `npx github:xxx add`

## File Structure Reference

```
skills-repo/
├── skills/               # Source of truth
│   └── category/
│       └── subcategory/
│           └── skill-name/
│               ├── SKILL.md
│               ├── .x_skill.yaml
│               └── ...
├── registry/            # Generated (MUST commit)
│   ├── index.json       # Required by CLI
│   ├── categories.json
│   └── search-index.json
├── site/                # Next.js website
│   ├── public/
│   │   └── registry/    # Copied during build
│   └── out/             # Build output (ignored)
└── cli/                 # CLI tool
    └── commands/
        ├── add.mjs      # Reads registry/index.json
        └── list.mjs     # Reads registry/index.json
```

## Summary

**Key Workflow Steps**:
1. Edit skills in `skills/`
2. Run `npm run build:registry`
3. Commit **both** skills AND registry files
4. Push to GitHub
5. CLI tool and website automatically use latest data

**Remember**: Registry files are generated but required for distribution!
