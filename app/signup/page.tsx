import { AuthCard } from '@/components/auth-card'

export default function SignupPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-6">
      <AuthCard mode="signup" />
    </div>
  )
}
