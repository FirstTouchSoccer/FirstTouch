'use client'

import { useRef, useState } from 'react'
import {
  Zap,
  Film,
  Target,
  Gauge,
  Wind,
  Crosshair,
  UploadCloud,
  Sparkles,
  Smartphone,
  Sun,
  User,
  Video,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AiLoader } from '@/components/ai-lab/ai-loader'
import { UploadResult } from '@/components/ai-lab/upload-result'
import { AnalysisResult } from '@/components/ai-lab/analysis-result'
import { authToken, createClip, startCheckout, updateClip } from '@/lib/store'
import { analyzeVideo } from '@/lib/pose'
import { getVideoDuration } from '@/lib/video-duration'
import { buildMockFeedback } from '@/lib/mock-feedback'
import { usePlayers } from '@/lib/players-context'
import type { Clip, Feedback, SkillTag } from '@/lib/types'

type Mode = 'skill' | 'match'
type Phase = 'idle' | 'processing' | 'result'

const MAX_SKILL_CLIP_SECONDS = 60
const MAX_MATCH_BYTES = 2 * 1024 * 1024 * 1024

const recordingTips = [
  { icon: Smartphone, text: 'Landscape orientation, camera steady or braced' },
  { icon: User, text: 'Full body in frame — just the one player' },
  { icon: Sun, text: 'Good daylight or well-lit indoors, avoid backlighting' },
  { icon: Video, text: `Up to ${MAX_SKILL_CLIP_SECONDS}s, MP4 or MOV` },
]

const skills: { id: SkillTag; label: string; icon: typeof Gauge }[] = [
  { id: 'shot-velocity', label: 'Shot Velocity', icon: Gauge },
  { id: 'free-kick-curve', label: 'Free Kick Curve', icon: Wind },
  { id: 'penalty-placement', label: 'Penalty Placement', icon: Target },
  { id: '1v1-dribble', label: '1v1 Dribble', icon: Crosshair },
]

const skillSteps = [
  'Uploading your clip...',
  'Reading your movement...',
  'Getting your coach feedback...',
  'Almost done...',
]

const matchSteps = [
  'Uploading your session...',
  'Packaging for your coach...',
  'Sending notification...',
  'Almost done...',
]

export function AiLabTab() {
  const { activePlayer: profile, billing, refreshBilling } = usePlayers()
  const [mode, setMode] = useState<Mode>('skill')
  const [phase, setPhase] = useState<Phase>('idle')
  const [skill, setSkill] = useState(skills[0])
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [savedClip, setSavedClip] = useState<Clip | null>(null)
  const [activeStep, setActiveStep] = useState(0)
  const [paywallNotice, setPaywallNotice] = useState(false)
  const [checkoutBusy, setCheckoutBusy] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const paywalled = !billing.isEntitled && billing.freeAnalysesUsed >= billing.freeAnalysesLimit
  const freeRemaining = Math.max(0, billing.freeAnalysesLimit - billing.freeAnalysesUsed)

  async function upgrade() {
    setCheckoutBusy(true)
    try {
      window.location.href = await startCheckout()
    } catch {
      setCheckoutBusy(false)
    }
  }

  function reset() {
    setPhase('idle')
    setDragging(false)
    setFile(null)
    setFileError(null)
    setSavedClip(null)
    setActiveStep(0)
    setPaywallNotice(false)
    setUploadError(null)
  }

  function switchMode(m: Mode) {
    setMode(m)
    reset()
  }

  async function pickSkillFile(picked: File | null) {
    setFileError(null)
    if (!picked) {
      setFile(null)
      return
    }
    try {
      const seconds = await getVideoDuration(picked)
      if (seconds > MAX_SKILL_CLIP_SECONDS) {
        setFile(null)
        setFileError(
          `That clip is ${Math.round(seconds)}s — trim it to ${MAX_SKILL_CLIP_SECONDS}s or under and try again.`,
        )
        return
      }
      setFile(picked)
    } catch {
      setFile(null)
      setFileError("Couldn't read that file — try a different video.")
    }
  }

  async function pickMatchFile(picked: File | null) {
    setFileError(null)
    if (!picked) {
      setFile(null)
      return
    }
    if (picked.size > MAX_MATCH_BYTES) {
      setFile(null)
      setFileError(
        `That file is ${(picked.size / (1024 * 1024 * 1024)).toFixed(1)}GB — FirstTouch accepts up to 2GB per upload.`,
      )
      return
    }
    try {
      // Not enforcing a duration cap here (full sessions are meant to be
      // long) — this just confirms it's a real, decodable video, since
      // drag-and-drop bypasses the file picker's "video/*" filter.
      await getVideoDuration(picked)
      setFile(picked)
    } catch {
      setFile(null)
      setFileError("Couldn't read that file — make sure it's a video, then try again.")
    }
  }

  async function runUpload(skillTag: SkillTag, title: string) {
    if (!file || !profile) return
    setPhase('processing')
    setActiveStep(0)
    setUploadError(null)
    try {
      const clip = await createClip(profile.id, title, file, skillTag)

      if (skillTag === 'full-match') {
        await updateClip(clip.id, { status: 'sent_to_coach' })
        setSavedClip({ ...clip, status: 'sent_to_coach' })
        setPhase('result')
        return
      }

      // Single-Skill: run real pose analysis (in-browser) + AI coach feedback.
      setActiveStep(1)
      const metrics = await analyzeVideo(file)

      setActiveStep(2)
      let feedback: Feedback
      try {
        const res = await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await authToken()}` },
          body: JSON.stringify({
            profile: {
              name: profile.name,
              age: profile.age,
              experience: profile.experience,
              position: profile.position,
              attributes: profile.attributes,
            },
            metrics,
            clipTitle: title,
          }),
        })
        if (res.status === 402) {
          // Free pool was exhausted server-side between page load and this
          // upload (stale client cache, or another device on the same
          // account). The clip stays as-is (uploaded, no feedback) — nothing
          // to undo, just surface the upgrade prompt instead of a result.
          refreshBilling()
          setPhase('idle')
          setPaywallNotice(true)
          return
        }
        const data = await res.json()
        feedback = data.feedback
      } catch {
        feedback = buildMockFeedback(profile, metrics)
      }

      refreshBilling()
      setActiveStep(3)
      await updateClip(clip.id, { status: 'analyzed', metrics, feedback })
      setSavedClip({ ...clip, status: 'analyzed', metrics, feedback })
      setPhase('result')
    } catch (err) {
      // Anything that throws here (upload, save) previously left the loader
      // spinning forever with no feedback — surface it and let them retry.
      setPhase('idle')
      setUploadError(err instanceof Error ? err.message : 'Something went wrong with that upload — try again.')
    }
  }

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <header className="px-5 pt-8">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Zap className="h-4 w-4" />
          </span>
          <div>
            <h1 className="text-lg font-bold leading-none tracking-tight">
              AI Lab
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Upload clips &amp; full sessions for your coach
            </p>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="mt-5 grid grid-cols-2 gap-1 rounded-2xl bg-secondary p-1">
          <button
            type="button"
            onClick={() => switchMode('skill')}
            className={cn(
              'flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold transition-colors',
              mode === 'skill'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground',
            )}
          >
            <Zap className="h-3.5 w-3.5" />
            Single-Skill
          </button>
          <button
            type="button"
            onClick={() => switchMode('match')}
            className={cn(
              'flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold transition-colors',
              mode === 'match'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground',
            )}
          >
            <Film className="h-3.5 w-3.5" />
            Full Match
          </button>
        </div>
      </header>

      <div className="px-5 pt-5">
        {phase === 'processing' && (
          <AiLoader
            title={mode === 'skill' ? 'Analyzing your clip' : 'Sending your session'}
            steps={mode === 'skill' ? skillSteps : matchSteps}
            activeStep={mode === 'skill' ? activeStep : undefined}
            onComplete={() => setPhase('result')}
          />
        )}

        {phase === 'result' && savedClip && savedClip.feedback && profile && (
          <AnalysisResult clip={savedClip} profile={profile} onReset={reset} onClipUpdate={setSavedClip} />
        )}

        {phase === 'result' && savedClip && !savedClip.feedback && (
          <UploadResult clip={savedClip} onReset={reset} />
        )}

        {phase === 'idle' && mode === 'skill' && (
          <div className="animate-in fade-in duration-300">
            <p className="mb-3 text-sm font-semibold">Pick a skill to analyze</p>
            <div className="grid grid-cols-2 gap-3">
              {skills.map((s) => {
                const Icon = s.icon
                const active = skill.id === s.id
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSkill(s)}
                    className={cn(
                      'flex items-center gap-2.5 rounded-2xl border p-4 text-left transition-colors',
                      active
                        ? 'border-primary bg-secondary'
                        : 'border-border bg-card',
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                        active
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-primary',
                      )}
                    >
                      <Icon className="h-[18px] w-[18px]" />
                    </span>
                    <span className="text-xs font-semibold leading-tight text-pretty">
                      {s.label}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="mt-4 rounded-2xl border border-border bg-card p-4">
              <p className="text-xs font-semibold text-muted-foreground">
                How to record it
              </p>
              <ul className="mt-2 flex flex-col gap-2">
                {recordingTips.map((tip) => {
                  const Icon = tip.icon
                  return (
                    <li key={tip.text} className="flex items-center gap-2.5 text-xs text-foreground">
                      <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />
                      {tip.text}
                    </li>
                  )
                })}
              </ul>
              <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
                FirstTouch reads body movement from the video — it doesn&apos;t identify who&apos;s in it. Upload{' '}
                {profile?.name ?? 'this player'}&apos;s own footage so the read and training plan are actually
                calibrated to their age and experience level.
              </p>
            </div>

            <Uploader
              hint={`Drop a clip, up to ${MAX_SKILL_CLIP_SECONDS}s`}
              sub="Landscape · MP4 or MOV"
              dragging={dragging}
              setDragging={setDragging}
              onPick={pickSkillFile}
              fileRef={fileRef}
              fileName={file?.name ?? null}
            />
            {fileError && (
              <p className="mt-2 text-xs font-medium text-rose">{fileError}</p>
            )}
            {uploadError && (
              <p className="mt-2 text-xs font-medium text-rose">{uploadError}</p>
            )}

            {paywallNotice && (
              <p className="mt-2 text-xs font-medium text-rose">
                You&apos;ve used both free analyses — upgrade to keep going.
              </p>
            )}
            {!paywallNotice && !billing.isEntitled && !paywalled && (
              <p className="mt-2 text-xs text-muted-foreground">
                {freeRemaining} free analysis{freeRemaining === 1 ? '' : 'es'} left on your account.
              </p>
            )}

            {paywalled ? (
              <button
                type="button"
                onClick={upgrade}
                disabled={checkoutBusy}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground active:scale-[0.99] disabled:opacity-40"
              >
                <Sparkles className="h-4 w-4" />
                {checkoutBusy ? 'Redirecting…' : 'Upgrade to Pro — $20/mo'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => runUpload(skill.id, skill.label)}
                disabled={!file}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground active:scale-[0.99] disabled:opacity-40"
              >
                <Sparkles className="h-4 w-4" />
                Analyze {skill.label}
              </button>
            )}
          </div>
        )}

        {phase === 'idle' && mode === 'match' && (
          <div className="animate-in fade-in duration-300">
            <p className="mb-3 text-sm font-semibold">
              Upload a full game or training session
            </p>
            <Uploader
              hint="Drag & drop your footage"
              sub="Full match or long session · up to 2GB"
              dragging={dragging}
              setDragging={setDragging}
              onPick={pickMatchFile}
              fileRef={fileRef}
              fileName={file?.name ?? null}
              large
            />
            {fileError && (
              <p className="mt-2 text-xs font-medium text-rose">{fileError}</p>
            )}
            {uploadError && (
              <p className="mt-2 text-xs font-medium text-rose">{uploadError}</p>
            )}

            <div className="mt-3 rounded-2xl border border-border bg-card p-4">
              <p className="text-xs font-semibold text-muted-foreground">
                What happens next
              </p>
              <ul className="mt-2 flex flex-col gap-2 text-xs text-muted-foreground">
                {[
                  'Your footage uploads securely to your Vault',
                  'Your coach gets notified to review the session',
                  "You'll see their notes in Coaches once it's done",
                ].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-sage" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={() => runUpload('full-match', 'Full Match Session')}
              disabled={!file}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground active:scale-[0.99] disabled:opacity-40"
            >
              <Sparkles className="h-4 w-4" />
              Send to your coach
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function Uploader({
  hint,
  sub,
  dragging,
  setDragging,
  onPick,
  fileRef,
  fileName,
  large,
}: {
  hint: string
  sub: string
  dragging: boolean
  setDragging: (v: boolean) => void
  onPick: (file: File | null) => void
  fileRef: React.RefObject<HTMLInputElement | null>
  fileName: string | null
  large?: boolean
}) {
  return (
    <button
      type="button"
      onClick={() => fileRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        onPick(e.dataTransfer.files?.[0] ?? null)
      }}
      className={cn(
        'mt-4 flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 text-center transition-colors',
        large ? 'py-12' : 'py-10',
        dragging
          ? 'border-primary bg-secondary'
          : 'border-border bg-card',
      )}
    >
      <span
        className={cn(
          'flex h-14 w-14 items-center justify-center rounded-2xl transition-colors',
          dragging ? 'bg-primary text-primary-foreground' : 'bg-secondary text-primary',
        )}
      >
        <UploadCloud className="h-6 w-6" />
      </span>
      <span className="mt-3 text-sm font-semibold">{fileName ?? hint}</span>
      <span className="mt-1 text-xs text-muted-foreground">
        {fileName ? 'Tap to choose a different file' : sub}
      </span>
      <input
        ref={fileRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => onPick(e.target.files?.[0] ?? null)}
      />
    </button>
  )
}
