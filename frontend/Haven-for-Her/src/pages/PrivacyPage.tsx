import { Card, CardContent } from '@/components/ui/card'

export function PrivacyPage() {
  return (
    <div className="px-5 py-16 md:px-10 md:py-24">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 max-w-3xl">
          <p className="text-muted-foreground text-sm font-semibold tracking-[0.18em] uppercase">
            Privacy policy
          </p>
          <h1 className="font-heading mt-3 text-balance text-[clamp(2.5rem,5vw,4rem)] font-semibold text-accent">
            How we protect the people who trust us
          </h1>
          <p className="text-muted-foreground mt-4 leading-8 text-pretty">
            Haven for Her is built with safety in mind. This policy explains
            what we collect, how we use it, and how we protect donors,
            survivors, volunteers, and staff.
          </p>
        </div>

        <Card className="border-border/70 bg-card/95">
          <CardContent className="space-y-8 p-8 text-sm leading-7">
            <section>
              <h2 className="font-heading mb-2 text-2xl font-semibold text-accent">
                1. Introduction
              </h2>
              <p>
                Haven for Her (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is
                committed to protecting the privacy and security of all
                individuals who interact with our platform, especially
                survivors, donors, and volunteers. This policy explains what
                personal data we collect, how we use it, and your rights under
                applicable data protection laws including GDPR.
              </p>
            </section>

            <section>
              <h2 className="font-heading mb-2 text-2xl font-semibold text-accent">
                2. Data We Collect
              </h2>
              <ul className="list-disc space-y-2 pl-6">
                <li>
                  <strong>Account information:</strong> Email address, password
                  (hashed), self-selected persona, and how you heard about us.
                </li>
                <li>
                  <strong>Donation data:</strong> Donation type, amount,
                  campaign, and optional contact information for tax receipts.
                </li>
                <li>
                  <strong>Usage data:</strong> Pages visited, features used, and
                  session information via secure cookies.
                </li>
                <li>
                  <strong>Survivor data (restricted):</strong> Case records,
                  counseling notes, health assessments, and intervention plans,
                  only accessible to authorized staff.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading mb-2 text-2xl font-semibold text-accent">
                3. How We Use Your Data
              </h2>
              <ul className="list-disc space-y-2 pl-6">
                <li>To provide and improve our services.</li>
                <li>To process donations and issue tax receipts.</li>
                <li>To manage volunteer and employee accounts.</li>
                <li>
                  To deliver personalized resources and crisis support to
                  survivors.
                </li>
                <li>
                  To generate anonymized analytics and improve outreach
                  effectiveness.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading mb-2 text-2xl font-semibold text-accent">
                4. Data Protection
              </h2>
              <p>
                All data is transmitted over HTTPS/TLS. Sensitive data is stored
                with encryption at rest. Survivor records are access-controlled
                by role and audited. We follow the principle of least privilege
                for all data access.
              </p>
            </section>

            <section>
              <h2 className="font-heading mb-2 text-2xl font-semibold text-accent">
                5. Your Rights
              </h2>
              <p>
                Under GDPR and applicable Philippine data protection law, you
                have the right to:
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Access the personal data we hold about you.</li>
                <li>Request correction of inaccurate data.</li>
                <li>Request deletion of your data.</li>
                <li>Withdraw consent for data processing at any time.</li>
                <li>Export your data in a portable format.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading mb-2 text-2xl font-semibold text-accent">
                6. Cookies
              </h2>
              <p>
                We use essential cookies for authentication and session
                management. These cookies are HttpOnly, Secure, and
                SameSite=Lax. We do not use third-party tracking cookies. By
                continuing to use this site after accepting the cookie consent
                banner, you agree to our use of essential cookies.
              </p>
            </section>

            <section>
              <h2 className="font-heading mb-2 text-2xl font-semibold text-accent">
                7. Contact
              </h2>
              <p>
                For any privacy-related questions or data requests, please
                contact us at{' '}
                <a
                  href="mailto:privacy@havenforher.org"
                  className="text-accent font-semibold underline underline-offset-4"
                >
                  privacy@havenforher.org
                </a>
                .
              </p>
            </section>

            <p className="text-muted-foreground border-border pt-2 text-sm">
              Last updated: April 2026
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
