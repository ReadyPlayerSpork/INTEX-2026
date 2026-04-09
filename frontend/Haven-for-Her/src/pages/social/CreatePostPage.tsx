import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, ApiError } from '@/api/client'
import { Button } from '@/components/ui/button'
import { ImagePlus, Megaphone, Loader2, CheckCircle2, ExternalLink, AlertTriangle, X } from 'lucide-react'

// ── Audience presets (seed headline / link / CTA / genders) ─────────────────

type Audience = 'donors' | 'survivors'

const AUDIENCE_PRESETS: Record<
  Audience,
  {
    label: string
    headline: string
    linkUrl: string
    callToAction: string
    genders: number[] | null
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
    genders: [2],
    description: 'Targets survivors — women only, CTA links to resources page',
  },
}

/** ISO 3166-1 alpha-2 — Meta geo_locations.countries */
const COUNTRY_OPTIONS: { code: string; label: string }[] = [
  { code: 'US', label: 'United States' },
  { code: 'CA', label: 'Canada' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'AU', label: 'Australia' },
  { code: 'PH', label: 'Philippines' },
]

interface InterestPick {
  id: string
  name: string
}

interface MetaDefaultsResponse {
  callToActionTypes: { value: string; label: string }[]
  defaultTargeting: { countries: string[]; ageMin: number; ageMax: number }
  defaultDailyBudgetCents: number
}

interface CampaignResult {
  campaignId: string
  adSetId: string
  adCreativeId: string
  adId: string
  imageHash: string
  status: string
  adsManagerUrl: string
}

function dateInputToUtcIso(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0)).toISOString()
}

export function CreatePostPage() {
  const navigate = useNavigate()

  const [metaConfigured, setMetaConfigured] = useState<boolean | null>(null)
  const [configDetail, setConfigDetail] = useState<Record<string, boolean>>({})

  const [audience, setAudience] = useState<Audience>('donors')
  const [campaignName, setCampaignName] = useState('')
  const [caption, setCaption] = useState('')
  const [dailyBudget, setDailyBudget] = useState<number | ''>('')

  const [headline, setHeadline] = useState(AUDIENCE_PRESETS.donors.headline)
  const [linkUrl, setLinkUrl] = useState(AUDIENCE_PRESETS.donors.linkUrl)
  const [callToAction, setCallToAction] = useState(AUDIENCE_PRESETS.donors.callToAction)
  const [ctaOptions, setCtaOptions] = useState<{ value: string; label: string }[]>([])

  const [ageMin, setAgeMin] = useState(18)
  const [ageMax, setAgeMax] = useState(65)
  const [countries, setCountries] = useState<string[]>(['US'])

  const [interestQuery, setInterestQuery] = useState('')
  const [interestResults, setInterestResults] = useState<InterestPick[]>([])
  const [interestLoading, setInterestLoading] = useState(false)
  const [interests, setInterests] = useState<InterestPick[]>([])
  const interestDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [scheduleStart, setScheduleStart] = useState('')
  const [scheduleEnd, setScheduleEnd] = useState('')

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<CampaignResult | null>(null)

  const preset = AUDIENCE_PRESETS[audience]

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

  useEffect(() => {
    api
      .get<MetaDefaultsResponse>('/api/meta-ads/defaults')
      .then((d) => {
        setCtaOptions(d.callToActionTypes)
      })
      .catch(() => {
        setCtaOptions([
          { value: 'LEARN_MORE', label: 'Learn More' },
          { value: 'DONATE_NOW', label: 'Donate Now' },
          { value: 'SIGN_UP', label: 'Sign Up' },
        ])
      })
  }, [])

  useEffect(() => {
    const p = AUDIENCE_PRESETS[audience]
    setHeadline(p.headline)
    setLinkUrl(p.linkUrl)
    setCallToAction(p.callToAction)
  }, [audience])

  const searchInterests = useCallback(async (q: string) => {
    if (q.length < 2) {
      setInterestResults([])
      return
    }
    setInterestLoading(true)
    try {
      const raw = await api.get<{ data?: { id: string; name: string }[] }>(
        `/api/meta-ads/targeting/search?q=${encodeURIComponent(q)}`,
      )
      const rows = raw.data ?? []
      setInterestResults(
        rows.slice(0, 12).map((r) => ({ id: String(r.id), name: r.name })),
      )
    } catch {
      setInterestResults([])
    } finally {
      setInterestLoading(false)
    }
  }, [])

  useEffect(() => {
    if (interestDebounce.current) clearTimeout(interestDebounce.current)
    interestDebounce.current = setTimeout(() => {
      void searchInterests(interestQuery.trim())
    }, 350)
    return () => {
      if (interestDebounce.current) clearTimeout(interestDebounce.current)
    }
  }, [interestQuery, searchInterests])

  function toggleCountry(code: string) {
    setCountries((prev) => {
      if (prev.includes(code)) {
        const next = prev.filter((c) => c !== code)
        return next.length ? next : ['US']
      }
      return [...prev, code]
    })
  }

  function addInterest(item: InterestPick) {
    setInterests((prev) => {
      if (prev.some((p) => p.id === item.id)) return prev
      if (prev.length >= 25) return prev
      return [...prev, item]
    })
    setInterestQuery('')
    setInterestResults([])
  }

  function removeInterest(id: string) {
    setInterests((prev) => prev.filter((p) => p.id !== id))
  }

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

  function resetFormState() {
    setAudience('donors')
    setCampaignName('')
    setCaption('')
    setDailyBudget('')
    const d = AUDIENCE_PRESETS.donors
    setHeadline(d.headline)
    setLinkUrl(d.linkUrl)
    setCallToAction(d.callToAction)
    setAgeMin(18)
    setAgeMax(65)
    setCountries(['US'])
    setInterests([])
    setInterestQuery('')
    setScheduleStart('')
    setScheduleEnd('')
    clearImage()
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
    if (!headline.trim() || !linkUrl.trim()) {
      setError('Headline and destination URL are required.')
      return
    }
    if (ageMin < 13 || ageMax > 65 || ageMin > ageMax) {
      setError('Age range must be between 13–65, with min ≤ max (Meta limits).')
      return
    }
    if (countries.length === 0) {
      setError('Select at least one country.')
      return
    }

    let startTime: string | undefined
    let endTime: string | undefined
    if (scheduleStart) startTime = dateInputToUtcIso(scheduleStart)
    if (scheduleEnd) endTime = dateInputToUtcIso(scheduleEnd)
    if (startTime && endTime && new Date(endTime) <= new Date(startTime)) {
      setError('End date must be after start date.')
      return
    }

    setSubmitting(true)
    try {
      const body: Record<string, unknown> = {
        campaignName: campaignName.trim(),
        imageBase64: imagePreview,
        primaryText: caption.trim(),
        headline: headline.trim(),
        linkUrl: linkUrl.trim(),
        callToAction,
        dailyBudgetCents: Math.round(Number(dailyBudget) * 100),
        targeting: {
          countries,
          ageMin,
          ageMax,
          genders: preset.genders,
          ...(interests.length > 0
            ? { interests: interests.map((i) => ({ id: i.id, name: i.name })) }
            : {}),
        },
      }
      if (startTime) body.startTime = startTime
      if (endTime) body.endTime = endTime

      const res = await api.post<CampaignResult>('/api/meta-ads/campaigns', body)
      setResult(res)
    } catch (err) {
      if (err instanceof ApiError && err.body && typeof err.body === 'object') {
        const body = err.body as Record<string, unknown>
        const detail = String(body.detail ?? '')
        const lower = detail.toLowerCase()
        if (
          lower.includes('session has expired') ||
          lower.includes('error validating access token') ||
          detail.includes('"code":190') ||
          detail.includes('"code": 190')
        ) {
          setError(
            'Meta access token expired or invalid. Ask an admin to generate a new token and update META_SYSTEM_USER_TOKEN (then redeploy the API).',
          )
        } else {
          const meta = body.meta as
            | { error?: { error_user_msg?: string; message?: string; error_subcode?: number } }
            | undefined
          const userMsg = meta?.error?.error_user_msg
          const sub = meta?.error?.error_subcode
          if (userMsg) {
            setError(
              sub != null ? `${userMsg} (Meta error_subcode: ${sub})` : userMsg,
            )
          } else {
            setError(String(body.detail || body.error || 'Failed to create campaign.'))
          }
        }
      } else {
        setError('Failed to create campaign. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (metaConfigured === false) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
          <AlertTriangle className="mx-auto mb-3 size-10 text-amber-600" />
          <h1 className="font-heading mb-2 text-xl font-bold text-amber-900">
            Meta Ads API Not Configured
          </h1>
          <p className="text-amber-800 mb-4 text-sm">
            The server is missing one or more required environment variables.
            Contact your administrator to set these up:
          </p>
          <div className="mx-auto mb-4 max-w-sm space-y-1 text-left text-sm">
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

  if (metaConfigured === null) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <Loader2 className="text-muted-foreground mx-auto size-8 animate-spin" />
        <p className="text-muted-foreground mt-3 text-sm">Checking Meta Ads configuration...</p>
      </div>
    )
  }

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
              resetFormState()
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

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8">
        <h1 className="font-heading mb-1 text-2xl font-bold">Create Ad Campaign</h1>
        <p className="text-muted-foreground text-sm">
          All fields map to <code className="text-xs">POST /api/meta-ads/campaigns</code>. Campaign
          is created <strong>paused</strong>.
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive mb-6 rounded-xl border border-destructive/20 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <fieldset className="space-y-3">
          <legend className="mb-1 text-sm font-semibold">Target Audience Preset</legend>
          <div className="grid grid-cols-2 gap-3">
            {(Object.entries(AUDIENCE_PRESETS) as [Audience, (typeof AUDIENCE_PRESETS)['donors']][]).map(
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
                  <p className="text-muted-foreground mt-0.5 text-xs leading-snug">{p.description}</p>
                </button>
              ),
            )}
          </div>
          <p className="text-muted-foreground text-xs">
            Switching preset updates headline, link, and CTA — you can edit them below.
          </p>
        </fieldset>

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
              <span className="text-muted-foreground text-sm">Click to upload image</span>
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

        <div>
          <label className="mb-1 block text-sm font-semibold" htmlFor="campaignName">
            Campaign Name
          </label>
          <input
            id="campaignName"
            type="text"
            required
            placeholder="e.g. Spring Fundraiser 2026"
            className="border-border bg-background focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold" htmlFor="caption">
            Ad Copy (primary text)
          </label>
          <textarea
            id="caption"
            required
            rows={4}
            placeholder="Write the primary text for your ad..."
            className="border-border bg-background focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
          <p className="text-muted-foreground mt-1 text-xs">
            {caption.length} characters &middot; Recommended under 125 for best performance
          </p>
        </div>

        <div className="border-border space-y-4 rounded-xl border p-4">
          <p className="text-sm font-semibold">Destination &amp; CTA</p>
          <div>
            <label className="mb-1 block text-xs font-medium" htmlFor="headline">
              Headline (link title)
            </label>
            <input
              id="headline"
              type="text"
              required
              className="border-border bg-background focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium" htmlFor="linkUrl">
              Destination URL
            </label>
            <input
              id="linkUrl"
              type="url"
              required
              placeholder="https://..."
              className="border-border bg-background focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium" htmlFor="cta">
              Call to action
            </label>
            <select
              id="cta"
              className="border-border bg-background focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
              value={callToAction}
              onChange={(e) => setCallToAction(e.target.value)}
            >
              {ctaOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

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
              className="border-border bg-background focus:border-primary focus:ring-primary/20 w-full rounded-lg border py-2 pl-7 pr-3 text-sm focus:ring-2 focus:outline-none"
              value={dailyBudget}
              onChange={(e) =>
                setDailyBudget(e.target.value === '' ? '' : Number(e.target.value))
              }
            />
          </div>
          <p className="text-muted-foreground mt-1 text-xs">
            Sent as <code className="text-xs">dailyBudgetCents</code> to the API.
          </p>
        </div>

        <div className="border-border space-y-4 rounded-xl border p-4">
          <p className="text-sm font-semibold">Targeting</p>
          <p className="text-muted-foreground text-xs">
            Genders: {preset.genders === null ? 'all' : 'women only (Meta code 2)'} — controlled by
            audience preset above.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium" htmlFor="ageMin">
                Min age
              </label>
              <input
                id="ageMin"
                type="number"
                min={13}
                max={65}
                className="border-border bg-background focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                value={ageMin}
                onChange={(e) => setAgeMin(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium" htmlFor="ageMax">
                Max age
              </label>
              <input
                id="ageMax"
                type="number"
                min={13}
                max={65}
                className="border-border bg-background focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                value={ageMax}
                onChange={(e) => setAgeMax(Number(e.target.value))}
              />
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium">Countries (ISO codes)</p>
            <div className="flex flex-wrap gap-2">
              {COUNTRY_OPTIONS.map(({ code, label }) => (
                <label
                  key={code}
                  className="border-border flex cursor-pointer items-center gap-2 rounded-lg border px-2 py-1.5 text-xs"
                >
                  <input
                    type="checkbox"
                    checked={countries.includes(code)}
                    onChange={() => toggleCountry(code)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium" htmlFor="interestSearch">
              Interest targeting (optional)
            </label>
            <input
              id="interestSearch"
              type="text"
              placeholder="Type 2+ characters to search Meta interests..."
              className="border-border bg-background focus:border-primary focus:ring-primary/20 mb-2 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
              value={interestQuery}
              onChange={(e) => setInterestQuery(e.target.value)}
            />
            {interestLoading && (
              <p className="text-muted-foreground mb-1 text-xs">Searching…</p>
            )}
            {interestResults.length > 0 && (
              <ul className="border-border max-h-36 overflow-y-auto rounded-lg border text-sm">
                {interestResults.map((r) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      className="hover:bg-muted/60 w-full px-3 py-2 text-left text-xs"
                      onClick={() => addInterest(r)}
                    >
                      {r.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {interests.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {interests.map((i) => (
                  <span
                    key={i.id}
                    className="bg-secondary text-secondary-foreground inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
                  >
                    {i.name}
                    <button
                      type="button"
                      className="rounded-full p-0.5 hover:bg-background/50"
                      onClick={() => removeInterest(i.id)}
                      aria-label={`Remove ${i.name}`}
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className="text-muted-foreground mt-1 text-xs">Up to 25 interests. Uses Meta targeting search API.</p>
          </div>
        </div>

        <div className="border-border space-y-3 rounded-xl border p-4">
          <p className="text-sm font-semibold">Schedule (optional)</p>
          <p className="text-muted-foreground text-xs">
            Maps to <code className="text-xs">startTime</code> / <code className="text-xs">endTime</code>{' '}
            on the ad set (UTC).
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium" htmlFor="schedStart">
                Start date
              </label>
              <input
                id="schedStart"
                type="date"
                className="border-border bg-background focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                value={scheduleStart}
                onChange={(e) => setScheduleStart(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium" htmlFor="schedEnd">
                End date
              </label>
              <input
                id="schedEnd"
                type="date"
                className="border-border bg-background focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                value={scheduleEnd}
                onChange={(e) => setScheduleEnd(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="bg-secondary/50 border-border rounded-xl border p-4">
          <p className="text-muted-foreground mb-2 text-xs font-semibold uppercase tracking-wide">
            Summary
          </p>
          <div className="grid gap-1 text-sm">
            <p>
              <span className="text-muted-foreground">Audience:</span> <strong>{preset.label}</strong>
            </p>
            <p>
              <span className="text-muted-foreground">Headline:</span> {headline}
            </p>
            <p>
              <span className="text-muted-foreground">CTA:</span> {callToAction}
            </p>
            <p className="break-all">
              <span className="text-muted-foreground">Link:</span> {linkUrl}
            </p>
            <p>
              <span className="text-muted-foreground">Countries:</span> {countries.join(', ')}
            </p>
            <p>
              <span className="text-muted-foreground">Ages:</span> {ageMin}–{ageMax}
            </p>
            {interests.length > 0 && (
              <p>
                <span className="text-muted-foreground">Interests:</span> {interests.length} selected
              </p>
            )}
            {dailyBudget ? (
              <p>
                <span className="text-muted-foreground">Budget:</span> $
                {Number(dailyBudget).toFixed(2)}/day
              </p>
            ) : null}
          </div>
        </div>

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
          <Button type="button" variant="outline" onClick={() => navigate('/social/posts')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
