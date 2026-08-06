import { AuthCard } from '@/components/auth-card'
import { Logo } from '@/components/logo'

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-background p-6">
      <Logo size="lg" />
      <AuthCard mode="login" />
    </div>
  )
}
