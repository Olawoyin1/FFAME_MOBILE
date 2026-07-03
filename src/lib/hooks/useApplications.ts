import { useState, useCallback } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { get, patch } from '../api'

export interface ApiShift {
  _id: string
  ward: string
  startDateTime: string
  endDateTime: string
  requiredRole: string
  status: string
}

export interface ApiUser {
  _id: string
  role: string
  name: string
  email: string
  verificationStatus: string
  eligibilityStatus: string
}

export interface ApiApplication {
  _id: string
  tenantId: string
  shiftId: ApiShift
  userId: ApiUser
  status: 'applied' | 'approved' | 'rejected' | 'waitlisted' | 'assigned' | 'withdrawn' | 'completed'
  waitlisted: boolean
  createdAt: string
  updatedAt: string
}

export function useApplications(params?: { status?: string; limit?: number }) {
  const [applications, setApplications] = useState<ApiApplication[]>([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const query = new URLSearchParams()
      if (params?.status) query.set('status', params.status)
      query.set('limit', String(params?.limit ?? 50))

      const res = await get<{ success: boolean; data: ApiApplication[] }>(`/applications?${query}`)
      setApplications(res.data ?? [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [params?.status, params?.limit])

  // Re-fetch every time this screen comes into focus (covers initial mount too)
  useFocusEffect(useCallback(() => { fetch() }, [fetch]))
  return { applications, loading, error, refetch: fetch }
}

export async function withdrawApplication(id: string) {
  return patch(`/applications/${id}/withdraw`)
}
