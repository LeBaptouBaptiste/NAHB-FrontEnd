# Frontend Deployment Guide

## GitHub Actions CI/CD

The frontend repository includes a GitHub Actions workflow that automatically:
- ✅ Builds the application on every push/PR
- ✅ Runs ESLint
- ✅ Creates build artifacts
- 🔄 Deploys to hosting (when configured)

## Quick Start

### 1. Enable GitHub Actions
The workflow is already configured in `.github/workflows/ci-cd.yml`. It will run automatically when you push code.

### 2. View Build Status
Check the "Actions" tab in your GitHub repository to see workflow runs.

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Create Vercel Account**: [vercel.com](https://vercel.com)

2. **Import Project**: Connect your GitHub repository

3. **Configure Build Settings**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Add Secrets to GitHub** (for CI/CD):
   ```
   VERCEL_TOKEN - Get from Vercel account settings
   VERCEL_ORG_ID - Found in Vercel project settings
   VERCEL_PROJECT_ID - Found in Vercel project settings
   ```

5. **Uncomment deployment section** in `.github/workflows/ci-cd.yml`

### Option 2: Netlify

1. **Create Netlify Account**: [netlify.com](https://netlify.com)

2. **Import Project**: Connect your GitHub repository

3. **Configure Build Settings**:
   - Build Command: `npm run build`
   - Publish Directory: `dist`

4. **Add Secrets to GitHub**:
   ```
   NETLIFY_AUTH_TOKEN - Get from Netlify user settings
   NETLIFY_SITE_ID - Found in site settings
   ```

5. **Uncomment Netlify deployment** in `.github/workflows/ci-cd.yml`

### Option 3: Manual Deployment

Build and deploy manually:

```bash
# Build the app
npm install
npm run build

# The built files are in the dist/ directory
# Upload dist/ to your hosting service (S3, Azure, etc.)
```

## Environment Variables

### Development (.env.local)
```env
VITE_API_URL=http://localhost:3000
```

### Production
Add these in your hosting platform:
```env
VITE_API_URL=https://api.yourapp.com
```

## Required GitHub Secrets

Add these in: **Settings → Secrets and variables → Actions**

**For Vercel:**
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

**For Netlify:**
- `NETLIFY_AUTH_TOKEN`
- `NETLIFY_SITE_ID`

## Testing the Workflow

1. Make a change and push to your repository
2. Go to the "Actions" tab
3. Watch the workflow run
4. Check for build success/failure

## Troubleshooting

### Build Fails
- Check the workflow logs in the Actions tab
- Verify all dependencies are in package.json
- Ensure Node version matches (20.x)

### Deployment Fails
- Verify all secrets are correctly set
- Check deployment platform logs
- Ensure environment variables are configured

### Lint Errors
The workflow continues even with lint errors. To see them:
1. Check the workflow logs
2. Run `npm run lint` locally
3. Fix errors and push again

## Manual Build

If you need to build locally:

```bash
npm install
npm run build
npm run preview  # Test the production build
```

## Next Steps

1. ✅ Choose a deployment platform (Vercel/Netlify)
2. ✅ Add required secrets to GitHub
3. ✅ Uncomment deployment section in workflow
4. ✅ Push to main branch
5. ✅ Verify deployment works
