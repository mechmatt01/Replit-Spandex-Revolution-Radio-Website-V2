# 📋 Deployment Checklist - Spandex Salvation Radio

Use this checklist to ensure everything is properly configured before deploying to Firebase Hosting.

## Pre-Deployment (Do Once)

### Environment Setup
- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm 8+ installed (`npm --version`)
- [ ] Firebase CLI installed globally (`npm install -g firebase-tools`)
- [ ] Firebase CLI authenticated (`firebase login`)
- [ ] Git installed (for version control)

### Project Configuration
- [ ] `.env.local` file created from `.env.example`
- [ ] Firebase credentials filled in `.env.local`
- [ ] Firebase project verified: `spandex-salvation-radio-site`
- [ ] `.firebaserc` points to correct project
- [ ] Dependencies installed: `npm install && cd client && npm install`

### Firebase Services
- [ ] Firestore Database enabled
- [ ] Authentication enabled (Email/Password and/or Google OAuth)
- [ ] Cloud Storage enabled (if using file uploads)
- [ ] Hosting enabled for `spandex-salvation-radio-site`

## Pre-Build Checks

### Code Quality
- [ ] No TypeScript errors in IDE
- [ ] No console errors in development (`npm run dev`)
- [ ] All routes work in development
- [ ] Navigation between pages works
- [ ] Forms and inputs functional

### Assets and Content
- [ ] All images load correctly
- [ ] All CSS styles apply properly
- [ ] Fonts render correctly
- [ ] Icons display properly
- [ ] Audio files (if any) play correctly

### Firebase Integration
- [ ] Authentication login/signup works
- [ ] Firestore reads/writes work (if applicable)
- [ ] Cloud Storage uploads work (if applicable)
- [ ] Error handling works properly

### Performance
- [ ] Development build loads in < 3 seconds
- [ ] No memory leaks detected
- [ ] No unnecessary re-renders (check React DevTools)
- [ ] Console has no warnings/errors

## Build Verification

### Build Process
- [ ] Run `npm run build` successfully
- [ ] No build errors or warnings
- [ ] No console errors during build
- [ ] Production build completes in reasonable time

### Build Output
- [ ] `client/dist/` directory created
- [ ] `client/dist/index.html` exists
- [ ] `client/dist/assets/` directory exists
- [ ] Asset files have hash suffixes (e.g., `index-abc123.js`)
- [ ] Total build size is reasonable (< 5MB for initial load)

### Build Content
- [ ] All JavaScript files minified
- [ ] All CSS files minified
- [ ] Source maps not included (security)
- [ ] Environment variables not exposed
- [ ] Secrets not included in build

## Firebase Configuration Review

### firebase.json
- [ ] `public` directory is `client/dist`
- [ ] SPA rewrite rule is configured: `"destination": "/index.html"`
- [ ] Cache control headers set properly
- [ ] Security headers configured
- [ ] No JSON syntax errors (valid JSON, no comments)

### .firebaserc
- [ ] Default project is `spandex-salvation-radio-site`
- [ ] Hosting target configured correctly
- [ ] No syntax errors

### File Permissions
- [ ] firebase.json is readable
- [ ] .firebaserc is readable
- [ ] client/dist/ contents are readable

## Pre-Deployment Testing

### Local Testing
- [ ] Run `cd client && npm run preview` (local production server)
- [ ] Open http://localhost:4173
- [ ] All pages load correctly
- [ ] No console errors in production build
- [ ] All functionality works
- [ ] Check browser DevTools → Console (no errors)
- [ ] Check browser DevTools → Network (all assets load, status 200)

### Responsive Testing
- [ ] Test on desktop (1920px)
- [ ] Test on tablet (768px)
- [ ] Test on mobile (375px)
- [ ] All elements display correctly at each breakpoint
- [ ] Touch interactions work on mobile

### Cross-Browser Testing (Optional but Recommended)
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest if on Mac)
- [ ] Edge (latest)

### Feature Testing
- [ ] Homepage displays correctly
- [ ] Navigation menu works
- [ ] All routes accessible
- [ ] Forms submit successfully
- [ ] Authentication works
- [ ] Firestore queries work
- [ ] File uploads work (if applicable)
- [ ] External API calls work

## Deployment

### Final Checks
- [ ] All code committed to git
- [ ] No uncommitted changes important to deployment
- [ ] Latest code built locally and tested
- [ ] Firebase CLI authenticated (`firebase login`)
- [ ] Correct Firebase project selected (`firebase use spandex-salvation-radio-site`)

### Pre-Deploy Verification
Run the verification script:
```bash
chmod +x ./verify-deployment.sh
./verify-deployment.sh
```

All checks should pass (show green ✓).

### Deployment Command
```bash
firebase deploy --only hosting
```

- [ ] Deployment command started successfully
- [ ] Upload progress visible in terminal
- [ ] No errors during upload
- [ ] Deployment completed successfully
- [ ] Success message shown with live URL

## Post-Deployment Verification

### Site Accessibility
- [ ] Site is accessible at https://spandex-salvation-radio-site.web.app
- [ ] No "Page Not Found" error
- [ ] HTTPS/SSL certificate valid (lock icon visible)
- [ ] Page loads completely in < 3 seconds

### Functionality Testing
- [ ] Homepage displays correctly
- [ ] All navigation links work
- [ ] All routes accessible (`/music`, `/profile`, etc.)
- [ ] Forms and inputs work
- [ ] Authentication working
- [ ] Firestore data loads
- [ ] Images load and display
- [ ] CSS styles apply correctly
- [ ] Responsive design works (test on mobile)

### Performance Verification
- [ ] Page load time acceptable (< 3 seconds)
- [ ] No visual layout shifts
- [ ] All animations smooth
- [ ] No jank or stuttering

### Console and Network
- [ ] No JavaScript errors in console (F12 → Console)
- [ ] No CSS/styling errors
- [ ] No 404 errors (F12 → Network)
- [ ] All resources have status 200
- [ ] No CORS errors (if using APIs)
- [ ] No security warnings

### Security
- [ ] HTTPS enabled (check URL bar)
- [ ] Security headers present (F12 → Network → select page → Headers)
  - [ ] X-Frame-Options: DENY
  - [ ] X-Content-Type-Options: nosniff
  - [ ] X-XSS-Protection: 1; mode=block
- [ ] No sensitive data in browser storage (F12 → Application)
- [ ] No API keys exposed in code

### Firebase Services
- [ ] Authentication works (login/signup)
- [ ] Firestore data accessible
- [ ] Cloud Storage accessible (if used)
- [ ] Analytics data appears (if enabled)

## Post-Deployment Maintenance

### Monitoring
- [ ] Set up Firebase Console monitoring
- [ ] Enable Google Analytics (if not already)
- [ ] Monitor error logs regularly
- [ ] Check performance metrics

### Updates
- [ ] Set up automatic backups
- [ ] Plan for regular security updates
- [ ] Monitor Firebase quotas/usage
- [ ] Review Firestore indexes for performance

### Documentation
- [ ] Document any manual configuration steps
- [ ] Record Firebase project credentials securely
- [ ] Create runbook for common issues
- [ ] Document custom domain setup (if applicable)

## Rollback Plan

If deployment has issues:

```bash
# View previous deployments
firebase hosting:channel:list

# Rollback to previous version
firebase hosting:rollback
```

- [ ] Rollback tested and working (if needed)
- [ ] Previous version verified as functional
- [ ] Issue documented for future reference

## Success Criteria ✅

Your deployment is successful when:

✅ Site loads at https://spandex-salvation-radio-site.web.app  
✅ All pages and routes work  
✅ No console errors  
✅ All images and assets load  
✅ Responsive design works  
✅ Firebase services functional  
✅ Page load time < 3 seconds  
✅ Lighthouse score 90+  

## Troubleshooting Guide

### Common Issues

**Issue: Blank page after deployment**
- [ ] Check browser console (F12)
- [ ] Verify Firebase config in .env.local
- [ ] Check that index.html exists in client/dist/
- [ ] Ensure firebase.json has SPA rewrite rule

**Issue: 404 errors on routes**
- [ ] Verify firebase.json rewrite rule
- [ ] Check that index.html exists in client/dist/
- [ ] Clear browser cache
- [ ] Try incognito/private browsing mode

**Issue: Static assets not loading**
- [ ] Check Network tab (F12) for asset errors
- [ ] Verify asset paths in network requests
- [ ] Check asset file sizes (reasonable?)
- [ ] Clear browser cache and reload

**Issue: Firebase authentication not working**
- [ ] Verify Firebase credentials in .env.local
- [ ] Check Firebase Console → Authentication
- [ ] Verify security rules if using Firestore
- [ ] Check browser console for Firebase errors

**Issue: Deployment timeout or fails**
- [ ] Check internet connection
- [ ] Try deployment again
- [ ] Check Firebase status page
- [ ] Check for large files in build

## Quick Command Reference

```bash
# Install dependencies
npm install && cd client && npm install && cd ..

# Development
npm run dev

# Build
npm run build

# Preview build locally
cd client && npm run preview

# Deploy
firebase deploy --only hosting

# View deployment history
firebase hosting:channel:list

# View logs
firebase hosting:channel:log live

# Rollback
firebase hosting:rollback

# Verify deployment readiness
./verify-deployment.sh
```

## Contact & Support

For issues or questions:
1. Check the comprehensive guides in the project
2. Review Firebase documentation
3. Check browser console for error messages
4. Review deployment logs: `firebase hosting:channel:log live`

---

**Last Updated:** 2024-12-23  
**Project:** Spandex Salvation Radio  
**Deployment Target:** Firebase Hosting (spandex-salvation-radio-site)  
**Status:** Ready for Production
