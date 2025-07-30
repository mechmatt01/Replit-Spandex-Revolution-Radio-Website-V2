# GitHub Repository Deployment Guide

## Overview
This guide explains how to deploy the Spandex Salvation Radio project to a GitHub repository and set up automatic deployments.

## Prerequisites
- GitHub account
- Git installed locally
- Firebase CLI installed and authenticated

## Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Repository name: `spandex-salvation-radio`
3. Set as Public (recommended for open source projects)
4. Don't initialize with README, .gitignore, or license (we already have these)

## Step 2: Connect Local Repository to GitHub

```bash
# Initialize git repository (if not already done)
git init

# Add all files to git
git add .

# Create initial commit
git commit -m "Initial commit: Spandex Salvation Radio streaming platform"

# Add GitHub remote (replace USERNAME with your GitHub username)
git remote add origin https://github.com/USERNAME/spandex-salvation-radio.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Set Up Environment Variables

In your GitHub repository, go to Settings > Secrets and variables > Actions and add:

### Required Secrets:
- `FIREBASE_TOKEN`: Firebase CI token for deployments
- `DATABASE_URL`: PostgreSQL database connection string
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `GOOGLE_MAPS_API_KEY`: Google Maps API key
- `OPENWEATHER_API_KEY`: OpenWeatherMap API key
- `RADIO_CO_API_KEY`: Radio.co API key
- `LASTFM_API_KEY`: Last.fm API key

### Firebase Token Generation:
```bash
firebase login:ci
# Copy the generated token to FIREBASE_TOKEN secret
```

## Step 4: GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: |
          npm ci
          cd client && npm ci

      - name: Build application
        run: npm run build
        env:
          VITE_GOOGLE_MAPS_API_KEY: ${{ secrets.GOOGLE_MAPS_API_KEY }}
          VITE_GOOGLE_CLIENT_ID: ${{ secrets.GOOGLE_CLIENT_ID }}

      - name: Deploy to Firebase Hosting
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          channelId: live
          projectId: spandex-salvation-radio-site
```

## Step 5: Branch Protection Rules

1. Go to Settings > Branches
2. Add rule for `main` branch:
   - Require status checks to pass before merging
   - Require branches to be up to date before merging
   - Include administrators

## Step 6: Project Structure

```
spandex-salvation-radio/
├── client/                 # React frontend application
├── server/                 # Express.js backend API
├── shared/                 # Shared TypeScript schemas
├── functions/              # Firebase Cloud Functions
├── .github/workflows/      # GitHub Actions CI/CD
├── firebase.json           # Firebase configuration
├── package.json           # Root package configuration
└── README.md              # Project documentation
```

## Live URLs

- **GitHub Repository**: `https://github.com/USERNAME/spandex-salvation-radio`
- **Firebase Hosting**: `https://spandex-salvation-radio-site.web.app`
- **Custom Domain**: `https://www.spandex-salvation-radio.com`

## Development Workflow

1. Create feature branch: `git checkout -b feature/new-feature`
2. Make changes and commit: `git commit -m "Add new feature"`
3. Push branch: `git push origin feature/new-feature`
4. Create Pull Request on GitHub
5. After review and approval, merge to main
6. Automatic deployment triggers to Firebase

## Monitoring and Analytics

- Firebase Console: Monitor hosting, performance, and usage
- GitHub Insights: Track repository activity and contributions
- Google Analytics: Website traffic and user behavior (if configured)

## Security Considerations

- All sensitive data stored in GitHub Secrets
- Environment variables properly configured for production
- HTTPS enforced through Firebase Hosting
- Content Security Policy headers configured
- Regular dependency updates through Dependabot

## Support

For deployment issues:
1. Check GitHub Actions logs
2. Review Firebase Console for hosting errors
3. Verify all environment variables are set correctly
4. Check build output for any compilation errors

---

**Note**: This deployment guide assumes you have the necessary API keys and credentials. Contact the project maintainer if you need access to specific services.