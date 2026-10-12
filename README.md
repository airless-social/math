# cx — updated static site

This package keeps the existing cx game catalog and interface, adds a strict two-column game grid on phones, and adds optional Firebase accounts/cloud saves plus a Google Sheets submission form.

## Files

- `index.html` — full updated site. Replace your repository's current `index.html` with this file.
- `firestore.rules` — restricts each signed-in user to their own saved game document.
- `google-apps-script.gs` — receives the contact/recommendation form and appends submissions to a Google Sheet.

## 1. Deploy to GitHub Pages

1. Download/extract this package.
2. In your `cxshelf.github.io` repository, replace the existing `index.html` with this `index.html`. Keep any other existing files (such as `privacy.html`) unless you intend to replace them.
3. Commit the change. In GitHub, open **Settings → Pages** and confirm Pages is publishing from the correct branch/folder.
4. Wait for the deployment and open `https://cxshelf.github.io/`.

The mobile CSS sets the game grid to exactly two equal columns at viewport widths up to 600px. Larger layouts retain the original auto-fill grid.

## 2. Configure Firebase email/password + Google sign-in

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a project (or use an existing one).
2. In **Project settings → General**, add a **Web app** and copy its Firebase configuration.
3. In `index.html`, find `const firebaseConfig = { ... }` in the module script near the bottom. Replace `YOUR_FIREBASE_API_KEY`, `YOUR_PROJECT_ID`, and `YOUR_FIREBASE_APP_ID` with the exact values from Firebase. Keep the surrounding quotes and property names. `authDomain` should normally be `<your-project-id>.firebaseapp.com`.
4. In Firebase **Authentication → Sign-in method**, enable **Email/Password** and **Google**.
5. In **Authentication → Settings → Authorized domains**, add `cxshelf.github.io` if it is not already listed. If you test locally, also add `localhost`.
6. In **Firestore Database**, create a database. Open **Rules**, paste the contents of `firestore.rules`, and publish them.
7. Commit the updated `index.html` to GitHub Pages and reload the site.

### What is saved

Favorites, playlist, and recently played game IDs are saved in local storage and synced to the signed-in user's Firestore document. The site's existing theme and sound preferences remain local. The cloud document is at `users/{uid}/private/gameState`; the rules prevent one user from reading another user's saves. Firebase's web config is not a password, but Firestore security rules are essential.

This is client-side authentication for a static site; do not put service-account keys, private API secrets, or admin credentials in `index.html`.

## 3. Connect the form to Google Sheets

1. Create a Google Sheet for submissions.
2. In the Sheet, choose **Extensions → Apps Script**.
3. Replace the editor contents with `google-apps-script.gs` and save. The script uses the active spreadsheet and creates a `Submissions` tab the first time it receives a valid submission.
4. Choose **Deploy → New deployment → Web app**.
5. Set **Execute as** to **Me**. Set access to **Anyone** so visitors can submit without logging into Google. This makes the endpoint public, so keep the form fields length-limited and monitor the sheet/script for spam. Do not store sensitive information in this form.
6. Deploy and copy the Web app URL (usually ends in `/exec`). Authorize the script when prompted.
7. In `index.html`, find `const GOOGLE_SHEETS_WEB_APP_URL = "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";` and replace the placeholder with the copied URL.
8. Commit the updated `index.html` and test one submission. Confirm it appears in the `Submissions` sheet and check **Apps Script → Executions** if it does not.

The browser uses a `no-cors` form POST to work with static hosting. That means the page cannot read the server's response; its success message means the request was sent, not independently verified by the browser. Always verify the first test submission in the Sheet.

## Notes

- Email/password sign-up requires a valid email and a password of at least 6 characters (Firebase's default minimum).
- Google sign-in uses a popup; browser popup blockers can interfere.
- If cloud sync does not work, check Firebase config, authorized domains, Firestore setup, and the browser console. Local saves should still work.
- This static client has no server-side anti-spam layer. If the public form starts receiving spam, add a server-side CAPTCHA/rate limit or use a form service with abuse protection.
