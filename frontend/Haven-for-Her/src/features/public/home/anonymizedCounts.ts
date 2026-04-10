/**
 * Public-facing count display: exact under 10, otherwise floor to decade + "+" (matches home hero).
 */
export function formatAnonymizedCount(count: number): string {
  if (count < 10) return count.toString()
  return `${Math.floor(count / 10) * 10}+`
}
