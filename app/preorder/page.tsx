import type { Metadata, Viewport } from 'next'
import { PreorderPage } from './preorder-page'
import './preorder.css'

export const metadata: Metadata = {
  title: 'FirstTouch \u2014 Preorder',
  description:
    'Film thirty seconds on your phone. FirstTouch reads how the body moves, '
    + 'grades it into bands you can act on, and writes the week\u2019s drills.',
}

// The root layout pins the app shell at maximumScale 1 so it behaves like a
// native app. That also blocks pinch-zoom, which fails WCAG 1.4.4 on a public
// marketing page, so this route opts back in.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f2ed' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a18' },
  ],
}

export default function Page() {
  return <PreorderPage />
}
