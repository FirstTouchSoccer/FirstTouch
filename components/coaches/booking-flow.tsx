'use client'

import { useState } from 'react'
import { PlayerAvatar } from '@/components/player-avatar'
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
import type { Coach } from '@/lib/coaches'
import { createBooking } from '@/lib/store'
import { usePlayers } from '@/lib/players-context'
import { useTranslation } from '@/lib/i18n/context'
import { tf } from '@/lib/i18n/format'
import type { SessionBooking } from '@/lib/types'

type Step = 'calendar' | 'questionnaire' | 'confirmed'

function buildDays(count = 7): Date[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    return d
  })
}

function downloadIcs(booking: SessionBooking, coachName: string) {
  const start = new Date(booking.startsAt)
  const end = new Date(start.getTime() + booking.durationMin * 60_000)
  const fmt = (d: Date) => `${d.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `UID:${booking.id}@firsttouch`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:1-on-1 with ${coachName}`,
    `DESCRIPTION:${booking.focus.join(', ') || 'General review'}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
  const blob = new Blob([ics], { type: 'text/calendar' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'first-touch-session.ics'
  a.click()
  URL.revokeObjectURL(url)
}

const slots = ['09:00', '10:30', '13:00', '14:30', '16:00', '17:30']

export function BookingFlow({
  coach,
  onBack,
}: {
  coach: Coach
  onBack: () => void
}) {
  const { activePlayer } = usePlayers()
  const { t, language } = useTranslation()
  const locale = language === 'ru' ? 'ru-RU' : 'en-US'
  const focusOptions = [
    t.bookingFlow.focusOption1,
    t.bookingFlow.focusOption2,
    t.bookingFlow.focusOption3,
    t.bookingFlow.focusOption4,
    t.bookingFlow.focusOption5,
    t.bookingFlow.focusOption6,
  ]
  const levels = [t.bookingFlow.levelRecreational, t.bookingFlow.levelCompetitive, t.bookingFlow.levelAcademy]
  const [days] = useState(() => buildDays())
  const [step, setStep] = useState<Step>('calendar')
  const [day, setDay] = useState(days[2])
  const [slot, setSlot] = useState<string | null>(null)
  const [focus, setFocus] = useState<string[]>([])
  const [level, setLevel] = useState(t.bookingFlow.levelCompetitive)
  const [notes, setNotes] = useState('')
  const [booking, setBooking] = useState<SessionBooking | null>(null)
  const [saving, setSaving] = useState(false)

  const toggleFocus = (f: string) =>
    setFocus((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f],
    )

  async function confirmBooking() {
    if (!slot || !activePlayer) return
    setSaving(true)
    const [hours, minutes] = slot.split(':').map(Number)
    const startsAt = new Date(day)
    startsAt.setHours(hours, minutes, 0, 0)
    const created = await createBooking(activePlayer.id, {
      coachId: coach.id,
      startsAt: startsAt.toISOString(),
      durationMin: 45,
      focus,
      level,
      notes: notes || null,
    })
    setBooking(created)
    setSaving(false)
    setStep('confirmed')
  }

  return (
    <div className="animate-in fade-in duration-500">
      <header className="flex items-center gap-3 px-5 pt-8">
        <button
          type="button"
          onClick={onBack}
          aria-label={t.bookingFlow.backToCoaches}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-lg font-bold tracking-tight">{t.bookingFlow.title}</h1>
      </header>

      {/* Coach summary */}
      <div className="mt-5 px-5">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
            <PlayerAvatar name={coach.name} avatarUrl={coach.avatar} sizePx={56} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-sm font-bold">{coach.name}</p>
              <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />
            </div>
            <p className="truncate text-xs text-muted-foreground">
              {coach.title || t.coaches.defaultCoachTitle}
            </p>
            <div className="mt-1 flex items-center gap-1 text-[11px]">
              <Star className="h-3 w-3 fill-bronze text-bronze" />
              <span className="font-semibold">{coach.rating}</span>
              <span className="text-muted-foreground">
                · ${coach.rate}{t.bookingFlow.perSession}
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
                {s === 'calendar' ? t.bookingFlow.dateAndTime : t.bookingFlow.focus}
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
            <p className="text-sm font-semibold">
              {t.bookingFlow.selectDate} · {day.toLocaleDateString(locale, { month: 'long' })}
            </p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {days.map((d) => (
              <button
                key={d.toISOString()}
                type="button"
                onClick={() => setDay(d)}
                className={cn(
                  'flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-2xl border transition-colors',
                  day.getTime() === d.getTime()
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-foreground',
                )}
              >
                <span className="text-[11px] font-medium opacity-80">
                  {d.toLocaleDateString(locale, { weekday: 'short' })}
                </span>
                <span className="text-base font-bold">{d.getDate()}</span>
              </button>
            ))}
          </div>

          <div className="mb-2 mt-5 flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-semibold">{t.bookingFlow.availableSlots}</p>
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
            {t.bookingFlow.continue}
          </button>
        </div>
      )}

      {/* Step: Questionnaire */}
      {step === 'questionnaire' && (
        <div className="mt-5 px-5">
          <h2 className="text-sm font-bold tracking-tight">
            {t.bookingFlow.focusQuestion}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t.bookingFlow.focusSubtitle}
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
            {t.bookingFlow.currentLevel}
          </h3>
          <div className="mt-2 flex flex-col gap-2">
            {levels.map(
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
            {t.bookingFlow.anythingElse}
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t.bookingFlow.notesPlaceholder}
            className="mt-2 w-full resize-none rounded-2xl border border-border bg-card p-4 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
          />

          <button
            type="button"
            onClick={confirmBooking}
            disabled={saving}
            className="mt-5 w-full rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
          >
            {saving ? t.bookingFlow.booking : t.bookingFlow.confirmBooking}
          </button>
        </div>
      )}

      {/* Step: Confirmation */}
      {step === 'confirmed' && booking && (
        <div className="mt-6 px-5 pb-4 animate-in fade-in zoom-in-95 duration-500">
          <div className="flex flex-col items-center text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <Check className="h-8 w-8" strokeWidth={3} />
            </span>
            <h2 className="mt-4 text-xl font-bold tracking-tight">
              {t.bookingFlow.sessionBooked}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground text-balance">
              {tf(t.bookingFlow.allSetWith, { coach: coach.name })}
            </p>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex items-center gap-3 border-b border-border p-4">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                <PlayerAvatar name={coach.name} avatarUrl={coach.avatar} sizePx={48} />
              </div>
              <div>
                <p className="text-sm font-bold">{tf(t.activityHistory.oneOnOneWith, { coach: coach.name })}</p>
                <p className="text-xs text-muted-foreground">
                  {t.bookingFlow.videoCall} · {booking.durationMin} {t.activityHistory.min}
                </p>
              </div>
            </div>
            <dl className="divide-y divide-border text-sm">
              <div className="flex items-center justify-between px-4 py-3">
                <dt className="text-muted-foreground">{t.bookingFlow.date}</dt>
                <dd className="font-semibold">
                  {new Date(booking.startsAt).toLocaleDateString(locale, {
                    weekday: 'short',
                    month: 'long',
                    day: 'numeric',
                  })}
                </dd>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <dt className="text-muted-foreground">{t.bookingFlow.time}</dt>
                <dd className="font-semibold">
                  {new Date(booking.startsAt).toLocaleTimeString(locale, {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}{' '}
                  · {booking.durationMin} {t.activityHistory.min}
                </dd>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <dt className="text-muted-foreground">{t.bookingFlow.focusLabel}</dt>
                <dd className="max-w-[60%] text-right font-semibold">
                  {booking.focus.length ? booking.focus.join(', ') : t.bookingFlow.generalReview}
                </dd>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <dt className="text-muted-foreground">{t.bookingFlow.total}</dt>
                <dd className="font-bold text-primary">${coach.rate}.00</dd>
              </div>
            </dl>
          </div>

          <button
            type="button"
            onClick={() => downloadIcs(booking, coach.name)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3.5 text-sm font-bold text-foreground"
          >
            <CalendarPlus className="h-4 w-4" />
            {t.bookingFlow.addToCalendar}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="mt-2 w-full rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground"
          >
            {t.bookingFlow.done}
          </button>
        </div>
      )}
    </div>
  )
}
