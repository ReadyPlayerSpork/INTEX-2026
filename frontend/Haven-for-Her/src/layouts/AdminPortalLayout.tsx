import { PortalLayout, type PortalLink } from './PortalLayout'

const LINKS: PortalLink[] = [
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
]

export function AdminPortalLayout() {
  return <PortalLayout title="Haven for Her" subtitle="Admin Portal" links={LINKS} />
}
