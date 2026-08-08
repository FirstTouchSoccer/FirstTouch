'use client'

/**
 * Some containers report Infinity for `video.duration` until the browser has
 * actually scanned the file — MediaRecorder-produced WebM is one case, and so
 * are fragmented/streamed MP4s that are missing a proper duration atom, which
 * is common in re-encoded "save this TikTok" downloads. Forcing a seek to the
 * end makes the browser resolve the real duration.
 */
export async function resolveDuration(video: HTMLVideoElement): Promise<number> {
  if (Number.isFinite(video.duration)) return video.duration
  return new Promise((resolve) => {
    video.onseeked = () => resolve(Number.isFinite(video.duration) ? video.duration : 0)
    video.currentTime = 1e9
  })
}

export function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.muted = true
    video.playsInline = true
    const url = URL.createObjectURL(file)
    video.onloadedmetadata = async () => {
      const duration = await resolveDuration(video)
      URL.revokeObjectURL(url)
      resolve(duration)
    }
    video.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read this video file.'))
    }
    video.src = url
  })
}
