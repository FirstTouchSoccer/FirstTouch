'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  ArrowLeft,
  Star,
  BadgeCheck,
  Check,
  CalendarDays,
  Clock,
  CalendarPlus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Coach } from '@/components/coaches/coaches-data'

type Step = 'calendar' | 'questionnaire' | 'confirmed'

const days = [
  { label: 'Mon', date: '12' },
  { label: 'Tue', date: '13' },
  { label: 'Wed', date: '14' },
  { label: 'Thu', date: '15' },
  { label: 'Fri', date: '16' },
  { label: 'Sat', date: '17' },
  { label: 'Sun', date: '18' },
]

const slots = ['09:00', '10:30', '13:00', '14:30', '16:00', '17:30']

const focusOptions = [
  'First touch under pressure',
  'Weak foot control',
  '1v1 dribbling',
  'Finishing & shooting',
  'Positioning & scanning',
  'Sprint mechanics',
]

export function BookingFlow({
  coach,
  onBack,
}: {
  coach: Coach
  onBack: () => void
}) {
  const [step, setStep] = useState<Step>('calendar')
  const [day, setDay] = useState(days[2])
  const [slot, setSlot] = useState<string | null>(null)
  const [focus, setFocus] = useState<string[]>([])
  const [level, setLevel] = useState('Competitive club')

  const toggleFocus = (f: string) =>
    setFocus((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f],
    )

  return (
    <div className="animate-in fade-in duration-500">
      <header className="flex items-center gap-3 px-5 pt-8">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to coaches"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-lg font-bold tracking-tight">Book a session</h1>
      </header>

      {/* Coach summary */}
      <div className="mt-5 px-5">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
            <Image
              src={coach.avatar}
              alt={coach.name}
              fill
              className="object-cover"
              sizes="56px"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-sm font-bold">{coach.name}</p>
              <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />
            </div>
            <p className="truncate text-xs text-muted-foreground">
              {coach.title}
            </p>
            <div className="mt-1 flex items-center gap-1 text-[11px]">
              <Star className="h-3 w-3 fill-bronze text-bronze" />
              <span className="font-semibold">{coach.rating}</span>
              <span className="text-muted-foreground">
                · ${coach.rate}/session
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Step indicator */}
      {step !== 'confirmed' && (
        <div className="mt-5 flex items-center gap-2 px-5">
          {(['calendar', 'questionnaire'] as const).map((s, i) => (
            <div key={s} className="flex flex-1 items-center gap-2">
              <div
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold',
                  step === s ||
                    (s === 'calendar' && step === 'questionnaire')
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground',
                )}
              >
                {s === 'calendar' && step === 'questionnaire' ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={cn(
                  'text-xs font-medium',
                  step === s ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {s === 'calendar' ? 'Date & time' : 'Focus'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Step: Calendar */}
      {step === 'calendar' && (
        <div className="mt-5 px-5">
          <div className="mb-2 flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-semibold">Select a date · June</p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {days.map((d) => (
              <button
                key={d.date}
                type="button"
                onClick={() => setDay(d)}
                className={cn(
                  'flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-2xl border transition-colors',
                  day.date === d.date
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-foreground',
                )}
              >
                <span className="text-[11px] font-medium opacity-80">
                  {d.label}
                </span>
                <span className="text-base font-bold">{d.date}</span>
              </button>
            ))}
          </div>

          <div className="mb-2 mt-5 flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-semibold">Available slots</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {slots.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSlot(s)}
                className={cn(
                  'rounded-xl border py-3 text-sm font-semibold transition-colors',
                  slot === s
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-foreground',
                )}
              >
                {s}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={!slot}
            onClick={() => setStep('questionnaire')}
            className="mt-6 w-full rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground transition-opacity disabled:opacity-40"
          >
            Continue
          </button>
        </div>
      )}

      {/* Step: Questionnaire */}
      {step === 'questionnaire' && (
        <div className="mt-5 px-5">
          <h2 className="text-sm font-bold tracking-tight">
            What do you want to focus on?
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Select all that apply — your coach preps around this.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {focusOptions.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => toggleFocus(f)}
                className={cn(
                  'rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors',
                  focus.includes(f)
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-foreground',
                )}
              >
                {f}
              </button>
            ))}
          </div>

          <h3 className="mt-6 text-sm font-bold tracking-tight">
            Current level
          </h3>
          <div className="mt-2 flex flex-col gap-2">
            {['Recreational', 'Competitive club', 'Academy / semi-pro'].map(
              (l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLevel(l)}
                  className={cn(
                    'flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-medium transition-colors',
                    level === l
                      ? 'border-primary bg-primary/5 text-foreground'
                      : 'border-border bg-card text-foreground',
                  )}
                >
                  {l}
                  <span
                    className={cn(
                      'flex h-5 w-5 items-center justify-center rounded-full border',
                      level === l
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border',
                    )}
                  >
                    {level === l && <Check className="h-3 w-3" />}
                  </span>
                </button>
              ),
            )}
          </div>

          <label className="mt-6 block text-sm font-bold tracking-tight">
            Anything else?
          </label>
          <textarea
            rows={3}
            placeholder="e.g. I struggle receiving with my back to goal..."
            className="mt-2 w-full resize-none rounded-2xl border border-border bg-card p-4 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
          />

          <button
            type="button"
            onClick={() => setStep('confirmed')}
            className="mt-5 w-full rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground"
          >
            Confirm booking
          </button>
        </div>
      )}

      {/* Step: Confirmation */}
      {step === 'confirmed' && (
        <div className="mt-6 px-5 pb-4 animate-in fade-in zoom-in-95 duration-500">
          <div className="flex flex-col items-center text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <Check className="h-8 w-8" strokeWidth={3} />
            </span>
            <h2 className="mt-4 text-xl font-bold tracking-tight">
              Session booked!
            </h2>
            <p className="mt-1 text-sm text-muted-foreground text-balance">
              You&apos;re all set with {coach.name}. A calendar invite has been
              sent.
            </p>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex items-center gap-3 border-b border-border p-4">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                <Image
                  src={coach.avatar}
                  alt={coach.name}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
              <div>
                <p className="text-sm font-bold">1-on-1 with {coach.name}</p>
                <p className="text-xs text-muted-foreground">
                  Video call · 45 min
                </p>
              </div>
            </div>
            <dl className="divide-y divide-border text-sm">
              <div className="flex items-center justify-between px-4 py-3">
                <dt className="text-muted-foreground">Date</dt>
                <dd className="font-semibold">Wed, June {day.date}</dd>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <dt className="text-muted-foreground">Time</dt>
                <dd className="font-semibold">{slot} · 45 min</dd>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <dt className="text-muted-foreground">Focus</dt>
                <dd className="max-w-[60%] text-right font-semibold">
                  {focus.length ? focus.join(', ') : 'General review'}
                </dd>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <dt className="text-muted-foreground">Total</dt>
                <dd className="font-bold text-primary">${coach.rate}.00</dd>
              </div>
            </dl>
          </div>

          <button
            type="button"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3.5 text-sm font-bold text-foreground"
          >
            <CalendarPlus className="h-4 w-4" />
            Add to calendar
          </button>
          <button
            type="button"
            onClick={onBack}
            className="mt-2 w-full rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground"
          >
            Done
          </button>
        </div>
      )}
    </div>
  )
}
