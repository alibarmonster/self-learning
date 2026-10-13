# Deploying

The app is a static site: `bun run build` writes `dist/`, and `dist/` is the
whole thing — about 840 KB, one JS file, one CSS file, a favicon. It makes **no
network requests at all** once loaded. No API, no database, no web fonts, no
analytics. Anything that can serve files can host it.

Two things make this easier than a typical SPA deploy:

- **Hash routing.** Every route is `#/cdl`, `#/ace/cheatsheet` and so on, so the
  server only ever serves `/index.html`. You do **not** need SPA rewrite rules,
  and a refresh on a deep link cannot 404.
- **No backend.** There is nothing to provision, scale or pay for.

## Protecting it with a password

The password must be checked **by the host, before the files are sent**. Do not
put a password inside the app: everything in `dist/` is public by definition, so
a password checked in the browser can be read out of the JavaScript by anyone
who opens DevTools. It would stop a casual passer-by and nobody else.

### Cloudflare Pages + Cloudflare Access (recommended)

Free, and the password is enforced at Cloudflare's edge — a request without a
valid session never reaches the files.

1. Push this folder to a GitHub repository.
2. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** →
   **Connect to Git**, and pick the repo.
3. Build settings:
   - Framework preset: **None** (or Vite)
   - Build command: `bun run build` (Pages detects `bun.lock` and installs with Bun)
   - Build output directory: `dist`
4. Deploy. You get `your-project.pages.dev`.
5. Now the lock. **Zero Trust** → **Access** → **Applications** →
   **Add an application** → **Self-hosted**:
   - Application domain: your `pages.dev` hostname
   - Policy: **Allow**, with rule **Emails** → your own email address
6. Visiting the site now asks for your email and sends a one-time code.

That is a login rather than a shared password, which is better: no secret to
leak, and you can revoke it from the dashboard. If you would rather have a
plain shared password, use a **Service Auth** policy or pick Vercel below.

### Vercel (simplest shared password)

1. Import the GitHub repo at vercel.com. It detects Vite; output is `dist`.
2. Project → **Settings** → **Deployment Protection** → **Password
   Protection** → set a password.

Password protection on Vercel is a paid feature on current plans — check the
pricing page before relying on it. Cloudflare Access is free for personal use.

### Netlify

1. Import the repo; build `bun run build`, publish `dist`.
2. **Site configuration** → **Access & security** → **Password protection**
   (also a paid feature, and site-wide).

### What not to use for this

**GitHub Pages** has no password feature at all. If you host there the site is
public to anyone with the URL, question bank and all.

## Caching and headers

`public/_headers` is copied into `dist/` on build and is read by Cloudflare
Pages and Netlify. It sets a strict Content-Security-Policy (the app needs no
outside origins), `noindex`, and caching: `/assets/*` forever because Vite
fingerprints those filenames, `index.html` never, so a new deploy reaches you
immediately. Vercel ignores `_headers` — move those rules into `vercel.json` if
you deploy there.

`public/robots.txt` disallows crawling. Behind Access it is redundant, but it
costs nothing and matters if the site is ever reachable without the lock.

## Where your progress lives

In your browser, not on the server — see *Storage* in `README.md`. Two
consequences worth knowing before you rely on this:

- Clearing site data for the domain erases attempt history, saved papers and
  the resumable session. There is no copy anywhere else.
- Your phone and your laptop keep separate histories. The question banks and
  cheat sheets are identical; only progress differs.

Both are fixable later by adding a backend, which this app does not have and
does not need for one person on one browser.

## Updating

Push to the branch the host watches. The build runs there, `index.html` is
never cached, so a refresh picks up the new version. Nothing to migrate —
localStorage keys are versioned (`-v1`) and unchanged by a deploy.

## Checking a build before you ship it

```bash
bun run check      # type-check the app and the scripts
bun run validate   # question banks: no broken answers, modes, or drills
bun run build      # writes dist/
bun run preview    # serves dist/ at http://localhost:4173
```
