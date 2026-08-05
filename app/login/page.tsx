import { AuthCard } from '@/components/auth-card'

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-6">
      <AuthCard mode="login" />
    </div>
  )
}
