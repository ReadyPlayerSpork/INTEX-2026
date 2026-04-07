import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/api/client'
import { Button } from '@/components/ui/button'

interface SocialPost {
  id: number
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
    setLoading(true)
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
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page, platform, sortBy, sortDir])

  const totalPages = data ? Math.ceil(data.totalCount / pageSize) : 0

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Social Media Posts</h1>
        <Link to="/social/post">
          <Button>Create Post</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-4">
        <div>
          <label className="text-muted-foreground mb-1 block text-xs">Platform</label>
          <select
            className="border-border rounded border bg-transparent px-3 py-1.5 text-sm"
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
            className="border-border rounded border bg-transparent px-3 py-1.5 text-sm"
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
            className="border-border rounded border bg-transparent px-3 py-1.5 text-sm"
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
          {/* Table */}
          <div className="overflow-x-auto">
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
                    key={post.id}
                    post={post}
                    expanded={expandedId === post.id}
                    onToggle={() =>
                      setExpandedId(expandedId === post.id ? null : post.id)
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
            <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
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
