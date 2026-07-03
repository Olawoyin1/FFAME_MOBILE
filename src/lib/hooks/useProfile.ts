import { useState, useEffect, useCallback } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { get, patch } from '../api'

export interface ApiProfile {
  _id: string
  userId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  specialty?: string
  department?: string
  location?: string
  bio?: string
  completenessStatus: string
  availability: Array<{ day: string; startTime: string; endTime: string }>
}

export function useProfile() {
  const [profile, setProfile] = useState<ApiProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  const fetch = useCallback(() => {
    setLoading(true)
    setError(null)
    get<{ success: boolean; data: ApiProfile }>('/profiles/me')
      .then(res => setProfile(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetch() }, [fetch])
  // Re-fetch every time this screen comes into focus
  useFocusEffect(useCallback(() => { fetch() }, [fetch]))

  async function updateProfile(updates: Partial<ApiProfile>) {
    const res = await patch<{ success: boolean; data: ApiProfile }>('/profiles/me', updates)
    setProfile(res.data)
    return res.data
  }

  return { profile, loading, error, updateProfile }
}
