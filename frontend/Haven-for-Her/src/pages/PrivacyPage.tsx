import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { resetEssentialCookieNotice } from '@/lib/essentialCookieNotice'

export function PrivacyPage() {
  const handleShowNoticeAgain = () => {
    resetEssentialCookieNotice()
    window.location.reload()
  }

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
                1. Who We Are
              </h2>
              <p>
                Haven for Her (&quot;we,&quot; &quot;our,&quot; or
                &quot;us&quot;) is a nonprofit organization dedicated to
                assisting survivors of sexual assault. This policy explains what
                personal data we collect, how we use it, and your rights under
                the General Data Protection Regulation (GDPR) and applicable
                local data protection laws.
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>
                  <strong>Data Controller:</strong> Haven for Her
                </li>
                <li>
                  <strong>Privacy Contact / Data Protection Officer:</strong>{' '}
                  <a
                    href="mailto:privacy@havenforher.org"
                    className="text-accent font-semibold underline underline-offset-4"
                  >
                    privacy@havenforher.org
                  </a>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading mb-2 text-2xl font-semibold text-accent">
                2. Data We Collect
              </h2>
              <ul className="list-disc space-y-2 pl-6">
                <li>
                  <strong>Account information:</strong> Email address, password
                  (stored as a one-way hash), self-selected persona, and
                  acquisition source (how you heard about us).
                </li>
                <li>
                  <strong>Donation data:</strong> Donation type, amount,
                  currency, campaign name, and optional contact information you
                  provide for tax receipts.
                </li>
                <li>
                  <strong>Usage data:</strong> Pages visited, features used, and
                  session identifiers stored in a secure, HttpOnly
                  authentication cookie.
                </li>
                <li>
                  <strong>Survivor data (restricted):</strong> Case records,
                  counseling notes, health assessments, and intervention plans.
                  Access is strictly limited to authorized counselors and
                  administrators.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading mb-2 text-2xl font-semibold text-accent">
                3. Legal Basis for Processing
              </h2>
              <p>
                We process personal data under the following GDPR legal bases:
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li>
                  <strong>Consent (Art. 6(1)(a)):</strong> When you create an
                  account, make a donation, or accept our cookie notice, you
                  consent to processing the data described above. You can
                  withdraw consent at any time (see Section 7).
                </li>
                <li>
                  <strong>Contractual necessity (Art. 6(1)(b)):</strong>{' '}
                  Processing account and donation data is necessary to provide
                  you with our services, such as issuing tax receipts and
                  managing your account.
                </li>
                <li>
                  <strong>Legitimate interests (Art. 6(1)(f)):</strong> We
                  generate anonymized, aggregated analytics to measure outreach
                  effectiveness and improve our programs. This processing does
                  not override your fundamental rights.
                </li>
                <li>
                  <strong>Vital interests (Art. 6(1)(d)):</strong> In crisis
                  situations involving survivors, we process data to protect
                  the vital interests of the individual.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading mb-2 text-2xl font-semibold text-accent">
                4. How We Use Your Data
              </h2>
              <ul className="list-disc space-y-2 pl-6">
                <li>
                  To authenticate your identity and maintain your session.
                </li>
                <li>
                  To process donations and generate tax receipts for donors who
                  provide contact information.
                </li>
                <li>To manage volunteer, employee, and counselor accounts.</li>
                <li>
                  To deliver case management services and crisis support to
                  survivors through authorized staff.
                </li>
                <li>
                  To produce anonymized, aggregate statistics that help us
                  improve outreach and program effectiveness.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading mb-2 text-2xl font-semibold text-accent">
                5. Data Recipients &amp; Sharing
              </h2>
              <p>
                We do not sell personal data. Data is shared only with the
                following categories of recipients:
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li>
                  <strong>Authorized staff:</strong> Counselors, administrators,
                  and financial officers access only the data required by their
                  role.
                </li>
                <li>
                  <strong>Infrastructure providers:</strong> Our hosting and
                  database providers process data on our behalf under data
                  processing agreements.
                </li>
                <li>
                  <strong>Authentication providers:</strong> If you sign in with
                  Google, Google receives your authentication request. We
                  receive only your email and name from Google.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading mb-2 text-2xl font-semibold text-accent">
                6. International Data Transfers
              </h2>
              <p>
                Our servers are hosted outside the European Economic Area (EEA).
                When personal data is transferred outside the EEA, we ensure
                appropriate safeguards are in place, including standard
                contractual clauses approved by the European Commission and
                encryption of data in transit and at rest.
              </p>
            </section>

            <section>
              <h2 className="font-heading mb-2 text-2xl font-semibold text-accent">
                7. Your Rights
              </h2>
              <p>
                Under the GDPR, you have the following rights. We respond to
                all requests within one month.
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li>
                  <strong>Right of access:</strong> Obtain a copy of the
                  personal data we hold about you.
                </li>
                <li>
                  <strong>Right to rectification:</strong> Request correction of
                  inaccurate or incomplete data.
                </li>
                <li>
                  <strong>Right to erasure:</strong> Request deletion of your
                  personal data when it is no longer necessary for the purposes
                  it was collected.
                </li>
                <li>
                  <strong>Right to restrict processing:</strong> Ask us to
                  temporarily stop processing your data while we verify its
                  accuracy or assess a request.
                </li>
                <li>
                  <strong>Right to object:</strong> Object to processing based
                  on legitimate interests. We will stop unless we demonstrate
                  compelling legitimate grounds.
                </li>
                <li>
                  <strong>Right to data portability:</strong> Receive your data
                  in a structured, commonly used, machine-readable format.
                </li>
                <li>
                  <strong>Right to withdraw consent:</strong> Withdraw consent
                  at any time. Withdrawal does not affect the lawfulness of
                  processing carried out before withdrawal.
                </li>
                <li>
                  <strong>Right to lodge a complaint:</strong> You have the
                  right to file a complaint with your local data protection
                  supervisory authority if you believe your data has been
                  processed unlawfully.
                </li>
              </ul>
              <p className="mt-3">
                To exercise any of these rights, contact{' '}
                <a
                  href="mailto:privacy@havenforher.org"
                  className="text-accent font-semibold underline underline-offset-4"
                >
                  privacy@havenforher.org
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="font-heading mb-2 text-2xl font-semibold text-accent">
                8. Data Retention
              </h2>
              <ul className="list-disc space-y-2 pl-6">
                <li>
                  <strong>Account data:</strong> Retained for the duration of
                  your account. Deleted within 30 days of an account deletion
                  request.
                </li>
                <li>
                  <strong>Donation records:</strong> Retained for 7 years to
                  meet tax and financial reporting obligations, then deleted.
                </li>
                <li>
                  <strong>Session cookies:</strong> Expire after 7 days of
                  inactivity (sliding expiration).
                </li>
                <li>
                  <strong>Survivor case data:</strong> Retained as required by
                  applicable law and organizational safeguarding policy, then
                  securely deleted.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading mb-2 text-2xl font-semibold text-accent">
                9. Cookies
              </h2>
              <p>
                We use <strong>essential cookies only</strong> for
                authentication and session management. These cookies are:
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li>
                  <strong>HttpOnly:</strong> Not accessible to JavaScript,
                  protecting against cross-site scripting attacks.
                </li>
                <li>
                  <strong>Secure:</strong> Transmitted only over encrypted HTTPS
                  connections.
                </li>
                <li>
                  <strong>SameSite=Lax:</strong> Restricted from cross-site
                  requests, protecting against cross-site request forgery.
                </li>
              </ul>
              <p className="mt-3">
                We do not use analytics, advertising, or third-party tracking
                cookies. If you dismiss the bottom notice, we store only a
                local flag that you have seen it (not sent to our servers) so
                the banner does not repeat on every visit.
              </p>
              <div className="mt-4">
                <Button variant="outline" size="sm" onClick={handleShowNoticeAgain}>
                  Show essential cookie notice again
                </Button>
              </div>
            </section>

            <section>
              <h2 className="font-heading mb-2 text-2xl font-semibold text-accent">
                10. Automated Decision-Making
              </h2>
              <p>
                We use a machine learning model to generate service
                recommendations based on anonymized, aggregate data. This model
                does not make decisions that produce legal effects or
                significantly affect any individual. No personal data is used
                as input to automated decision-making processes.
              </p>
            </section>

            <section>
              <h2 className="font-heading mb-2 text-2xl font-semibold text-accent">
                11. Data Protection Measures
              </h2>
              <p>
                All data is transmitted over HTTPS/TLS. Sensitive data is stored
                with encryption at rest. Survivor records are protected by
                role-based access control and audited. We follow the principle
                of least privilege for all data access. Authentication endpoints
                are rate-limited and accounts are locked after repeated failed
                login attempts.
              </p>
            </section>

            <section>
              <h2 className="font-heading mb-2 text-2xl font-semibold text-accent">
                12. Contact
              </h2>
              <p>
                For any privacy-related questions, data subject requests, or
                complaints, contact our Data Protection Officer at{' '}
                <a
                  href="mailto:privacy@havenforher.org"
                  className="text-accent font-semibold underline underline-offset-4"
                >
                  privacy@havenforher.org
                </a>
                . We aim to respond to all inquiries within one month.
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
