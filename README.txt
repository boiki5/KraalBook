KraalBook pilot, piece 1 (animals and tags), version 0.1
=========================================================

What this is
  A web app that saves livestock records on the farmer's own phone (browser storage).
  There is no server, no account and no analytics. Nothing is sent anywhere.

How to put it online (any static host that serves over HTTPS)
  1. Upload the whole folder as it is: index.html, app.js, styles.css, sw.js,
     manifest.webmanifest, the fonts folder and the icons folder.
  2. Open the web address on an Android phone in Chrome. After the first visit the app
     works without internet. Use "Add to Home screen" to install it.
  3. On iPhone use Safari, Share, then Add to Home Screen.

Hosting notes
  - It must be served over HTTPS (or localhost) for offline mode and installing to work.
  - To test on your computer: open a terminal in this folder and run
        python3 -m http.server 8000
    then open http://localhost:8000
  - When you change any file, change the number in CACHE ("kraalbook-shell-v1") in sw.js
    so phones fetch the new version.
  - Static hosts keep ordinary access logs (IP address and time). They never see farm records.

Data
  - Records live in IndexedDB in each farmer's browser. Clearing browser data erases them.
  - Settings has a backup file (JSON) and a restore option. Ask farmers to save backups.
  - "Sample farm" uses a separate store with made-up animals, for demos.

UPLOADING TO GITHUB (important)
- Upload the CONTENTS of this folder so index.html is at the top of the repository.
- Make sure the folders "icons" and "fonts" appear in the repository file list after you upload.
  If a folder is missing, upload it again. A missing icon blocks "Install app",
  and a missing file stops offline use.
- After uploading, open these on your phone and check they load (no 404):
  /manifest.webmanifest   /sw.js   /icons/icon-512.png   /icons/icon-maskable-512.png
- In the app, open Settings, then "Check this install" to see what is working.
