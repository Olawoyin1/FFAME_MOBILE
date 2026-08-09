import { useState, useEffect, useCallback } from 'react'
import { get } from '../api'

export interface ApiProfessionRole {
  _id: string
  sector: string
  roleName: string
  esrStaffGroupCode?: string
  active: boolean
}

// The taxonomy is tenant-wide and always populated (every tenant is auto-seeded —
// see FFAME-Server/docs/FRONTEND_API_CHANGES.md §8), and rarely changes, so this
// fetches once per app session rather than refetching on every screen focus like
// useShifts/useProfile do for genuinely live data.
export function useProfessionRoles() {
  const [roles, setRoles] = useState<ApiProfessionRole[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(() => {
    setLoading(true)
    setError(null)
    get<{ success: boolean; data: ApiProfessionRole[] }>('/profession-roles')
      .then(res => setRoles(res.data ?? []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { roles, loading, error, refetch: fetch }
}

export const PROFESSION_SECTORS = [
  { value: 'nursing_and_midwifery', label: 'Nursing and Midwifery' },
  { value: 'medical_and_dental', label: 'Medical and Dental' },
  { value: 'allied_health_professions', label: 'Allied Health Professions' },
  { value: 'health_science_services', label: 'Health Science Services' },
  { value: 'emergency_services', label: 'Emergency Services' },
  { value: 'personal_and_social_services', label: 'Personal and Social Services' },
  { value: 'support_services', label: 'Support Services' },
  { value: 'administrative_services', label: 'Administrative Services' },
  { value: 'directors', label: 'Directors' },
  { value: 'volunteers', label: 'Volunteers' },
] as const
