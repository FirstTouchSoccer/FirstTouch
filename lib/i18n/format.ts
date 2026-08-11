/** Replaces `{key}` tokens in a translated string with the given values. */
export function tf(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => (key in params ? String(params[key]) : match))
}

/**
 * Russian plural rule: n%10==1 && n%100!=11 -> one; n%10 in 2-4 && n%100 not
 * in 12-14 -> few; everything else -> many. English only ever needs one/many.
 */
export function pluralRu(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
  return many
}

export function pluralEn(n: number, one: string, many: string): string {
  return n === 1 ? one : many
}
