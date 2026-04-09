import { PortalLayout, type PortalLink } from './PortalLayout'

const LINKS: PortalLink[] = [
  { label: 'Dashboard', to: '/financial/dashboard', end: true },
  { label: 'Donor Management', to: '/financial/donors' },
  { label: 'Donation Records', to: '/financial/donations' },
  { label: 'Insights', to: '/financial/insights' },
  { label: 'Reports', to: '/financial/reports' },
  { label: 'Account', to: '/account' },
]

export function FinancialPortalLayout() {
  return <PortalLayout title="Haven for Her" subtitle="Financial Portal" links={LINKS} />
}
