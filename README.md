# Linguo

Zero-cost, local-first German practice companion. Static React + Fluent UI v9
app, deployable entirely to GitHub Pages with no backend.

- Full product spec: [`PRD.md`](PRD.md)
- Repo orientation for coding agents: [`AGENTS.md`](AGENTS.md)
- Content-authoring agent workflows: [`.agents/`](.agents)

## Stack

- Vite + React + TypeScript
- Fluent UI v9 (`@fluentui/react-components`, `@fluentui/react-icons`)
- Zustand for local-first app state, persisted to `localStorage`
- Google Identity Services (token model) + Drive `appDataFolder` REST calls for
  optional cross-device sync — no backend, no client secret
- `vite-plugin-pwa` for the offline-capable installable PWA
- GitHub Actions → GitHub Pages for deployment

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL. The app is fully usable in guest mode with no
sign-in — pick "Kapitel 1" and work through Stufe 0 → 3.

## Building

```bash
npm run build
```

Builds to `dist/` with the `/linguo/` base path used for GitHub Pages
(`vite.config.ts`). `npm run preview` serves that build locally.

## Deploying to GitHub Pages

This repo does not yet have a GitHub remote configured. To publish:

```bash
# from this directory
git remote add origin git@github.com:michael2036/linguo.git
git push -u origin main
```

Then in the GitHub repo settings, under **Pages**, set the source to
**GitHub Actions** — the workflow in `.github/workflows/deploy.yml` builds and
deploys on every push to `main`. The site will be published at
`https://michael2036.github.io/linguo/`.

If you rename the repo to something other than `linguo`, update `REPO_BASE`
in [`vite.config.ts`](vite.config.ts) to match before deploying.

## Google Drive sync (optional)

Sync is fully optional — the app works offline/guest-only without it.

A real OAuth 2.0 **Web application** client ID is already wired into
[`src/lib/googleAuth.ts`](src/lib/googleAuth.ts). For it to actually work,
its **Authorized JavaScript origins** in
[Google Cloud Console](https://console.cloud.google.com/apis/credentials)
must include both:

- `http://localhost:5173` (local dev)
- `https://michael2036.github.io` (production, once deployed)

No redirect URI or client secret is needed — this app only ever uses the
token-model flow, entirely client-side.

The app only ever requests the `drive.appdata` scope — a private, hidden
folder Google reserves per-app, invisible in the user's normal Drive UI.

## Content authoring

Chapter packs live at `public/data/<course-id>/chapter-XX.json` and must
match [`public/schemas/chapter-schema.json`](public/schemas/chapter-schema.json).
`chapter-01.json` under `deutsch-a1` is a hand-authored sample chapter — use
it as a reference for format and pedagogical structure (vocabulary with full
morphological markers, three graded exercise tiers, hints, and rule-based
explanations) when authoring further chapters.

New chapters are meant to be produced by the two-agent offline authoring
pipeline described in [`.agents/`](.agents) (Didactic Generator →
Pedagogical Critic & Auditor), not written by hand — see
[`.agents/pipeline.md`](.agents/pipeline.md) for the full workflow.

To add a finished chapter to the app, add its entry to `CHAPTER_CATALOG` in
[`src/lib/chapterLoader.ts`](src/lib/chapterLoader.ts).
