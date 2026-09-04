# Linguo

**Zero-cost, local-first German practice PWA.** No backend, no server, no
subscription — a static site that turns textbook curricula into structured,
gradeable drills, installable on any device and fully usable offline.

> Built as a Level → Modul → Lektion curriculum engine, with a copyright-safe
> AI content pipeline that authors original exercises from textbook answer
> keys instead of reproducing source text.

- 📄 Full product spec: [`PRD.md`](PRD.md)
- 🧭 Repo orientation for coding agents: [`AGENTS.md`](AGENTS.md)
- 🤖 Content-authoring agent workflows: [`.agents/`](.agents)

## Features

- **Guest-first, 100% offline** — every feature works with zero sign-in and
  zero network requests; progress persists to `localStorage` immediately.
- **Two independent learning modes per Lektion:**
  - **Übung (Practice)** — vocabulary flashcards, then three graded
    difficulty tiers (easy → medium → hard).
  - **Test** — a separate, originally-authored assessment bank, reachable
    instantly with no gating or prerequisite practice.
- **Six exercise types** — multiple-choice, fill-in-the-blank, sentence
  scramble, cloze conjugation, targeted transformation, and error correction.
- **Full German linguistic profiles for vocabulary** (B1 so far) — nouns
  carry gender and plural, verbs carry their principal parts (Präteritum,
  Partizip II, `haben`/`sein`) and regularity; the Wortschatz-Trainer tests
  all of it, not just term↔translation recall.
- **Linguo**, the app's mascot, guides the home page's level selector and
  reacts to every graded answer in an animated feedback drawer — sprite-based,
  no video/GIF assets.
- **Optional cross-device sync** via the user's own Google Drive
  `appDataFolder` — no client secret, no custom backend, last-write-wins
  conflict resolution.
- **Installable PWA** with offline caching (`vite-plugin-pwa`), so it behaves
  like a native app on iOS/Android home screens and desktop.
- **Zero hosting cost** — deploys entirely to GitHub Pages via GitHub
  Actions on every push to `main`.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | [Vite](https://vitejs.dev) + [React 19](https://react.dev) + TypeScript (strict) |
| UI | [Fluent UI v9](https://react.fluentui.dev) (`@fluentui/react-components`, `@fluentui/react-icons`) |
| State | [Zustand](https://github.com/pmndrs/zustand), persisted to `localStorage` |
| Routing | React Router (`HashRouter`, for GitHub Pages sub-path compatibility) |
| Sync | Google Identity Services (token model) + Drive `appDataFolder` REST calls |
| Offline | `vite-plugin-pwa` |
| CI/CD | GitHub Actions → GitHub Pages |
| Linting | `oxlint` |

## Getting started

Requires Node.js 20+.

```bash
git clone https://github.com/michael2036/Linguo.git
cd Linguo
npm install
npm run dev
```

Open the printed local URL. The app is fully usable in guest mode with no
sign-in — pick a Lektion and choose **Übung** or **Test**.

### Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check (`tsc -b`) and build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run `oxlint` |

## Curriculum coverage

Content follows the real structure of the "Momente" (Hueber) textbook
series: **Level** (A1/A2/B1) → **Modul** (1–8) → **Lektion** (exactly 3 per
Modul, 24 per level).

| Level | Moduln authored | Vocabulary linguistic profiles |
|---|---|---|
| A1 | 8 / 8 ✅ | not yet backfilled |
| A2 | 8 / 8 ✅ | not yet backfilled |
| B1 | 8 / 8 ✅ | ✅ full noun/verb profiles |

Modul packs live at `public/data/<level>/modul-<N>.json` and must validate
against [`public/schemas/modul-schema.json`](public/schemas/modul-schema.json).
"Vocabulary linguistic profiles" means the richer per-word data (noun
plural, verb principal parts) described in [PRD §10](PRD.md#10-v1-revision-vocabulary-linguistic-profiles--student-simulation)
— those fields are optional, so A1/A2 work normally today and just don't
generate the extra grammar quiz items until backfilled.

## Content authoring

New Moduln are meant to be produced by a three-agent offline authoring
pipeline (Didactic Generator → Pedagogical Critic & Auditor → Test Item
Writer → Auditor again) described in [`.agents/`](.agents), not written by
hand — see [`.agents/pipeline.md`](.agents/pipeline.md) for the full
workflow. The pipeline reads textbook PDFs only to infer grammar and
vocabulary targets; it never reproduces source text, so all generated
sentences and exercises are original.

To register a finished Modul with the app, add its entry to `MODUL_CATALOG`
in [`src/lib/curriculumLoader.ts`](src/lib/curriculumLoader.ts). If it's the
first Modul for a new level, also add that level to `LEVEL_CATALOG` in the
same file.

## Deploying to GitHub Pages

This repo is connected to `github.com/michael2036/Linguo` and deploys
automatically — [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
builds and publishes on every push to `main` (and can be run manually from
the Actions tab). The repo's **Pages** settings must have the source set to
**GitHub Actions**. The site is published at
`https://michael2036.github.io/Linguo/`.

`REPO_BASE` in [`vite.config.ts`](vite.config.ts) must exactly match the
repo's name, capitalization included — GitHub Pages paths are
case-sensitive, so a mismatch here 404s every asset while the root page
still loads.

## Google Drive sync (optional)

Sync is fully optional — the app works offline/guest-only without it.

A real OAuth 2.0 **Web application** client ID is already wired into
[`src/lib/googleAuth.ts`](src/lib/googleAuth.ts). For it to work, its
**Authorized JavaScript origins** in
[Google Cloud Console](https://console.cloud.google.com/apis/credentials)
must include both:

- `http://localhost:5173` (local dev)
- `https://michael2036.github.io` (production)

No redirect URI or client secret is needed — this app only ever uses the
token-model flow, entirely client-side, and only ever requests the
`drive.appdata` scope — a private, hidden folder Google reserves per-app,
invisible in the user's normal Drive UI.

Google's OAuth consent screen requires a public Privacy Policy and Terms of
Service URL — the app ships both as real pages once deployed:

- `https://michael2036.github.io/Linguo/#/privacy`
- `https://michael2036.github.io/Linguo/#/terms`

## Contributing

Contributions are welcome, especially backfilling A1/A2 vocabulary with the
noun/verb linguistic profiles B1 already has (see [Curriculum
coverage](#curriculum-coverage) and [Content authoring](#content-authoring)).
Please open an issue or PR — for anything content-related, follow the
`.agents/pipeline.md` workflow, including its blind-solve student-simulation
audit step, so exercises stay copyright-safe, unambiguous, and consistent
with the existing schema.
