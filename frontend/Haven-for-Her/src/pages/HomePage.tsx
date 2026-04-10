import { useState } from 'react'
import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button-variants'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useImpactStats } from '@/features/public/home/useImpactStats'
import { formatAnonymizedCount } from '@/features/public/home/anonymizedCounts'
import logoWordmarkUrl from '@/assets/LogoHavenForHerTransparentBackground.svg'
import womanInGreenField from '@/assets/Woman in Green Field.jpg'
import { motion, type Variants } from 'framer-motion'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { AnimatedCounter } from '@/components/ui/animated-counter'

export function HomePage() {
  const { stats } = useImpactStats()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const headingText = "A softer, safer path forward for girls rebuilding their lives."
  const words = headingText.split(" ")

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.1 },
    },
  }

  const child: Variants = {
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { type: 'spring', damping: 20, stiffness: 100 },
    },
    hidden: {
      opacity: 0,
      y: 15,
      filter: 'blur(4px)',
    },
  }

  return (
    <div className="space-y-20 pb-10 pt-6 sm:pt-8 min-h-screen">
      <section className="px-5 pt-6 pb-16 md:px-10 md:pt-10 md:pb-24">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <img
              src={logoWordmarkUrl}
              alt="Haven for Her"
              width={440}
              height={170}
              decoding="async"
              fetchPriority="high"
              className="mx-auto mb-2 w-full max-w-[min(100%,18rem)] object-contain sm:mb-2.5 sm:max-w-sm md:mx-0 md:mb-3 md:max-w-md lg:max-w-lg xl:max-w-xl"
            />
            <div className="flex flex-col gap-6">
              <p className="text-muted-foreground text-sm font-semibold tracking-[0.18em] uppercase">
                Safe homes. Steady care. Long-term hope.
              </p>
              <motion.h1
                variants={container}
                initial="hidden"
                animate="visible"
                className="font-heading text-balance text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.02] font-semibold text-accent"
              >
                {words.map((word, index) => (
                  <motion.span variants={child} key={index} className="inline-block mr-[0.25em] last:mr-0">
                    {word}
                  </motion.span>
                ))}
              </motion.h1>
              <p className="text-muted-foreground max-w-2xl text-lg leading-8 text-pretty">
                Haven for Her is a community of care dedicated to survivors of sexual abuse and trafficking. We provide the stability and resources needed for residents to rebuild their lives.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/donate"
                  className={cn(buttonVariants({ size: 'lg' }), 'no-underline')}
                >
                  Give with care
                </Link>
                <Link
                  to="/volunteer"
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'lg' }),
                    'no-underline',
                  )}
                >
                  Volunteer
                </Link>
                <Link
                  to="/impact"
                  className={cn(
                    buttonVariants({ variant: 'ghost', size: 'lg' }),
                    'no-underline',
                  )}
                >
                  See our impact
                </Link>
              </div>
            </div>
          </div>

          <ScrollReveal direction="right" delay={0.3}>
            <Card className="overflow-hidden border-border/70 bg-[linear-gradient(160deg,rgba(255,251,247,0.96),rgba(240,221,213,0.72),rgba(243,239,248,0.92))]">
              <CardContent className="grid gap-5 p-8">
                <div className="rounded-2xl border border-border/60 bg-card/90 p-5">
                  <p className="text-muted-foreground text-sm">What care looks like</p>
                  <p className="mt-3 font-heading text-3xl font-semibold text-accent">
                    Dignity first
                  </p>
                  <p className="text-muted-foreground mt-3 text-sm leading-6 text-pretty">
                    Stable shelter, trusted adults, counseling access, education,
                    and reintegration planning built around each resident's pace.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border/60 bg-card/85 p-5">
                    <p className="font-heading text-primary text-3xl font-semibold">
                      {stats ? (
                        <AnimatedCounter
                          value={stats.activeResidents}
                          format={(n) => formatAnonymizedCount(Math.round(n))}
                        />
                      ) : '...'}
                    </p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      girls currently supported
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-card/85 p-5">
                    <p className="font-heading text-primary text-3xl font-semibold">
                      {stats ? (
                        <AnimatedCounter value={stats.activeSafehouses} />
                      ) : '...'}
                    </p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      active safe homes
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </section>

      {stats && (
        <section className="px-5 py-16 md:px-10 md:py-24">
          <div className="mx-auto max-w-7xl">
            <ScrollReveal>
              <div className="mb-10">
                <h2 className="font-heading text-3xl font-semibold text-accent md:text-4xl">
                  Our impact, held with care
                </h2>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.15}>
              <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-16">
                <div className="flex-1 space-y-8">
                  <p className="font-heading text-xl leading-relaxed sm:text-2xl sm:leading-relaxed text-muted-foreground text-pretty">
                    We have served <strong className="text-primary font-bold"><AnimatedCounter value={stats.totalResidentsServed} /></strong> survivors on their journey to healing, with <strong className="text-primary font-bold"><AnimatedCounter value={stats.activeResidents} format={(n) => formatAnonymizedCount(Math.round(n))} /></strong> girls currently residing across our <strong className="text-primary font-bold"><AnimatedCounter value={stats.activeSafehouses} /></strong> active safe homes.
                  </p>
                  <div className="h-px w-24 bg-border/80"></div>
                  <p className="text-lg leading-8 text-muted-foreground text-pretty">
                    Because of our <strong className="text-primary font-bold"><AnimatedCounter value={stats.activePartners} /></strong> active organizational partners and countless individual volunteers, we are able to provide practical support, safer conditions, and ensure our community shows up consistently for those who need it most.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      <section className="px-5 py-12 md:px-10 md:py-20" aria-label="Mission and ways to help">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center lg:gap-16">
          <ScrollReveal direction="left">
            <img
              src={womanInGreenField}
              alt="Woman standing peacefully in a green field"
              className="rounded-3xl object-cover aspect-[4/3] md:aspect-square lg:aspect-[4/5] w-full shadow-xl border border-border/50 brightness-[1.02] contrast-105"
            />
          </ScrollReveal>
          <div className="flex flex-col gap-8 lg:gap-10">
            <ScrollReveal direction="right" delay={0.1}>
              <Card className="bg-card/95">
                <CardContent className="flex flex-col justify-between p-6 md:p-10">
                  <div>
                    <h2 className="font-heading text-3xl font-semibold text-accent">
                      Our mission
                    </h2>
                    <p className="text-muted-foreground mt-4 leading-8 text-pretty">
                      We provide the environment and resources necessary for survivors to regain their autonomy and secure a sustainable future.
                    </p>
                  </div>
                  <Link
                    to="/impact"
                    className={cn(
                      buttonVariants({ variant: 'outline', size: 'lg' }),
                      'mt-6 w-fit no-underline',
                    )}
                  >
                    See our impact
                  </Link>
                </CardContent>
              </Card>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.25}>
              <Card className="border-primary/20 bg-primary/7">
                <CardContent className="p-6 md:p-10">
                  <h2 className="font-heading text-3xl font-semibold text-accent">
                    How you can help
                  </h2>
              <div className="mt-5 grid gap-4 md:grid-cols-3" onMouseLeave={() => setHoveredIndex(null)}>
                {[
                  { to: "/donate", title: "Give", desc: "Fund meals, counseling sessions, and day-to-day care." },
                  { to: "/volunteer", title: "Volunteer", desc: "Share time, practical support, or professional skills." },
                  { to: "/impact", title: "Advocate", desc: "Help more families discover safe and credible resources." }
                ].map((item, idx) => (
                  <Link 
                    key={item.to} 
                    to={item.to} 
                    className="group no-underline relative p-3 sm:p-4 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onFocus={() => setHoveredIndex(idx)}
                  >
                    {hoveredIndex === idx && (
                      <motion.div
                        layoutId="hoverBackground"
                        className="absolute inset-0 bg-primary/15 rounded-xl border border-primary/20 backdrop-blur-sm shadow-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition: { duration: 0.15 } }}
                        exit={{ opacity: 0, transition: { duration: 0.15, delay: 0.2 } }}
                      />
                    )}
                    <div className="relative z-10">
                      <h3 className="text-accent font-semibold group-hover:text-primary transition-colors duration-150">{item.title}</h3>
                      <p className="text-muted-foreground mt-2 text-sm leading-6">
                        {item.desc}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </div>
  )
}


