export function VolunteerPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold">Volunteer & Events</h1>

      <p className="text-muted-foreground mb-8 max-w-2xl">
        Join our community of dedicated volunteers making a real difference in
        the lives of survivors. Whether you can give an hour or a lifetime,
        there's a place for you here.
      </p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card
          title="Mentorship Program"
          description="Mentor a survivor through education, career preparation, and personal development. Requires background check and training."
        />
        <Card
          title="Community Events"
          description="Help organize fundraising events, awareness campaigns, and community outreach programs throughout the Philippines."
        />
        <Card
          title="Skills-Based Volunteering"
          description="Contribute your professional skills — legal, medical, counseling, IT, marketing, or other expertise."
        />
        <Card
          title="Safe Home Support"
          description="Assist with day-to-day operations at our safe homes: tutoring, meal preparation, recreational activities."
        />
        <Card
          title="Online Advocacy"
          description="Help spread awareness through social media, content creation, and digital advocacy campaigns."
        />
        <Card
          title="Corporate Partnerships"
          description="Connect your organization with Haven for Her for sponsorship, employee volunteering, or in-kind support."
        />
      </div>

      <section className="mt-12 rounded-lg bg-muted/50 p-8 text-center">
        <h2 className="mb-2 text-xl font-semibold">
          Interested in volunteering?
        </h2>
        <p className="text-muted-foreground">
          Contact us to learn about upcoming opportunities and how to get
          involved. We'll match you with a program that fits your skills and
          availability.
        </p>
      </section>
    </div>
  )
}

function Card({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="bg-card border-border rounded-lg border p-6">
      <h3 className="mb-2 font-semibold">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  )
}
