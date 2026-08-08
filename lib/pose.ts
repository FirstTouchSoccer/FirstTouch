'use client'

/**
 * Pose analysis. Primary path runs MediaPipe Pose Landmarker fully in the
 * browser (wasm + model fetched from Google's CDN on first use). If the model
 * can't load or the video can't be decoded, we fall back to clearly-labelled
 * simulated metrics (`source: "simulated"`) so the end-to-end flow still demos.
 */
import { resolveDuration } from '@/lib/video-duration'
import type { PoseMetrics } from '@/lib/types'

// MediaPipe pose landmark indices we use.
const L_SHOULDER = 11, R_SHOULDER = 12, L_WRIST = 15, R_WRIST = 16
const L_HIP = 23, R_HIP = 24, L_KNEE = 25, R_KNEE = 26, L_ANKLE = 27, R_ANKLE = 28

const MAX_ANALYZE_SECONDS = 60
const SAMPLE_FPS = 5

interface Pt {
  x: number
  y: number
}

/** Interior angle at vertex b (degrees) formed by points a-b-c. */
function angleAt(a: Pt, b: Pt, c: Pt): number {
  const v1 = { x: a.x - b.x, y: a.y - b.y }
  const v2 = { x: c.x - b.x, y: c.y - b.y }
  const dot = v1.x * v2.x + v1.y * v2.y
  const m1 = Math.hypot(v1.x, v1.y)
  const m2 = Math.hypot(v2.x, v2.y)
  if (m1 === 0 || m2 === 0) return 180
  const cos = Math.min(1, Math.max(-1, dot / (m1 * m2)))
  return (Math.acos(cos) * 180) / Math.PI
}

function mean(xs: number[]): number {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0
}

function std(xs: number[]): number {
  if (xs.length < 2) return 0
  const m = mean(xs)
  return Math.sqrt(mean(xs.map((x) => (x - m) ** 2)))
}

function clamp100(x: number): number {
  return Math.round(Math.min(100, Math.max(0, x)))
}

export async function analyzeVideo(
  blob: Blob,
  onProgress?: (fraction: number) => void
): Promise<PoseMetrics> {
  try {
    return await analyzeWithMediaPipe(blob, onProgress)
  } catch (err) {
    console.warn('MediaPipe analysis unavailable — using simulated metrics.', err)
    return simulateMetrics(blob)
  }
}

async function analyzeWithMediaPipe(
  blob: Blob,
  onProgress?: (fraction: number) => void
): Promise<PoseMetrics> {
  const { FilesetResolver, PoseLandmarker } = await import('@mediapipe/tasks-vision')
  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm'
  )
  const landmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
    },
    runningMode: 'VIDEO',
    numPoses: 1,
  })

  const video = document.createElement('video')
  video.muted = true
  video.playsInline = true
  const url = URL.createObjectURL(blob)
  try {
    video.src = url
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve()
      video.onerror = () => reject(new Error('Could not decode video.'))
    })

    // video.duration can read as Infinity right after loadedmetadata for
    // fragmented/streamed containers (common in re-encoded clip downloads)
    // until a seek forces the browser to resolve it — same issue the file
    // picker's duration check already works around.
    const rawDuration = await resolveDuration(video)
    const duration = Math.min(rawDuration || 0, MAX_ANALYZE_SECONDS)
    if (!duration) throw new Error('Video has no duration.')

    const step = 1 / SAMPLE_FPS
    const kneeL: number[] = []
    const kneeR: number[] = []
    const hipX: number[] = []
    const lean: number[] = []
    const wristGap: number[] = []
    const velocity: number[] = []
    let prev: Pt[] | null = null
    let frames = 0

    for (let t = 0; t < duration; t += step) {
      await new Promise<void>((resolve, reject) => {
        video.onseeked = () => resolve()
        video.onerror = () => reject(new Error('Seek failed.'))
        video.currentTime = t
      })
      const result = landmarker.detectForVideo(video, Math.round(t * 1000))
      const lm = result.landmarks?.[0]
      onProgress?.(t / duration)
      if (!lm) continue
      frames++

      kneeL.push(180 - angleAt(lm[L_HIP], lm[L_KNEE], lm[L_ANKLE]))
      kneeR.push(180 - angleAt(lm[R_HIP], lm[R_KNEE], lm[R_ANKLE]))

      const hipMid = {
        x: (lm[L_HIP].x + lm[R_HIP].x) / 2,
        y: (lm[L_HIP].y + lm[R_HIP].y) / 2,
      }
      const shoulderMid = {
        x: (lm[L_SHOULDER].x + lm[R_SHOULDER].x) / 2,
        y: (lm[L_SHOULDER].y + lm[R_SHOULDER].y) / 2,
      }
      hipX.push(hipMid.x)
      // Torso lean from vertical, in degrees.
      lean.push(
        Math.abs(
          (Math.atan2(shoulderMid.x - hipMid.x, hipMid.y - shoulderMid.y) * 180) /
            Math.PI
        )
      )
      wristGap.push(Math.abs(lm[L_WRIST].y - lm[R_WRIST].y))

      const pts = lm.map((p) => ({ x: p.x, y: p.y }))
      if (prev) {
        velocity.push(
          mean(pts.map((p, i) => Math.hypot(p.x - prev![i].x, p.y - prev![i].y)))
        )
      }
      prev = pts
    }

    if (frames < 5) {
      throw new Error('Too few frames with a detectable player.')
    }

    const avgL = mean(kneeL)
    const avgR = mean(kneeR)
    return {
      source: 'mediapipe',
      framesAnalyzed: frames,
      durationSec: Math.round(duration),
      avgKneeFlexionL: Math.round(avgL),
      avgKneeFlexionR: Math.round(avgR),
      kneeSymmetry: clamp100(100 - Math.abs(avgL - avgR) * 2.5),
      hipStability: clamp100(100 - std(hipX) * 900),
      armBalance: clamp100(100 - mean(wristGap) * 350),
      movementIntensity: clamp100(mean(velocity) * 4000),
      posturalLean: Math.round(mean(lean)),
    }
  } finally {
    URL.revokeObjectURL(url)
    landmarker.close()
  }
}

/** Deterministic, plausible metrics derived from the file bytes (demo fallback). */
export function simulateMetrics(blob: Blob): PoseMetrics {
  let seed = blob.size % 997
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
  const between = (lo: number, hi: number) => Math.round(lo + rand() * (hi - lo))
  const l = between(25, 55)
  const r = between(25, 55)
  return {
    source: 'simulated',
    framesAnalyzed: between(90, 220),
    durationSec: between(12, 30),
    avgKneeFlexionL: l,
    avgKneeFlexionR: r,
    kneeSymmetry: clamp100(100 - Math.abs(l - r) * 2.5),
    hipStability: between(45, 90),
    armBalance: between(50, 92),
    movementIntensity: between(40, 88),
    posturalLean: between(4, 14),
  }
}
