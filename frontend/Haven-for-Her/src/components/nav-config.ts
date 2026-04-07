export interface NavItem {
  label: string
  to: string
  roles: string[]
}

/** Shown to everyone (guests and signed-in users). */
export const PRIMARY_NAV: NavItem[] = [
  { label: 'Home', to: '/', roles: [] },
  { label: 'Donate', to: '/donate', roles: [] },
  { label: 'Volunteer', to: '/volunteer', roles: [] },
  { label: 'Resources', to: '/resources', roles: [] },
  { label: 'Impact', to: '/impact', roles: [] },
]

/** Shown only when signed in and the user has the required role(s). */
export const ACCOUNT_NAV: NavItem[] = [
  { label: 'Donor Dashboard', to: '/donor/dashboard', roles: ['Donor'] },
  { label: 'My Resources', to: '/survivor/resources', roles: ['Survivor'] },
  { label: 'Financial', to: '/financial/dashboard', roles: ['Financial'] },
  { label: 'Counselor', to: '/counselor/dashboard', roles: ['Counselor'] },
  { label: 'Social Media', to: '/social/dashboard', roles: ['SocialMedia'] },
  { label: 'Admin', to: '/admin/dashboard', roles: ['Admin'] },
  { label: 'Security', to: '/account/security', roles: [] },
]

export function filterVisibleAccountItems(
  isAuthenticated: boolean,
  hasRole: (...roles: string[]) => boolean,
): NavItem[] {
  if (!isAuthenticated) return []
  return ACCOUNT_NAV.filter(
    (item) => item.roles.length === 0 || hasRole(...item.roles),
  )
}

export const navLinkClassName =
  'text-muted-foreground hover:bg-secondary hover:text-foreground inline-flex min-h-11 min-w-0 items-center rounded-full px-3 py-2 text-sm font-medium motion-safe:transition-[background-color,color] motion-safe:duration-200 focus-visible:border-ring focus-visible:ring-ring/20 outline-none focus-visible:ring-4'

export const sheetLinkClassName =
  'text-foreground hover:bg-secondary focus-visible:border-ring focus-visible:ring-ring/20 block min-h-11 w-full min-w-0 rounded-xl px-4 py-3 text-left text-base font-medium motion-safe:transition-[background-color,color,box-shadow] motion-safe:duration-200 outline-none focus-visible:ring-4'
