# PWA Installation Guide

## How Users Can Install Your App

Your Factory Inspection app now has **3 ways** for users to install it:

### 1. Custom Install Banner (NEW!)

- A beautiful install prompt appears at the bottom of the screen
- Shows automatically when the app is installable
- Works on both desktop and mobile
- Users can click "Install Now" to add the app
- Can be dismissed if user doesn't want to install yet

### 2. Browser Install Button

**Desktop (Chrome, Edge, Brave):**

- Look for the install icon (⊕) in the address bar
- Click it to install the app

**Mobile (Android Chrome):**

- Tap the menu (⋮)
- Select "Install app" or "Add to Home Screen"

**Mobile (iOS Safari):**

- Tap the Share button
- Scroll down and tap "Add to Home Screen"
- The custom banner provides instructions for iOS users

### 3. Automatic Prompts

- Chrome and Edge may show automatic install prompts after users visit a few times
- These are controlled by the browser

## Features When Installed

✅ **Standalone App**: Opens in its own window (no browser UI)  
✅ **Home Screen Icon**: Quick access from desktop/home screen  
✅ **Offline Support**: Works without internet connection  
✅ **Auto-Updates**: Automatically updates when you deploy new versions  
✅ **Fast Loading**: Cached assets load instantly

## Testing the Install Feature

### Development Mode:

```bash
npm run dev
```

Open http://localhost:3000 - The install banner will appear!

### Production Mode:

```bash
npm run build
npm run preview
```

### Testing in Browser:

1. Open Chrome DevTools
2. Go to "Application" tab
3. Click "Manifest" to see PWA details
4. Click "Service Workers" to verify registration
5. Use "Add to Home Screen" to test installation

### Testing Install Banner:

- The banner appears automatically on first visit
- It won't show if:
  - App is already installed
  - User dismissed it (stored in localStorage)
  - App is running in standalone mode

### Reset Install Banner (for testing):

```javascript
// In browser console:
localStorage.removeItem("pwa-install-dismissed");
// Then refresh the page
```

## Customization

### Change Banner Colors:

Edit `/src/components/InstallPWA.jsx` line 73:

```jsx
className = "fixed ... bg-gradient-to-r from-blue-600 to-indigo-600 ...";
```

### Change App Name/Icon:

Edit `/vite.config.js`:

```javascript
manifest: {
  name: "Your App Name",
  short_name: "ShortName",
  // ... update icons
}
```

### Hide Install Banner:

Remove or comment out this line in `/src/App.jsx`:

```jsx
<InstallPWA />
```

## Browser Support

| Browser          | Install Support | Custom Banner          |
| ---------------- | --------------- | ---------------------- |
| Chrome (Desktop) | ✅              | ✅                     |
| Chrome (Android) | ✅              | ✅                     |
| Edge (Desktop)   | ✅              | ✅                     |
| Safari (iOS)     | ✅              | ✅ (with instructions) |
| Firefox          | ⚠️ Limited      | ❌                     |
| Safari (macOS)   | ⚠️ Limited      | ❌                     |

## Deployment Notes

When deploying to Railway (or any host):

- PWA works with HTTPS only (Railway provides this)
- Service worker registers automatically
- Users will see install prompts after first visit
- App updates automatically when you deploy new versions

## Monitoring

Check if users have installed your PWA:

```javascript
// In browser console:
window.matchMedia("(display-mode: standalone)").matches;
// Returns: true if installed, false if in browser
```

## Troubleshooting

**Install button doesn't appear?**

- Make sure you're using HTTPS (or localhost)
- Check if app is already installed
- Clear browser cache and try again

**iOS users can't see install button?**

- The custom banner shows instructions for iOS
- iOS requires manual "Add to Home Screen" from Safari

**Service worker not updating?**

- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Clear site data in DevTools → Application → Storage
