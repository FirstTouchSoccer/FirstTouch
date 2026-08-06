import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FirstTouch — AI Soccer Coaching',
    short_name: 'FirstTouch',
    description: 'AI-powered coaching feedback, drills, and progress tracking for youth soccer players.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f6f9f6',
    theme_color: '#15703c',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
