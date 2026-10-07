import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { fileURLToPath, URL } from "node:url";
export default defineConfig({resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/icon.svg"],
      manifest: {
        name: "Nukus Transport",
        short_name: "NukusBus",
        description: "Nukus shahrida avtobus va marshrutkalar yo'nalishi",
        lang: "uz",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#0d9488",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // Ilova qobig'i va ma'lumotlar (JSON) oldindan keshlanadi
        globPatterns: ["**/*.{js,css,html,svg,png,json}"],
        runtimeCaching: [
          {
            // Xarita plitkalari: ko'rilganlari offline'da ishlaydi
            urlPattern: /^https:\/\/[a-c]\.tile\.openstreetmap\.org\/.*/,
            handler: "CacheFirst",
            options: {
              cacheName: "osm-tiles",
              expiration: { maxEntries: 600, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
});
