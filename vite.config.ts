import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// TR-02: GitHub Pages serves this repo from https://<user>.github.io/Linguo/,
// so every built asset URL must be prefixed with that sub-path. Local dev
// keeps `/` so `npm run dev` still works at the site root.
//
// Case matters here: GitHub Pages paths are case-sensitive and this repo's
// actual name is `Linguo` (capital L) — a lowercase base silently 404s
// every asset while the root HTML still loads, which is exactly the bug
// this comment exists to stop someone from reintroducing.
const REPO_BASE = '/Linguo/'

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? REPO_BASE : '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/apple-touch-icon.png', 'icons/favicon.png'],
      manifest: {
        name: 'Linguo',
        short_name: 'Linguo',
        description: 'Zero-cost, local-first German practice companion',
        lang: 'de',
        dir: 'ltr',
        categories: ['education', 'lifestyle'],
        start_url: '.',
        scope: '.',
        display: 'standalone',
        background_color: '#4f30b5',
        theme_color: '#4f30b5',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Precache the chapter JSON data too, so vocab/exercises work fully
        // offline (FR-05) once the app has been opened at least once.
        globPatterns: ['**/*.{js,css,html,ico,svg,png,json}'],
        // og-image.png is fetched by external link-preview crawlers, never
        // by the app itself — no reason to spend offline-cache budget on it.
        globIgnores: ['**/og-image.png'],
        navigateFallbackDenylist: [/^\/schemas\//],
      },
    }),
  ],
})
