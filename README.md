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
sign-in — pick a Lektion and choose **Übung** (vocab → three graded
practice tiers) or **Test** (instant, ungated assessment).

## Building

```bash
npm run build
```

Builds to `dist/` with the `/Linguo/` base path used for GitHub Pages
(`vite.config.ts`). `npm run preview` serves that build locally.

## Deploying to GitHub Pages

This repo is connected to `github.com/michael2036/Linguo` and deploys
automatically — the workflow in `.github/workflows/deploy.yml` builds and
publishes on every push to `main` (and can be run manually from the Actions
tab). Make sure the repo's **Pages** settings have the source set to
**GitHub Actions**. The site is published at
`https://michael2036.github.io/Linguo/`.

`REPO_BASE` in [`vite.config.ts`](vite.config.ts) must exactly match the
repo's name, capitalization included — GitHub Pages paths are
case-sensitive, so a mismatch here 404s every asset while the root page
still loads (this broke the first deploy: the repo is `Linguo`, capital L,
but the base was set to lowercase `linguo`). Update it if the repo is ever
renamed.

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

### OAuth consent screen

Google's consent screen configuration asks for a public Privacy Policy and
Terms of Service URL — the app ships both as real pages, once deployed:

- `https://michael2036.github.io/Linguo/#/privacy`
- `https://michael2036.github.io/Linguo/#/terms`

## Content authoring

Content follows the real structure of the "Momente" (Hueber) textbook
series: **Level** (A1/A2/B1) → **Modul** (1–8) → **Lektion** (exactly 3 per
Modul). Modul packs live at `public/data/<level>/modul-<N>.json` and must
match [`public/schemas/modul-schema.json`](public/schemas/modul-schema.json).
`public/data/a1/modul-1.json` is a hand-authored pilot (3 Lektionen) — use it
as a reference for format and pedagogical structure when authoring more.

Each Lektion has two independent pathways: **Übung** (Practice — vocab, then
three graded tiers merging both the Kursbuch and Arbeitsbuch's native
easy/hard drill split) and **Test** (Direct Test Mode — a separate,
originally-authored assessment bank, reachable instantly with no gating).

New Moduln are meant to be produced by the three-agent offline authoring
pipeline described in [`.agents/`](.agents) (Didactic Generator →
Pedagogical Critic & Auditor → Test Item Writer → Auditor again), not
written by hand — see [`.agents/pipeline.md`](.agents/pipeline.md) for the
full workflow.

To add a finished Modul to the app, add its entry to `MODUL_CATALOG` in
[`src/lib/curriculumLoader.ts`](src/lib/curriculumLoader.ts). If it's the
first Modul for a new level, also add that level to `LEVEL_CATALOG` in the
same file, which supplies the section header the home page groups Moduln
under.
