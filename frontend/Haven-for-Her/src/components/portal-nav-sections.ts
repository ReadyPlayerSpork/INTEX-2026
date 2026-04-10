/**
 * Mobile hamburger + Tools dropdown: one section per portal with all in-portal links.
 * Role gates mirror ProtectedRoute / portal layouts (Admin sees staff portals).
 */
export interface PortalNavLink {
  label: string
  to: string
}

export interface PortalNavSection {
  id: string
  heading: string
  /** Show this section if the user has any of these roles. */
  roles: string[]
  items: PortalNavLink[]
}

export const PORTAL_NAV_SECTIONS: PortalNavSection[] = [
  {
    id: 'admin',
    heading: 'Admin',
    roles: ['Admin'],
    items: [
      { label: 'Dashboard', to: '/admin/dashboard' },
      { label: 'Users', to: '/admin/users' },
      { label: 'Roles', to: '/admin/roles' },
      { label: 'Caseload', to: '/admin/caseload' },
      { label: 'Incidents', to: '/admin/incidents' },
      { label: 'Interventions', to: '/admin/interventions' },
      { label: 'Safehouses', to: '/admin/safehouses' },
      { label: 'Partners', to: '/admin/partners' },
      { label: 'Analytics', to: '/admin/analytics' },
    ],
  },
  {
    id: 'counselor',
    heading: 'Counselor',
    roles: ['Counselor', 'Admin'],
    items: [
      { label: 'Dashboard', to: '/counselor/dashboard' },
      { label: 'Sessions', to: '/counselor/sessions' },
      { label: 'Visitations', to: '/counselor/visitations' },
      { label: 'Case Conferences', to: '/counselor/case-conferences' },
    ],
  },
  {
    id: 'financial',
    heading: 'Financial',
    roles: ['Financial', 'Admin'],
    items: [
      { label: 'Dashboard', to: '/financial/dashboard' },
      { label: 'Donor Management', to: '/financial/donors' },
      { label: 'Donation Records', to: '/financial/donations' },
      { label: 'Insights', to: '/financial/insights' },
      { label: 'Reports', to: '/financial/reports' },
    ],
  },
  {
    id: 'social',
    heading: 'Social Media',
    roles: ['SocialMedia', 'Admin'],
    items: [
      { label: 'Dashboard', to: '/social/dashboard' },
      { label: 'Posts', to: '/social/posts' },
      { label: 'Create Post', to: '/social/post' },
    ],
  },
  {
    id: 'donor',
    heading: 'Donor',
    roles: ['Donor'],
    items: [{ label: 'Dashboard', to: '/donor/dashboard' }],
  },
  {
    id: 'survivor',
    heading: 'Survivor',
    roles: ['Survivor'],
    items: [
      { label: 'My Resources', to: '/resources' },
      { label: 'Request counseling', to: '/survivor/counseling' },
      { label: 'Find a safe home', to: '/resources#safe-homes' },
    ],
  },
]

export function getVisiblePortalSections(
  isAuthenticated: boolean,
  hasRole: (...roles: string[]) => boolean,
): PortalNavSection[] {
  if (!isAuthenticated) return []
  return PORTAL_NAV_SECTIONS.filter(
    (section) =>
      section.roles.length > 0 && section.roles.some((r) => hasRole(r)),
  )
}

/** Flat list for compact menus (e.g. desktop Tools dropdown). */
export function flattenPortalNavSections(
  sections: PortalNavSection[],
): PortalNavLink[] {
  return sections.flatMap((s) => s.items)
}
