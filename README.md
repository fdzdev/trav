# Trav — Tarp Order Form

A simple iPad-friendly web app for creating tarp order forms, exporting them as PDFs, and optionally saving to Google Drive.

## Quick Start

Just open `index.html` in a browser. No build step required.

For iPad: host the files on any static server (GitHub Pages, Netlify, Vercel, or even a local server) and open in Safari.

```bash
# Local development — any of these work:
npx serve .
python3 -m http.server 8000
```

## Features

- **Form** — Fill out tarp orders matching the standard paper form
- **PDF Export** — Generate clean PDFs and download them
- **Google Drive** — Upload PDFs directly to Google Drive (requires setup)
- **History** — All created orders are saved locally with timestamps
- **iPad Optimized** — Touch-friendly chips, large tap targets, no pinch-zoom issues

## Google Drive Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or use existing)
3. Enable the **Google Drive API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Authorized JavaScript origins: add your domain (e.g. `https://yourdomain.com`)
5. Also create an **API Key** and restrict it to Google Drive API
6. Open `app.js` and fill in:
   ```js
   const GOOGLE_CLIENT_ID = 'your-client-id.apps.googleusercontent.com';
   const GOOGLE_API_KEY = 'your-api-key';
   ```

Without these credentials, the "Save to Google Drive" button will fall back to a regular PDF download.
