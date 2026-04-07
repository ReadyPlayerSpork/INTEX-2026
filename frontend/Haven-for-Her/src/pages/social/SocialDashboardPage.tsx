import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/api/client'

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
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold">Social Media Dashboard</h1>

      {/* Quick nav */}
      <div className="text-muted-foreground mb-6 flex gap-4 text-sm">
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
                  className="bg-card border-border flex items-center justify-between rounded border p-3"
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
                  className="bg-card border-border rounded border p-3"
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
                  className="bg-card border-border flex items-center justify-between rounded border p-3"
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
                  className="bg-card border-border flex items-center justify-between rounded border p-3"
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
    <div className="bg-card border-border rounded-lg border p-4 text-center">
      <p className="text-primary text-2xl font-bold">{value}</p>
      <p className="text-muted-foreground mt-1 text-xs">{label}</p>
    </div>
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
    <div className="bg-card border-border rounded-lg border p-4 text-center">
      <p className="text-primary text-2xl font-bold">{value}</p>
      <p className="text-muted-foreground mt-1 text-xs">{label}</p>
      <p className={`mt-1 text-xs font-medium ${positive ? 'text-green-600' : 'text-red-600'}`}>
        {positive ? '+' : ''}
        {change.toFixed(1)}% MoM
      </p>
    </div>
  )
}
