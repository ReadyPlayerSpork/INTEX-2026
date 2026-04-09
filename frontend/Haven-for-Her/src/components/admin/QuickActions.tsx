/**
 * Primary admin quick actions — routes to real pages (no alert stubs).
 */

import { memo } from 'react'
import { Link } from 'react-router-dom'
import { UserPlus, HandHeart, ClipboardList, ShieldAlert } from 'lucide-react'

const ACTIONS = [
  {
    label: 'Add Resident',
    icon: UserPlus,
    primary: true,
    to: '/admin/caseload',
  },
  {
    label: 'Log Donation',
    icon: HandHeart,
    primary: false,
    to: '/donate',
  },
  {
    label: 'New Session Note',
    icon: ClipboardList,
    primary: false,
    to: '/admin/caseload',
  },
  {
    label: 'Report Incident',
    icon: ShieldAlert,
    primary: false,
    to: '/admin/incidents',
  },
] as const

export const QuickActions = memo(function QuickActions() {
  return (
    <div className="flex flex-wrap gap-2">
      {ACTIONS.map(({ label, icon: Icon, primary, to }) => (
        <Link
          key={label}
          to={to}
          className={[
            'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold',
            'transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            primary
              ? 'bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground'
              : 'border border-border bg-card text-card-foreground hover:bg-muted',
          ].join(' ')}
        >
          <Icon size={14} />
          {label}
        </Link>
      ))}
    </div>
  )
})
