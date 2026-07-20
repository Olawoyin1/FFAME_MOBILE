import { useState, useCallback } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { get } from '../api'

export type TimesheetStatus = 'pending_attendance' | 'submitted' | 'approved' | 'paid'
export type AttendanceStatus = 'pending' | 'worked' | 'no_show' | 'partial'

export interface ApiTimesheet {
  _id: string
  shiftId: { _id: string; ward: string; title?: string } | string
  scheduledStart: string
  scheduledEnd: string
  regularHours: number
  overtimeHours: number
  authorisedHours?: number
  totalPayPence: number
  payRateCode: string
  status: TimesheetStatus
  attendanceStatus: AttendanceStatus
}

export function wardOf(ts: ApiTimesheet): string {
  return typeof ts.shiftId === 'object' ? ts.shiftId.ward : 'Unknown ward'
}

export function titleOf(ts: ApiTimesheet): string | undefined {
  return typeof ts.shiftId === 'object' ? ts.shiftId.title : undefined
}

export function useMyPay() {
  const [timesheets, setTimesheets] = useState<ApiTimesheet[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await get<{ success: boolean; data: ApiTimesheet[]; meta?: { total: number } }>('/finance/my-pay?limit=500')
      setTimesheets(res.data ?? [])
      setTotal(res.meta?.total ?? res.data?.length ?? 0)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(useCallback(() => { fetch() }, [fetch]))
  return { timesheets, total, loading, error, refetch: fetch }
}
