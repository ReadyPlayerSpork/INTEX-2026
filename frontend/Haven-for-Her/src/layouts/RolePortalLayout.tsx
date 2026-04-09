import { PortalLayout, type PortalLink } from './PortalLayout'

interface RolePortalConfig {
  subtitle: string
  links: PortalLink[]
}

const PORTAL_CONFIGS: Record<string, RolePortalConfig> = {
  admin: {
    subtitle: 'Admin Portal',
    links: [
      { label: 'Dashboard', to: '/admin/dashboard', end: true },
      { label: 'Users', to: '/admin/users' },
      { label: 'Roles', to: '/admin/roles' },
      { label: 'Caseload', to: '/admin/caseload' },
      { label: 'Incidents', to: '/admin/incidents' },
      { label: 'Interventions', to: '/admin/interventions' },
      { label: 'Safehouses', to: '/admin/safehouses' },
      { label: 'Partners', to: '/admin/partners' },
      { label: 'Analytics', to: '/admin/analytics' },
      { label: 'Account', to: '/account' },
    ],
  },
  financial: {
    subtitle: 'Financial Portal',
    links: [
      { label: 'Dashboard', to: '/financial/dashboard', end: true },
      { label: 'Donor Management', to: '/financial/donors' },
      { label: 'Donation Records', to: '/financial/donations' },
      { label: 'Insights', to: '/financial/insights' },
      { label: 'Reports', to: '/financial/reports' },
      { label: 'Account', to: '/account' },
    ],
  },
  counselor: {
    subtitle: 'Counselor Portal',
    links: [
      { label: 'Dashboard', to: '/counselor/dashboard', end: true },
      { label: 'Sessions', to: '/counselor/sessions' },
      { label: 'Visitations', to: '/counselor/visitations' },
      { label: 'Case Conferences', to: '/counselor/case-conferences' },
      { label: 'Account', to: '/account' },
    ],
  },
  social: {
    subtitle: 'Social Media Portal',
    links: [
      { label: 'Dashboard', to: '/social/dashboard', end: true },
      { label: 'Posts', to: '/social/posts' },
      { label: 'Create Post', to: '/social/post' },
      { label: 'Account', to: '/account' },
    ],
  },
}

export function RolePortalLayout({ role }: { role: keyof typeof PORTAL_CONFIGS }) {
  const config = PORTAL_CONFIGS[role]

  if (!config) {
    return null
  }

  return <PortalLayout title="Haven for Her" subtitle={config.subtitle} links={config.links} />
}
