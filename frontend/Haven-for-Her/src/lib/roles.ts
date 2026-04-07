/**
 * Role precedence for determining default landing page after login.
 * Higher in the list = higher priority.
 */
const ROLE_LANDING: [string, string][] = [
  ['Admin', '/admin/dashboard'],
  ['Financial', '/financial/dashboard'],
  ['Counselor', '/counselor/dashboard'],
  ['SocialMedia', '/social/dashboard'],
  ['Donor', '/donor/dashboard'],
  ['Survivor', '/survivor/resources'],
  ['Employee', '/volunteer'],
]

/**
 * Given a user's roles, return the landing path for their highest-priority role.
 * Falls back to '/' if no roles match.
 */
export function getLandingPath(roles: string[]): string {
  for (const [role, path] of ROLE_LANDING) {
    if (roles.includes(role)) return path
  }
  return '/'
}
