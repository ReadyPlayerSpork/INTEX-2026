import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/api/client'
import { Button } from '@/components/ui/button'

interface PostForm {
  platform: string
  platformPostId: string
  postUrl: string
  postType: string
  mediaType: string
  caption: string
  hashtags: string
  contentTopic: string
  sentimentTone: string
  campaignName: string
  isBoosted: boolean
  boostBudgetPhp: number | ''
  impressions: number | ''
  reach: number | ''
  likes: number | ''
  comments: number | ''
  shares: number | ''
  saves: number | ''
  clickThroughs: number | ''
  videoViews: number | ''
  engagementRate: number | ''
  donationReferrals: number | ''
  estimatedDonationValuePhp: number | ''
}

const INITIAL: PostForm = {
  platform: 'Facebook',
  platformPostId: '',
  postUrl: '',
  postType: '',
  mediaType: '',
  caption: '',
  hashtags: '',
  contentTopic: '',
  sentimentTone: '',
  campaignName: '',
  isBoosted: false,
  boostBudgetPhp: '',
  impressions: '',
  reach: '',
  likes: '',
  comments: '',
  shares: '',
  saves: '',
  clickThroughs: '',
  videoViews: '',
  engagementRate: '',
  donationReferrals: '',
  estimatedDonationValuePhp: '',
}

export function CreatePostPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<PostForm>(INITIAL)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function set<K extends keyof PostForm>(key: K, value: PostForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function numOrNull(val: number | ''): number | null {
    return val === '' ? null : val
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await api.post('/api/social/posts', {
        platform: form.platform,
        platformPostId: form.platformPostId || null,
        postUrl: form.postUrl || null,
        postType: form.postType || null,
        mediaType: form.mediaType || null,
        caption: form.caption,
        hashtags: form.hashtags || null,
        contentTopic: form.contentTopic || null,
        sentimentTone: form.sentimentTone || null,
        campaignName: form.campaignName || null,
        isBoosted: form.isBoosted,
        boostBudgetPhp: form.isBoosted ? numOrNull(form.boostBudgetPhp) : null,
        impressions: numOrNull(form.impressions),
        reach: numOrNull(form.reach),
        likes: numOrNull(form.likes),
        comments: numOrNull(form.comments),
        shares: numOrNull(form.shares),
        saves: numOrNull(form.saves),
        clickThroughs: numOrNull(form.clickThroughs),
        videoViews: numOrNull(form.videoViews),
        engagementRate: numOrNull(form.engagementRate),
        donationReferrals: numOrNull(form.donationReferrals),
        estimatedDonationValuePhp: numOrNull(form.estimatedDonationValuePhp),
      })
      navigate('/social/posts')
    } catch {
      setError('Failed to create post. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-2 text-2xl font-bold">Create Social Media Post</h1>
      <p className="text-muted-foreground mb-8 text-sm">
        Manual entry &mdash; API integration coming soon
      </p>

      {error && (
        <div className="bg-destructive/10 text-destructive mb-4 rounded-2xl border border-destructive/20 px-4 py-2 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Post Details */}
        <fieldset className="space-y-4">
          <legend className="mb-2 text-lg font-semibold">Post Details</legend>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Platform">
              <select
                className="border-border w-full rounded border bg-transparent px-3 py-1.5 text-sm"
                value={form.platform}
                onChange={(e) => set('platform', e.target.value)}
              >
                <option>Facebook</option>
                <option>Instagram</option>
                <option>TikTok</option>
              </select>
            </Field>

            <Field label="Platform Post ID">
              <input
                type="text"
                className="border-border w-full rounded border bg-transparent px-3 py-1.5 text-sm"
                value={form.platformPostId}
                onChange={(e) => set('platformPostId', e.target.value)}
              />
            </Field>

            <Field label="Post URL">
              <input
                type="url"
                className="border-border w-full rounded border bg-transparent px-3 py-1.5 text-sm"
                value={form.postUrl}
                onChange={(e) => set('postUrl', e.target.value)}
              />
            </Field>

            <Field label="Post Type">
              <input
                type="text"
                className="border-border w-full rounded border bg-transparent px-3 py-1.5 text-sm"
                placeholder="e.g. image, video, story, reel"
                value={form.postType}
                onChange={(e) => set('postType', e.target.value)}
              />
            </Field>

            <Field label="Media Type">
              <input
                type="text"
                className="border-border w-full rounded border bg-transparent px-3 py-1.5 text-sm"
                placeholder="e.g. photo, carousel, video"
                value={form.mediaType}
                onChange={(e) => set('mediaType', e.target.value)}
              />
            </Field>

            <Field label="Content Topic">
              <input
                type="text"
                className="border-border w-full rounded border bg-transparent px-3 py-1.5 text-sm"
                value={form.contentTopic}
                onChange={(e) => set('contentTopic', e.target.value)}
              />
            </Field>

            <Field label="Sentiment / Tone">
              <input
                type="text"
                className="border-border w-full rounded border bg-transparent px-3 py-1.5 text-sm"
                placeholder="e.g. positive, neutral, urgent"
                value={form.sentimentTone}
                onChange={(e) => set('sentimentTone', e.target.value)}
              />
            </Field>

            <Field label="Campaign Name">
              <input
                type="text"
                className="border-border w-full rounded border bg-transparent px-3 py-1.5 text-sm"
                value={form.campaignName}
                onChange={(e) => set('campaignName', e.target.value)}
              />
            </Field>
          </div>

          <Field label="Caption">
            <textarea
              className="border-border w-full rounded border bg-transparent px-3 py-1.5 text-sm"
              rows={4}
              value={form.caption}
              onChange={(e) => set('caption', e.target.value)}
            />
          </Field>

          <Field label="Hashtags">
            <input
              type="text"
              className="border-border w-full rounded border bg-transparent px-3 py-1.5 text-sm"
              placeholder="#tag1 #tag2"
              value={form.hashtags}
              onChange={(e) => set('hashtags', e.target.value)}
            />
          </Field>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isBoosted"
              checked={form.isBoosted}
              onChange={(e) => set('isBoosted', e.target.checked)}
            />
            <label htmlFor="isBoosted" className="text-sm">
              Boosted Post
            </label>
          </div>

          {form.isBoosted && (
            <Field label="Boost Budget (PHP)">
              <input
                type="number"
                min="0"
                step="0.01"
                className="border-border w-full rounded border bg-transparent px-3 py-1.5 text-sm"
                value={form.boostBudgetPhp}
                onChange={(e) =>
                  set('boostBudgetPhp', e.target.value === '' ? '' : Number(e.target.value))
                }
              />
            </Field>
          )}
        </fieldset>

        {/* Engagement Metrics */}
        <fieldset className="space-y-4">
          <legend className="mb-2 text-lg font-semibold">Engagement Metrics</legend>

          <div className="grid gap-4 sm:grid-cols-3">
            {(
              [
                ['impressions', 'Impressions'],
                ['reach', 'Reach'],
                ['likes', 'Likes'],
                ['comments', 'Comments'],
                ['shares', 'Shares'],
                ['saves', 'Saves'],
                ['clickThroughs', 'Click-Throughs'],
                ['videoViews', 'Video Views'],
                ['engagementRate', 'Engagement Rate (%)'],
                ['donationReferrals', 'Donation Referrals'],
                ['estimatedDonationValuePhp', 'Est. Donation Value (PHP)'],
              ] as const
            ).map(([key, label]) => (
              <Field key={key} label={label}>
                <input
                  type="number"
                  min="0"
                  step={key === 'engagementRate' ? '0.01' : '1'}
                  className="border-border w-full rounded border bg-transparent px-3 py-1.5 text-sm"
                  value={form[key]}
                  onChange={(e) =>
                    set(key, e.target.value === '' ? '' : Number(e.target.value))
                  }
                />
              </Field>
            ))}
          </div>
        </fieldset>

        <div className="flex gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : 'Create Post'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/social/posts')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-muted-foreground mb-1 block text-xs">{label}</label>
      {children}
    </div>
  )
}
