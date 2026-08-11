import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { LanguageProvider } from '@/lib/i18n/context'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

const SITE_URL = 'https://soccerfirsttouch.com'
const DESCRIPTION =
  'AI-powered coaching feedback, personalized drills, and progress tracking for youth soccer players — upload a clip, get real movement analysis and a training plan back.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'FirstTouch — AI Soccer Coaching',
    template: '%s · FirstTouch',
  },
  description: DESCRIPTION,
  applicationName: 'FirstTouch',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FirstTouch',
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'FirstTouch',
    title: 'FirstTouch — AI Soccer Coaching',
    description: DESCRIPTION,
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'FirstTouch' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FirstTouch — AI Soccer Coaching',
    description: DESCRIPTION,
    images: ['/og-image.png'],
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#15703c' },
    { media: '(prefers-color-scheme: dark)', color: '#0e1210' },
  ],
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`bg-background ${inter.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased transition-colors duration-200">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>{children}</LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
