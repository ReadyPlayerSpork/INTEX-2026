export function getAuthBaseUrl(): string {
  const explicit =
    import.meta.env.VITE_AUTH_BASE_URL?.trim() ||
    import.meta.env.VITE_API_BASE_URL?.trim()

  if (explicit) {
    return explicit.replace(/\/$/, '')
  }

  // Dev: auth redirects must hit the backend directly (not proxied).
  return 'https://localhost:7229'
}

export function getGoogleSignInUrl(returnPath = '/'): string {
  const params = new URLSearchParams({
    provider: 'Google',
    returnPath,
  })

  return `${getAuthBaseUrl()}/api/auth/external-login?${params.toString()}`
}
