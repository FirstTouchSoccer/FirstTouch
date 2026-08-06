/**
 * Baseline anti-abuse check for server routes that call the paid Anthropic
 * API: reject requests whose Origin doesn't match the Host actually serving
 * the request. Stops naive scripted abuse and cross-site pages riding a
 * victim's browser session; does NOT stop a determined attacker forging
 * headers directly (curl can set any Origin it wants). Real protection needs
 * a verified Supabase session tied to per-user rate limiting — see the
 * logistics notes for why that isn't wired up yet.
 */
export function isTrustedOrigin(req: Request): boolean {
  const origin = req.headers.get('origin')
  const host = req.headers.get('host')
  if (!origin || !host) return false
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}
