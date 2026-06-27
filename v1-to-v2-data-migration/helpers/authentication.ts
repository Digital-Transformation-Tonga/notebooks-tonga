import { GATEWAY } from './routes.ts'

export async function authenticate(
  username: string,
  password: string
): Promise<{ nonce: string }> {
  const response = await fetch(`${GATEWAY}/auth/authenticate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!response.ok) {
    throw new Error(`Authentication failed: ${response.statusText}`)
  }
  const authResponse = await response.json()

  const nonce = authResponse.nonce
  const verifyCode = async (code: string, nonce: string) => {
    const response = await fetch(`${GATEWAY}/auth/verifyCode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, nonce }),
    })
    if (!response.ok) {
      throw new Error(`Code verification failed: ${response.statusText}`)
    }
    return response.json()
  }

  return (await verifyCode('000000', nonce)).token
}

export async function getTokenForSystemClient(
  clientId: string,
  clientSecret: string
): Promise<string> {
  const authenticateResponse = await fetch(
    `${GATEWAY}/auth/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-correlation-id': clientId + '-' + Date.now(),
      },
    }
  )
  const res = await authenticateResponse.json()
  if (!authenticateResponse.ok) {
    throw new Error(
      `Failed to get token for system client: ${
        res.message || authenticateResponse.statusText
      }`
    )
  }

  return res.token || res.access_token
}

const TOKEN_REFRESH_INTERVAL_MS = 8 * 60 * 1000 // Refresh every 8 minutes (well before typical 10-20 min JWT expiry)

/**
 * Auto-refreshing token wrapper that transparently re-fetches the JWT
 * before it expires. Call `.get()` to always get a valid token.
 */
export class AutoRefreshingToken {
  private token: string
  private lastRefresh: number
  private clientId: string
  private clientSecret: string
  private refreshing: Promise<string> | null = null

  constructor(
    initialToken: string,
    clientId: string,
    clientSecret: string
  ) {
    this.token = initialToken
    this.lastRefresh = Date.now()
    this.clientId = clientId
    this.clientSecret = clientSecret
  }

  async get(): Promise<string> {
    const age = Date.now() - this.lastRefresh
    if (age < TOKEN_REFRESH_INTERVAL_MS) {
      return this.token
    }

    // Coalesce concurrent refresh calls
    if (!this.refreshing) {
      this.refreshing = this.refresh()
    }

    try {
      return await this.refreshing
    } finally {
      this.refreshing = null
    }
  }

  private async refresh(): Promise<string> {
    try {
      const newToken = await getTokenForSystemClient(
        this.clientId,
        this.clientSecret
      )
      this.token = newToken
      this.lastRefresh = Date.now()
      console.log(`Token refreshed at ${new Date().toISOString()}`)
      return this.token
    } catch (err) {
      console.warn(
        `Token refresh failed, using existing token: ${
          err instanceof Error ? err.message : String(err)
        }`
      )
      // Extend the current token's life by 2 minutes to avoid hammering auth
      this.lastRefresh = Date.now() - TOKEN_REFRESH_INTERVAL_MS + 2 * 60 * 1000
      return this.token
    }
  }
}
