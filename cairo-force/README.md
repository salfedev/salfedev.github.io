# Cairo Force — public web (GitHub Pages)

Static site for **privacy policy**, **beta signup**, and a minimal landing page. Product name is **Cairo Force** everywhere.

## Live site

| | |
|---|---|
| **Live URL** | https://salfedev.github.io/cairo-force/ |
| **Pages repo** | https://github.com/salfedev/cairo-force (private) |
| **Source in game repo** | `web/` on `salfedev/dark-tower` |

| Page | Path | URL |
|------|------|-----|
| Landing | `/` | https://salfedev.github.io/cairo-force/ |
| Privacy | `privacy.html` | https://salfedev.github.io/cairo-force/privacy.html |
| Join beta | `join-beta.html` | https://salfedev.github.io/cairo-force/join-beta.html |

The public site is served from the **`salfedev.github.io/cairo-force`** org/user Pages project (not the private repo URL). Edit files here in `dark-tower`, then sync to the private Pages repo and push.

## Deploy (copy `web/` → private Pages repo)

From **dark-tower** repo root:

```powershell
$PagesClone = "C:\path\to\cairo-force"   # git clone of salfedev/cairo-force
Copy-Item -Recurse -Force web\* $PagesClone\
Set-Location $PagesClone
git add -A
git status
git commit -m "Sync web from dark-tower"
git push origin main
```

**First-time setup:**

```powershell
git clone git@github.com:salfedev/cairo-force.git C:\path\to\cairo-force
# Copy web/* as above, then push
```

**GitHub Pages:** repo **Settings → Pages** → Source: **Deploy from a branch** → Branch **`main`** → folder **`/ (root)`**. The live URL stays `https://salfedev.github.io/cairo-force/` when the org/user Pages site is wired to this repo.

## Local preview

```powershell
cd web
python -m http.server 8080
# Open http://localhost:8080
```

Or open `index.html` directly in a browser (form submit needs a server for fetch/CORS).

## Formspree setup (recommended default)

1. Create a free form at [formspree.io](https://formspree.io) → copy form ID `xxxxxxxx`.
2. Edit `web/js/join-beta.js` → replace `PLACEHOLDER`:

   ```javascript
   var FORM_ACTION = "https://formspree.io/f/xxxxxxxx";
   ```

3. In Formspree dashboard, enable **AJAX** / JSON submissions (default for fetch POST).
4. Optional: add field names in Formspree (`email`, `display_name`, `role`, `platforms`, `message`).
5. Redeploy Pages. Test with a real email; check Formspree inbox.

Until `PLACEHOLDER` is replaced, the form shows a configuration error (no data sent).

## Firebase Firestore alternative

See `js/firebase-signup.js.example` — copy to `firebase-signup.js`, add Firebase compat CDN scripts to `join-beta.html`, configure `FIREBASE_CONFIG` from Console. **Never commit** real API keys; use `.gitignore` for `firebase-signup.js` if needed.

Suggested Firestore rule (create-only, no reads from client):

```
match /beta_signups/{doc} {
  allow create: if request.resource.data.email is string
                && request.resource.data.email.size() > 5;
  allow read, update, delete: if false;
}
```

## File map

```
web/
├── index.html          # Landing + game logo hero
├── privacy.html        # Full policy (11 sections)
├── join-beta.html      # Beta / volunteer signup form
├── css/cairo-force.css # Design system
├── assets/logo-mark.svg
├── assets/menu-logo.png
├── js/join-beta.js     # Form validation + Formspree submit
├── js/site.js          # Privacy section nav (mobile + scroll spy)
└── js/firebase-signup.js.example
```

## Play Console references

- **Privacy policy URL:** `privacy.html` (required for Data safety + store listing).
- **Beta testers:** share `join-beta.html` link or collect emails from Formspree → add in Play Console **Closed testing** (task **B5** in [`docs/play-release-readiness-tasks.md`](../docs/play-release-readiness-tasks.md)).

## Related docs (dark-tower repo)

- [`docs/play-secrets-vault.md`](../docs/play-secrets-vault.md) — public URLs vault
- [`docs/play-release-readiness-tasks.md`](../docs/play-release-readiness-tasks.md) — B4 privacy, B5 testers
