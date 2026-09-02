import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// TR-02: GitHub Pages serves this repo from https://<user>.github.io/linguo/,
// so every built asset URL must be prefixed with that sub-path. Local dev
// keeps `/` so `npm run dev` still works at the site root.
const REPO_BASE = '/linguo/'

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? REPO_BASE : '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/apple-touch-icon.png'],
      manifest: {
        name: 'Linguo',
        short_name: 'Linguo',
        description: 'Zero-cost, local-first German practice companion',
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
        navigateFallbackDenylist: [/^\/schemas\//],
      },
    }),
  ],
})
