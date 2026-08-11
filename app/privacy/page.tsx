import Link from 'next/link'
import { Logo } from '@/components/logo'
import { PrivacyContent } from '@/components/legal/privacy-content'

export const metadata = { title: 'Privacy Policy' }

export default function PrivacyPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center gap-8 bg-background p-6 pb-16">
      <Link href="/" className="pt-2">
        <Logo size="lg" />
      </Link>
      <div className="w-full max-w-2xl rounded-3xl border border-border bg-card p-6 sm:p-8">
        <PrivacyContent />
      </div>
    </div>
  )
}
