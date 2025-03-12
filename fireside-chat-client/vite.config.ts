import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import {VitePWA} from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(),
        VitePWA({
            registerType: 'autoUpdate',
            devOptions: {
                enabled: true, // Enable PWA in dev mode
            },
            manifest: {
                name: "Fireside Chats",
                short_name: "Fireside",
                icons: [
                    {
                        src: "/web-app-manifest-192x192.png",
                        sizes: "192x192",
                        type: "image/png",
                        purpose: "maskable"
                    },
                    {
                        src: "/web-app-manifest-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "maskable"
                    }
                ],
                theme_color: "#000000",
                background_color: "#000000",
                display: "standalone"
            },
            workbox: {
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/firestore.googleapis.com\//,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'firestore-cache',
                            expiration: {maxEntries: 50, maxAgeSeconds: 3600}
                        }
                    }
                ]
            }
        })
    ],
})
