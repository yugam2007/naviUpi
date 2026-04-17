# 📱 GPay Demo App

> **🔒 Demo App – No Real Payments. Educational Purpose Only.**

A pixel-perfect Google Pay UI clone built with vanilla HTML/CSS/JavaScript.
Works as a PWA (installable on Android/iOS) or can be wrapped as an APK with Capacitor.

---

## 📁 File Structure

```
gpay-demo/
├── index.html       — Main app shell (all screens)
├── style.css        — All styles, animations, theming
├── app.js           — App logic, state, storage, QR
├── manifest.json    — PWA manifest
├── sw.js            — Service Worker (offline support)
├── icon-192.png     — PWA icon (192×192)
├── icon-512.png     — PWA icon (512×512)
└── README.md        — This file
```

---

## 🚀 Quick Start (Local)

### Option A — Python (easiest)
```bash
cd gpay-demo
python3 -m http.server 8080
# Open http://localhost:8080 in browser
```

### Option B — Node / npx
```bash
cd gpay-demo
npx serve .
# Or: npx http-server -p 8080
```

### Option C — VS Code Live Server
Open folder in VS Code → right-click `index.html` → **Open with Live Server**

---

## 📲 Install on Android as PWA

1. Start a local server (see above)
2. Find your PC's local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
   - Example: `192.168.1.5`
3. On Android Chrome, open: `http://192.168.1.5:8080`
4. Tap the **⋮ menu** → **"Add to Home screen"**
5. The app installs like a native app!

**Or deploy to the web (free options):**
- [Netlify Drop](https://app.netlify.com/drop) — drag the folder
- [Vercel](https://vercel.com) — `npx vercel`
- [GitHub Pages](https://pages.github.com)

After deployment, open the HTTPS URL on Android and tap **Add to Home screen**.

---

## 📦 Convert to APK with Capacitor

### Prerequisites
```bash
node -v    # Need Node.js 16+
java -v    # Need JDK 11+
           # Android Studio installed
```

### Steps

```bash
# 1. Install Capacitor
npm init -y
npm install @capacitor/core @capacitor/cli @capacitor/android

# 2. Initialize
npx cap init "GPay Demo" "com.demo.gpay" --web-dir="."

# 3. Add Android platform
npx cap add android

# 4. Sync files
npx cap sync android

# 5. Open in Android Studio
npx cap open android

# In Android Studio:
# Build → Generate Signed APK  (for release)
# OR press ▶ Run to test on emulator/device
```

### capacitor.config.json (auto-generated, customize as needed)
```json
{
  "appId": "com.demo.gpay",
  "appName": "GPay Demo",
  "webDir": ".",
  "server": { "androidScheme": "https" },
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 2000,
      "backgroundColor": "#1a73e8",
      "androidSplashResourceName": "splash"
    }
  }
}
```

---

## ✨ Features

| Feature | Status |
|---|---|
| Home screen with balance | ✅ |
| Quick action buttons | ✅ |
| People shortcuts | ✅ |
| QR Scanner (camera) | ✅ |
| Demo QR scan (no camera needed) | ✅ |
| UPI ID manual entry | ✅ |
| Recipient verification | ✅ |
| Number pad for amount | ✅ |
| Quick amount buttons | ✅ |
| Payment note | ✅ |
| UPI PIN screen (UI only) | ✅ |
| Processing animation | ✅ |
| Success screen + receipt | ✅ |
| Transaction ID + UPI ref | ✅ |
| Balance deduction | ✅ |
| Transaction history | ✅ |
| LocalStorage persistence | ✅ |
| Filter by sent/received | ✅ |
| Receive money QR | ✅ |
| Notifications screen | ✅ |
| Success sound (Web Audio) | ✅ |
| Haptic vibration | ✅ |
| PWA installable | ✅ |
| Service Worker / offline | ✅ |
| Mobile-first responsive | ✅ |

---

## 🔒 Important Disclaimers

- **No real UPI processing** — all transactions are simulated
- **No backend** — everything runs in the browser
- **No payment gateway** — no Razorpay, Stripe, or bank APIs
- **Fake balance** — numbers are stored in `localStorage`
- **UPI PINs are not validated** — any 6 digits work
- **For educational/demo/portfolio use only**

---

## 🎨 Tech Stack

- **HTML5** + **CSS3** (custom properties, animations, grid)
- **Vanilla JavaScript** (ES2020)
- **html5-qrcode** library (CDN) for camera QR scanning
- **Web Audio API** for success sound
- **Vibration API** for haptic feedback
- **PWA** (Service Worker + Web App Manifest)

---

## 🛠 Customization

### Change the user name / UPI
Edit `index.html`:
```html
<div class="username" id="home-username">Your Name</div>
```
And in `app.js`, update `seedTransactions` and the UPI string.

### Change the balance
In `app.js`:
```js
balance: 12450.00,  // ← Change this
```

### Change theme color
In `style.css`:
```css
--primary: #1a73e8;  /* ← Change to your color */
```
