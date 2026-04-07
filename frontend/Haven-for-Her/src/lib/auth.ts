export function getAuthBaseUrl(): string {
  const explicitBaseUrl = import.meta.env.VITE_AUTH_BASE_URL?.trim()

  if (explicitBaseUrl) {
    return explicitBaseUrl.replace(/\/$/, '')
  }

  if (typeof window !== 'undefined') {
    const { hostname, origin } = window.location

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'https://localhost:7229'
    }

    return origin.replace(/\/$/, '')
  }

  return 'https://localhost:7229'
}

export function getGoogleSignInUrl(returnPath = '/'): string {
  const params = new URLSearchParams({
    provider: 'Google',
    returnPath,
  })

  return `${getAuthBaseUrl()}/api/auth/external-login?${params.toString()}`
}
