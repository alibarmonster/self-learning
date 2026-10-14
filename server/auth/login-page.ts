/**
 * The sign-in page, served by the middleware before any app file. It is fully
 * self-contained (the app's CSS and fonts are behind the login too), styled to
 * the design guideline with system fallbacks for the two typefaces.
 */
import { SESSION_DAYS } from './session';

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export interface LoginPageOptions {
  next: string;
  error?: string;
  notice?: string;
  user?: string;
  /** The app route (#/ace…) to return to; kept across a failed attempt. */
  hash?: string;
}

export function loginPage({ next, error, notice, user = '', hash = '' }: LoginPageOptions): string {
  const message = error
    ? `<p class="msg error" role="alert">${escapeHtml(error)}</p>`
    : notice
      ? `<p class="msg" role="status">${escapeHtml(notice)}</p>`
      : '';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta name="color-scheme" content="light dark">
<title>Sign in · Exam Prep</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<style>
  :root {
    --ink: #1a1a1a; --text-secondary: #6b6761; --text-tertiary: #736f67;
    --cream: #fffdf0; --stone: #f5f5f4; --bg: #ffffff; --line: #e7e5e0; --line-strong: #d6d3cc;
    --mint: #56eaaf; --red: #b3261e; --red-soft: rgba(179, 38, 30, 0.08);
    --serif: 'Newsreader Variable', 'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif;
    --sans: 'Hanken Grotesk Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color-scheme: light;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --ink: #f2f0e8; --text-secondary: #a8a39a; --text-tertiary: #8c877e;
      --cream: #1c1b17; --stone: #1e1d1a; --bg: #141413; --line: rgba(242,240,232,.1); --line-strong: rgba(242,240,232,.22);
      --red: #ff8a80; --red-soft: rgba(255, 138, 128, 0.1);
      color-scheme: dark;
    }
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; min-height: 100%; }
  body {
    min-height: 100vh; display: flex; flex-direction: column;
    background: var(--bg); color: var(--ink);
    font: 16px/1.4 var(--sans); letter-spacing: -0.3px; -webkit-font-smoothing: antialiased;
  }
  header { height: 64px; display: flex; align-items: center; padding: 0 24px; background: var(--cream); border-bottom: 1px solid var(--line); }
  .mark { width: 32px; height: 32px; display: grid; place-items: center; border: 1.5px solid var(--ink); font-size: 12px; font-weight: 600; position: relative; }
  .mark::after { content: ''; position: absolute; right: -4px; bottom: -4px; width: 9px; height: 9px; background: var(--mint); border: 1.5px solid var(--cream); }
  header strong { margin-left: 12px; font-size: 15px; font-weight: 600; }
  main { flex: 1; display: grid; place-items: center; padding: 48px 16px; }
  .panel { width: 100%; max-width: 420px; background: var(--stone); padding: 32px; }
  .eyebrow { margin: 0; font-size: 12px; font-weight: 500; letter-spacing: .06em; text-transform: uppercase; color: var(--text-tertiary); }
  h1 { margin: 8px 0 0; font: 400 40px/1.15 var(--serif); letter-spacing: -0.4px; }
  h1 mark { background: var(--mint); color: #1a1a1a; border-radius: 14px; padding: 0 8px; }
  .lede { margin: 12px 0 0; color: var(--text-secondary); }
  form { margin-top: 24px; display: grid; gap: 16px; }
  label { display: grid; gap: 6px; font-size: 14px; font-weight: 500; }
  input[type=text], input[type=password] {
    width: 100%; padding: 12px 16px; font: inherit; color: var(--ink);
    background: var(--bg); border: 1px solid var(--line-strong); border-radius: 4px;
  }
  input:focus-visible, button:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }
  button {
    margin-top: 4px; padding: 14px 16px; border: 0; border-radius: 0; cursor: pointer;
    background: var(--ink); color: var(--cream); font: 600 16px/1 var(--sans); letter-spacing: -0.3px;
  }
  button:hover { opacity: .9; }
  .msg { margin: 20px 0 0; padding: 12px 16px; border-left: 4px solid var(--mint); background: var(--bg); font-size: 14px; }
  .msg.error { border-left-color: var(--red); background: var(--red-soft); color: var(--red); }
  .foot { margin: 20px 0 0; font-size: 13px; color: var(--text-tertiary); }
  @media (max-width: 480px) { .panel { padding: 20px; } h1 { font-size: 32px; } }
</style>
</head>
<body>
<header><span class="mark" aria-hidden="true">§</span><strong>Exam Prep</strong></header>
<main>
  <section class="panel" aria-labelledby="title">
    <p class="eyebrow">Private study site</p>
    <h1 id="title">Sign in to <mark>practise</mark></h1>
    <p class="lede">This site is for its owner only. Sign in once and this browser stays signed in for ${SESSION_DAYS} days.</p>
    ${message}
    <form method="post" action="/__login" autocomplete="on">
      <input type="hidden" name="next" value="${escapeHtml(next)}">
      <input type="hidden" name="hash" value="${escapeHtml(hash)}">
      <label>Username
        <input type="text" name="user" autocomplete="username" autocapitalize="none" spellcheck="false" required value="${escapeHtml(user)}">
      </label>
      <label>Password
        <input type="password" name="password" autocomplete="current-password" required>
      </label>
      <button type="submit">Sign in</button>
    </form>
    <p class="foot">Forgot it? The username and password are the project's environment variables on Vercel.</p>
  </section>
</main>
<script src="/__login.js"></script>
</body>
</html>`;
}

/**
 * Carries the app route (#/ace, #/cdl/cheatsheet…) through the sign-in. The
 * fragment never reaches the server, so the page copies it into the form. It
 * is a separate file because the Content-Security-Policy forbids inline script.
 */
export const LOGIN_SCRIPT = `(function () {
  var form = document.querySelector('form');
  if (!form) return;
  if (location.hash) form.elements.namedItem('hash').value = location.hash;
  var field = form.elements.namedItem(form.elements.namedItem('user').value ? 'password' : 'user');
  if (field) field.focus();
})();
`;
