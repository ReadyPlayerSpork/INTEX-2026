export function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Privacy Policy</h1>

      <div className="space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="mb-2 text-lg font-semibold">1. Introduction</h2>
          <p>
            Haven for Her ("we," "our," or "us") is committed to protecting the
            privacy and security of all individuals who interact with our
            platform, especially survivors, donors, and volunteers. This policy
            explains what personal data we collect, how we use it, and your
            rights under applicable data protection laws including GDPR.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">2. Data We Collect</h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong>Account information:</strong> Email address, password
              (hashed), self-selected persona, and how you heard about us.
            </li>
            <li>
              <strong>Donation data:</strong> Donation type, amount, campaign,
              and optional contact information for tax receipts.
            </li>
            <li>
              <strong>Usage data:</strong> Pages visited, features used, and
              session information via secure cookies.
            </li>
            <li>
              <strong>Survivor data (restricted):</strong> Case records,
              counseling notes, health assessments, and intervention plans — only
              accessible to authorized staff.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">3. How We Use Your Data</h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>To provide and improve our services.</li>
            <li>To process donations and issue tax receipts.</li>
            <li>To manage volunteer and employee accounts.</li>
            <li>
              To deliver personalized resources and crisis support to survivors.
            </li>
            <li>
              To generate anonymized analytics and improve outreach
              effectiveness.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">4. Data Protection</h2>
          <p>
            All data is transmitted over HTTPS/TLS. Sensitive data is stored
            with encryption at rest. Survivor records are access-controlled by
            role and audited. We follow the principle of least privilege for all
            data access.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">5. Your Rights</h2>
          <p>
            Under GDPR and applicable Philippine data protection law, you have
            the right to:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>Access the personal data we hold about you.</li>
            <li>Request correction of inaccurate data.</li>
            <li>Request deletion of your data ("right to be forgotten").</li>
            <li>Withdraw consent for data processing at any time.</li>
            <li>Export your data in a portable format.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">6. Cookies</h2>
          <p>
            We use essential cookies for authentication and session management.
            These cookies are HttpOnly, Secure, and SameSite=Lax. We do not use
            third-party tracking cookies. By continuing to use this site after
            accepting the cookie consent banner, you agree to our use of
            essential cookies.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">7. Contact</h2>
          <p>
            For any privacy-related questions or data requests, please contact
            us at{' '}
            <a href="mailto:privacy@havenforher.org" className="underline">
              privacy@havenforher.org
            </a>
            .
          </p>
        </section>

        <p className="text-muted-foreground pt-4">
          Last updated: April 2026
        </p>
      </div>
    </div>
  )
}
