import type { Viewport } from 'next'
import { LandingPage } from '@/components/landing/landing-page'
import '@/components/landing/landing.css'

// The root layout pins the app shell at maximumScale 1 so it behaves like a
// native app once you're signed in. That also blocks pinch-zoom, which fails
// WCAG 1.4.4 on a public marketing page, so this route opts back in.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function Page() {
  return <LandingPage />
}
