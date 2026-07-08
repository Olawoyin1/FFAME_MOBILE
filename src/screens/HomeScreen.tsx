import { useState, useCallback } from 'react'
import { View, TouchableOpacity, ScrollView, Alert, StatusBar, Image, RefreshControl } from 'react-native'
import { Text } from '../components/Text'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '../context/AuthContext'
import { useShifts, applyToShift } from '../lib/hooks/useShifts'
import { useApplications } from '../lib/hooks/useApplications'
import { useNotifications } from '../lib/hooks/useNotifications'
import StatusBadge from '../components/StatusBadge'
import { HomeSkeleton } from '../components/Skeleton'
import { BellIcon, ArrowRightIcon, ClockIcon, UsersIcon, SearchIcon, CheckCircleIcon } from '../components/icons'
import { format } from 'date-fns'

const LOGO = require('../../assets/ffame_logo.png')

type Props = { navigation: any }

function getShiftType(start: string): 'Day' | 'Late' | 'Night' {
  const h = new Date(start).getHours()
  if (h >= 7 && h < 15) return 'Day'
  if (h >= 15 && h < 20) return 'Late'
  return 'Night'
}

const TYPE_COLOR: Record<string, string> = {
  Day: '#f59e0b', Late: '#03397B', Night: '#1e293b',
}

export default function HomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets()
  const { user } = useAuth()
  const { shifts, loading: shiftsLoading, refetch: refetchShifts } = useShifts({ status: 'open', limit: 3 })
  const { applications, loading: appsLoading, refetch: refetchApps } = useApplications({ limit: 50 })
  const { unreadCount, refetch: refetchNotifs } = useNotifications()
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await Promise.all([refetchShifts(), refetchApps(), refetchNotifs()])
    setRefreshing(false)
  }, [refetchShifts, refetchApps, refetchNotifs])

  if (!user || shiftsLoading || appsLoading) return <HomeSkeleton />

  const firstName = user.name?.split(' ')[1] ?? user.name?.split(' ')[0] ?? 'there'
  const initials = (user.name || '').split(' ').filter(Boolean).map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'U'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const safeApps = applications || []
  const safeShifts = shifts || []

  const appliedShiftIds = new Set(
    safeApps
      .filter(a => a.status !== 'withdrawn' && a.status !== 'rejected')
      .map(a => a.shiftId?._id)
      .filter(Boolean)
  )

  const scheduled = safeApps.filter(a => a.status === 'assigned' || a.status === 'approved')
  const nextShift = scheduled.find(a => a.shiftId?.startDateTime && new Date(a.shiftId.startDateTime) > new Date())

  const eligConfig: Record<string, { label: string; color: string; bg: string }> = {
    active:                 { label: 'Verified',     color: '#16a34a', bg: '#dcfce7' },
    verified_and_compliant: { label: 'Verified',     color: '#16a34a', bg: '#dcfce7' },
    verification_pending:   { label: 'Pending',      color: '#d97706', bg: '#fef3c7' },
    inactive:               { label: 'Needs Review', color: '#dc2626', bg: '#fee2e2' },
    suspended:              { label: 'Suspended',    color: '#dc2626', bg: '#fee2e2' },
  }
  const elig = eligConfig[user.eligibilityStatus as keyof typeof eligConfig] ?? eligConfig.verification_pending

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <StatusBar barStyle="light-content" backgroundColor="#03397B" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#03397B" colors={['#03397B']} />}
      >
        {/* ── Header ── */}
        <View style={{ backgroundColor: '#03397B', paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 28 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Image source={LOGO} style={{ width: 90, height: 28, resizeMode: 'contain', tintColor: '#ffffff' }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={{ position: 'relative' }}>
                <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center' }}>
                  <BellIcon width={17} height={17} stroke="#03397B" strokeWidth={2} />
                </View>
                {unreadCount > 0 && (
                  <View style={{ position: 'absolute', top: -3, right: -3, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: '#ef4444', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3, borderWidth: 1.5, borderColor: '#03397B' }}>
                    <Text style={{ color: '#fff', fontSize: 9, fontWeight: '800' }}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <View style={{ width: 38, height: 38, borderRadius: 4, backgroundColor: '#00A39D', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>{initials}</Text>
              </View>
            </View>
          </View>

          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 3 }}>{greeting}</Text>
          <Text style={{ color: '#ffffff', fontSize: 22, fontWeight: '800', letterSpacing: -0.3, marginBottom: 10 }}>
            {firstName}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Compliance')}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: elig.bg, paddingHorizontal: 10, paddingVertical: 4 }}
          >
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: elig.color }} />
            <Text style={{ color: elig.color, fontSize: 11, fontWeight: '700' }}>{elig.label}</Text>
          </TouchableOpacity>
        </View>

        {/* ── Stats strip ── */}
        <View style={{ flexDirection: 'row', backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
          {[
            { label: 'Applications', value: safeApps.length, color: '#03397B' },
            { label: 'Upcoming', value: scheduled.length, color: '#00A39D' },
            { label: 'Alerts', value: unreadCount, color: '#ef4444' },
          ].map(({ label, value, color }, i, arr) => (
            <View key={label} style={{ flex: 1, alignItems: 'center', paddingVertical: 18, borderRightWidth: i < arr.length - 1 ? 1 : 0, borderRightColor: '#f1f5f9' }}>
              <Text style={{ fontSize: 24, fontWeight: '800', color, lineHeight: 28 }}>{value}</Text>
              <Text style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{label}</Text>
            </View>
          ))}
        </View>

        {/* ── Next Shift ── */}
        {nextShift?.shiftId?.startDateTime && (
          <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>
              Upcoming Shift
            </Text>
            <View style={{ backgroundColor: '#0f172a', padding: 18 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#94a3b8', fontSize: 11, marginBottom: 4 }}>
                    {nextShift.shiftId.requiredRole?.replace(/_/g, ' ')}
                  </Text>
                  <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 20, letterSpacing: -0.3 }}>
                    {nextShift.shiftId.ward}
                  </Text>
                </View>
                <View style={{ backgroundColor: TYPE_COLOR[getShiftType(nextShift.shiftId.startDateTime)] ?? '#03397B', paddingHorizontal: 10, paddingVertical: 4 }}>
                  <Text style={{ color: '#ffffff', fontSize: 11, fontWeight: '700' }}>
                    {getShiftType(nextShift.shiftId.startDateTime)}
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', padding: 12 }}>
                  <Text style={{ color: '#64748b', fontSize: 10, marginBottom: 2 }}>Date</Text>
                  <Text style={{ color: '#ffffff', fontWeight: '600', fontSize: 13 }}>
                    {format(new Date(nextShift.shiftId.startDateTime), 'EEE, d MMM')}
                  </Text>
                </View>
                <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', padding: 12 }}>
                  <Text style={{ color: '#64748b', fontSize: 10, marginBottom: 2 }}>Time</Text>
                  <Text style={{ color: '#ffffff', fontWeight: '600', fontSize: 13 }}>
                    {format(new Date(nextShift.shiftId.startDateTime), 'HH:mm')}
                    {nextShift.shiftId.endDateTime ? ` – ${format(new Date(nextShift.shiftId.endDateTime), 'HH:mm')}` : ''}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ── Available Shifts ── */}
        <View style={{ paddingHorizontal: 20, marginTop: 28 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Available Shifts
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Shifts')} style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
              <Text style={{ color: '#03397B', fontSize: 13, fontWeight: '600' }}>See all</Text>
              <ArrowRightIcon width={14} height={14} stroke="#03397B" />
            </TouchableOpacity>
          </View>

          {safeShifts.length === 0 ? (
            <View style={{ backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#f1f5f9', padding: 32, alignItems: 'center' }}>
              <SearchIcon width={22} height={22} stroke="#cbd5e1" />
              <Text style={{ color: '#94a3b8', fontSize: 14, fontWeight: '500', marginTop: 10 }}>No open shifts right now</Text>
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              {safeShifts.slice(0, 3).map(shift => {
                const type = getShiftType(shift.startDateTime)
                const alreadyApplied = appliedShiftIds.has(shift._id)
                const accentColor = alreadyApplied ? '#16a34a' : (TYPE_COLOR[type] ?? '#03397B')
                return (
                  <View key={shift._id} style={{ backgroundColor: '#ffffff', borderRadius: 20, borderWidth: 1, borderColor: '#f1f5f9', padding: 14 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <View style={{ flex: 1, marginRight: 12 }}>
                        <Text style={{ color: '#0f172a', fontWeight: '800', fontSize: 16 }}>{shift.ward}</Text>
                        <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>
                          {shift.requiredRole?.replace(/_/g, ' ')}
                        </Text>
                      </View>
                      <View style={{ paddingHorizontal: 10, paddingVertical: 4, backgroundColor: `${accentColor}18`, borderRadius: 8 }}>
                        <Text style={{ color: accentColor, fontSize: 11, fontWeight: '700' }}>{type}</Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                        <Text style={{ color: '#94a3b8', fontSize: 11 }}>📅</Text>
                        <Text style={{ color: '#475569', fontSize: 12, fontWeight: '500' }}>
                          {format(new Date(shift.startDateTime), 'EEE, d MMM')}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                        <Text style={{ color: '#94a3b8', fontSize: 11 }}>🕐</Text>
                        <Text style={{ color: '#475569', fontSize: 12, fontWeight: '500' }}>
                          {format(new Date(shift.startDateTime), 'HH:mm')}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <UsersIcon width={11} height={11} stroke="#4B5563" />
                        <Text style={{ color: '#94a3b8', fontSize: 11 }}>{shift.requiredCount - shift.assignedCount} left</Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
                      <TouchableOpacity
                        onPress={() => navigation.navigate('ShiftDetail', { shiftId: shift._id })}
                        style={{ paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8 }}
                      >
                        <Text style={{ color: '#475569', fontSize: 12, fontWeight: '600' }}>Details</Text>
                      </TouchableOpacity>
                      {alreadyApplied ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0', borderRadius: 8 }}>
                          <CheckCircleIcon width={12} height={12} stroke="#16a34a" />
                          <Text style={{ color: '#16a34a', fontSize: 12, fontWeight: '700' }}>Applied</Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={{ paddingHorizontal: 14, paddingVertical: 7, backgroundColor: '#03397B', borderRadius: 8 }}
                          onPress={async () => {
                            try {
                              await applyToShift(shift._id)
                              Alert.alert('Applied', 'Your application has been submitted.')
                            } catch (err: any) {
                              Alert.alert('Error', err.message || 'Could not apply')
                            }
                          }}
                        >
                          <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '700' }}>Apply Now</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )
              })}
            </View>
          )}
        </View>

        {/* ── Recent Applications ── */}
        {safeApps.length > 0 && (
          <View style={{ paddingHorizontal: 20, marginTop: 28 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                My Applications
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Applications')} style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                <Text style={{ color: '#03397B', fontSize: 13, fontWeight: '600' }}>View all</Text>
                <ArrowRightIcon width={14} height={14} stroke="#03397B" />
              </TouchableOpacity>
            </View>
            <View style={{ backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#f1f5f9' }}>
              {safeApps.slice(0, 3).map((app, i, arr) => (
                <View key={app._id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: '#f8fafc' }}>
                  <View>
                    <Text style={{ color: '#0f172a', fontWeight: '600', fontSize: 14 }}>{app.shiftId?.ward ?? '—'}</Text>
                    <Text style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}>
                      {app.shiftId?.startDateTime ? format(new Date(app.shiftId.startDateTime), 'EEE, d MMM') : '—'}
                    </Text>
                  </View>
                  <StatusBadge status={app.status as any} size="sm" />
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  )
}
