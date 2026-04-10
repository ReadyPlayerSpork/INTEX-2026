# Demo accounts (local and seeded environments)

**These credentials are for development and demonstration only.** In production, override every password via environment variables — see `backend/.env.production.example`.

| Role | Email env var | Password env var | Dev default |
|------|---------------|------------------|-------------|
| Admin | `GenerateDefaultIdentityAdmin__Email` | `GenerateDefaultIdentityAdmin__Password` | `admin@havenforher.local` / `admin!haven4her` |
| Counselor | `GenerateDefaultIdentityCounselor__Email` | `GenerateDefaultIdentityCounselor__Password` | `counselor@havenforher.local` / `Counselor!haven4her` |
| Donor | `GenerateDefaultIdentityDonor__Email` | `GenerateDefaultIdentityDonor__Password` | `donor@havenforher.local` / `Donor!haven4her` |
| Supporter accounts (CSV) | — | `SeedSupporterPassword` | `LighthouseDev2026!` |

## Database seeding

Domain data is seeded from CSVs **only** when:
1. The domain database is empty (first deploy), **or**
2. The environment variable `REFRESH=true` is set.

When `REFRESH` is unset or `false`, existing data is preserved across restarts.

## Donor dashboard

The donor account's email **must match** a row in `supporters.csv` (`donor@havenforher.local`) so `GET /api/donor/dashboard` can resolve giving history.

## Multi-factor authentication

Interactive 2FA enrollment is supported via the account security flow in the app; there is no pre-seeded authenticator secret in source control.
