import { Card, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button-variants'
import { cn } from '@/lib/utils'

export function VolunteerPage() {
  return (
    <div className="px-5 py-16 md:px-10 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 max-w-3xl">
          <p className="text-muted-foreground text-sm font-semibold tracking-[0.18em] uppercase">
            Volunteer and events
          </p>
          <h1 className="font-heading mt-3 text-balance text-[clamp(2.5rem,5vw,4rem)] font-semibold text-accent">
            There are many ways to show up with care.
          </h1>
          <p className="text-muted-foreground mt-4 max-w-2xl leading-8 text-pretty">
            Review the current opportunities to contribute your time and skills. Find a role that matches your schedule and expertise below.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <OpportunityCard
            title="Mentorship Program"
            description="Mentor a survivor through education, career preparation, and personal development. Requires background check and training."
          />
          <OpportunityCard
            title="Community Events"
            description="Help organize fundraising events, awareness campaigns, and community outreach programs throughout the Philippines."
          />
          <OpportunityCard
            title="Skills-Based Volunteering"
            description="Contribute your professional skills: legal, medical, counseling, IT, marketing, or other expertise."
          />
          <OpportunityCard
            title="Safe Home Support"
            description="Assist with day-to-day operations at our safe homes: tutoring, meal preparation, and recreational activities."
          />
          <OpportunityCard
            title="Online Advocacy"
            description="Help spread awareness through social media, content creation, and digital advocacy campaigns."
          />
          <OpportunityCard
            title="Corporate Partnerships"
            description="Connect your organization with Haven for Her for sponsorship, employee volunteering, or in-kind support."
          />
        </div>

        <Card className="mt-12 border-primary/18 bg-primary/7 text-center">
          <CardContent className="p-8">
            <h2 className="font-heading text-2xl font-semibold text-accent">
              Interested in volunteering?
            </h2>
            <p className="text-muted-foreground mx-auto mt-3 max-w-2xl leading-7 text-pretty">
              Contact us to learn about upcoming opportunities and how to get
              involved. We&apos;ll match you with a program that fits your skills
              and availability.
            </p>
            <a
              href="mailto:volunteer@havenforher.org"
              className={cn(buttonVariants(), 'mt-5 inline-flex no-underline')}
            >
              Get in touch
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function OpportunityCard({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <Card className="h-full border-border/70 bg-card/95">
      <CardContent className="p-6">
        <h3 className="font-heading text-2xl font-semibold text-accent">{title}</h3>
        <p className="text-muted-foreground mt-3 text-sm leading-6">{description}</p>
      </CardContent>
    </Card>
  )
}
