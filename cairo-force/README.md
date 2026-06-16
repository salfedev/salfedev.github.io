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

The public site is served at **`https://salfedev.github.io/cairo-force/`** via the [`salfedev/salfedev.github.io`](https://github.com/salfedev/salfedev.github.io) user Pages repo (`cairo-force/` subdirectory). The private **`salfedev/cairo-force`** repo holds the same files at repo root as the canonical deploy source (GitHub Pages on private repos requires a paid plan — sync to `salfedev.github.io` for live hosting).

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

**GitHub Pages (private repo):** repo **Settings → Pages** → Branch **`main`** / root — requires GitHub Pro on private repos. For free hosting, copy to **`salfedev.github.io/cairo-force/`** (see below).

**Live deploy (user site):**

```powershell
$UserPages = "C:\path\to\salfedev.github.io"
Copy-Item -Recurse -Force web\* $UserPages\cairo-force\
Set-Location $UserPages
git add cairo-force/
git commit -m "Sync Cairo Force web from dark-tower"
git push origin main
```

## Local preview

```powershell
cd web
python -m http.server 8080
# Open http://localhost:8080
```

Or open `index.html` directly in a browser (form submit needs a server for fetch/CORS).

## Formspree setup (optional alternative)

Formspree was the original stub; **live join-beta uses Firestore** (`beta_signups` on `cairo-force-dev`). To use Formspree instead, restore the fetch handler in `join-beta.js` and set `FORM_ACTION`.

1. Create a free form at [formspree.io](https://formspree.io) → copy form ID `xxxxxxxx`.
2. Set `var FORM_ACTION = "https://formspree.io/f/xxxxxxxx";` in a custom submit handler.
3. Redeploy Pages.

## Firebase Firestore signup (default — live)

1. Web app **Cairo Force join-beta** on `cairo-force-dev` — config in `js/firebase-config.js`.
2. `join-beta.html` loads Firebase compat SDK + `firebase-config.js` + `join-beta.js`.
3. Submissions call Cloud Function **`submitBetaSignup`** (rate-limited server-side); rules block direct Firestore writes.
4. Deploy rules after changes:

   ```powershell
   cd firebase
   npx firebase-tools deploy --only firestore:rules --project cairo-force-dev
   ```

5. Sync `web/` to Pages repos (below) and test with a real email; check Firebase Console → Firestore → `beta_signups`.

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
├── js/firebase-config.js # Public Web SDK config (cairo-force-dev)
├── js/join-beta.js     # Form validation + Firestore submit
├── js/site.js          # Privacy section nav (mobile + scroll spy)
└── js/firebase-signup.js.example
```

## Play Console references

- **Privacy policy URL:** `privacy.html` (required for Data safety + store listing).
- **Beta testers:** share `join-beta.html` link or collect emails from Firestore `beta_signups` → add in Play Console **Closed testing** (task **B5** in [`docs/play-release-readiness-tasks.md`](../docs/play-release-readiness-tasks.md)).

## Related docs (dark-tower repo)

- [`docs/play-secrets-vault.md`](../docs/play-secrets-vault.md) — public URLs vault
- [`docs/play-release-readiness-tasks.md`](../docs/play-release-readiness-tasks.md) — B4 privacy, B5 testers
