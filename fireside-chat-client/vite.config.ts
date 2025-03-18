import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

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
                description: "A chat app where conversations burn out like a campfire.",
                start_url: "/",
                display: "standalone",
                theme_color: "#000000",
                background_color: "#000000",
                icons: [
                    {
                        src: "/favicon-192x192.png",
                        sizes: "192x192",
                        type: "image/png",
                        purpose: "any maskable"
                    },
                    {
                        src: "/favicon-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "any maskable"
                    }
                ]
            },
            workbox: {
                runtimeCaching: [
                    {
                        urlPattern: ({ request }) => request.destination === 'document',
                        handler: 'NetworkFirst', // Ensures the latest content is fetched if online
                        options: {
                            cacheName: 'html-cache',
                            expiration: { maxEntries: 10, maxAgeSeconds: 7 * 24 * 60 * 60 } // 7 days
                        }
                    },
                    {
                        urlPattern: ({ request }) => request.destination === 'script' || request.destination === 'style',
                        handler: 'StaleWhileRevalidate', // Uses cached assets but updates in the background
                        options: {
                            cacheName: 'static-resources',
                            expiration: { maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 } // 30 days
                        }
                    },
                    {
                        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|ico|webp)$/,
                        handler: 'CacheFirst', // Always serves cached images
                        options: {
                            cacheName: 'image-cache',
                            expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 } // 30 days
                        }
                    },
                    {
                        urlPattern: /\.(?:woff2|ttf|woff|eot)$/,
                        handler: 'CacheFirst', // Fonts should always load from cache if available
                        options: {
                            cacheName: 'font-cache',
                            expiration: { maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 } // 1 year
                        }
                    },
                    {
                        urlPattern: /^https:\/\/firestore\.googleapis\.com\//,
                        handler: 'NetworkFirst', // Ensures Firestore data is up-to-date when online
                        options: {
                            cacheName: 'firestore-cache',
                            expiration: { maxEntries: 50, maxAgeSeconds: 3600 } // 1 hour
                        }
                    }
                ],
                navigateFallback: '/index.html' // Ensures the app works offline properly
            },
            includeAssets: [
                "campfire.gif",
                "favicon.ico",
                "favicon.svg",
                "favicon-96x96.png",
                "favicon-192x192.png",
                "favicon-512x512.png",
            ]
        })
    ],
})
