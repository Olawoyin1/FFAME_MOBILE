import { useState, useCallback } from 'react'
import { View, ScrollView, RefreshControl } from 'react-native'
import { Text } from '../components/Text'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useApplications } from '../lib/hooks/useApplications'
import { useAuth } from '../context/AuthContext'
import ScreenState from '../components/ScreenState'
import ShiftTypeBadge from '../components/ShiftTypeBadge'
import { format, differenceInHours, startOfWeek, addDays, isSameDay } from 'date-fns'

function getShiftType(start: string): 'Day' | 'Late' | 'Night' {
  const h = new Date(start).getHours()
  if (h >= 7  && h < 15) return 'Day'
  if (h >= 15 && h < 20) return 'Late'
  return 'Night'
}

const TYPE_BAR: Record<string, string> = {
  Day:   '#f59e0b',
  Late:  '#005EB8',
  Night: '#1e293b',
}

export default function ScheduleScreen() {
  const insets = useSafeAreaInsets()
  const { user } = useAuth()
  // Assigned and approved shifts are the schedule
  const { applications, loading, error, refetch } = useApplications({ limit: 50 })
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }, [refetch])

  if (loading || error) return <ScreenState loading={loading} error={error} onRetry={refetch} />

  const scheduled = applications.filter(a =>
    (a.status === 'assigned' || a.status === 'approved') && a.shiftId?.startDateTime
  )

  const totalHours = scheduled.reduce((sum, a) => {
    if (!a.shiftId?.startDateTime || !a.shiftId?.endDateTime) return sum
    return sum + differenceInHours(new Date(a.shiftId.endDateTime), new Date(a.shiftId.startDateTime))
  }, 0)

  // Week strip — current week Mon–Sun
  const now      = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekDays  = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const hasShiftOnDay = (day: Date) =>
    scheduled.some(a => a.shiftId?.startDateTime && isSameDay(new Date(a.shiftId.startDateTime), day))

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f8fafc' }} showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#03397B" colors={['#03397B']} />}>
      {/* Header */}
      <LinearGradient colors={['#003087', '#005EB8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + 16, paddingBottom: 24, paddingHorizontal: 20 }}>
        <View style={{ position: 'absolute', top: -30, right: -40, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(0,163,157,0.1)' }} />
        <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 22, letterSpacing: -0.3, marginBottom: 4 }}>My Schedule</Text>
        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 16 }}>
          {scheduled.length} confirmed shift{scheduled.length !== 1 ? 's' : ''}
        </Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {[
            { label: 'Shifts',   value: scheduled.length },
            { label: 'Hours',    value: `${totalHours}h` },
          ].map(s => (
            <View key={s.label} style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
              <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 22 }}>{s.value}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, marginTop: 2 }}>{s.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: insets.bottom + 100, gap: 16 }}>

        {/* Week strip */}
        <View style={{ backgroundColor: '#ffffff', borderRadius: 20, borderWidth: 1, borderColor: '#f1f5f9', padding: 16 }}>
          <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>
            {format(weekStart, 'MMM d')} – {format(addDays(weekStart, 6), 'MMM d, yyyy')}
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {weekDays.map((day, i) => {
              const isToday  = isSameDay(day, now)
              const hasShift = hasShiftOnDay(day)
              return (
                <View key={i} style={{ alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 10, fontWeight: '600', color: isToday ? '#005EB8' : '#94a3b8' }}>
                    {format(day, 'EEE')}
                  </Text>
                  <View style={{ width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: isToday ? '#005EB8' : 'transparent' }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: isToday ? '#ffffff' : '#374151' }}>
                      {format(day, 'd')}
                    </Text>
                  </View>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: hasShift ? '#00A39D' : 'transparent' }} />
                </View>
              )
            })}
          </View>
        </View>

        {/* Shift list */}
        {scheduled.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 56, backgroundColor: '#ffffff', borderRadius: 20, borderWidth: 1, borderColor: '#f1f5f9' }}>
            <Text style={{ color: '#0f172a', fontWeight: '700', fontSize: 16, marginBottom: 6 }}>No confirmed shifts</Text>
            <Text style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', paddingHorizontal: 32 }}>
              Apply for shifts and once approved, they'll appear here.
            </Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            <Text style={{ color: '#0f172a', fontWeight: '800', fontSize: 16 }}>Confirmed Shifts</Text>
            {scheduled.map(app => {
              if (!app.shiftId?.startDateTime) return null
              const type    = getShiftType(app.shiftId.startDateTime)
              const ward    = app.shiftId.ward ?? '—'
              const startDate = new Date(app.shiftId.startDateTime)
              const endDate   = app.shiftId.endDateTime ? new Date(app.shiftId.endDateTime) : null
              const dateFmt   = isNaN(startDate.getTime()) ? '—' : format(startDate, 'EEE d MMM')
              const timeFmt   = isNaN(startDate.getTime()) ? '—' : `${format(startDate, 'HH:mm')} – ${endDate && !isNaN(endDate.getTime()) ? format(endDate, 'HH:mm') : '—'}`
              const hrs       = endDate && !isNaN(endDate.getTime()) && !isNaN(startDate.getTime())
                ? differenceInHours(endDate, startDate)
                : 0

              return (
                <View key={app._id} style={{ backgroundColor: '#ffffff', borderRadius: 20, borderWidth: 1, borderColor: '#f1f5f9', padding: 14 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <View>
                      <Text style={{ color: '#0f172a', fontWeight: '800', fontSize: 16 }}>{ward}</Text>
                      <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>
                        {app.shiftId.requiredRole?.replace(/_/g, ' ') ?? ''}
                      </Text>
                    </View>
                    <ShiftTypeBadge type={type} />
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                      <Text style={{ color: '#94a3b8', fontSize: 11 }}>📅</Text>
                      <Text style={{ color: '#475569', fontSize: 12, fontWeight: '500' }}>{dateFmt}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                      <Text style={{ color: '#94a3b8', fontSize: 11 }}>🕐</Text>
                      <Text style={{ color: '#475569', fontSize: 12, fontWeight: '500' }}>{timeFmt}</Text>
                    </View>
                    <Text style={{ color: '#00A39D', fontSize: 12, fontWeight: '700' }}>{hrs}h</Text>
                  </View>
                </View>
              )
            })}
          </View>
        )}

        <View style={{ backgroundColor: 'rgba(0,94,184,0.05)', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderWidth: 1, borderColor: 'rgba(0,94,184,0.1)' }}>
          <Text style={{ fontSize: 14 }}>💡</Text>
          <Text style={{ color: '#475569', fontSize: 12, lineHeight: 18, flex: 1 }}>
            Browse available shifts to build out your schedule. New shifts are published weekly.
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}
