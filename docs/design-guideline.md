# Design guideline

The visual language of this app is taken from **Kira Learning**
([kira-learning.com](https://www.kira-learning.com/), featured on
[godly.design](https://godly.design/website/kira-learning/)). The values in the
*Reference* columns below were read from the live site's computed styles in
October 2026; the *Here* columns are what this app uses, with the reasons where
they differ.

Kira is an education product, which is why it fits: it has to look calm and
trustworthy to teachers, and an exam simulator has the same job. The look in one
line — **an editorial serif over a quiet grotesk, ink on white and cream, square
corners, no shadows, and one mint highlighter.**

## Principles

1. **Type does the work.** Hierarchy comes from the serif/sans pairing and size,
   not from colour, weight or decoration. Headings are always regular weight.
2. **Flat and square.** Surfaces are separated by a change of tone (white →
   stone → cream), never by a drop shadow. Corners are square except where a
   shape means something (a radio dot, a highlighter stroke).
3. **Ink, paper, one highlighter.** The palette is near-black on warm whites.
   Mint is the only colour, and it is used like a marker pen: to point at the
   thing that matters on the screen — the right answer, the current question,
   the key phrase in a headline.
4. **State colours are functional only.** Green, red and amber appear when they
   carry meaning (correct, wrong, time running out) and nowhere else.
5. **Quiet motion.** Colour and opacity ease in 200 ms. Nothing bounces.

## Colour

| Token | Reference | Here (light) | Here (dark) | Use |
| --- | --- | --- | --- | --- |
| `--ink` | `#1A1A1A` | `#1A1A1A` | `#F2F0E8` | Headings, primary text, primary button fill |
| `--text` | — | `var(--ink)` | `var(--ink)` | Default text colour |
| `--text-secondary` | `#6B6761` | `#6B6761` | `#A8A39A` | Body copy, descriptions |
| `--text-strong-secondary` | `#504D49` | `#504D49` | `#C9C4B8` | Secondary text that must hold up on stone |
| `--text-tertiary` | `#999999` | `#736F67` | `#8C877E` | Labels, metadata, footnotes |
| `--bg` | `#FFFFFF` | `#FFFFFF` | `#141413` | Page |
| `--cream` | `#FFFDF0` | `#FFFDF0` | `#1C1B17` | Header, hero bands, text on ink buttons |
| `--stone` | `#F5F5F4` | `#F5F5F4` | `#1E1D1A` | Cards and panels |
| `--stone-strong` | — | `#EDECE9` | `#272622` | Hover on stone, sunken wells, tracks |
| `--line` | — | `#E7E5E0` | `rgba(242,240,232,0.10)` | Hairlines and table rules |
| `--line-strong` | — | `#D6D3CC` | `rgba(242,240,232,0.22)` | Input borders, focus-less outlines |
| `--mint` | `#56EAAF` | `#56EAAF` | `#56EAAF` | Highlighter: marks, progress, current item |
| `--mint-soft` | — | `rgba(86,234,175,0.22)` | `rgba(86,234,175,0.16)` | Selected option background |
| `--green` | — | `#1F7A55` | `#5FD39B` | Correct |
| `--red` | — | `#B3261E` | `#FF8A80` | Wrong |
| `--amber` | — | `#8A5A00` | `#E9B95A` | Flagged, time warning |

Tertiary grey differs from the reference: `#999` is 2.8:1 on white, below the
WCAG AA minimum for the 11–13 px labels this app uses it for. `#736F67` keeps the
warm cast at 5.0:1 on white and 4.6:1 on stone.

Measured contrast (WCAG 2.x):

| Pair | Ratio |
| --- | --- |
| Ink on white | 17.4 : 1 |
| Body `#6B6761` on white / on stone | 5.6 : 1 / 5.2 : 1 |
| Cream on ink (primary button) | 17.0 : 1 |
| Ink on mint (highlighted text) | 11.4 : 1 |
| Green / red / amber on white | 5.3 / 6.5 / 5.9 : 1 |
| Dark: ink `#F2F0E8` on `#141413` | 16.2 : 1 |
| Dark: body `#A8A39A` on `#141413` | 7.4 : 1 |
| Dark: tertiary `#8C877E` on stone `#1E1D1A` | 4.7 : 1 |

Mint is never a text colour on white (1.5 : 1). Text sits **on** mint, in ink.

### Per-exam tint

Each exam keeps a small tint (`--exam-tint`) that appears in exactly one place:
the square beside its monogram. Everything else stays ink and mint, so moving
between exams changes the label, not the product.

| Exam | Tint |
| --- | --- |
| Apple Developer Academy | `#56EAAF` (mint) |
| Cloud Digital Leader | `#8AB4F8` |
| Associate Cloud Engineer | `#F6C26B` |

## Typography

| Role | Reference | Here |
| --- | --- | --- |
| Display / headings | Recife Text, 400 | **Newsreader** (variable, optical size), 400 |
| Body and UI | Messina Sans, 400 / 600 | **Hanken Grotesk** (variable), 400 / 500 / 600 |
| Code and data | — | System monospace (`ui-monospace`, SF Mono, Menlo, Consolas) |

Recife Text and Messina Sans are commercial faces. Newsreader is the closest
open-licence match to Recife's sharp, slightly condensed text serif, and its
optical-size axis keeps 56 px headings crisp and 20 px card titles sturdy.
Hanken Grotesk matches Messina's even, neo-grotesk rhythm. Both are
self-hosted from `@fontsource-variable/*` and bundled by Vite, because the
Content-Security-Policy is `font-src 'self'` — no request to a font CDN.

### Scale

| Token | Reference | Size / line-height | Letter-spacing | Face |
| --- | --- | --- | --- | --- |
| `--type-hero` | hero H1 | 56 / 67 px (clamp to 36 on phones) | −0.4 px | serif |
| `--type-h1` | page H1 | 48 / 58 px (clamp to 32) | −0.4 px | serif |
| `--type-h2` | section H2 | 32 / 35 px | −0.3 px | serif |
| `--type-h3` | card title | 24 / 26 px | −0.3 px | serif |
| `--type-h4` | small card title | 20 / 22 px | −0.3 px | serif |
| `--type-lead` | lede | 18 / 25 px | −0.3 px | sans |
| `--type-body` | body | 16 / 22.4 px | −0.3 px | sans |
| `--type-small` | small print | 14 / 20 px | −0.2 px | sans |
| `--type-label` | caption | 12 / 16 px, 500, uppercase, +0.06 em | | sans |

Rules:

- Headings are **always weight 400**. Emphasis inside a heading uses `<mark>`
  (see below) or italics, never bold.
- Buttons use the sans at 600, 16 px, `line-height: 1`.
- Numbers that are the point of a panel (a score, a count, a percentage) are set
  in the serif at 400, like headings. Numbers in tables and timers use
  `font-variant-numeric: tabular-nums`.
- Small labels (eyebrows, table headers, metadata) are sans, uppercase, 12 px,
  weight 500, tracked +0.06 em. Monospace is kept for code, commands and the
  CLI cheat-sheet table — content, not decoration.

## Highlighter mark

Kira underlines its key phrases with a mint marker stroke. Here it is a
`<mark>`:

```css
mark {
  background: var(--mint);
  color: var(--ink);
  border-radius: 14px;   /* reference value */
  padding: 0 8px;
  box-decoration-break: clone;
}
```

Use one per heading at most. In the app mint marks one word of the landing-page
headline, the suggested answer letter on reveal, the chosen option, the
current question in the navigator, and the progress bar.

## Shape and elevation

| Token | Reference | Here |
| --- | --- | --- |
| `--radius` | 0 (cards, buttons) | `0` |
| `--radius-control` | 4 px (inputs) | `4px` — inputs, chips, option letters |
| `--radius-mark` | 14 px | `14px` — `<mark>` only |
| Shadows | `rgba(235,235,235,0.25) 0 1px 2px` on buttons, none on cards | `--shadow-sm` is that one value; cards have **no** shadow |

Circles stay circles (radio dots, the score ring). Nothing else is rounded.

Separation comes from tone: page white, cards stone, header and hero cream. A
card on a stone band would disappear, so a card inside a stone region is white
with a 1 px `--line` border instead.

## Spacing and layout

| Token | Reference | Here |
| --- | --- | --- |
| Page max width | 1440 px container, 1196 px card grid | `--page: 1120px` (reading width; this is an app, not a landing page) |
| Side gutter | 30 px sections, 60 px card grid | `--page-pad: 24px`, `16px` under 560 px |
| Section rhythm | 64 / 100 / 200 px | `--space-section: 72px`, `--space-block: 48px` |
| Card padding | 32 px | `--card-pad: 32px`, `20px` under 560 px |
| Grid gap | 48–64 px | `24px` between cards, `48px` between blocks |
| Header height | 64 px, padding 0 20 px | `64px` |

Spacing steps: 4, 8, 12, 16, 24, 32, 48, 72.

## Components

### Header

64 px, cream background, a single `--line` hairline at the bottom, sticky. Left:
the exam monogram (ink square outline, 0 radius, with the exam tint in the
corner) and the exam name in the sans at 600. Right: ghost buttons.

### Buttons

| Variant | Background | Text | Border | Hover |
| --- | --- | --- | --- | --- |
| Primary | `--ink` | `--cream` | none | background lifts to `#333` (dark: `#FFFFFF`) |
| Secondary | transparent | `--ink` | 1 px `--ink` | background `--stone` |
| Ghost | transparent | `--text-secondary` | none | text `--ink`, background `--stone` |

Padding 12 px 16 px (reference); large buttons 16 px 24 px. Radius 0. Disabled
is 40 % opacity. Pressing does not scale — Kira's buttons are flat.

### Cards

Stone background, 0 radius, no border, no shadow, 32 px padding. Title in the
serif (`--type-h3` or `--type-h4`), body in `--text-secondary`. Cards are
containers, never decorated: no gradient edges, no corner brackets, no texture.

### Inputs

White background, 1 px `--line-strong` border, 4 px radius, 12 px 16 px padding,
ink text. Focus: 2 px ink outline offset 2 px.

### Answer options (app-specific)

A white row with a 1 px `--line` border on a stone question card. The letter sits
in a 28 px square (4 px radius). States:

| State | Treatment |
| --- | --- |
| Idle | white, `--line` border |
| Hover | border `--ink` |
| Chosen | background `--mint-soft`, border `--ink`, letter on `--mint` |
| Correct (reveal) | border and letter `--green`, background green at 10 % |
| Wrong (reveal) | border and letter `--red`, background red at 8 % |

### Tables

No vertical rules. Header row: label style (12 px, uppercase, tertiary).
Rows divided by `--line`. First column in the sans at 600 when it names the row.

### Progress and timers

Progress: a 4 px mint bar along the top edge of the quiz bar. Timer is sans 600
with tabular numbers; amber under five minutes, red under one. The score ring
and per-section bars use the state colours, because there the colour is the
verdict.

## Motion

| Token | Value | Use |
| --- | --- | --- |
| `--ease` | `cubic-bezier(0.44, 0, 0.56, 1)` (reference) | colour, background, border |
| `--dur-micro` | `200ms` (reference) | hover and press |
| `--ease-enter` | `cubic-bezier(0.16, 1, 0.3, 1)` | page entrance |
| `--dur-enter` | `480ms` | fade + 10 px rise, once, staggered 60 ms |

Everything respects `prefers-reduced-motion`.

## Dark mode

Kira has no dark theme. The dark variant keeps the same structure: warm
near-black page, slightly lighter warm stone for cards, cream-tinted ink for
text, and the **same mint**, which reads at 12 : 1 on the dark page. Primary
buttons invert to cream with ink text. Shadows stay off.

## Do and don't

- **Do** let a 48 px serif heading and a grey lede carry a page on their own.
- **Do** use mint for the one thing to look at.
- **Don't** bold a heading, round a card, or add a shadow to separate surfaces.
- **Don't** introduce a second accent colour. Exam tints are a marker, not a
  theme.
- **Don't** set body text in the serif or headings in the sans.

## Where it lives

- Tokens and primitives: `src/styles/global.css`
- Fonts: imported once in `src/main.ts` from `@fontsource-variable/newsreader`
  and `@fontsource-variable/hanken-grotesk`
- Components keep their own scoped styles and take colour, type and radii from
  these tokens.
