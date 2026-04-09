import { useEffect, useState } from 'react'
import { Brain } from 'lucide-react'
import { api } from '@/api/client'
import { getSocialMediaRecommendations, type SocialMediaRecommendations } from '@/api/mlApi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/* ---------- Types matching SocialMediaController.GetDashboard ---------- */

interface MonthOverMonthMetric {
  thisMonth: number
  lastMonth: number
  changePercent: number | null
}

interface TopicEngagement {
  topic: string
  totalEngagement: number
  postCount: number
}

interface PlatformBreakdown {
  platform: string
  postCount: number
  totalImpressions: number
  totalReach: number
  avgEngagementRate: number
}

interface BestPostingTime {
  dayOfWeek: string
  postHour: number
  avgEngagementRate: number
  postCount: number
}

interface DonationContent {
  topic: string
  avgDonationReferrals: number
  totalDonationReferrals: number
  avgEstimatedValue: number
  postCount: number
}

interface SocialDashboard {
  totalPosts: number
  totalImpressions: number
  totalReach: number
  avgEngagementRate: number
  monthOverMonth: {
    impressions: MonthOverMonthMetric
    reach: MonthOverMonthMetric
    engagementRate: MonthOverMonthMetric
  }
  topContentTopics: TopicEngagement[]
  platformBreakdown: PlatformBreakdown[]
  bestPostingTimes: BestPostingTime[]
  contentThatDrivesDonations: DonationContent[]
}

export function SocialDashboardPage() {
  const [data, setData] = useState<SocialDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [mlIntel, setMlIntel] = useState<SocialMediaRecommendations | null>(null)
  const [mlIntelErr, setMlIntelErr] = useState<string | null>(null)

  useEffect(() => {
    api
      .get<SocialDashboard>('/api/social/dashboard')
      .then(setData)
      .catch((err) => console.error('Failed to load social dashboard', err))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    getSocialMediaRecommendations()
      .then(setMlIntel)
      .catch(() => setMlIntelErr('ML recommendations are unavailable (train models or check the ML service).'))
  }, [])

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <p className="text-muted-foreground animate-pulse">Loading...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <p className="text-muted-foreground">Unable to load dashboard.</p>
      </div>
    )
  }

  const mom = data.monthOverMonth

  return (
    <div className="mx-auto max-w-7xl px-5 py-16 md:px-10 md:py-20">
      <div className="mb-8">
        <p className="text-muted-foreground text-sm font-semibold tracking-[0.18em] uppercase">
          Social media dashboard
        </p>
        <h1 className="font-heading mt-2 text-4xl font-semibold text-accent">
          Social Media Dashboard
        </h1>
      </div>


      {mlIntelErr && (
        <p className="text-muted-foreground mb-6 text-sm" role="status">
          {mlIntelErr}
        </p>
      )}
      {mlIntel && (
        <Card className="border-primary/25 bg-card/95 mb-8">
          <CardHeader className="pb-2">
            <CardTitle className="font-heading flex items-center gap-2 text-lg">
              <Brain className="text-primary size-5 shrink-0" aria-hidden />
              ML posting intelligence
            </CardTitle>
            <CardDescription>
              Data-driven timing, format, and CTA hints from the ML pipeline (same signals as donation-driver scoring on Create Post).
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <MlStat label="Best hour (UTC-style)" value={`${mlIntel.bestPostHour}:00`} />
              <MlStat label="Best day" value={mlIntel.bestDayOfWeek} />
              <MlStat label="Post type (donations)" value={mlIntel.bestPostTypeForDonations} />
              <MlStat label="Media (engagement)" value={mlIntel.bestMediaTypeForEngagement} />
            </div>
            <div className="text-muted-foreground mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-border/70 pt-4 text-sm">
              <span>
                <strong className="text-foreground font-medium">Suggested CTA:</strong>{' '}
                {mlIntel.recommendedCta}
              </span>
              <span className="tabular-nums">
                Avg engagement {mlIntel.avgEngagementRate.toFixed(2)}% ·{' '}
                {mlIntel.totalDonationReferrals.toLocaleString()} donation referrals (historical)
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Total Posts" value={data.totalPosts.toLocaleString()} />
        <StatWithChange
          label="Impressions"
          value={data.totalImpressions.toLocaleString()}
          change={mom.impressions.changePercent}
        />
        <StatWithChange
          label="Reach"
          value={data.totalReach.toLocaleString()}
          change={mom.reach.changePercent}
        />
        <StatWithChange
          label="Avg Engagement Rate"
          value={`${data.avgEngagementRate.toFixed(2)}%`}
          change={mom.engagementRate.changePercent}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Top Content Topics */}
        <section>
          <h2 className="mb-3 text-lg font-semibold">Top Content Topics</h2>
          {data.topContentTopics.length === 0 ? (
            <p className="text-muted-foreground text-sm">No data yet.</p>
          ) : (
            <div className="space-y-2">
              {data.topContentTopics.map((t) => (
                <div
                  key={t.topic}
                  className="bg-card border-border/70 flex items-center justify-between rounded-2xl border p-4"
                >
                  <span className="text-sm font-medium">{t.topic}</span>
                  <span className="text-muted-foreground text-sm">
                    {t.totalEngagement.toLocaleString()} engagements
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Platform Breakdown */}
        <section>
          <h2 className="mb-3 text-lg font-semibold">Platform Breakdown</h2>
          {data.platformBreakdown.length === 0 ? (
            <p className="text-muted-foreground text-sm">No data yet.</p>
          ) : (
            <div className="space-y-2">
              {data.platformBreakdown.map((p) => (
                <div
                  key={p.platform}
                  className="bg-card border-border/70 rounded-2xl border p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{p.platform}</span>
                    <span className="text-muted-foreground text-sm">
                      {p.avgEngagementRate.toFixed(2)}% eng.
                    </span>
                  </div>
                  <div className="text-muted-foreground mt-1 text-xs">
                    {p.totalImpressions.toLocaleString()} impressions &middot;{' '}
                    {p.totalReach.toLocaleString()} reach
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Best Posting Times */}
        <section>
          <h2 className="mb-3 text-lg font-semibold">Best Posting Times</h2>
          {data.bestPostingTimes.length === 0 ? (
            <p className="text-muted-foreground text-sm">No data yet.</p>
          ) : (
            <div className="space-y-2">
              {data.bestPostingTimes.slice(0, 5).map((t, i) => (
                <div
                  key={i}
                  className="bg-card border-border/70 flex items-center justify-between rounded-2xl border p-4"
                >
                  <span className="text-sm font-medium">
                    {t.dayOfWeek} at {t.postHour}:00
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {t.avgEngagementRate.toFixed(2)}% avg eng.
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Content That Drives Donations */}
        <section>
          <h2 className="mb-3 text-lg font-semibold">Content That Drives Donations</h2>
          {data.contentThatDrivesDonations.length === 0 ? (
            <p className="text-muted-foreground text-sm">No data yet.</p>
          ) : (
            <div className="space-y-2">
              {data.contentThatDrivesDonations.slice(0, 5).map((c) => (
                <div
                  key={c.topic}
                  className="bg-card border-border/70 flex items-center justify-between rounded-2xl border p-4"
                >
                  <span className="text-sm font-medium">{c.topic}</span>
                  <span className="text-muted-foreground text-sm">
                    {c.avgDonationReferrals.toFixed(1)} avg referrals
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function MlStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card border-border/70 rounded-xl border p-4">
      <p className="text-muted-foreground text-xs font-medium">{label}</p>
      <p className="font-heading mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="border-border/70 bg-card/95">
      <CardContent className="p-5 text-center">
        <p className="text-primary text-2xl font-extrabold">{value}</p>
        <p className="text-muted-foreground mt-2 text-xs">{label}</p>
      </CardContent>
    </Card>
  )
}

function StatWithChange({
  label,
  value,
  change,
}: {
  label: string
  value: string | number
  change: number | null
}) {
  const positive = change != null && change >= 0
  return (
    <Card className="border-border/70 bg-card/95">
      <CardContent className="p-5 text-center">
        <p className="text-primary text-2xl font-extrabold">{value}</p>
        <p className="text-muted-foreground mt-2 text-xs">{label}</p>
        {change != null && (
          <p
            className={`mt-2 text-xs font-semibold ${positive ? 'text-primary' : 'text-destructive'}`}
          >
            {positive ? '+' : ''}
            {change.toFixed(1)}% MoM
          </p>
        )}
      </CardContent>
    </Card>
  )
}
