# 🚀 Scripts Directory

This directory contains automation scripts for the Spandex Salvation Radio project.

## 📋 Available Scripts

### **🔄 `prepare-github-deployment.sh`**
Creates a clean deployment package in the root directory for GitHub deployment.

**Usage:**
```bash
# Run from the root project directory
./scripts/prepare-github-deployment.sh
```

**What it does:**
- Removes any existing deployment package
- Creates a fresh `github-deployment-package/` directory in the root
- Copies all necessary project files with progress bar
- Creates `.gitignore` and `DEPLOY_TO_GITHUB.md` files
- Ready for immediate deployment

### **🚀 `deploy-github-package.sh`**
Deploys the prepared deployment package to GitHub.

**Usage:**
```bash
# Run from the root project directory
./scripts/deploy-github-package.sh
```

**What it does:**
- Automatically finds and navigates to the deployment package
- Initializes git repository
- Commits all files
- Pushes to GitHub with force update
- Includes safe cancel options at every step

### **🔥 `deploy-firebase.sh`**
Directly deploys the current project to Firebase.

**Usage:**
```bash
# Run from the root project directory
./scripts/deploy-firebase.sh
```

**What it does:**
- Offers multiple deployment options (current branch, existing branch, new branch)
- Commits changes locally
- Builds client application
- Deploys to Firebase Functions and Hosting
- Includes safe cancel options at every step

### **⚡ `start-local-dev.sh`**
Starts the full local development environment.

**Usage:**
```bash
# Run from the root project directory
./scripts/start-local-dev.sh
```

**What it does:**
- Kills existing processes and clears ports
- Installs dependencies
- Builds applications
- Launches full stack with browser preview
- Includes safe cancel options

### **⚡ `start-local-dev-quick.sh`**
Quick start for local development (optimized for speed).

**Usage:**
```bash
# Run from the root project directory
./scripts/start-local-dev-quick.sh
```

**What it does:**
- Quick cleanup of processes and ports
- Skips dependency installation if already installed
- Only rebuilds if necessary
- Launches development environment
- Includes safe cancel options

## 🎯 **Simplified Deployment Workflow**

### **Option 1: GitHub Deployment (Recommended)**
```bash
# 1. Prepare deployment package
./scripts/prepare-github-deployment.sh

# 2. Deploy to GitHub
./scripts/deploy-github-package.sh
```

### **Option 2: Direct Firebase Deployment**
```bash
# Deploy directly to Firebase
./scripts/deploy-firebase.sh
```

## 🛡️ **Safety Features**

All scripts include **safe cancel options** that:
- ✅ Never leave operations half-done
- ✅ Preserve current state when cancelled
- ✅ Provide clear feedback on what was cancelled
- ✅ Exit cleanly with appropriate status codes

## 📁 **Directory Structure**

```
Spandex-Salvation-Radio-Website-V2/
├── scripts/                          # Scripts directory
│   ├── prepare-github-deployment.sh  # Creates deployment package
│   ├── deploy-github-package.sh      # Deploys to GitHub
│   ├── deploy-firebase.sh            # Direct Firebase deployment
│   ├── start-local-dev.sh            # Full local development
│   ├── start-local-dev-quick.sh      # Quick local development
│   └── README.md                     # This file
├── github-deployment-package/        # Created by prepare script (temporary)
├── client/                           # React frontend
├── server/                           # Express backend
├── functions/                        # Firebase functions
└── ...                              # Other project files
```

## 🎸 **Quick Start**

1. **For GitHub deployment:**
   ```bash
   ./scripts/prepare-github-deployment.sh
   ./scripts/deploy-github-package.sh
   ```

2. **For local development:**
   ```bash
   ./scripts/start-local-dev-quick.sh
   ```

3. **For direct Firebase deployment:**
   ```bash
   ./scripts/deploy-firebase.sh
   ```

## 🔧 **Troubleshooting**

- **Script not found:** Make sure you're in the root project directory
- **Permission denied:** Run `chmod +x scripts/*.sh` to make scripts executable
- **Deployment package not found:** Run the prepare script first
- **Git errors:** Check that you have proper git configuration

## 🎉 **Success Indicators**

- ✅ **GitHub deployment:** Repository updated with all files
- ✅ **Firebase deployment:** Site live at https://spandex-salvation-radio-site.web.app
- ✅ **Local development:** Client at http://localhost:3000, Server at http://localhost:4000

---

**🎸 Rock on! Your radio station deployment is simplified and safe! 🎸**
