import { startTransition, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/api/client'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SocialPost {
  postId: number
  platform: string
  postType: string
  caption: string
  impressions: number
  reach: number
  engagementRate: number
  donationReferrals: number
  isBoosted: boolean
  createdAt: string
}

interface PostsResponse {
  items: SocialPost[]
  totalCount: number
  page: number
  pageSize: number
}

const PLATFORMS = ['all', 'Facebook', 'Instagram', 'TikTok'] as const
const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Date' },
  { value: 'impressions', label: 'Impressions' },
  { value: 'reach', label: 'Reach' },
  { value: 'engagementRate', label: 'Engagement Rate' },
  { value: 'donationReferrals', label: 'Donation Referrals' },
] as const

export function PostsPage() {
  const [data, setData] = useState<PostsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [platform, setPlatform] = useState<string>('all')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const pageSize = 20

  useEffect(() => {
    startTransition(() => {
      setLoading(true)
    })
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      sortBy,
      sortDir,
    })
    if (platform !== 'all') {
      params.set('platform', platform)
    }
    api
      .get<PostsResponse>(`/api/social/posts?${params}`)
      .then(setData)
      .catch((err) => console.error('Failed to load posts', err))
      .finally(() => setLoading(false))
  }, [page, platform, sortBy, sortDir])

  const totalPages = data ? Math.ceil(data.totalCount / pageSize) : 0

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-4xl font-semibold text-accent">Social Media Posts</h1>
        <Link
          to="/social/post"
          className={cn(buttonVariants(), 'no-underline')}
        >
          Create Post
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-4">
        <div>
          <label className="text-muted-foreground mb-1 block text-xs">Platform</label>
          <select
            className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/18 w-full rounded-lg border px-3 py-2 text-sm outline-none transition-[border-color,box-shadow] focus-visible:ring-4"
            value={platform}
            onChange={(e) => {
              setPlatform(e.target.value)
              setPage(1)
            }}
          >
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {p === 'all' ? 'All Platforms' : p}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-muted-foreground mb-1 block text-xs">Sort By</label>
          <select
            className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/18 w-full rounded-lg border px-3 py-2 text-sm outline-none transition-[border-color,box-shadow] focus-visible:ring-4"
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value)
              setPage(1)
            }}
          >
            {SORT_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-muted-foreground mb-1 block text-xs">Direction</label>
          <select
            className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/18 w-full rounded-lg border px-3 py-2 text-sm outline-none transition-[border-color,box-shadow] focus-visible:ring-4"
            value={sortDir}
            onChange={(e) => {
              setSortDir(e.target.value as 'asc' | 'desc')
              setPage(1)
            }}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      {loading && (
        <p className="text-muted-foreground animate-pulse py-8">Loading...</p>
      )}

      {!loading && !data && (
        <p className="text-muted-foreground py-8">Unable to load posts.</p>
      )}

      {!loading && data && (
        <>
          {/* Mobile card view */}
          <div className="flex flex-col gap-4 md:hidden">
            {data.items.length === 0 && (
              <p className="text-muted-foreground py-8 text-center">No posts found.</p>
            )}
            {data.items.map((post) => (
              <PostCard key={post.postId} post={post} />
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-border text-muted-foreground border-b text-xs">
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Platform</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Caption</th>
                  <th className="px-3 py-2 text-right">Impressions</th>
                  <th className="px-3 py-2 text-right">Reach</th>
                  <th className="px-3 py-2 text-right">Eng. Rate</th>
                  <th className="px-3 py-2 text-right">Don. Ref.</th>
                  <th className="px-3 py-2 text-center">Boosted</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((post) => (
                  <PostRow
                    key={post.postId}
                    post={post}
                    expanded={expandedId === post.postId}
                    onToggle={() =>
                      setExpandedId(expandedId === post.postId ? null : post.postId)
                    }
                  />
                ))}
                {data.items.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-muted-foreground px-3 py-8 text-center">
                      No posts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-muted-foreground text-sm">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function PostRow({
  post,
  expanded,
  onToggle,
}: {
  post: SocialPost
  expanded: boolean
  onToggle: () => void
}) {
  const date = new Date(post.createdAt).toLocaleDateString()
  const truncated =
    post.caption.length > 60 ? post.caption.slice(0, 60) + '...' : post.caption

  return (
    <>
      <tr
        className="border-border hover:bg-muted/50 cursor-pointer border-b"
        onClick={onToggle}
      >
        <td className="whitespace-nowrap px-3 py-2">{date}</td>
        <td className="px-3 py-2">{post.platform}</td>
        <td className="px-3 py-2">{post.postType}</td>
        <td className="px-3 py-2">{truncated}</td>
        <td className="px-3 py-2 text-right">
          {post.impressions.toLocaleString()}
        </td>
        <td className="px-3 py-2 text-right">
          {post.reach.toLocaleString()}
        </td>
        <td className="px-3 py-2 text-right">
          {post.engagementRate.toFixed(2)}%
        </td>
        <td className="px-3 py-2 text-right">{post.donationReferrals}</td>
        <td className="px-3 py-2 text-center">
          {post.isBoosted && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              Boosted
            </span>
          )}
        </td>
      </tr>
      {expanded && (
        <tr className="border-border border-b">
          <td colSpan={9} className="bg-muted/30 px-6 py-4">
            <p className="text-sm whitespace-pre-wrap">{post.caption}</p>
          </td>
        </tr>
      )}
    </>
  )
}

function PostCard({ post }: { post: SocialPost }) {
  const date = new Date(post.createdAt).toLocaleDateString()
  return (
    <div className="rounded-2xl border border-border/70 bg-card/95 p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-muted-foreground text-xs">{date}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">{post.platform}</span>
          {post.isBoosted && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              Boosted
            </span>
          )}
        </div>
      </div>
      <p className="text-sm leading-relaxed line-clamp-3">{post.caption}</p>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-muted-foreground">Impressions</span>
          <p className="font-semibold">{post.impressions.toLocaleString()}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Reach</span>
          <p className="font-semibold">{post.reach.toLocaleString()}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Eng. Rate</span>
          <p className="font-semibold">{post.engagementRate.toFixed(2)}%</p>
        </div>
        <div>
          <span className="text-muted-foreground">Don. Ref.</span>
          <p className="font-semibold">{post.donationReferrals}</p>
        </div>
      </div>
    </div>
  )
}
