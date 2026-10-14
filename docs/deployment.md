# Deploying

The app is a static site: `bun run build` writes `dist/`, and `dist/` is the
whole thing — one JS file, one CSS file, the self-hosted font files and a
favicon, about 1.2 MB before compression. It makes **no request to any other
origin** once loaded: no API, no database, no font CDN, no analytics. Anything
that can serve files can host it.

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
plain shared password, use a **Service Auth** policy or pick Vercel below,
which this repo is already set up for.

### Vercel + sign-in page (free)

The repo is ready for Vercel: `vercel.json` sets the build (`bun install`,
`bun run build`, output `dist`) and the same security headers as
`public/_headers`, and `middleware.ts` puts a sign-in page in front of every
request. Vercel runs that middleware before its cache, so no app file is
served until you have signed in. It works on the free Hobby plan.

1. Push the repo to GitHub.
2. vercel.com → **Add New… → Project** → import the repo. The settings come
   from `vercel.json`; leave them as they are.
3. Before (or right after) the first deploy: **Settings → Environment
   Variables**, add for **Production** and **Preview**:
   - `BASIC_AUTH_USER` — the username
   - `BASIC_AUTH_PASSWORD` — a long password
   - `SESSION_SECRET` (optional) — any long random string; see below
4. **Deployments → Redeploy** so the variables take effect.
5. Open the site: you land on `/__login`. Sign in and you go back to the page
   you asked for, including the exam route after `#`. **Sign out** in the
   header (or `/__logout`) ends the session.

How it works: a correct sign-in sets an `HttpOnly`, `Secure`, `SameSite=Lax`
cookie holding an expiry and an HMAC signature, valid for 30 days. The key is
derived from the username and password, so **changing the password signs every
browser out**; set `SESSION_SECRET` if you would rather sessions survive a
password change. A wrong password waits 0.8 s before answering, to make
guessing slow. A second, readable cookie only tells the app to show the Sign
out button. `favicon.svg` and `robots.txt` are served without a session; nothing
else is.

Until both credential variables exist the site answers `503 Site locked` to
everyone — a missing variable never makes it public. To change the password,
edit the variable and redeploy.

The sign-in page only exists on Vercel. `bun run dev` and `bun run preview`
have no middleware, so the app opens directly and shows no Sign out button.

Vercel's own *Password Protection* (a hosted password page) is not available on
Hobby — it needs Pro plus $20 per month per project. *Vercel Authentication*
with scope **All Deployments** is free too, but it is a Vercel-account login
rather than a password. Both would sit in front of this sign-in page, not
replace it, so pick one.

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
immediately. Vercel ignores `_headers`; the same rules are repeated in
`vercel.json`, so keep the two in step when you change one.

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
