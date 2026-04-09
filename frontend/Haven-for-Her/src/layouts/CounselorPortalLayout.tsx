import { PortalLayout, type PortalLink } from './PortalLayout'

const LINKS: PortalLink[] = [
  { label: 'Dashboard', to: '/counselor/dashboard', end: true },
  { label: 'Sessions', to: '/counselor/sessions' },
  { label: 'Visitations', to: '/counselor/visitations' },
  { label: 'Case Conferences', to: '/counselor/case-conferences' },
  { label: 'Account', to: '/account' },
]

export function CounselorPortalLayout() {
  return <PortalLayout title="Haven for Her" subtitle="Counselor Portal" links={LINKS} />
}
