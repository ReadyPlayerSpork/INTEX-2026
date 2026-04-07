/**
 * components/admin/AlertsSection.tsx
 * Categorised alert cards — Bloom palette.
 *
 * Alert types (matches /api/admin/dashboard → residents.alerts):
 *   escalatingRisk    → TrendingUp  / destructive
 *   recentConcerns    → Flag        / accent (plum)
 *   unresolvedIncidents → ShieldAlert / destructive
 *   missedSessions    → CalendarX   / chart-3 (warm yellow)
 *   followUpNeeded    → ClipboardCheck / primary (sage)
 */

import {
  TrendingUp,
  Flag,
  ShieldAlert,
  CalendarX,
  ClipboardCheck,
  Bell,
} from 'lucide-react';
import { Link } from 'react-router-dom';

/* ── Prop types (mirror the AdminDashboardPage DashboardData shapes) ── */

interface EscalatingRiskAlert {
  residentId: number;
  currentRiskLevel: string;
  initialRiskLevel: string;
  safehouse: string;
}

interface ConcernAlert {
  recordingId: number;
  residentId: number;
  sessionDate: string;
}

interface IncidentAlert {
  incidentId: number;
  residentId: number;
  safehouseId: number;
  incidentDate: string;
  severity: string;
}

interface MissedSessionAlert {
  residentId: number;
  safehouse: string;
}

interface FollowUpAlert {
  residentId: number;
  reintegrationStatus: string;
  dateClosed: string | null;
}

interface AlertsSectionProps {
  escalatingRisk: EscalatingRiskAlert[];
  recentConcerns: ConcernAlert[];
  unresolvedIncidents: IncidentAlert[];
  missedSessions: MissedSessionAlert[];
  followUpNeeded: FollowUpAlert[];
}

/* ── Helper: format ISO date strings ── */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
  });
}

/* ── Alert group wrapper ── */
function AlertGroup({
  icon: Icon,
  title,
  count,
  iconBg,
  iconColor,
  children,
}: {
  icon: React.ElementType;
  title: string;
  count: number;
  iconBg: string;
  iconColor: string;
  children: React.ReactNode;
}) {
  if (count === 0) return null;
  return (
    <div className="rounded-xl border border-border bg-background/60 p-3">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${iconBg}`}>
          <Icon size={12} className={iconColor} />
        </div>
        <span className="text-xs font-semibold text-card-foreground">
          {title}
        </span>
        <span className="ml-auto text-xs font-bold text-muted-foreground tabular-nums">
          {count}
        </span>
      </div>
      <ul className="space-y-1">{children}</ul>
    </div>
  );
}

/* ── Alert row link ── */
function AlertRow({
  residentId,
  detail,
}: {
  residentId: number;
  detail: string;
}) {
  return (
    <li className="flex items-baseline gap-1.5 text-[11px] text-muted-foreground">
      <Link
        to={`/admin/caseload/${residentId}`}
        className="font-semibold text-accent hover:text-primary underline-offset-2 hover:underline transition-colors duration-150 shrink-0"
      >
        #{residentId}
      </Link>
      <span className="truncate">{detail}</span>
    </li>
  );
}

/* ── Main component ── */

export function AlertsSection({
  escalatingRisk,
  recentConcerns,
  unresolvedIncidents,
  missedSessions,
  followUpNeeded,
}: AlertsSectionProps) {
  const totalAlerts =
    escalatingRisk.length +
    recentConcerns.length +
    unresolvedIncidents.length +
    missedSessions.length +
    followUpNeeded.length;

  return (
    <div className="rounded-2xl bg-card border border-border p-6 shadow-[0_4px_24px_rgba(74,44,94,0.03)]">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-heading font-semibold text-base text-card-foreground">
            Active Alerts
          </h3>
          {totalAlerts > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold tabular-nums">
              {totalAlerts}
            </span>
          )}
        </div>
        <Link
          to="/admin/caseload"
          className="text-xs font-semibold text-primary hover:text-accent transition-colors duration-150"
        >
          View caseload →
        </Link>
      </div>

      {/* Alert groups */}
      {totalAlerts === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Bell size={28} className="text-muted-foreground/40 mb-2" />
          <p className="text-sm font-semibold text-card-foreground">All clear</p>
          <p className="text-xs text-muted-foreground mt-0.5">No active alerts right now.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AlertGroup
            icon={TrendingUp}
            title="Escalating Risk"
            count={escalatingRisk.length}
            iconBg="bg-destructive/15"
            iconColor="text-destructive"
          >
            {escalatingRisk.map((r) => (
              <AlertRow
                key={r.residentId}
                residentId={r.residentId}
                detail={`${r.initialRiskLevel} → ${r.currentRiskLevel} · ${r.safehouse}`}
              />
            ))}
          </AlertGroup>

          <AlertGroup
            icon={ShieldAlert}
            title="Unresolved Incidents"
            count={unresolvedIncidents.length}
            iconBg="bg-destructive/15"
            iconColor="text-destructive"
          >
            {unresolvedIncidents.map((i) => (
              <AlertRow
                key={i.incidentId}
                residentId={i.residentId}
                detail={`${i.severity} severity · ${formatDate(i.incidentDate)}`}
              />
            ))}
          </AlertGroup>

          <AlertGroup
            icon={Flag}
            title="Concerns Flagged"
            count={recentConcerns.length}
            iconBg="bg-accent/10"
            iconColor="text-accent"
          >
            {recentConcerns.map((c) => (
              <AlertRow
                key={c.recordingId}
                residentId={c.residentId}
                detail={`Session ${formatDate(c.sessionDate)}`}
              />
            ))}
          </AlertGroup>

          <AlertGroup
            icon={CalendarX}
            title="Missed Sessions (30d)"
            count={missedSessions.length}
            iconBg="bg-[var(--chart-3)]/15"
            iconColor="text-[var(--chart-3)]"
          >
            {missedSessions.map((m) => (
              <AlertRow
                key={m.residentId}
                residentId={m.residentId}
                detail={m.safehouse}
              />
            ))}
          </AlertGroup>

          <AlertGroup
            icon={ClipboardCheck}
            title="Follow-up Needed"
            count={followUpNeeded.length}
            iconBg="bg-primary/10"
            iconColor="text-primary"
          >
            {followUpNeeded.map((f) => (
              <AlertRow
                key={f.residentId}
                residentId={f.residentId}
                detail={f.reintegrationStatus}
              />
            ))}
          </AlertGroup>
        </div>
      )}
    </div>
  );
}
