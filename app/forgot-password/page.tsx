import { ForgotPasswordCard } from '@/components/forgot-password-card'
import { Logo } from '@/components/logo'

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-background p-6">
      <Logo size="lg" />
      <ForgotPasswordCard />
    </div>
  )
}
