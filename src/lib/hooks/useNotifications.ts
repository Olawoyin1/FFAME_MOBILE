import { useState, useEffect, useCallback } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { get, patch } from '../api'

export interface ApiNotification {
  _id: string
  title: string
  body: string
  category: string
  read: boolean
  readAt?: string
  createdAt: string
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<ApiNotification[]>([])
  const [unreadCount,   setUnreadCount]   = useState(0)
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await get<{
        success: boolean
        data: ApiNotification[]
        meta: { unreadCount: number }
      }>('/notifications?limit=30')
      setNotifications(res.data)
      setUnreadCount(res.meta?.unreadCount ?? res.data.filter(n => !n.read).length)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])
  // Re-fetch every time this screen comes into focus
  useFocusEffect(useCallback(() => { fetch() }, [fetch]))

  async function markRead(id: string) {
    await patch(`/notifications/${id}/read`)
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  async function markAllRead() {
    await patch('/notifications/read-all')
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  return { notifications, unreadCount, loading, error, refetch: fetch, markRead, markAllRead }
}
