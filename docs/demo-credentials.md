# Demo accounts (local and seeded environments)

**These credentials are for development and demonstration only.** Change or disable them in production.

| Role | Email | Password | Notes |
|------|--------|----------|--------|
| Admin | `admin@havenforher.local` | `admin!haven4her` | Overridable via `GenerateDefaultIdentityAdmin` in configuration |
| Counselor | `counselor@havenforher.local` | `Counselor!haven4her` | Caseload matches CSV `SW-15` assignment |
| Donor | `donor@havenforher.local` | `Donor!haven4her` | Domain supporter row + donation seeded in CSV; overridable via `GenerateDefaultIdentityDonor` |

## Donor dashboard

The donor account’s email **must match** a row in `supporters.csv` (`donor@havenforher.local`) so `GET /api/donor/dashboard` can resolve giving history.

## Multi-factor authentication

Interactive 2FA enrollment is supported via the account security flow in the app; there is no pre-seeded authenticator secret in source control.
