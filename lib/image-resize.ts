/**
 * Client-only helper for player avatars: downscale + JPEG-compress to a
 * small data URL so it's cheap to store directly in the `players.avatar_url`
 * text column (no R2 upload plumbing needed for a tiny profile photo).
 */
export async function fileToAvatarDataUrl(file: File, maxSizePx = 256, quality = 0.85): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose an image file.')
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Image is too large (max 10MB).')
  }

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxSizePx / Math.max(bitmap.width, bitmap.height))
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not process this image.')
  ctx.drawImage(bitmap, 0, 0, width, height)

  const dataUrl = canvas.toDataURL('image/jpeg', quality)
  if (dataUrl.length > 500_000) {
    throw new Error('This image is too complex to compress small enough — try a different photo.')
  }
  return dataUrl
}
