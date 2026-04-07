import type { ComponentType, ReactNode } from "react"
import { Link } from "react-router-dom"
import {
  Gem,
  HeartHandshake,
  Leaf,
  LockKeyhole,
  MoonStar,
  ShieldCheck,
  Sparkles,
  SunMedium,
  UserRoundCheck,
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
import type { LoginVariantProps } from "@/features/public/login/types"

export function LoginDesignVariant(props: LoginVariantProps) {
  if (props.variant === "youthful") return <YouthfulLoginVariant {...props} />
  if (props.variant === "institutional") return <InstitutionalLoginVariant {...props} />
  if (props.variant === "sanctuary") return <SanctuaryLoginVariant {...props} />
  if (props.variant === "beacon") return <BeaconLoginVariant {...props} />
  if (props.variant === "bloom") return <BloomLoginVariant {...props} />
  if (props.variant === "chronicle") return <ChronicleLoginVariant {...props} />
  if (props.variant === "radiant") return <RadiantLoginVariant {...props} />
  if (props.variant === "refuge") return <RefugeLoginVariant {...props} />

  return <MissionFirstLoginVariant {...props} />
}

function MissionFirstLoginVariant(props: LoginVariantProps) {
  return (
    <SplitLayout
      left={
        <Card className="border-primary/10 bg-[radial-gradient(circle_at_top_left,_rgba(143,94,83,0.14),_transparent_46%),linear-gradient(180deg,rgba(255,249,245,0.95),rgba(255,255,255,1))] shadow-lg">
          <CardContent className="space-y-6 px-8 py-10">
            <Badge className="bg-primary/90">Mission-first</Badge>
            <HeroHeading>Welcome back to a space built around care and continuity.</HeroHeading>
            <BodyText>
              Sign in to access donor history, resources, role-specific tools, or the next
              step in the support journey.
            </BodyText>
            <div className="space-y-3">
              {[
                "Supporter accounts can track giving and receipts.",
                "Role-based access keeps sensitive tools protected.",
                "Google sign-in remains available for convenience.",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-border/60 bg-background/80 p-4 text-sm leading-6">
                  {item}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      }
      right={
        <LoginFormCard
          heading="Log in"
          description="The gentle, trust-centered version emphasizes reassurance and clarity."
          props={props}
        />
      }
    />
  )
}

function YouthfulLoginVariant(props: LoginVariantProps) {
  return (
    <div className="px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <Card className="overflow-hidden border-0 bg-[linear-gradient(135deg,rgba(245,98,91,0.16),rgba(255,221,153,0.22),rgba(90,160,120,0.18))] shadow-xl">
          <CardContent className="grid gap-8 px-8 py-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5">
              <Badge className="bg-background text-foreground shadow-sm">Youthful</Badge>
              <HeroHeading>Sign in and keep building momentum with us.</HeroHeading>
              <BodyText className="text-foreground/80">
                This direction feels brighter and more encouraging while keeping the
                form simple, accessible, and trustworthy.
              </BodyText>
              <div className="grid gap-4 sm:grid-cols-2">
                <TintPanel icon={Sparkles} title="Warmer welcome" body="More energy in the layout without changing the auth rules." className="border-white/40 bg-white/85" />
                <TintPanel icon={UserRoundCheck} title="Clear path back in" body="Simple form flow with familiar support links and Google sign-in." className="border-white/40 bg-white/85" />
              </div>
            </div>
            <LoginFormCard
              heading="Sign in"
              description="The same login behavior presented with a more optimistic visual tone."
              props={props}
              elevated
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function InstitutionalLoginVariant(props: LoginVariantProps) {
  return (
    <SplitLayout
      left={
        <Card className="shadow-lg">
          <CardHeader className="gap-4">
            <Badge variant="outline" className="bg-muted w-fit">
              Institutional
            </Badge>
            <CardTitle className="text-4xl tracking-tight text-balance">
              Access secure tools, records, and role-based workflows with confidence.
            </CardTitle>
            <CardDescription className="max-w-3xl text-base leading-8">
              This direction uses a more formal and operational tone for users who
              expect strong structure and visible security cues.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <TintPanel icon={ShieldCheck} title="Protected by role-aware access" body="Sensitive areas stay restricted to the people authorized to use them." className="bg-muted/30" />
            <TintPanel icon={LockKeyhole} title="Focused on clarity" body="Strong hierarchy, minimal decoration, and a more formal trust posture." className="bg-muted/30" />
          </CardContent>
        </Card>
      }
      right={
        <LoginFormCard
          heading="Account access"
          description="Structured, formal framing for donors, staff, counselors, and admins."
          props={props}
        />
      }
    />
  )
}

function SanctuaryLoginVariant(props: LoginVariantProps) {
  return (
    <ThemedLoginShell
      backgroundClass="bg-[#FAF5EF] text-[#3D261A]"
      heroClass="border-[rgba(61,38,26,0.15)] bg-[#FFFBF7]"
      badgeClass="bg-[#C06A3A] text-[#FFFBF7]"
      variantLabel="Sanctuary"
      title="A warm editorial sign-in page that feels calm, personal, and reassuring."
      body="Sanctuary turns login into a softer re-entry moment with terracotta warmth and an intentionally human tone."
      panels={[
        [HeartHandshake, "Compassion-first framing", "The emotional tone is more welcoming while the auth behavior stays identical."],
        [Leaf, "Gentler trust cues", "Softer borders and warmer color reduce intimidation without removing clarity."],
      ]}
      formProps={props}
      formHeading="Welcome back"
      formDescription="Editorial warmth around the same login, error handling, and Google sign-in flow."
      formClassName="border-[rgba(61,38,26,0.15)] bg-[#FFFBF7]"
      bodyClass="text-[#5D463A]"
    />
  )
}

function BeaconLoginVariant(props: LoginVariantProps) {
  return (
    <ThemedLoginShell
      backgroundClass="bg-[#FAFAF5] text-[#1B1F3B]"
      heroClass="border-[rgba(27,31,59,0.15)] bg-[#1B1F3B] text-[#FAFAF5]"
      badgeClass="bg-[#E57356] text-white"
      variantLabel="Beacon"
      title="A bold geometric login flow designed for speed, structure, and confidence."
      body="Beacon pushes contrast harder so account access feels controlled, clear, and operationally mature."
      panels={[
        [ShieldCheck, "Security-forward tone", "High contrast and stronger geometry make the page read as deliberate and reliable."],
        [UserRoundCheck, "Fast orientation", "A clearer visual path from headline to fields to action."],
      ]}
      formProps={props}
      formHeading="Sign in securely"
      formDescription="A high-clarity interface layered over the same authentication behavior."
      formClassName="border-[rgba(27,31,59,0.15)] bg-white"
      bodyClass="text-[#E6E6DD]"
      panelClass="border-[rgba(250,250,245,0.15)] bg-white/8 text-[#FAFAF5]"
      primaryClass="bg-[#E57356] text-white"
      outlineClass="border-[rgba(27,31,59,0.15)] text-[#1B1F3B]"
    />
  )
}

function BloomLoginVariant(props: LoginVariantProps) {
  return (
    <ThemedLoginShell
      backgroundClass="bg-[#F3EFF8] text-[#4A2C5E]"
      heroClass="border-[rgba(74,44,94,0.14)] bg-white/80"
      badgeClass="bg-[#7A9E70] text-white"
      variantLabel="Bloom"
      title="A soft organic login screen that lowers tension and feels more personally welcoming."
      body="Bloom makes the sign-in experience quieter and gentler, useful when the app should feel emotionally safe from the first interaction."
      panels={[
        [Leaf, "Low-pressure entry", "The layout reduces visual pressure while keeping the same form fields and actions."],
        [HeartHandshake, "Supportive tone", "A calmer page for users who benefit from warmth and softness."],
      ]}
      formProps={props}
      formHeading="Sign in gently"
      formDescription="A more organic, less rigid frame around the same login and Google sign-in actions."
      formClassName="border-[rgba(74,44,94,0.14)] bg-white/85"
      bodyClass="text-[#6A5578]"
      panelClass="border-[rgba(74,44,94,0.14)] bg-[#F0DDD5]"
      primaryClass="bg-[#7A9E70] text-white"
      outlineClass="border-[rgba(74,44,94,0.14)] text-[#4A2C5E]"
    />
  )
}

function ChronicleLoginVariant(props: LoginVariantProps) {
  return (
    <ThemedLoginShell
      backgroundClass="bg-[#141414] text-[#FAF8F5]"
      heroClass="border-[rgba(184,151,90,0.18)] bg-[linear-gradient(180deg,rgba(20,20,20,1),rgba(30,24,22,1))]"
      badgeClass="bg-[#B8975A] text-[#141414]"
      variantLabel="Chronicle"
      title="A dark editorial login style with a premium, high-trust, magazine-like tone."
      body="Chronicle is best when sign-in should feel polished and high-value rather than neutral or purely utilitarian."
      panels={[
        [MoonStar, "Elevated contrast", "Dark presentation increases drama while still preserving readability and focus."],
        [Gem, "Premium impression", "The layout suggests serious stewardship and a higher-touch experience."],
      ]}
      formProps={props}
      formHeading="Access your account"
      formDescription="Dark premium styling without changing the auth behavior underneath."
      formClassName="border-[rgba(184,151,90,0.18)] bg-[#1C1C1C] text-[#FAF8F5]"
      bodyClass="text-[#D5CCC7]"
      panelClass="border-[rgba(184,151,90,0.18)] bg-white/5 text-[#FAF8F5]"
      primaryClass="bg-[#B8975A] text-[#141414]"
      outlineClass="border-[rgba(250,248,245,0.18)] text-[#FAF8F5]"
    />
  )
}

function RadiantLoginVariant(props: LoginVariantProps) {
  return (
    <ThemedLoginShell
      backgroundClass="bg-[#FFFBF0] text-[#1E1E1E]"
      heroClass="border-[rgba(13,110,114,0.14)] bg-[linear-gradient(135deg,rgba(13,110,114,0.12),rgba(242,199,68,0.16),rgba(255,251,240,1))]"
      badgeClass="bg-[#0D6E72] text-white"
      variantLabel="Radiant"
      title="A vibrant hopeful login page that feels energetic, clear, and optimistic."
      body="Radiant gives sign-in a brighter emotional temperature while keeping trust and usability intact."
      panels={[
        [SunMedium, "Visible momentum", "Color and spacing make re-entry feel lighter and more forward-moving."],
        [Sparkles, "Friendly clarity", "The action path reads quickly without becoming casual or noisy."],
      ]}
      formProps={props}
      formHeading="Sign in fast"
      formDescription="A brighter visual tone around the same login fields, redirects, and Google auth link."
      formClassName="border-[rgba(13,110,114,0.14)] bg-white"
      bodyClass="text-[#3F3F3F]"
      panelClass="border-[rgba(13,110,114,0.14)] bg-white"
      primaryClass="bg-[#0D6E72] text-white"
      outlineClass="border-[rgba(13,110,114,0.14)] text-[#0D6E72]"
    />
  )
}

function RefugeLoginVariant(props: LoginVariantProps) {
  return (
    <ThemedLoginShell
      backgroundClass="bg-[#FCFAF8] text-[#1C1917]"
      heroClass="border-[rgba(28,25,23,0.12)] bg-white"
      badgeClass="bg-[#C9A9A3] text-[#1C1917]"
      variantLabel="Refuge"
      title="A minimal refined login page that keeps attention on calm, focused account access."
      body="Refuge removes visual noise and relies on strong spacing, subtle warmth, and disciplined layout to build trust."
      panels={[
        [LockKeyhole, "Quiet confidence", "A stripped-back interface can feel more premium and less distracting."],
        [Gem, "Elegant restraint", "Useful when refinement matters more than visual energy."],
      ]}
      formProps={props}
      formHeading="Log in quietly"
      formDescription="A cleaner, more restrained frame around the same sign-in behavior."
      formClassName="border-[rgba(28,25,23,0.12)] bg-white"
      bodyClass="text-[#6F665E]"
      panelClass="border-[rgba(28,25,23,0.12)] bg-[#FCFAF8]"
      primaryClass="bg-[#C9A9A3] text-[#1C1917]"
      outlineClass="border-[rgba(28,25,23,0.12)] text-[#1C1917]"
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
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.02fr_0.98fr]">
        {left}
        {right}
      </div>
    </div>
  )
}

function ThemedLoginShell({
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
  bodyClass,
  panelClass,
  primaryClass,
  outlineClass,
}: {
  backgroundClass: string
  heroClass: string
  badgeClass: string
  variantLabel: string
  title: string
  body: string
  panels: [ComponentType<{ className?: string }>, string, string][]
  formProps: LoginVariantProps
  formHeading: string
  formDescription: string
  formClassName: string
  bodyClass?: string
  panelClass?: string
  primaryClass?: string
  outlineClass?: string
}) {
  return (
    <div className={`${backgroundClass} px-5 py-16 md:px-10 md:py-24`}>
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
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
              <Link to="/register">
                <Button variant="outline" className={outlineClass}>
                  Create account
                </Button>
              </Link>
              <Link to="/resources">
                <Button variant="ghost" className={bodyClass}>
                  Browse resources
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <LoginFormCard
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

function LoginFormCard({
  heading,
  description,
  props,
  elevated = false,
  className,
  primaryClassName,
  outlineClassName,
}: {
  heading: string
  description: string
  props: LoginVariantProps
  elevated?: boolean
  className?: string
  primaryClassName?: string
  outlineClassName?: string
}) {
  return (
    <Card className={`${elevated ? "bg-background/90 shadow-lg" : "shadow-lg"} ${className ?? ""}`}>
      <CardHeader>
        <CardTitle>{heading}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {props.error && (
          <div className="bg-destructive/10 text-destructive rounded-2xl border border-destructive/20 p-4 text-sm">
            {props.error}
          </div>
        )}

        <form onSubmit={props.onSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              required
              value={props.email}
              onChange={(event) => props.onEmailChange(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              type="password"
              required
              value={props.password}
              onChange={(event) => props.onPasswordChange(event.target.value)}
            />
          </div>

          <Button type="submit" size="lg" disabled={props.loading} className={`w-full ${primaryClassName ?? ""}`}>
            {props.loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="space-y-4 text-center">
          <a
            href="/api/auth/external-login?provider=Google"
            className={`text-sm font-medium underline underline-offset-4 ${outlineClassName ?? ""}`}
          >
            Sign in with Google
          </a>
          <Separator />
          <p className="text-muted-foreground text-sm">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-foreground underline underline-offset-4">
              Sign up
            </Link>
          </p>
        </div>
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
