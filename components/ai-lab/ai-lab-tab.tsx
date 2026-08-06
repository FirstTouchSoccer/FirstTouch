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
import { createClip, updateClip } from '@/lib/store'
import { analyzeVideo } from '@/lib/pose'
import { buildMockFeedback } from '@/lib/mock-feedback'
import { usePlayer } from '@/lib/player-context'
import type { Clip, Feedback, SkillTag } from '@/lib/types'

type Mode = 'skill' | 'match'
type Phase = 'idle' | 'processing' | 'result'

const MAX_SKILL_CLIP_SECONDS = 60

function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    const url = URL.createObjectURL(file)
    video.onloadedmetadata = () => {
      // Some containers (notably MediaRecorder-produced WebM) report
      // Infinity here until the browser has actually scanned the file —
      // force it by seeking to the end, then read the resolved duration.
      if (!Number.isFinite(video.duration)) {
        video.onseeked = () => {
          URL.revokeObjectURL(url)
          resolve(Number.isFinite(video.duration) ? video.duration : 0)
        }
        video.currentTime = 1e9
        return
      }
      URL.revokeObjectURL(url)
      resolve(video.duration)
    }
    video.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read this video file.'))
    }
    video.src = url
  })
}

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
  const { profile } = usePlayer()
  const [mode, setMode] = useState<Mode>('skill')
  const [phase, setPhase] = useState<Phase>('idle')
  const [skill, setSkill] = useState(skills[0])
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [savedClip, setSavedClip] = useState<Clip | null>(null)
  const [activeStep, setActiveStep] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  function reset() {
    setPhase('idle')
    setDragging(false)
    setFile(null)
    setFileError(null)
    setSavedClip(null)
    setActiveStep(0)
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

  async function runUpload(skillTag: SkillTag, title: string) {
    if (!file || !profile) return
    setPhase('processing')
    setActiveStep(0)
    const clip = await createClip(title, file, skillTag)

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            name: profile.name,
            age: profile.age,
            position: profile.position,
            attributes: profile.attributes,
          },
          metrics,
          clipTitle: title,
        }),
      })
      const data = await res.json()
      feedback = data.feedback
    } catch {
      feedback = buildMockFeedback(profile, metrics)
    }

    setActiveStep(3)
    await updateClip(clip.id, { status: 'analyzed', metrics, feedback })
    setSavedClip({ ...clip, status: 'analyzed', metrics, feedback })
    setPhase('result')
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

            <button
              type="button"
              onClick={() => runUpload(skill.id, skill.label)}
              disabled={!file}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground active:scale-[0.99] disabled:opacity-40"
            >
              <Sparkles className="h-4 w-4" />
              Analyze {skill.label}
            </button>
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
              onPick={setFile}
              fileRef={fileRef}
              fileName={file?.name ?? null}
              large
            />

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
