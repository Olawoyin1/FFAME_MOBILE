import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { DeviceEventEmitter } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { post } from '../lib/api'

const STORAGE_KEY = 'ffame_auth'
const ONBOARDING_KEY = 'ffame_onboarding_done'

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
    Promise.all([
      AsyncStorage.getItem(STORAGE_KEY),
    ]).then(([stored]) => {
      if (stored) {
        try {
          const parsed: StoredAuth = JSON.parse(stored)
          setUser(parsed.user)
        } catch { /* corrupt storage */ }
      }
      setHasSeenOnboarding(false)
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

    // Try to fetch the user's profile to enrich with specialty/department/nhsId
    let enriched: AuthUser = apiUser
    try {
      const profileRes = await fetch(
        'https://ffame-server.onrender.com/api/v1/profiles/me',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'X-Tenant-ID': apiUser.tenantId,
          },
        }
      )
      if (profileRes.ok) {
        const profileJson = await profileRes.json()
        const p = profileJson.data
        enriched = {
          ...apiUser,
          name: `${p.firstName} ${p.lastName}`.trim() || apiUser.name,
          specialty: p.specialty,
          department: p.department,
        }
      }
    } catch { /* profile fetch is non-blocking */ }

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
