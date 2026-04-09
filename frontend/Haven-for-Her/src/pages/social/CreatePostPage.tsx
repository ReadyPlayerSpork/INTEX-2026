import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, ApiError } from '@/api/client'
import { Button } from '@/components/ui/button'
import { ImagePlus, Megaphone, Loader2, CheckCircle2, ExternalLink, AlertTriangle } from 'lucide-react'

// ── Audience presets ───────────────────────────────────────────────────────

type Audience = 'donors' | 'survivors'

const AUDIENCE_PRESETS: Record<
  Audience,
  {
    label: string
    headline: string
    linkUrl: string
    callToAction: string
    genders: number[] | null // null = all genders, [2] = women only
    description: string
  }
> = {
  donors: {
    label: 'Donors',
    headline: 'Support Survivors Today',
    linkUrl: 'https://havenforher.lukemiller.dev/donate',
    callToAction: 'DONATE_NOW',
    genders: null,
    description: 'Targets potential donors — all genders, CTA links to donation page',
  },
  survivors: {
    label: 'Survivors',
    headline: 'Find Support Today',
    linkUrl: 'https://havenforher.lukemiller.dev/resources',
    callToAction: 'LEARN_MORE',
    genders: [2], // women only
    description: 'Targets survivors — women only, CTA links to resources page',
  },
}

// ── Component ──────────────────────────────────────────────────────────────

interface CampaignResult {
  campaignId: string
  adSetId: string
  adCreativeId: string
  adId: string
  imageHash: string
  status: string
  adsManagerUrl: string
}

export function CreatePostPage() {
  const navigate = useNavigate()

  // Meta config check
  const [metaConfigured, setMetaConfigured] = useState<boolean | null>(null) // null = loading
  const [configDetail, setConfigDetail] = useState<Record<string, boolean>>({})

  useEffect(() => {
    api
      .get<{ configured: boolean; hasAccessToken: boolean; hasAdAccountId: boolean; hasPageId: boolean }>(
        '/api/meta-ads/status',
      )
      .then((s) => {
        setMetaConfigured(s.configured)
        setConfigDetail({
          hasAccessToken: s.hasAccessToken,
          hasAdAccountId: s.hasAdAccountId,
          hasPageId: s.hasPageId,
        })
      })
      .catch(() => setMetaConfigured(false))
  }, [])

  // Form state — only the 4 fields the user fills in + audience selector
  const [audience, setAudience] = useState<Audience>('donors')
  const [campaignName, setCampaignName] = useState('')
  const [caption, setCaption] = useState('')
  const [dailyBudget, setDailyBudget] = useState<number | ''>('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Submission state
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<CampaignResult | null>(null)

  const preset = AUDIENCE_PRESETS[audience]

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  function clearImage() {
    setImageFile(null)
    setImagePreview(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!imageFile || !imagePreview) {
      setError('Please upload an image for the ad.')
      return
    }
    if (!campaignName.trim()) {
      setError('Please enter a campaign name.')
      return
    }
    if (!caption.trim()) {
      setError('Please enter ad copy (caption).')
      return
    }
    if (!dailyBudget || dailyBudget < 1) {
      setError('Please enter a daily budget of at least $1.')
      return
    }

    setSubmitting(true)
    try {
      const res = await api.post<CampaignResult>('/api/meta-ads/campaigns', {
        campaignName: campaignName.trim(),
        imageBase64: imagePreview, // includes data URI prefix — backend strips it
        primaryText: caption.trim(),
        headline: preset.headline,
        linkUrl: preset.linkUrl,
        callToAction: preset.callToAction,
        dailyBudgetCents: Math.round(dailyBudget * 100),
        targeting: {
          countries: ['US'],
          ageMin: 18,
          ageMax: 65,
          genders: preset.genders,
        },
      })
      setResult(res)
    } catch (err) {
      if (err instanceof ApiError && err.body && typeof err.body === 'object') {
        const body = err.body as Record<string, unknown>
        setError(String(body.detail || body.error || 'Failed to create campaign.'))
      } else {
        setError('Failed to create campaign. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  // ── Not configured state ────────────────────────────────────────────────

  if (metaConfigured === false) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
          <AlertTriangle className="mx-auto mb-3 size-10 text-amber-600" />
          <h1 className="font-heading mb-2 text-xl font-bold text-amber-900">
            Meta Ads API Not Configured
          </h1>
          <p className="text-amber-800 text-sm mb-4">
            The server is missing one or more required environment variables.
            Contact your administrator to set these up:
          </p>
          <div className="mx-auto max-w-sm text-left text-sm space-y-1 mb-4">
            {Object.entries(configDetail).map(([key, ok]) => (
              <p key={key} className={ok ? 'text-green-700' : 'text-red-700'}>
                {ok ? '✓' : '✗'} {key.replace('has', '').replace(/([A-Z])/g, ' $1').trim()}
              </p>
            ))}
          </div>
          <Button variant="outline" onClick={() => navigate('/social/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  // ── Loading config state ───────────────────────────────────────────────

  if (metaConfigured === null) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <Loader2 className="text-muted-foreground mx-auto size-8 animate-spin" />
        <p className="text-muted-foreground mt-3 text-sm">Checking Meta Ads configuration...</p>
      </div>
    )
  }

  // ── Success state ──────────────────────────────────────────────────────

  if (result) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <CheckCircle2 className="text-primary mx-auto mb-4 size-12" />
        <h1 className="font-heading mb-2 text-2xl font-bold">Campaign Created</h1>
        <p className="text-muted-foreground mb-6 text-sm">
          Your campaign has been created and is <strong>paused</strong>. Review it
          in Meta Ads Manager before activating.
        </p>

        <div className="bg-card border-border mx-auto mb-8 max-w-md rounded-xl border p-5 text-left text-sm">
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Status</dt>
              <dd className="font-semibold text-amber-600">{result.status}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Campaign ID</dt>
              <dd className="font-mono text-xs">{result.campaignId}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Ad Set ID</dt>
              <dd className="font-mono text-xs">{result.adSetId}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Ad ID</dt>
              <dd className="font-mono text-xs">{result.adId}</dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a
            href={result.adsManagerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors"
          >
            Open Ads Manager <ExternalLink className="size-3.5" />
          </a>
          <Button
            variant="outline"
            onClick={() => {
              setResult(null)
              setCampaignName('')
              setCaption('')
              setDailyBudget('')
              clearImage()
            }}
          >
            Create Another
          </Button>
          <Button variant="ghost" onClick={() => navigate('/social/posts')}>
            Back to Posts
          </Button>
        </div>
      </div>
    )
  }

  // ── Form ───────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8">
        <h1 className="font-heading mb-1 text-2xl font-bold">Create Ad Campaign</h1>
        <p className="text-muted-foreground text-sm">
          Upload an image, write your ad copy, and we'll create a paused campaign
          on Meta. Review and activate it in Ads Manager when ready.
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive mb-6 rounded-xl border border-destructive/20 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Audience selector */}
        <fieldset className="space-y-3">
          <legend className="mb-1 text-sm font-semibold">Target Audience</legend>
          <div className="grid grid-cols-2 gap-3">
            {(Object.entries(AUDIENCE_PRESETS) as [Audience, typeof preset][]).map(
              ([key, p]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setAudience(key)}
                  className={[
                    'rounded-xl border-2 p-4 text-left transition-all',
                    audience === key
                      ? 'border-primary bg-primary/5 ring-primary/20 ring-2'
                      : 'border-border hover:border-primary/40',
                  ].join(' ')}
                >
                  <p className="text-sm font-semibold">{p.label}</p>
                  <p className="text-muted-foreground mt-0.5 text-xs leading-snug">
                    {p.description}
                  </p>
                </button>
              ),
            )}
          </div>
          <p className="text-muted-foreground text-xs">
            Headline: <strong>{preset.headline}</strong> &middot; CTA:{' '}
            <strong>{preset.callToAction.replace('_', ' ')}</strong> &middot;
            Link: <strong className="break-all">{preset.linkUrl}</strong>
          </p>
        </fieldset>

        {/* Image upload */}
        <fieldset className="space-y-3">
          <legend className="mb-1 text-sm font-semibold">Ad Image</legend>
          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Ad preview"
                className="border-border h-64 w-full rounded-xl border object-cover"
              />
              <button
                type="button"
                onClick={clearImage}
                className="bg-background/80 text-destructive hover:bg-background absolute right-2 top-2 rounded-lg border px-2.5 py-1 text-xs font-medium backdrop-blur-sm"
              >
                Remove
              </button>
            </div>
          ) : (
            <label className="border-border hover:border-primary/50 hover:bg-primary/5 flex h-48 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors">
              <ImagePlus className="text-muted-foreground size-8" />
              <span className="text-muted-foreground text-sm">
                Click to upload image
              </span>
              <span className="text-muted-foreground text-xs">
                PNG, JPG, or WebP &middot; Recommended 1200x628
              </span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
          )}
        </fieldset>

        {/* Campaign name */}
        <div>
          <label className="mb-1 block text-sm font-semibold" htmlFor="campaignName">
            Campaign Name
          </label>
          <input
            id="campaignName"
            type="text"
            required
            placeholder="e.g. Spring Fundraiser 2026"
            className="border-border bg-background w-full rounded-lg border px-3 py-2 text-sm focus:border-primary focus:ring-primary/20 focus:ring-2 focus:outline-none"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
          />
        </div>

        {/* Caption / primary text */}
        <div>
          <label className="mb-1 block text-sm font-semibold" htmlFor="caption">
            Ad Copy
          </label>
          <textarea
            id="caption"
            required
            rows={4}
            placeholder="Write the primary text for your ad..."
            className="border-border bg-background w-full rounded-lg border px-3 py-2 text-sm focus:border-primary focus:ring-primary/20 focus:ring-2 focus:outline-none"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
          <p className="text-muted-foreground mt-1 text-xs">
            {caption.length} characters &middot; Recommended under 125 for best performance
          </p>
        </div>

        {/* Daily budget */}
        <div>
          <label className="mb-1 block text-sm font-semibold" htmlFor="budget">
            Daily Budget (USD)
          </label>
          <div className="relative">
            <span className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm">
              $
            </span>
            <input
              id="budget"
              type="number"
              required
              min={1}
              step={0.01}
              placeholder="5.00"
              className="border-border bg-background w-full rounded-lg border py-2 pl-7 pr-3 text-sm focus:border-primary focus:ring-primary/20 focus:ring-2 focus:outline-none"
              value={dailyBudget}
              onChange={(e) =>
                setDailyBudget(e.target.value === '' ? '' : Number(e.target.value))
              }
            />
          </div>
          <p className="text-muted-foreground mt-1 text-xs">
            Campaign is created <strong>paused</strong> — no money is spent until
            you activate it in Ads Manager.
          </p>
        </div>

        {/* Preview banner */}
        <div className="bg-secondary/50 border-border rounded-xl border p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Campaign Preview
          </p>
          <div className="grid gap-1 text-sm">
            <p>
              <span className="text-muted-foreground">Audience:</span>{' '}
              <strong>{preset.label}</strong>
            </p>
            <p>
              <span className="text-muted-foreground">Headline:</span>{' '}
              {preset.headline}
            </p>
            <p>
              <span className="text-muted-foreground">CTA Button:</span>{' '}
              {preset.callToAction.replace('_', ' ')}
            </p>
            <p>
              <span className="text-muted-foreground">Link:</span>{' '}
              <span className="break-all">{preset.linkUrl}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Targeting:</span> US,
              ages 18-65
              {preset.genders ? ', women only' : ', all genders'}
            </p>
            {dailyBudget ? (
              <p>
                <span className="text-muted-foreground">Budget:</span>{' '}
                ${Number(dailyBudget).toFixed(2)}/day
              </p>
            ) : null}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <Button type="submit" disabled={submitting} className="gap-2">
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating Campaign...
              </>
            ) : (
              <>
                <Megaphone className="size-4" />
                Create Paused Campaign
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/social/posts')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
