import { supabase } from '@/lib/supabase'
import { getDownloadUrl } from '@/lib/r2'

/** Same ownership check as upload-url — see that file for why. */
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

  const { key } = (await req.json()) as { key: string }
  if (!key || !key.startsWith(`${data.user.id}/`)) {
    return Response.json({ error: 'Invalid key' }, { status: 403 })
  }

  const url = await getDownloadUrl(key)
  return Response.json({ url })
}
