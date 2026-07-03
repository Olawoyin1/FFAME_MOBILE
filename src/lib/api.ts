import AsyncStorage from '@react-native-async-storage/async-storage'
import { DeviceEventEmitter } from 'react-native'

const BASE_URL = 'https://ffame-server.onrender.com/api/v1'
const STORAGE_KEY = 'ffame_auth'

// ── Token helpers ─────────────────────────────────────────
async function getStoredAuth(): Promise<{ accessToken: string; refreshToken: string; user?: any } | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

async function saveTokens(accessToken: string, refreshToken: string) {
  try {
    const existing = await getStoredAuth()
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, accessToken, refreshToken }))
  } catch { /* ignore */ }
}

// ── Refresh — returns new accessToken or null ─────────────
// Returns false specifically when the refresh token itself is expired/invalid
// (server returns 401), so the caller can force logout.
// Returns null on transient network errors (caller should not force logout).
type RefreshResult = string | null | false

let refreshPromise: Promise<RefreshResult> | null = null

async function refreshAccessToken(): Promise<RefreshResult> {
  // De-duplicate concurrent refresh attempts
  if (refreshPromise) return refreshPromise

  refreshPromise = (async (): Promise<RefreshResult> => {
    try {
      const auth = await getStoredAuth()
      if (!auth?.refreshToken) return false   // no refresh token → force logout

      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: auth.refreshToken }),
      })

      const json = await res.json().catch(() => null)

      if (!res.ok) {
        // 401 = refresh token expired or invalid → force logout
        if (res.status === 401) return false
        // Other server errors (5xx, etc.) = transient → don't force logout
        return null
      }

      const newAccess  = json?.data?.accessToken
      const newRefresh = json?.data?.refreshToken

      if (!newAccess) return null   // unexpected shape, treat as transient

      await saveTokens(newAccess, newRefresh ?? auth.refreshToken)
      return newAccess
    } catch {
      // Network error — transient, don't force logout
      return null
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

// ── Core request ──────────────────────────────────────────
export async function apiRequest<T = unknown>(
  path: string,
  options: RequestInit = {},
  _retry = true,           // internal flag — never refresh during a refresh call
): Promise<T> {
  const auth = await getStoredAuth()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  }

  if (auth?.accessToken) headers['Authorization'] = `Bearer ${auth.accessToken}`
  if (auth?.user?.tenantId) headers['X-Tenant-ID'] = auth.user.tenantId

  let res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  // ── 401 → try refresh once ────────────────────────────
  if (res.status === 401 && _retry) {
    const errBody = await res.json().catch(() => ({}))

    // Don't try to refresh if this is a login call with bad credentials
    if (errBody?.errorCode === 'INVALID_CREDENTIALS') {
      throw new Error(errBody?.message ?? 'Invalid credentials')
    }

    const refreshResult = await refreshAccessToken()

    if (refreshResult === false) {
      // Refresh token expired → force logout
      DeviceEventEmitter.emit('auth:logout')
      throw new Error('Session expired. Please sign in again.')
    }

    if (refreshResult === null) {
      // Transient error — surface the original 401 message
      throw new Error(errBody?.message ?? 'Unauthorized')
    }

    // Got a new access token — retry original request once (retry=false prevents loops)
    headers['Authorization'] = `Bearer ${refreshResult}`
    res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

    if (res.status === 401) {
      // Still 401 after fresh token → session is dead
      DeviceEventEmitter.emit('auth:logout')
      throw new Error('Session expired. Please sign in again.')
    }
  }

  // ── Non-2xx ───────────────────────────────────────────
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}))
    throw new Error(errBody?.message ?? `Request failed: ${res.status}`)
  }

  if (res.status === 204) return {} as T
  return res.json()
}

// ── Convenience methods ───────────────────────────────────
export const get   = <T>(path: string)                  => apiRequest<T>(path)
export const post  = <T>(path: string, body: unknown)   => apiRequest<T>(path, { method: 'POST',  body: JSON.stringify(body) })
export const patch = <T>(path: string, body?: unknown)  => apiRequest<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined })
