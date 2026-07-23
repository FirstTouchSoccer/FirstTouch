import Image from 'next/image'
import { BadgeCheck, MapPin, Settings } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { careerStats, highlights } from '@/components/profile/profile-data'

export function ProfileHeader() {
  return (
    <header className="px-5 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold tracking-tight">Profile</h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            aria-label="Settings"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors duration-200"
          >
            <Settings className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>

      {/* Player card */}
      <div className="mt-4 overflow-hidden rounded-3xl border border-border bg-card transition-colors duration-200">
        <div className="flex items-center gap-4 p-5">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl ring-2 ring-border">
            <Image
              src="/player-avatar.png"
              alt="Diego Marín"
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-lg font-bold text-black dark:text-[color:var(--sand)]">Diego Marín</p>
              <BadgeCheck className="h-4 w-4 shrink-0 text-[color:var(--sand)]" />
            </div>
            <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>Valencia, ES</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="rounded-full bg-[color:var(--sage)] px-2.5 py-0.5 text-[10px] font-bold text-[color:var(--sage-foreground)]">
                CAM
              </span>
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-bold text-[color:var(--sand)]">
                78 OVR
              </span>
              <span className="text-[11px] font-medium text-muted-foreground">
                Age 17
              </span>
            </div>
          </div>
        </div>

        {/* career highlights strip */}
        <div className="grid grid-cols-3 border-t border-border">
          {highlights.map((h, i) => {
            const Icon = h.icon
            return (
              <div
                key={h.label}
                className={
                  i < highlights.length - 1
                    ? 'border-r border-border px-4 py-3'
                    : 'px-4 py-3'
                }
              >
                <div className="flex items-center gap-1 text-[color:var(--sand)]">
                  <Icon className="h-3.5 w-3.5" />
                  <span className="text-sm font-bold">{h.value}</span>
                </div>
                <p className="mt-0.5 text-[10px] leading-tight text-muted-foreground">
                  {h.label}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* career stat chips */}
      <div className="mt-3 grid grid-cols-4 gap-2">
        {careerStats.map((s) => {
          const Icon = s.icon
          return (
            <div
              key={s.label}
              className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-card py-3 transition-colors duration-200"
            >
              <Icon className="h-4 w-4 text-primary" />
              <span className="text-base font-bold leading-none">
                {s.value}
              </span>
              <span className="text-[10px] leading-tight text-muted-foreground">
                {s.label}
              </span>
            </div>
          )
        })}
      </div>
    </header>
  )
}
