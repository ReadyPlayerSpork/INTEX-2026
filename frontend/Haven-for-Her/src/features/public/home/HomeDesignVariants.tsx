import type { ComponentType, ReactNode } from "react"
import { Link } from "react-router-dom"
import {
  ArrowRight,
  Gem,
  HeartHandshake,
  Landmark,
  Leaf,
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
import { Separator } from "@/components/ui/separator"
import type { HomeVariantProps } from "@/features/public/home/types"

export function HomeDesignVariant({ variant, stats, isLoading }: HomeVariantProps) {
  if (variant === "youthful") return <YouthfulHomeVariant stats={stats} isLoading={isLoading} />
  if (variant === "institutional") return <InstitutionalHomeVariant stats={stats} isLoading={isLoading} />
  if (variant === "sanctuary") return <SanctuaryHomeVariant stats={stats} isLoading={isLoading} />
  if (variant === "beacon") return <BeaconHomeVariant stats={stats} isLoading={isLoading} />
  if (variant === "bloom") return <BloomHomeVariant stats={stats} isLoading={isLoading} />
  if (variant === "chronicle") return <ChronicleHomeVariant stats={stats} isLoading={isLoading} />
  if (variant === "radiant") return <RadiantHomeVariant stats={stats} isLoading={isLoading} />
  if (variant === "refuge") return <RefugeHomeVariant stats={stats} isLoading={isLoading} />

  return <MissionFirstHomeVariant stats={stats} isLoading={isLoading} />
}

function MissionFirstHomeVariant({
  stats,
  isLoading,
}: Omit<HomeVariantProps, "variant">) {
  return (
    <div className="space-y-14">
      <section className="overflow-hidden px-4 pt-10">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="border-primary/10 bg-[radial-gradient(circle_at_top_left,_rgba(143,94,83,0.14),_transparent_46%),linear-gradient(180deg,rgba(255,249,245,0.95),rgba(255,255,255,1))] shadow-lg">
            <CardContent className="space-y-6 px-8 py-10 sm:px-10 sm:py-12">
              <Badge className="bg-primary/90">Mission-first</Badge>
              <div className="space-y-5">
                <h2 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                  Safe homes, steady care, and a future rebuilt with dignity.
                </h2>
                <p className="text-muted-foreground max-w-2xl text-lg leading-8">
                  Haven for Her supports girls who have survived abuse and trafficking
                  through trauma-informed housing, counseling, education, and
                  long-term care in the Philippines.
                </p>
              </div>
              <ActionRow />
            </CardContent>
          </Card>

          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <HeartHandshake className="size-5 text-primary" />
                What support looks like
              </CardTitle>
              <CardDescription>
                Care is designed to restore safety first, then rebuild stability and hope.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                "24/7 safe home placement and staff support",
                "Trauma-informed counseling and process recording",
                "Education, health, and reintegration planning",
                "Trusted partners and long-term community support",
              ].map((item) => (
                <FeatureCard key={item}>{item}</FeatureCard>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="px-4">
        <SectionHeader
          eyebrow="Public impact snapshot"
          title="Measured outcomes, not vague promises"
          cta={<LinkButton to="/impact" variant="ghost">View more metrics</LinkButton>}
        />
        <ImpactGrid stats={stats} isLoading={isLoading} />
      </section>

      <section className="px-4 pb-6">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <Card className="bg-primary text-primary-foreground shadow-lg">
            <CardContent className="space-y-4 px-8 py-8">
              <p className="text-sm uppercase tracking-[0.24em] text-primary-foreground/80">
                Why donors stay
              </p>
              <p className="text-2xl font-semibold leading-9">
                Clear care pathways, real follow-through, and evidence that every gift
                moves a girl toward safety and stability.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="grid gap-6 px-8 py-8 sm:grid-cols-2">
              <InfoBlock
                title="Trauma-sensitive support"
                body="Messaging and care pathways are designed to communicate safety, not spectacle."
              />
              <InfoBlock
                title="Long-term accountability"
                body="We track residents served, safe home capacity, donor impact, and partner engagement to guide action."
              />
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

function YouthfulHomeVariant({
  stats,
  isLoading,
}: Omit<HomeVariantProps, "variant">) {
  return (
    <div className="space-y-14">
      <section className="px-4 pt-10">
        <div className="mx-auto max-w-7xl">
          <Card className="overflow-hidden border-0 bg-[linear-gradient(135deg,rgba(245,98,91,0.16),rgba(255,221,153,0.22),rgba(90,160,120,0.18))] shadow-xl">
            <CardContent className="grid gap-8 px-8 py-10 sm:px-10 sm:py-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <div className="space-y-6">
                <Badge className="bg-background text-foreground shadow-sm">Youthful</Badge>
                <div className="space-y-4">
                  <HeroHeading>A safer next chapter starts with one courageous step.</HeroHeading>
                  <BodyText className="max-w-2xl text-foreground/80">
                    We create safe homes where survivors can breathe, heal, study, and
                    move toward a future that feels possible again.
                  </BodyText>
                </div>
                <ActionRow />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  [Sparkles, "Hope made visible", "Warm, reassuring support with room for growth and recovery."],
                  [HeartHandshake, "Human-centered care", "Counseling, housing, and reintegration designed around real needs."],
                  [Landmark, "Structured support", "A stable system behind every step of care and follow-up."],
                  [ArrowRight, "Action-oriented giving", "Simple next steps for donors, volunteers, and community partners."],
                ].map(([Icon, title, body]) => (
                  <div
                    key={title as string}
                    className="rounded-3xl border border-white/40 bg-white/80 p-5 shadow-sm backdrop-blur"
                  >
                    <Icon className="size-5 text-primary" />
                    <h3 className="mt-4 text-base font-semibold">{title as string}</h3>
                    <p className="text-muted-foreground mt-2 text-sm leading-6">{body as string}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="px-4">
        <SectionHeader
          eyebrow="Snapshot"
          title="A brighter visual language, backed by real numbers"
          cta={<Badge variant="outline">Public data</Badge>}
        />
        <ImpactGrid stats={stats} isLoading={isLoading} highlight />
      </section>

      <section className="px-4 pb-6">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
          <TintCard color="bg-amber-50" title="Care with warmth" body="The tone stays optimistic without making the mission feel light or casual." />
          <TintCard color="bg-rose-50" title="Clear action paths" body="Donation, volunteering, and resources stay visible from the first screen." />
          <TintCard color="bg-emerald-50" title="Hope, not hype" body="Energy comes from color, hierarchy, and movement rather than gimmicks." />
        </div>
      </section>
    </div>
  )
}

function InstitutionalHomeVariant({
  stats,
  isLoading,
}: Omit<HomeVariantProps, "variant">) {
  return (
    <div className="space-y-14">
      <section className="px-4 pt-10">
        <div className="mx-auto max-w-7xl">
          <Card className="rounded-[2rem] border-border/90 shadow-lg">
            <CardContent className="grid gap-10 px-8 py-10 sm:px-10 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-6">
                <Badge variant="outline" className="bg-muted">
                  Institutional
                </Badge>
                <div className="space-y-4">
                  <HeroHeading>Structured care, operational accountability, and measurable impact.</HeroHeading>
                  <BodyText className="max-w-2xl">
                    Haven for Her operates safe homes and coordinated survivor support
                    programs with a focus on governance, continuity of care, and transparent reporting.
                  </BodyText>
                </div>
                <div className="flex flex-wrap gap-3">
                  <LinkButton to="/impact">Review impact data</LinkButton>
                  <LinkButton to="/donate" variant="outline">Fund the work</LinkButton>
                </div>
              </div>

              <Card className="rounded-[1.75rem] border-border/80 bg-muted/30 shadow-none">
                <CardHeader>
                  <CardTitle className="text-lg">Program priorities</CardTitle>
                  <CardDescription>
                    Core operating areas presented with a more formal, report-forward tone.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    "Resident safety and stable housing capacity",
                    "Counseling and intervention plan continuity",
                    "Education and wellbeing tracking",
                    "Donor stewardship and public impact reporting",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3 border-t border-border/60 pt-4 first:border-t-0 first:pt-0">
                      <div className="mt-1 size-2 rounded-full bg-primary" />
                      <p className="text-sm leading-6">{item}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="px-4">
        <SectionHeader
          eyebrow="Reported outcomes"
          title="Public-facing data with a more formal presentation layer"
          cta={<LinkButton to="/privacy" variant="ghost">Privacy and accountability</LinkButton>}
        />
        <ImpactGrid stats={stats} isLoading={isLoading} compact />
      </section>

      <section className="px-4 pb-6">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
          <Card>
            <CardHeader><CardTitle className="text-lg">Why this style works</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p>It emphasizes governance, clarity, and program continuity for donors who want evidence of serious operations.</p>
              <p>The tone is intentionally restrained while remaining human and accessible.</p>
            </CardContent>
          </Card>
          <Separator orientation="vertical" className="hidden lg:block" />
          <Card className="bg-muted/30">
            <CardHeader><CardTitle className="text-lg">Best-fit audience</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p>Institutional donors, board members, formal partners, and detail-oriented supporters.</p>
              <p>Strong choice when trust depends on structure, process, and visible accountability.</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

function SanctuaryHomeVariant({
  stats,
  isLoading,
}: Omit<HomeVariantProps, "variant">) {
  return (
    <div className="bg-[#FAF5EF] text-[#3D261A]">
      <section className="px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="border-[rgba(61,38,26,0.15)] bg-[#FFFBF7] shadow-xl">
            <CardContent className="space-y-6 p-8 md:p-10">
              <Badge className="bg-[#C06A3A] text-[#FFFBF7]">Sanctuary</Badge>
              <HeroHeading className="font-serif text-[#3D261A]">
                A warm editorial invitation into care, safety, and restoration.
              </HeroHeading>
              <BodyText className="max-w-2xl text-[#5D463A]">
                Sanctuary leans into warmth, texture, and compassionate rhythm. It feels
                like a mission letter that still leads clearly to action.
              </BodyText>
              <ActionRow
                primaryClass="bg-[#C06A3A] text-[#FFFBF7] hover:scale-[1.02] hover:opacity-90"
                secondaryClass="border-[rgba(61,38,26,0.15)] text-[#3D261A] hover:opacity-90"
              />
            </CardContent>
          </Card>
          <Card className="border-[rgba(61,38,26,0.15)] bg-[#FFFBF7] shadow-lg">
            <CardHeader>
              <CardTitle className="font-serif text-[#3D261A]">Steady, human-centered support</CardTitle>
              <CardDescription className="text-[#6C584E]">
                Editorial warmth paired with practical trust cues.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                "Safe housing with daily stability and protection",
                "Counseling and reintegration care tailored to each survivor",
                "A visual tone that feels compassionate rather than transactional",
              ].map((item) => (
                <FeatureCard key={item} className="border-[rgba(61,38,26,0.12)] bg-[#FAF5EF] text-[#4A3225]">
                  {item}
                </FeatureCard>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
      <section className="px-5 py-16 md:px-10 md:py-24">
        <SectionHeader eyebrow="Impact" title="Visible outcomes with an editorial sense of trust" />
        <ImpactGrid stats={stats} isLoading={isLoading} cardClassName="border-[rgba(61,38,26,0.12)] bg-[#FFFBF7]" />
      </section>
    </div>
  )
}

function BeaconHomeVariant({
  stats,
  isLoading,
}: Omit<HomeVariantProps, "variant">) {
  return (
    <div className="bg-[#FAFAF5] text-[#1B1F3B]">
      <section className="px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-7xl">
          <Card className="overflow-hidden border-[rgba(27,31,59,0.14)] bg-[#1B1F3B] text-[#FAFAF5] shadow-2xl">
            <CardContent className="grid gap-8 p-8 md:p-12 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-6">
                <Badge className="bg-[#E57356] text-white">Beacon</Badge>
                <HeroHeading className="text-balance font-sans text-[clamp(2.5rem,5vw,4.5rem)] tracking-tight text-white">
                  Bold geometry, high clarity, and a direct path to action.
                </HeroHeading>
                <BodyText className="max-w-2xl text-[#E6E6DD]">
                  Beacon uses stronger structure, sharper contrast, and brighter call-to-action energy
                  for visitors who respond well to confidence and momentum.
                </BodyText>
                <ActionRow
                  primaryClass="bg-[#E57356] text-white hover:scale-[1.02]"
                  secondaryClass="border-[rgba(250,250,245,0.2)] bg-transparent text-white hover:opacity-90"
                  ghostClass="text-[#D4A853] hover:bg-white/10"
                />
              </div>
              <div className="grid gap-4">
                <TintPanel icon={ShieldCheck} title="Trust with backbone" body="High-contrast sections make important information instantly scannable." className="border-[rgba(250,250,245,0.16)] bg-white/6 text-white" />
                <TintPanel icon={Landmark} title="Structured public story" body="Strong blocks, fast hierarchy, and clear next steps for donating and learning more." className="border-[rgba(250,250,245,0.16)] bg-white/6 text-white" />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      <section className="px-5 py-16 md:px-10 md:py-24">
        <SectionHeader eyebrow="Performance" title="A more geometric, conversion-aware impact view" />
        <ImpactGrid stats={stats} isLoading={isLoading} cardClassName="border-[rgba(27,31,59,0.12)] bg-white" />
      </section>
    </div>
  )
}

function BloomHomeVariant({
  stats,
  isLoading,
}: Omit<HomeVariantProps, "variant">) {
  return (
    <div className="bg-[#F3EFF8] text-[#4A2C5E]">
      <section className="px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-[rgba(74,44,94,0.14)] bg-white/80 shadow-lg">
            <CardContent className="space-y-6 p-8 md:p-10">
              <Badge className="bg-[#7A9E70] text-white">Bloom</Badge>
              <HeroHeading className="font-serif text-[#4A2C5E]">
                Soft organic forms, a gentler voice, and a sense of calm renewal.
              </HeroHeading>
              <BodyText className="max-w-2xl text-[#6A5578]">
                Bloom is intimate and restorative. It reduces visual pressure and gives the
                mission room to feel personal without becoming visually fragile.
              </BodyText>
              <ActionRow
                primaryClass="bg-[#7A9E70] text-white hover:scale-[1.02]"
                secondaryClass="border-[rgba(74,44,94,0.14)] text-[#4A2C5E]"
              />
            </CardContent>
          </Card>
          <div className="grid gap-4">
            <TintPanel icon={Leaf} title="Gentle, not vague" body="Rounded shapes and soft color blocks still preserve hierarchy and trust." className="border-[rgba(74,44,94,0.14)] bg-[#F0DDD5]" />
            <TintPanel icon={HeartHandshake} title="Care-first message" body="The visual language prioritizes emotional safety while keeping strong calls to action." className="border-[rgba(74,44,94,0.14)] bg-white/75" />
          </div>
        </div>
      </section>
      <section className="px-5 py-16 md:px-10 md:py-24">
        <SectionHeader eyebrow="Measured care" title="Soft presentation with the same real-world outcomes" />
        <ImpactGrid stats={stats} isLoading={isLoading} cardClassName="border-[rgba(74,44,94,0.14)] bg-white/85" />
      </section>
    </div>
  )
}

function ChronicleHomeVariant({
  stats,
  isLoading,
}: Omit<HomeVariantProps, "variant">) {
  return (
    <div className="bg-[#141414] text-[#FAF8F5]">
      <section className="px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-7xl space-y-8">
          <Card className="border-[rgba(184,151,90,0.18)] bg-[linear-gradient(180deg,rgba(20,20,20,1),rgba(30,24,22,1))] shadow-2xl">
            <CardContent className="grid gap-10 p-8 md:p-12 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-6">
                <Badge className="bg-[#B8975A] text-[#141414]">Chronicle</Badge>
                <HeroHeading className="font-serif text-white">
                  A premium dark editorial direction with stronger drama and gravity.
                </HeroHeading>
                <BodyText className="max-w-2xl text-[#D5CCC7]">
                  Chronicle frames the mission like a feature story: serious, composed,
                  and visually rich enough to feel high-value without becoming flashy.
                </BodyText>
                <ActionRow
                  primaryClass="bg-[#B8975A] text-[#141414] hover:scale-[1.02]"
                  secondaryClass="border-[rgba(250,248,245,0.16)] bg-transparent text-white hover:opacity-90"
                  ghostClass="text-[#C4A098] hover:bg-white/8"
                />
              </div>
              <div className="grid gap-4">
                <TintPanel icon={MoonStar} title="Magazine-like focus" body="Dark surfaces increase contrast and make the story feel weightier." className="border-[rgba(184,151,90,0.18)] bg-white/5 text-white" />
                <TintPanel icon={Gem} title="Premium donor feel" body="This version is strongest when the goal is cultivated trust and elevated presentation." className="border-[rgba(184,151,90,0.18)] bg-white/5 text-white" />
              </div>
            </CardContent>
          </Card>
          <ImpactGrid stats={stats} isLoading={isLoading} cardClassName="border-[rgba(184,151,90,0.14)] bg-[#1C1C1C] text-[#FAF8F5]" valueClassName="text-[#B8975A]" labelClassName="text-[#D5CCC7]" />
        </div>
      </section>
    </div>
  )
}

function RadiantHomeVariant({
  stats,
  isLoading,
}: Omit<HomeVariantProps, "variant">) {
  return (
    <div className="bg-[#FFFBF0] text-[#1E1E1E]">
      <section className="px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.12fr_0.88fr]">
          <Card className="overflow-hidden border-[rgba(13,110,114,0.14)] bg-[linear-gradient(135deg,rgba(13,110,114,0.12),rgba(242,199,68,0.16),rgba(255,251,240,1))] shadow-xl">
            <CardContent className="space-y-6 p-8 md:p-10">
              <Badge className="bg-[#0D6E72] text-white">Radiant</Badge>
              <HeroHeading className="text-[#1E1E1E]">
                Vibrant optimism with enough structure to keep every action clear.
              </HeroHeading>
              <BodyText className="max-w-2xl text-[#3F3F3F]">
                Radiant is for a hopeful first impression: brighter, more active, and
                highly usable without softening the seriousness of the cause.
              </BodyText>
              <ActionRow
                primaryClass="bg-[#0D6E72] text-white hover:scale-[1.02]"
                secondaryClass="border-[rgba(13,110,114,0.14)] text-[#0D6E72]"
                ghostClass="text-[#1E1E1E]"
              />
            </CardContent>
          </Card>
          <div className="grid gap-4 sm:grid-cols-2">
            <TintPanel icon={SunMedium} title="Hopeful by design" body="Sunshine accents bring energy without making the interface loud." className="border-[rgba(13,110,114,0.14)] bg-white" />
            <TintPanel icon={Sparkles} title="High-clarity actions" body="The CTA system is obvious, fast, and visually affirmative." className="border-[rgba(13,110,114,0.14)] bg-[#F2C744]/15" />
          </div>
        </div>
      </section>
      <section className="px-5 py-16 md:px-10 md:py-24">
        <SectionHeader eyebrow="Visibility" title="Bright enough to feel alive, grounded enough to remain trusted" />
        <ImpactGrid stats={stats} isLoading={isLoading} cardClassName="border-[rgba(13,110,114,0.14)] bg-white" valueClassName="text-[#0D6E72]" />
      </section>
    </div>
  )
}

function RefugeHomeVariant({
  stats,
  isLoading,
}: Omit<HomeVariantProps, "variant">) {
  return (
    <div className="bg-[#FCFAF8] text-[#1C1917]">
      <section className="px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_1fr]">
          <Card className="border-[rgba(28,25,23,0.12)] bg-white shadow-lg">
            <CardContent className="space-y-6 p-8 md:p-10">
              <Badge className="bg-[#C9A9A3] text-[#1C1917]">Refuge</Badge>
              <HeroHeading className="text-[#1C1917]">
                Minimal, refined, and intentionally quiet without feeling empty.
              </HeroHeading>
              <BodyText className="max-w-2xl text-[#6F665E]">
                Refuge trims away almost everything decorative so the mission, the text,
                and the calls to action do the work with confidence.
              </BodyText>
              <ActionRow
                primaryClass="bg-[#C9A9A3] text-[#1C1917] hover:scale-[1.02]"
                secondaryClass="border-[rgba(28,25,23,0.12)] text-[#1C1917]"
                ghostClass="text-[#6F665E]"
              />
            </CardContent>
          </Card>
          <Card className="border-[rgba(28,25,23,0.12)] bg-[#FCFAF8] shadow-none">
            <CardContent className="grid gap-4 p-8 md:p-10">
              <InfoBlock title="Refined spacing" body="Large margins and restrained color give this theme a calmer, more premium cadence." />
              <InfoBlock title="Softened trust cues" body="Dusty rose and warm stone replace louder accent systems with something gentler." />
              <InfoBlock title="Strong for clarity" body="Useful when the goal is elegance, focus, and a low-noise reading experience." />
            </CardContent>
          </Card>
        </div>
      </section>
      <section className="px-5 py-16 md:px-10 md:py-24">
        <SectionHeader eyebrow="Evidence" title="Minimal presentation, unchanged metrics" />
        <ImpactGrid stats={stats} isLoading={isLoading} cardClassName="border-[rgba(28,25,23,0.12)] bg-white" valueClassName="text-[#1C1917]" labelClassName="text-[#A69E94]" />
      </section>
    </div>
  )
}

function SectionHeader({
  eyebrow,
  title,
  cta,
}: {
  eyebrow: string
  title: string
  cta?: ReactNode
}) {
  return (
    <div className="mx-auto mb-6 flex max-w-7xl flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
        <h3 className="text-2xl font-semibold tracking-tight text-balance">{title}</h3>
      </div>
      {cta}
    </div>
  )
}

function HeroHeading({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <h2 className={`max-w-4xl text-[clamp(2.5rem,5vw,4.5rem)] font-semibold tracking-tight text-balance ${className ?? ""}`}>
      {children}
    </h2>
  )
}

function BodyText({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <p className={`text-pretty text-lg leading-8 text-muted-foreground ${className ?? ""}`}>
      {children}
    </p>
  )
}

function ActionRow({
  primaryClass,
  secondaryClass,
  ghostClass,
}: {
  primaryClass?: string
  secondaryClass?: string
  ghostClass?: string
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <Link to="/donate">
        <Button size="lg" className={primaryClass}>
          Support a safe home
          <ArrowRight className="size-4" />
        </Button>
      </Link>
      <Link to="/volunteer">
        <Button variant="outline" size="lg" className={secondaryClass}>
          Volunteer
        </Button>
      </Link>
      <Link to="/impact">
        <Button variant="ghost" size="lg" className={ghostClass}>
          See our impact
        </Button>
      </Link>
    </div>
  )
}

function LinkButton({
  to,
  children,
  variant = "default",
}: {
  to: string
  children: ReactNode
  variant?: "default" | "outline" | "ghost"
}) {
  return (
    <Link to={to}>
      <Button variant={variant}>{children}</Button>
    </Link>
  )
}

function FeatureCard({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`rounded-2xl border border-border/70 bg-background/80 p-4 text-sm leading-6 ${className ?? ""}`}>
      {children}
    </div>
  )
}

function TintCard({
  color,
  title,
  body,
}: {
  color: string
  title: string
  body: string
}) {
  return (
    <Card className={color}>
      <CardContent className="px-6 py-6">
        <h4 className="font-semibold">{title}</h4>
        <p className="text-muted-foreground mt-2 text-sm leading-6">{body}</p>
      </CardContent>
    </Card>
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

function InfoBlock({
  title,
  body,
}: {
  title: string
  body: string
}) {
  return (
    <div>
      <h4 className="text-lg font-semibold">{title}</h4>
      <p className="text-muted-foreground mt-2 text-sm leading-6">{body}</p>
    </div>
  )
}

function ImpactGrid({
  stats,
  isLoading,
  highlight = false,
  compact = false,
  cardClassName,
  valueClassName,
  labelClassName,
}: {
  stats: HomeVariantProps["stats"]
  isLoading: boolean
  highlight?: boolean
  compact?: boolean
  cardClassName?: string
  valueClassName?: string
  labelClassName?: string
}) {
  const items = stats
    ? [
        ["Residents served", stats.totalResidentsServed.toLocaleString()],
        ["Active residents", stats.activeResidents.toLocaleString()],
        ["Total donations", stats.totalDonations.toLocaleString()],
        ["Total donated (PHP)", stats.totalDonationValuePhp.toLocaleString()],
        ["Safe homes", stats.activeSafehouses.toLocaleString()],
        ["Partners", stats.activePartners.toLocaleString()],
      ]
    : []

  if (isLoading && !stats) {
    return (
      <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-card h-28 animate-pulse rounded-3xl border border-border/60" />
        ))}
      </div>
    )
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(([label, value]) => (
        <Card
          key={label}
          className={[
            compact ? "rounded-2xl shadow-none" : highlight ? "rounded-3xl bg-card/95 shadow-md" : "rounded-3xl",
            cardClassName,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <CardContent className="space-y-2 px-6 py-6">
            <p className={`text-primary text-3xl font-semibold ${valueClassName ?? ""}`}>{value}</p>
            <p className={`text-muted-foreground text-sm ${labelClassName ?? ""}`}>{label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
