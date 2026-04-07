/**
 * components/admin/QuickActions.tsx
 * Quick-action pill buttons — Bloom palette.
 *
 * Primary action: sage filled rounded-full.
 * Secondary actions: cream outline rounded-full.
 *
 * TODO Phase 5: Replace alert() stubs with real navigation / modal triggers.
 */

import { UserPlus, HandHeart, ClipboardList, ShieldAlert } from 'lucide-react';

const ACTIONS = [
  {
    label: 'Add Resident',
    icon: UserPlus,
    primary: true,
    onClick: () => alert('Add Resident — Phase 5'),
  },
  {
    label: 'Log Donation',
    icon: HandHeart,
    primary: false,
    onClick: () => alert('Log Donation — Phase 4'),
  },
  {
    label: 'New Session Note',
    icon: ClipboardList,
    primary: false,
    onClick: () => alert('New Session Note — Phase 5'),
  },
  {
    label: 'Report Incident',
    icon: ShieldAlert,
    primary: false,
    onClick: () => alert('Report Incident — Phase 5'),
  },
] as const;

export function QuickActions() {
  return (
    <div className="flex flex-wrap gap-2">
      {ACTIONS.map(({ label, icon: Icon, primary, onClick }) => (
        <button
          key={label}
          onClick={onClick}
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
        </button>
      ))}
    </div>
  );
}
