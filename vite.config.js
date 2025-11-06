import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    preact(), 
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'vite.svg'],
      manifest: {
        name: 'Enjambre',
        short_name: 'Enjambre',
        description: 'Red de apoyo mutuo.',
        theme_color: '#000000',
        background_color: '#ffffff',
        start_url: '.',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    }),
    basicSsl()
  ],
  resolve: {
    alias: {
      'react-dom/test-utils': 'preact/test-utils',
      'react-dom': 'preact/compat',
      'react': 'preact/compat'
    }
  }
  // Trivial change to trigger rebuild
})