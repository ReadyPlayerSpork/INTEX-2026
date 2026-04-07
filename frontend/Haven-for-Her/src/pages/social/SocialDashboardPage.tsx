import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/api/client'
import { Card, CardContent } from '@/components/ui/card'

interface TopicEngagement {
  topic: string
  totalEngagement: number
}

interface PlatformBreakdown {
  platform: string
  impressions: number
  reach: number
  avgEngagementRate: number
}

interface BestPostingTime {
  day: string
  hour: number
  avgEngagementRate: number
}

interface DonationContent {
  topic: string
  avgDonationReferrals: number
}

interface SocialDashboard {
  totalPosts: number
  totalImpressions: number
  totalReach: number
  avgEngagementRate: number
  impressionsChange: number
  reachChange: number
  engagementRateChange: number
  topContentTopics: TopicEngagement[]
  platformBreakdown: PlatformBreakdown[]
  bestPostingTimes: BestPostingTime[]
  contentThatDrivesDonations: DonationContent[]
}

export function SocialDashboardPage() {
  const [data, setData] = useState<SocialDashboard | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<SocialDashboard>('/api/social/dashboard')
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
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

      {/* Quick nav */}
      <div className="text-muted-foreground mb-6 flex flex-wrap gap-4 text-sm">
        <Link to="/social/posts" className="hover:text-foreground underline">
          All Posts
        </Link>
        <Link to="/social/post" className="hover:text-foreground underline">
          Create Post
        </Link>
      </div>

      {/* Summary cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Total Posts" value={data.totalPosts.toLocaleString()} />
        <StatWithChange
          label="Impressions"
          value={data.totalImpressions.toLocaleString()}
          change={data.impressionsChange}
        />
        <StatWithChange
          label="Reach"
          value={data.totalReach.toLocaleString()}
          change={data.reachChange}
        />
        <StatWithChange
          label="Avg Engagement Rate"
          value={`${data.avgEngagementRate.toFixed(2)}%`}
          change={data.engagementRateChange}
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
                    {p.impressions.toLocaleString()} impressions &middot;{' '}
                    {p.reach.toLocaleString()} reach
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
                    {t.day} at {t.hour}:00
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
  change: number
}) {
  const positive = change >= 0
  return (
    <Card className="border-border/70 bg-card/95">
      <CardContent className="p-5 text-center">
      <p className="text-primary text-2xl font-extrabold">{value}</p>
      <p className="text-muted-foreground mt-2 text-xs">{label}</p>
      <p
        className={`mt-2 text-xs font-semibold ${positive ? 'text-primary' : 'text-destructive'}`}
      >
        {positive ? '+' : ''}
        {change.toFixed(1)}% MoM
      </p>
      </CardContent>
    </Card>
  )
}
