import type { ComponentType, ReactNode } from "react"
import { Link } from "react-router-dom"
import {
  CheckCircle2,
  CircleDollarSign,
  Gem,
  HandHeart,
  Leaf,
  LockKeyhole,
  MoonStar,
  ShieldCheck,
  Sparkles,
  SunMedium,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import type { AnonymousDonateVariantProps } from "@/features/public/donate/types"

const PRESET_AMOUNTS = ["500", "1000", "2500", "5000"]

export function AnonymousDonateDesignVariant(props: AnonymousDonateVariantProps) {
  if (props.success) return <AnonymousDonateSuccessState />
  if (props.variant === "youthful") return <YouthfulDonateVariant {...props} />
  if (props.variant === "institutional") return <InstitutionalDonateVariant {...props} />
  if (props.variant === "sanctuary") return <SanctuaryDonateVariant {...props} />
  if (props.variant === "beacon") return <BeaconDonateVariant {...props} />
  if (props.variant === "bloom") return <BloomDonateVariant {...props} />
  if (props.variant === "chronicle") return <ChronicleDonateVariant {...props} />
  if (props.variant === "radiant") return <RadiantDonateVariant {...props} />
  if (props.variant === "refuge") return <RefugeDonateVariant {...props} />

  return <MissionFirstDonateVariant {...props} />
}

function AnonymousDonateSuccessState() {
  return (
    <div className="px-4 py-10">
      <Card className="mx-auto max-w-2xl border-primary/20 bg-primary/5 shadow-lg">
        <CardContent className="flex flex-col items-center gap-5 px-8 py-12 text-center">
          <CheckCircle2 className="size-12 text-primary" />
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold tracking-tight">Thank you for giving</h2>
            <p className="text-muted-foreground max-w-xl text-sm leading-7 sm:text-base">
              Your donation has been recorded. If you included an email, a receipt can be
              sent to you. Every contribution helps sustain safety, counseling, and long-term support.
            </p>
          </div>
          <Link to="/">
            <Button size="lg">Return to home</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

function MissionFirstDonateVariant(props: AnonymousDonateVariantProps) {
  return (
    <SplitLayout
      left={
        <Card className="border-primary/10 bg-[radial-gradient(circle_at_top_left,_rgba(143,94,83,0.14),_transparent_46%),linear-gradient(180deg,rgba(255,249,245,0.95),rgba(255,255,255,1))] shadow-lg">
          <CardContent className="space-y-6 px-8 py-10">
            <Badge className="bg-primary/90">Mission-first</Badge>
            <HeroHeading>A gift today helps keep a girl safe tonight.</HeroHeading>
            <BodyText>
              This anonymous donation flow is designed for low friction. Give once,
              support a safe home, and help sustain the care survivors need right now.
            </BodyText>
            <div className="space-y-3">
              {[
                "No account required",
                "Optional name and email for receipt only",
                "Direct support for housing, care, and recovery",
              ].map((item) => (
                <InfoChip key={item} icon={HandHeart}>{item}</InfoChip>
              ))}
            </div>
          </CardContent>
        </Card>
      }
      right={
        <DonationFormCard
          heading="Give securely"
          description="Every amount contributes to safety, stability, and sustained care."
          props={props}
        />
      }
    />
  )
}

function YouthfulDonateVariant(props: AnonymousDonateVariantProps) {
  return (
    <div className="px-4 py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <Card className="overflow-hidden border-0 bg-[linear-gradient(135deg,rgba(245,98,91,0.16),rgba(255,221,153,0.22),rgba(90,160,120,0.18))] shadow-xl">
          <CardContent className="grid gap-8 px-8 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-5">
              <Badge className="bg-background text-foreground shadow-sm">Youthful</Badge>
              <HeroHeading>Turn generosity into a safer, brighter next chapter.</HeroHeading>
              <BodyText className="text-foreground/80">
                This version leans into optimism while keeping the donation flow simple,
                respectful, and fully grounded in the mission.
              </BodyText>
              <PresetRow props={props} activeVariant="secondary" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <TintPanel icon={CircleDollarSign} title="Fast to complete" body="Essential fields only, with optional receipt details." className="border-white/40 bg-white/85" />
              <TintPanel icon={ShieldCheck} title="Still trustworthy" body="Momentum in the visuals without sacrificing confidence." className="border-white/40 bg-white/85" />
            </div>
          </CardContent>
        </Card>

        <DonationFormCard
          heading="Make your gift"
          description="This layout uses brighter framing and quicker amount cues while preserving the same donation logic."
          props={props}
          emphasizePresets
        />
      </div>
    </div>
  )
}

function InstitutionalDonateVariant(props: AnonymousDonateVariantProps) {
  return (
    <SplitLayout
      left={
        <Card className="shadow-lg">
          <CardHeader className="gap-4">
            <Badge variant="outline" className="bg-muted w-fit">
              Institutional
            </Badge>
            <CardTitle className="text-4xl tracking-tight text-balance">
              Support survivor care through a disciplined, transparent giving flow.
            </CardTitle>
            <CardDescription className="max-w-3xl text-base leading-8">
              This direction favors formal structure, clear accountability, and a stronger
              sense of operational credibility for detail-oriented donors.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              {[
                ["Anonymous option", "Donate without signing in."],
                ["Receipt details optional", "Provide name or email only if helpful."],
                ["Mission-aligned use", "Support housing, counseling, and core care."],
              ].map(([title, body]) => (
                <div key={title} className="rounded-2xl border border-border/70 p-4">
                  <p className="font-medium">{title}</p>
                  <p className="text-muted-foreground mt-2 text-sm leading-6">{body}</p>
                </div>
              ))}
            </div>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-2">
              <SupportPanel title="Best for" body="Donors who want a composed, straightforward interface that signals strong systems and accountable stewardship." />
              <SupportPanel title="Conversion angle" body="Reduce uncertainty with structure, trust cues, and a more report-like tone." />
            </div>
          </CardContent>
        </Card>
      }
      right={
        <DonationFormCard
          heading="Record a contribution"
          description="The same anonymous donation behavior presented in a more formal, credibility-first layout."
          props={props}
        />
      }
    />
  )
}

function SanctuaryDonateVariant(props: AnonymousDonateVariantProps) {
  return (
    <ThemedDonateShell
      backgroundClass="bg-[#FAF5EF] text-[#3D261A]"
      heroClass="border-[rgba(61,38,26,0.15)] bg-[#FFFBF7]"
      badgeClass="bg-[#C06A3A] text-[#FFFBF7]"
      variantLabel="Sanctuary"
      title="A warm editorial donation experience that feels gentle, human, and grounded."
      body="Sanctuary uses terracotta warmth and soft sage support notes to make the act of giving feel intimate rather than transactional."
      panels={[
        [HandHeart, "Low-friction giving", "A simpler emotional frame around the same anonymous donation workflow."],
        [Leaf, "Warm trust cues", "Softer color and editorial rhythm without losing clarity."],
      ]}
      formProps={props}
      formHeading="Contribute with care"
      formDescription="Editorial warmth outside, the same anonymous donation mechanics inside."
      formClassName="border-[rgba(61,38,26,0.15)] bg-[#FFFBF7]"
      primaryClass="bg-[#C06A3A] text-[#FFFBF7] hover:scale-[1.02]"
      outlineClass="border-[rgba(61,38,26,0.15)] text-[#3D261A]"
    />
  )
}

function BeaconDonateVariant(props: AnonymousDonateVariantProps) {
  return (
    <ThemedDonateShell
      backgroundClass="bg-[#FAFAF5] text-[#1B1F3B]"
      heroClass="border-[rgba(27,31,59,0.15)] bg-[#1B1F3B] text-[#FAFAF5]"
      badgeClass="bg-[#E57356] text-white"
      variantLabel="Beacon"
      title="A bold geometric donation layout built for clarity, confidence, and visible action."
      body="Beacon pushes contrast and structure harder so the give flow feels direct, accountable, and conversion-aware."
      panels={[
        [ShieldCheck, "High-clarity hierarchy", "The page reads quickly and signals that the organization has structure."],
        [CircleDollarSign, "Action-first framing", "The call to give is immediate without being sloppy or loud."],
      ]}
      formProps={props}
      formHeading="Complete a contribution"
      formDescription="A sharper, higher-contrast treatment using the same anonymous donation endpoint."
      formClassName="border-[rgba(27,31,59,0.15)] bg-white"
      primaryClass="bg-[#E57356] text-white hover:scale-[1.02]"
      outlineClass="border-[rgba(27,31,59,0.15)] text-[#1B1F3B]"
      bodyClass="text-[#E6E6DD]"
      panelClass="border-[rgba(250,250,245,0.15)] bg-white/8 text-[#FAFAF5]"
    />
  )
}

function BloomDonateVariant(props: AnonymousDonateVariantProps) {
  return (
    <ThemedDonateShell
      backgroundClass="bg-[#F3EFF8] text-[#4A2C5E]"
      heroClass="border-[rgba(74,44,94,0.14)] bg-white/80"
      badgeClass="bg-[#7A9E70] text-white"
      variantLabel="Bloom"
      title="A softer organic donation page designed to feel reassuring, gentle, and personal."
      body="Bloom uses lavender, plum, and blush to lower visual intensity while keeping the form itself direct and fully usable."
      panels={[
        [Leaf, "Gentle, readable pace", "Field groups breathe more and the page feels emotionally quieter."],
        [HandHeart, "Still mission-forward", "The softer visual tone does not weaken the call to support survivors."],
      ]}
      formProps={props}
      formHeading="Make a supportive gift"
      formDescription="Organic and calm on the outside, unchanged anonymous donation logic inside."
      formClassName="border-[rgba(74,44,94,0.14)] bg-white/85"
      primaryClass="bg-[#7A9E70] text-white hover:scale-[1.02]"
      outlineClass="border-[rgba(74,44,94,0.14)] text-[#4A2C5E]"
      panelClass="border-[rgba(74,44,94,0.14)] bg-[#F0DDD5]"
      bodyClass="text-[#6A5578]"
    />
  )
}

function ChronicleDonateVariant(props: AnonymousDonateVariantProps) {
  return (
    <ThemedDonateShell
      backgroundClass="bg-[#141414] text-[#FAF8F5]"
      heroClass="border-[rgba(184,151,90,0.18)] bg-[linear-gradient(180deg,rgba(20,20,20,1),rgba(30,24,22,1))]"
      badgeClass="bg-[#B8975A] text-[#141414]"
      variantLabel="Chronicle"
      title="A premium dark donation treatment for donors who respond to gravity, polish, and narrative weight."
      body="Chronicle treats the donation page like a feature spread: rich contrast, strong focus, and a cultivated sense of importance."
      panels={[
        [MoonStar, "High-drama confidence", "Dark surfaces and gold accents create a more elevated donor impression."],
        [Gem, "Premium stewardship feel", "Useful when the experience should feel careful, polished, and considered."],
      ]}
      formProps={props}
      formHeading="Support the mission"
      formDescription="Premium dark styling layered over the same anonymous donation behavior."
      formClassName="border-[rgba(184,151,90,0.18)] bg-[#1C1C1C] text-[#FAF8F5]"
      primaryClass="bg-[#B8975A] text-[#141414] hover:scale-[1.02]"
      outlineClass="border-[rgba(250,248,245,0.18)] text-[#FAF8F5]"
      bodyClass="text-[#D5CCC7]"
      panelClass="border-[rgba(184,151,90,0.18)] bg-white/5 text-[#FAF8F5]"
    />
  )
}

function RadiantDonateVariant(props: AnonymousDonateVariantProps) {
  return (
    <ThemedDonateShell
      backgroundClass="bg-[#FFFBF0] text-[#1E1E1E]"
      heroClass="border-[rgba(13,110,114,0.14)] bg-[linear-gradient(135deg,rgba(13,110,114,0.12),rgba(242,199,68,0.16),rgba(255,251,240,1))]"
      badgeClass="bg-[#0D6E72] text-white"
      variantLabel="Radiant"
      title="A vibrant hopeful donation page that feels active, positive, and easy to trust."
      body="Radiant uses teal and sunshine accents to increase momentum while keeping the donation path very simple."
      panels={[
        [SunMedium, "Hopeful energy", "Brighter color creates motion without feeling unserious."],
        [Sparkles, "Faster decisions", "Preset amounts and stronger CTA emphasis support conversion."],
      ]}
      formProps={props}
      formHeading="Donate today"
      formDescription="Teal-led optimism around the same anonymous donation flow."
      formClassName="border-[rgba(13,110,114,0.14)] bg-white"
      primaryClass="bg-[#0D6E72] text-white hover:scale-[1.02]"
      outlineClass="border-[rgba(13,110,114,0.14)] text-[#0D6E72]"
      panelClass="border-[rgba(13,110,114,0.14)] bg-white"
      bodyClass="text-[#3F3F3F]"
    />
  )
}

function RefugeDonateVariant(props: AnonymousDonateVariantProps) {
  return (
    <ThemedDonateShell
      backgroundClass="bg-[#FCFAF8] text-[#1C1917]"
      heroClass="border-[rgba(28,25,23,0.12)] bg-white"
      badgeClass="bg-[#C9A9A3] text-[#1C1917]"
      variantLabel="Refuge"
      title="A minimal refined donation page that reduces noise and lets the form carry the trust."
      body="Refuge strips the page back to essentials and relies on spacing, tone, and discipline instead of decorative energy."
      panels={[
        [LockKeyhole, "Quiet confidence", "The minimal frame keeps attention on the action and on the credibility of the organization."],
        [Gem, "Elegant restraint", "Best when visual confidence comes from calm composition rather than strong color drama."],
      ]}
      formProps={props}
      formHeading="Give without an account"
      formDescription="Minimal framing, same endpoint, same donation behavior."
      formClassName="border-[rgba(28,25,23,0.12)] bg-white"
      primaryClass="bg-[#C9A9A3] text-[#1C1917] hover:scale-[1.02]"
      outlineClass="border-[rgba(28,25,23,0.12)] text-[#1C1917]"
      panelClass="border-[rgba(28,25,23,0.12)] bg-[#FCFAF8]"
      bodyClass="text-[#6F665E]"
    />
  )
}

function SplitLayout({
  left,
  right,
}: {
  left: ReactNode
  right: ReactNode
}) {
  return (
    <div className="px-4 py-10">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.02fr_0.98fr]">
        {left}
        {right}
      </div>
    </div>
  )
}

function ThemedDonateShell({
  backgroundClass,
  heroClass,
  badgeClass,
  variantLabel,
  title,
  body,
  panels,
  formProps,
  formHeading,
  formDescription,
  formClassName,
  primaryClass,
  outlineClass,
  panelClass,
  bodyClass,
}: {
  backgroundClass: string
  heroClass: string
  badgeClass: string
  variantLabel: string
  title: string
  body: string
  panels: [ComponentType<{ className?: string }>, string, string][]
  formProps: AnonymousDonateVariantProps
  formHeading: string
  formDescription: string
  formClassName: string
  primaryClass: string
  outlineClass: string
  panelClass?: string
  bodyClass?: string
}) {
  return (
    <div className={`${backgroundClass} px-5 py-16 md:px-10 md:py-24`}>
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className={`${heroClass} shadow-xl`}>
          <CardContent className="space-y-6 p-8 md:p-10">
            <Badge className={badgeClass}>{variantLabel}</Badge>
            <HeroHeading>{title}</HeroHeading>
            <BodyText className={bodyClass}>{body}</BodyText>
            <div className="grid gap-4 sm:grid-cols-2">
              {panels.map(([Icon, panelTitle, panelBody]) => (
                <TintPanel
                  key={panelTitle}
                  icon={Icon}
                  title={panelTitle}
                  body={panelBody}
                  className={panelClass}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/impact">
                <Button variant="outline" className={outlineClass}>
                  See our impact
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="ghost" className={bodyClass}>
                  Log in instead
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <DonationFormCard
          heading={formHeading}
          description={formDescription}
          props={formProps}
          className={formClassName}
          primaryClassName={primaryClass}
          outlineClassName={outlineClass}
        />
      </div>
    </div>
  )
}

function DonationFormCard({
  heading,
  description,
  props,
  emphasizePresets = false,
  className,
  primaryClassName,
  outlineClassName,
}: {
  heading: string
  description: string
  props: AnonymousDonateVariantProps
  emphasizePresets?: boolean
  className?: string
  primaryClassName?: string
  outlineClassName?: string
}) {
  return (
    <Card className={`shadow-lg ${className ?? ""}`}>
      <CardHeader>
        <CardTitle>{heading}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {props.error && (
          <div className="bg-destructive/10 text-destructive mb-5 rounded-2xl border border-destructive/20 p-4 text-sm">
            {props.error}
          </div>
        )}

        <form onSubmit={props.onSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (PHP)</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              step="0.01"
              required
              value={props.amount}
              onChange={(event) => props.onAmountChange(event.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label>Suggested amounts</Label>
            <PresetRow
              props={props}
              activeVariant={emphasizePresets ? "secondary" : "outline"}
              buttonClassName={outlineClassName}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="campaign">Campaign (optional)</Label>
            <Input
              id="campaign"
              value={props.campaign}
              onChange={(event) => props.onCampaignChange(event.target.value)}
              placeholder="e.g. Holiday Giving 2026"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="donor-name">Your name (optional)</Label>
              <Input
                id="donor-name"
                value={props.donorName}
                onChange={(event) => props.onDonorNameChange(event.target.value)}
                placeholder="For a receipt"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="donor-email">Your email (optional)</Label>
              <Input
                id="donor-email"
                type="email"
                value={props.donorEmail}
                onChange={(event) => props.onDonorEmailChange(event.target.value)}
                placeholder="For a receipt"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="donation-notes">Notes (optional)</Label>
            <Textarea
              id="donation-notes"
              rows={3}
              value={props.notes}
              onChange={(event) => props.onNotesChange(event.target.value)}
            />
          </div>

          <Button type="submit" size="lg" disabled={props.loading} className={`w-full ${primaryClassName ?? ""}`}>
            {props.loading ? "Processing..." : "Donate now"}
          </Button>
        </form>

        <p className="text-muted-foreground mt-5 text-center text-xs leading-6">
          Prefer to track your giving?{" "}
          <Link to="/login" className="underline underline-offset-4">
            Log in
          </Link>{" "}
          to access donor history and receipts.
        </p>
      </CardContent>
    </Card>
  )
}

function HeroHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-[clamp(2.5rem,5vw,4.5rem)] font-semibold tracking-tight text-balance">
      {children}
    </h2>
  )
}

function BodyText({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <p className={`text-pretty text-base leading-8 text-muted-foreground ${className ?? ""}`}>{children}</p>
}

function PresetRow({
  props,
  activeVariant,
  buttonClassName,
}: {
  props: AnonymousDonateVariantProps
  activeVariant: "default" | "secondary" | "outline"
  buttonClassName?: string
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {PRESET_AMOUNTS.map((amount) => (
        <Button
          key={amount}
          type="button"
          variant={props.amount === amount ? "default" : activeVariant}
          className={props.amount === amount ? undefined : buttonClassName}
          onClick={() => props.onPresetAmount(amount)}
        >
          PHP {amount}
        </Button>
      ))}
    </div>
  )
}

function InfoChip({
  icon: Icon,
  children,
}: {
  icon: ComponentType<{ className?: string }>
  children: ReactNode
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/80 p-4 text-sm">
      <Icon className="mt-0.5 size-4 text-primary" />
      <span>{children}</span>
    </div>
  )
}

function SupportPanel({
  title,
  body,
}: {
  title: string
  body: string
}) {
  return (
    <div className="rounded-2xl bg-muted/30 p-5">
      <p className="text-sm font-medium uppercase tracking-[0.16em] text-primary">{title}</p>
      <p className="mt-3 text-sm leading-6">{body}</p>
    </div>
  )
}

function TintPanel({
  icon: Icon,
  title,
  body,
  className,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  body: string
  className?: string
}) {
  return (
    <div className={`rounded-3xl border p-5 shadow-sm ${className ?? ""}`}>
      <Icon className="size-5 text-primary" />
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 opacity-85">{body}</p>
    </div>
  )
}
