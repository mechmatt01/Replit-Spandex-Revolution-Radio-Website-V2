# 🚀 **MASTER DEPLOYMENT GUIDE - Spandex Salvation Radio**

This guide provides **ALL** the commands and steps needed to deploy your radio station website to both GitHub and Firebase, with error checking and fixes built-in.

---

## 🎯 **QUICK START - One Command Deployment**

### **🚀 FULL AUTOMATED DEPLOYMENT (Recommended)**
```bash
# From the root project directory:
./scripts/master-deployment.sh
```
Then select **Option 6: FULL AUTOMATED DEPLOYMENT**

This will automatically:
- ✅ Fix any configuration issues
- ✅ Create GitHub deployment package
- ✅ Deploy to GitHub repository
- ✅ Deploy to Firebase (Hosting + Functions)
- ✅ Handle all error checking and fixes

---

## 📋 **MANUAL STEP-BY-STEP DEPLOYMENT**

### **Step 1: Navigate to Root Project Directory**
```bash
# If you're in scripts/ directory:
cd ..

# If you're anywhere else, navigate to your project root:
cd /path/to/Spandex-Salvation-Radio-Website-V2
```

### **Step 2: Make Master Script Executable**
```bash
chmod +x scripts/master-deployment.sh
```

### **Step 3: Run the Master Script**
```bash
./scripts/master-deployment.sh
```

---

## 🎮 **MASTER SCRIPT MENU OPTIONS**

### **1. 🔄 Prepare GitHub Deployment Package**
- Creates a clean deployment package in the root directory
- Copies all necessary project files
- Creates proper `.gitignore` and documentation
- **Use this first** before deploying to GitHub

### **2. 🚀 Deploy to GitHub Repository**
- Deploys the prepared package to your GitHub repo
- Handles Git initialization and force push
- **Requires** a deployment package (option 1 first)

### **3. 🔥 Deploy to Firebase (Hosting + Functions)**
- Builds your client application
- Deploys Firebase Functions
- Deploys to Firebase Hosting
- **Can be run independently**

### **4. 🌿 Manage Git Branches**
- Switch between existing branches
- Create new branches for deployment
- Handle branch conflicts and issues

### **5. 🔧 Fix Common Issues & Check Configuration**
- Automatically fixes Firebase configuration
- Checks Git status and handles issues
- **Run this if you encounter errors**

### **6. 🚀 FULL AUTOMATED DEPLOYMENT (GitHub + Firebase)**
- **Complete end-to-end deployment**
- Handles everything automatically
- **Best option for full deployment**

### **7. 📋 Show Current Status**
- Displays current project status
- Shows Git, Firebase, and package status
- **Use this to check your setup**

### **8. ❌ Exit**
- Safely exits the script

---

## 🛠️ **COMMON ISSUES & FIXES**

### **❌ "Firebase hosting target not configured" Error**
**Fix:** Run option 5 (Fix Common Issues) or manually update:
```bash
# Update firebase.json
sed -i '' 's/"target": "main"/"target": "spandex-salvation-radio-site"/g' firebase.json

# Update .firebaserc
sed -i '' 's/"main": \[/"spandex-salvation-radio-site": [/g' .firebaserc
```

### **❌ "Git push rejected - non-fast-forward" Error**
**Fix:** This is normal after multiple deployments. The script handles it automatically with force push.

### **❌ "Script not found" Error**
**Fix:** Make sure you're in the root project directory, not in scripts/:
```bash
pwd  # Should show path ending with Spandex-Salvation-Radio-Website-V2
./scripts/master-deployment.sh
```

### **❌ "Permission denied" Error**
**Fix:** Make the script executable:
```bash
chmod +x scripts/master-deployment.sh
```

---

## 🔄 **INDIVIDUAL SCRIPT COMMANDS**

If you prefer to use the individual scripts instead of the master script:

### **Prepare GitHub Deployment Package**
```bash
./scripts/prepare-github-deployment.sh
```

### **Deploy to GitHub**
```bash
./scripts/deploy-github-package.sh
```

### **Deploy to Firebase**
```bash
./scripts/deploy-firebase.sh
```

### **Start Local Development**
```bash
./scripts/start-local-dev-quick.sh
```

---

## 🌐 **DEPLOYMENT TARGETS**

### **GitHub Repository**
- **URL:** https://github.com/mechmatt01/Replit-Spandex-Revolution-Radio-Website-V2
- **Purpose:** Source code management and GitHub Actions

### **Firebase Hosting**
- **Default Domain:** https://spandex-salvation-radio-site--spandex-salvation-radio-site.us-central1.hosted.app
- **Custom Domain:** https://spandex-salvation-radio.com (pending)
- **Purpose:** Live website hosting

### **Firebase Functions**
- **Region:** us-central1
- **Purpose:** Backend API and serverless functions

---

## 📊 **DEPLOYMENT CHECKLIST**

### **Before Deployment**
- [ ] You're in the root project directory
- [ ] All changes are committed to Git
- [ ] Firebase CLI is installed and logged in
- [ ] GitHub repository exists and is accessible

### **During Deployment**
- [ ] GitHub deployment package created successfully
- [ ] Code pushed to GitHub repository
- [ ] Client application built successfully
- [ ] Firebase Functions deployed
- [ ] Firebase Hosting deployed

### **After Deployment**
- [ ] Site is live at Firebase hosting URL
- [ ] GitHub repository is updated
- [ ] GitHub Actions are configured (if using CI/CD)
- [ ] Custom domain is configured (if applicable)

---

## 🚨 **SAFETY FEATURES**

### **✅ Safe Cancellation**
- **Cancel at any point** without breaking anything
- **No half-done operations** - all cancellations are safe
- **State preservation** - cancelled operations don't leave broken states

### **✅ Error Handling**
- **Automatic error detection** and fixes
- **Configuration validation** before deployment
- **Graceful fallbacks** if operations fail

### **✅ Progress Tracking**
- **Clear status indicators** for each step
- **Detailed error messages** with solutions
- **Confirmation prompts** for destructive operations

---

## 🎸 **QUICK DEPLOYMENT WORKFLOW**

### **For New Deployments:**
```bash
cd /path/to/Spandex-Salvation-Radio-Website-V2
./scripts/master-deployment.sh
# Select Option 6: FULL AUTOMATED DEPLOYMENT
```

### **For Updates Only:**
```bash
cd /path/to/Spandex-Salvation-Radio-Website-V2
./scripts/master-deployment.sh
# Select Option 3: Deploy to Firebase
```

### **For GitHub Updates Only:**
```bash
cd /path/to/Spandex-Salvation-Radio-Website-V2
./scripts/master-deployment.sh
# Select Option 2: Deploy to GitHub Repository
```

---

## 🔧 **TROUBLESHOOTING**

### **If Master Script Fails:**
1. **Check directory:** Make sure you're in the root project directory
2. **Check permissions:** Ensure script is executable
3. **Check dependencies:** Verify Firebase CLI and Git are installed
4. **Run option 5:** Use "Fix Common Issues" to auto-resolve problems

### **If Individual Scripts Fail:**
1. **Use the master script instead** - it has better error handling
2. **Check the error messages** - they usually contain the solution
3. **Run option 5** in the master script to fix issues

### **If Deployment Still Fails:**
1. **Check Firebase Console** for project configuration
2. **Verify GitHub repository** permissions and access
3. **Check network connectivity** and authentication
4. **Review the logs** for specific error details

---

## 🎉 **SUCCESS INDICATORS**

### **✅ GitHub Deployment Success:**
- Repository shows latest commits
- All files are present and up-to-date
- No error messages in the terminal

### **✅ Firebase Deployment Success:**
- Functions show as deployed in Firebase Console
- Hosting shows as deployed with live URL
- Site loads without errors at the hosting URL

### **✅ Complete Deployment Success:**
- Code is in GitHub repository
- Site is live at Firebase hosting URL
- All functions are working
- No error messages anywhere

---

## 🚀 **NEXT STEPS AFTER DEPLOYMENT**

### **1. Configure GitHub Actions (Optional)**
- Go to your GitHub repository
- Navigate to Settings > Secrets and variables > Actions
- Add required secrets for automated deployment

### **2. Set Up Custom Domain (Optional)**
- In Firebase Console, go to Hosting
- Add your custom domain
- Configure DNS settings as instructed

### **3. Monitor Performance**
- Check Firebase Performance Monitoring
- Monitor site analytics and user engagement
- Set up alerts for any issues

---

## 🎸 **ROCK ON!**

Your Spandex Salvation Radio station is now ready to rock the internet! 

**🌐 Live Site:** https://spandex-salvation-radio-site.web.app  
**📚 Source Code:** https://github.com/mechmatt01/Replit-Spandex-Revolution-Radio-Website-V2  
**🔥 Firebase Console:** https://console.firebase.google.com/project/spandex-salvation-radio-site

---

## 📞 **Need Help?**

If you encounter any issues:
1. **Run option 5** in the master script (Fix Common Issues)
2. **Check the status** with option 7 (Show Current Status)
3. **Review this guide** for common solutions
4. **The master script** handles most issues automatically

**🎸 Your radio station is ready to deploy! Rock on! 🎸**
