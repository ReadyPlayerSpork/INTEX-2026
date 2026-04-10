/**
 * Strip synthetic seed / expansion markers from supporter display strings for UI.
 */
export function cleanSupporterDisplayName(name: string | null | undefined): string {
  if (name == null || !name.trim()) return ''
  let s = name.trim()
  for (const suf of [' (Network)', ' (network)']) {
    if (s.endsWith(suf)) {
      s = s.slice(0, -suf.length).trim()
    }
  }
  s = s.replace(/\s*\[Network\s+\d+\]\s*$/i, '').trim()
  return s
}

/**
 * Label for tables: cleaned name, or fallback to #id when empty.
 */
export function supporterTableLabel(
  name: string | null | undefined,
  supporterId: number,
): string {
  const cleaned = cleanSupporterDisplayName(name)
  if (cleaned) return cleaned
  return `#${supporterId}`
}
