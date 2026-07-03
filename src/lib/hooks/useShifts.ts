import { useState, useEffect, useCallback } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { get, post } from '../api'

export interface ApiShift {
  _id: string
  ward: string
  title?: string
  description?: string
  startDateTime: string
  endDateTime: string
  requiredRole: string
  requiredCount: number
  assignedCount: number
  applicationCount: number
  status: string
  skills: string[]
  notes?: string
  payRateRef?: string
}

export interface ShiftsState {
  shifts: ApiShift[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useShifts(params?: { status?: string; ward?: string; limit?: number }): ShiftsState {
  const [shifts, setShifts] = useState<ApiShift[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const query = new URLSearchParams()
      if (params?.status) query.set('status', params.status)
      if (params?.ward)   query.set('ward', params.ward)
      query.set('limit', String(params?.limit ?? 50))

      const res = await get<{ success: boolean; data: ApiShift[] }>(`/shifts?${query}`)
      setShifts(res.data ?? [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [params?.status, params?.ward, params?.limit])

  useEffect(() => { fetch() }, [fetch])
  // Re-fetch every time this screen comes into focus (tab switch, back navigation)
  useFocusEffect(useCallback(() => { fetch() }, [fetch]))
  return { shifts, loading, error, refetch: fetch }
}

export async function applyToShift(shiftId: string) {
  return post(`/shifts/${shiftId}/apply`, {})
}
