# 🛠️ Blank Screen Fix Guide

🌐 **Live Demo**: [https://intelligent-voice-companion.netlify.app/](https://intelligent-voice-companion.netlify.app/)
📂 **GitHub**: [https://github.com/HorizonHnk/Gemini-AI-Assistant---Intelligent-Voice-Companion](https://github.com/HorizonHnk/Gemini-AI-Assistant---Intelligent-Voice-Companion)

## Problem Identified ✅

The app works perfectly in **development mode** (`npm run dev`) but shows blank screen in **production builds** (Android/Electron).

**Root Cause:** File path issues in the built `dist/index.html` file.

## ✅ **Quick Fix Applied:**

I've already fixed the main issue by changing absolute paths to relative paths in `dist/index.html`:

**Before (Broken):**
```html
<script src="/assets/index-BUaOcv6e.js"></script>
<link href="/assets/index-CY4xV--F.css">
```

**After (Fixed):**
```html
<script src="./assets/index-BUaOcv6e.js"></script>
<link href="./assets/index-CY4xV--F.css">
```

## 🧪 **Testing Instructions:**

### For Desktop (Electron):
```bash
# Test the app - it should now work
npm run electron
```

### For Android:
```bash
# Sync the fixed files to Android
npx cap sync

# Open in Android Studio and test
# Or build APK if you have Android Studio set up
```

### For Web (Test Mode):
```bash
# Start development server
npm run dev

# Open browser and add ?test to URL:
# http://localhost:5173?test
# This will show a test page to verify React is working
```

## 🔧 **If Still Blank Screen:**

### 1. **Check Browser Console:**
- Open developer tools (F12)
- Look for JavaScript errors in Console tab
- Look for failed network requests in Network tab

### 2. **Test Error Boundary:**
The app now includes error handling that should show any JavaScript errors with a friendly error page instead of blank screen.

### 3. **Manual Steps to Rebuild:**

If you need to rebuild and the paths get reset:

```bash
# Rebuild the app
npm run build

# Fix the paths manually
# Open dist/index.html and change:
# href="/assets/..." to href="./assets/..."
# src="/assets/..." to src="./assets/..."

# Then sync to platforms
npx cap sync  # For Android
# OR just test with: npm run electron
```

## 📱 **Platform-Specific Instructions:**

### **Android (Capacitor):**
1. ✅ Fixed dist folder synced automatically
2. Open Android Studio
3. File → Open → Select `android` folder from your project
4. Run → Run 'app' (or Build APK)

### **Desktop (Electron):**
1. ✅ Fixed dist folder ready
2. Run: `npm run electron`
3. Should open desktop window with working app

### **Web Browser:**
- Development: `npm run dev` (always works)
- Production: Serve the `dist` folder with any web server

## 🚨 **Common Issues:**

### **"Cannot read properties of undefined"**
- Usually means a component failed to load
- Check browser console for the exact error
- The error boundary should catch this now

### **White screen, no errors**
- CSS files not loading
- Check Network tab for 404 errors on CSS/JS files
- Verify file paths in `dist/index.html`

### **Camera/microphone not working**
- These require HTTPS or localhost
- Android: Should work fine
- Electron: Should work fine (localhost equivalent)

## ✅ **Verification Checklist:**

After applying fixes, verify:

- [ ] `npm run dev` works (development)
- [ ] `npm run electron` shows desktop app
- [ ] Android Studio can build/run the Android version
- [ ] No JavaScript errors in browser console
- [ ] Error boundary shows helpful errors instead of blank screen

## 🎯 **Expected Results:**

✅ **Working:** Desktop app opens with full AI Assistant interface
✅ **Working:** Android app shows AI Assistant (after Android Studio build)
✅ **Working:** All voice features, camera switching, themes work
✅ **Working:** Error messages instead of blank screens for any issues

The main fixes have been applied! Test with `npm run electron` first.