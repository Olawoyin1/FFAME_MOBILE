import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { DeviceEventEmitter } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { post, get } from '../lib/api'

const STORAGE_KEY = 'ffame_auth'

// ── Types ─────────────────────────────────────────────────
export interface AuthUser {
  _id: string
  email: string
  name: string
  role: string
  status: string
  tenantId: string
  authType: 'traditional' | 'nhs'
  verificationStatus: string | null
  eligibilityStatus: string
  // From profile (populated after login)
  specialty?: string
  department?: string
  nhsId?: string
}

interface StoredAuth {
  user: AuthUser
  accessToken: string
  refreshToken: string
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  hasSeenOnboarding: boolean
  completeOnboarding: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

// ── Provider ──────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(stored => {
      if (stored) {
        try {
          const parsed: StoredAuth = JSON.parse(stored)
          setUser(parsed.user)
        } catch { /* corrupt storage */ }
      }
      setLoading(false)
    })

    // Fired by api.ts when the refresh token is expired — clears session locally
    // without hitting the server (tokens are already invalid)
    const sub = DeviceEventEmitter.addListener('auth:logout', () => {
      logoutLocally()
    })
    return () => sub.remove()
  }, [])

  async function completeOnboarding() {
    setHasSeenOnboarding(true)
  }

  // Clears local state and storage — does NOT call the server
  async function logoutLocally() {
    await AsyncStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }

  async function login(email: string, password: string) {
    const res = await post<{
      success: boolean
      data: {
        accessToken: string
        refreshToken: string
        user: AuthUser
      }
    }>('/auth/login', { email, password })

    const { accessToken, refreshToken, user: apiUser } = res.data

    // Enrich with profile data (specialty/department). Uses apiRequest so it
    // benefits from the token-refresh logic and correct tenant header.
    let enriched: AuthUser = apiUser
    try {
      const profileJson = await get<{ success: boolean; data: { firstName: string; lastName: string; specialty?: string; department?: string } }>('/profiles/me')
      const p = profileJson.data
      enriched = {
        ...apiUser,
        name: `${p.firstName} ${p.lastName}`.trim() || apiUser.name,
        specialty: p.specialty,
        department: p.department,
      }
    } catch { /* profile enrichment is non-blocking */ }

    const stored: StoredAuth = { user: enriched, accessToken, refreshToken }
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
    setUser(enriched)
  }

  async function logout() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY)
      if (raw) {
        const { refreshToken } = JSON.parse(raw) as StoredAuth
        await post('/auth/logout', { refreshToken })
      }
    } catch { /* ignore — clear locally regardless */ }
    await logoutLocally()
  }

  return (
    <AuthContext.Provider value={{
      user, loading, hasSeenOnboarding,
      completeOnboarding, login, logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
