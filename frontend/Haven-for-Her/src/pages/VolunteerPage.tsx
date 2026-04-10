import { Card, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button-variants'
import { cn } from '@/lib/utils'
import youngWomanSmiling from '@/assets/Young Woman Smiling.jpg'

export function VolunteerPage() {
  return (
    <div className="px-5 py-16 md:px-10 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="max-w-2xl">
            <p className="text-muted-foreground text-sm font-semibold tracking-[0.18em] uppercase">
              Volunteer and events
            </p>
            <h1 className="font-heading mt-3 text-balance text-[clamp(2.5rem,5vw,4rem)] font-semibold text-accent">
              There are many ways to show up with care.
            </h1>
            <p className="text-muted-foreground mt-4 leading-8 text-pretty">
              Review the current opportunities to contribute your time and skills. Find a role that matches your schedule and expertise below.
            </p>
          </div>
          <div className="hidden lg:flex lg:justify-end">
            <img
              src={youngWomanSmiling}
              alt="Smiling young woman"
              className="rounded-3xl object-cover aspect-[2/3] w-full max-w-[420px] shadow-xl border border-border/50 brightness-105 contrast-105"
            />
          </div>
        </div>

        <div className="mb-10 lg:mb-16">
          <div className="mb-6 flex items-center gap-3">
            <h2 className="font-heading text-3xl font-semibold text-accent">High Need Roles</h2>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">Priority</span>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <FeaturedOpportunityCard
              title="Safe Home Support"
              description="Assist with day-to-day operations at our safe homes: tutoring, meal preparation, and recreational activities. Your consistent presence brings stability."
            />
            <FeaturedOpportunityCard
              title="Mentorship Program"
              description="Mentor a survivor through education, career preparation, and personal development. Requires a formal background check and specialized training."
            />
          </div>
        </div>

        <div className="mb-12">
          <div className="mb-6">
            <h2 className="font-heading text-2xl font-semibold text-accent">Other ways to contribute</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <CompactOpportunityCard
              title="Community Events"
              description="Help organize fundraising events, awareness campaigns, and community outreach programs."
            />
            <CompactOpportunityCard
              title="Skills-Based"
              description="Contribute your professional skills: legal, medical, counseling, IT, or marketing."
            />
            <CompactOpportunityCard
              title="Online Advocacy"
              description="Help spread awareness through social media, content creation, and digital advocacy campaigns."
            />
            <CompactOpportunityCard
              title="Corporate Partners"
              description="Connect your organization with Haven for Her for sponsorship or employee volunteering."
            />
          </div>
        </div>

        <Card className="relative mt-16 overflow-hidden border-border/70 bg-card text-center shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
          <CardContent className="relative px-6 py-10 md:p-12">
            <h2 className="font-heading text-3xl font-semibold text-accent">
              Take the next step
            </h2>
            <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg leading-8 text-pretty">
              Send us a brief email introducing yourself. Please include the role you're interested in, your general availability, and any relevant background or skills. We respond to all inquiries within 2 business days.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-5 sm:flex-row">
              <a
                href="mailto:volunteer@havenforher.org?subject=Volunteer%20Inquiry%20-%20[Your%20Name]&body=Hi%20Haven%20for%20Her%20team,%0A%0AI'm%20interested%20in%20volunteering.%0A%0ARole%20of%20interest:%0AAvailability:%0ABackground/Skills:%0A%0AThank%20you!"
                className={cn(buttonVariants({ size: 'lg' }), 'inline-flex w-full no-underline shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] sm:w-auto')}
              >
                Email our volunteer team
              </a>
              <span className="text-muted-foreground text-sm font-medium">volunteer@havenforher.org</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function FeaturedOpportunityCard({ title, description }: { title: string; description: string }) {
  return (
    <Card className="group relative h-full overflow-hidden border-primary/20 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md">
      <div className="absolute inset-y-0 left-0 w-1.5 bg-primary/40 transition-colors duration-300 group-hover:bg-primary" />
      <CardContent className="p-6 pl-8 md:p-8 md:pl-10">
        <h3 className="font-heading text-2xl font-semibold text-accent transition-colors duration-300 group-hover:text-primary">{title}</h3>
        <p className="text-muted-foreground mt-3 text-lg leading-relaxed text-pretty">{description}</p>
      </CardContent>
    </Card>
  )
}

function CompactOpportunityCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="group rounded-xl border border-border/60 bg-card/40 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-border hover:bg-card hover:shadow-sm">
      <h3 className="font-semibold text-accent transition-colors duration-300 group-hover:text-primary">{title}</h3>
      <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{description}</p>
    </div>
  )
}
