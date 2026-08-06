import { supabase } from '@/lib/supabase'
import { getUploadUrl } from '@/lib/r2'

/**
 * Issues a presigned R2 upload URL, but only for a key inside the caller's
 * own prefix (`${userId}/...`) — verified against a real Supabase session,
 * not trusted from the request body. Without this check anyone with a
 * network client could write into another player's clip storage.
 */
export async function POST(req: Request) {
  if (!supabase) {
    return Response.json({ error: 'No backend configured' }, { status: 501 })
  }

  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { key, contentType } = (await req.json()) as { key: string; contentType: string }
  if (!key || !key.startsWith(`${data.user.id}/`)) {
    return Response.json({ error: 'Invalid key' }, { status: 403 })
  }

  const url = await getUploadUrl(key, contentType || 'application/octet-stream')
  return Response.json({ url })
}
