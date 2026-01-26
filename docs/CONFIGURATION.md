# Configuration Guide

This guide explains how to configure the Skills Registry for your own use or when migrating to a different GitHub repository.

## Repository Configuration

All repository-specific settings are centralized in environment variables, making it easy to migrate or fork this project.

### Environment Variables

The site uses the following environment variables (configured in `site/.env.local`):

```bash
# Site name (optional)
NEXT_PUBLIC_SITE_NAME=Skills Registry

# Your GitHub repository (REQUIRED)
# Format: owner/repo
NEXT_PUBLIC_REPO_SLUG=xue1213888/skills-repo

# Site URL for production (optional)
SITE_URL=https://your-domain.com

# Base path for deployment (optional)
SITE_BASE_PATH=
```

## Migrating to a New Repository

To use this registry with a different GitHub repository:

### 1. Fork or Clone the Repository

```bash
git clone https://github.com/xue1213888/skills-repo.git
cd skills-repo
```

### 2. Update Environment Variables

Create or edit `site/.env.local`:

```bash
cd site
cp .env.example .env.local
```

Edit `.env.local` and change the repository:

```bash
# Change this to your GitHub username/repo
NEXT_PUBLIC_REPO_SLUG=your-username/your-repo-name
```

### 3. Update CLI Default Registry (Optional)

If you want the CLI tool to default to your repository, edit `cli/commands/add.mjs` and `cli/commands/list.mjs`:

```javascript
// Change this line in both files
const DEFAULT_REGISTRY_URL = "https://github.com/your-username/your-repo-name";
```

### 4. Build and Deploy

```bash
# Build the registry (IMPORTANT: This must be committed to Git)
npm run validate
npm run build:registry

# Commit the registry files (required for CLI tool)
git add registry/*.json
git commit -m "chore: update registry"
git push

# Build the site
cd site
npm install
npm run build
```

**Important**: The registry JSON files in `registry/` directory **must be committed to Git** because:
- The CLI tool (`npx github:xxx`) downloads code from GitHub and reads these files
- The website build process also uses these files
- They are generated but essential for distribution

## How It Works

### Frontend (Next.js Site)

The site reads configuration from environment variables at build time:

- `REPO_SLUG` → Used to generate `npx github:owner/repo` commands
- `REPO_URL` → Used for direct download links and source links

These are imported from `site/lib/config.ts`:

```typescript
export const REPO_SLUG = process.env.NEXT_PUBLIC_REPO_SLUG ?? "";
export const REPO_URL = REPO_SLUG ? `https://github.com/${REPO_SLUG}` : "";
```

### CLI Tool

The CLI tool can work with any registry by:

1. **Default registry**: Set in the code or via environment variable
2. **Custom registry**: Use `--registry https://github.com/owner/repo` flag
3. **Environment override**: Set `SKILL_REGISTRY_URL` environment variable

```bash
# Use default registry
npx github:xue1213888/skills-repo add skill-name

# Use custom registry
npx github:xue1213888/skills-repo add skill-name --registry https://github.com/your/repo

# Or set environment variable
export SKILL_REGISTRY_URL=https://github.com/your/repo
npx github:xue1213888/skills-repo add skill-name
```

## Deployment

### GitHub Pages

Update `.github/workflows/deploy.yml` (if exists) with your repository details.

### Vercel

1. Import your repository in Vercel
2. Set environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_REPO_SLUG=your-username/your-repo-name`
   - `SITE_URL=https://your-domain.vercel.app`

### Netlify

1. Import your repository in Netlify
2. Set environment variables in Netlify dashboard
3. Build command: `npm run build:registry && cd site && npm install && npm run build`
4. Publish directory: `site/out`

## Best Practices

1. **Never hardcode URLs**: Always use `REPO_SLUG` and `REPO_URL` from the config
2. **Keep .env.local private**: Add to `.gitignore` (already done)
3. **Update .env.example**: When adding new variables, document them in `.env.example`
4. **Test before deploy**: Run locally with your new configuration before deploying

## Troubleshooting

### Issue: "Registry URL not configured"

**Solution**: Make sure `NEXT_PUBLIC_REPO_SLUG` is set in `site/.env.local`

### Issue: NPX commands show wrong repository

**Solution**: Rebuild the site after updating environment variables:
```bash
cd site
npm run build
```

### Issue: Skills not found

**Solution**: Ensure the registry is built and deployed:
```bash
npm run build:registry
```

## Support

For issues or questions, please [open an issue](https://github.com/xue1213888/skills-repo/issues) on GitHub.
