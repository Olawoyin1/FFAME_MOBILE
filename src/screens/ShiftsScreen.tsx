import { useState, useCallback } from 'react'
import { ScrollView, View, TouchableOpacity, TextInput, Alert, StatusBar, RefreshControl } from 'react-native'
import SuccessModal from '../components/SuccessModal'
import { Text } from '../components/Text'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { ShiftsStackParamList } from '../navigation/AppNavigator'
import { useShifts, applyToShift } from '../lib/hooks/useShifts'
import { useApplications } from '../lib/hooks/useApplications'
import { useProfessionRoles } from '../lib/hooks/useProfessionRoles'
import ScreenState from '../components/ScreenState'
import { ShiftsSkeleton } from '../components/Skeleton'
import { SearchIcon, ClockIcon, UsersIcon, CheckCircleIcon } from '../components/icons'
import { format } from 'date-fns'

type Props = NativeStackScreenProps<ShiftsStackParamList, 'ShiftList'>

const TYPE_FILTERS = ['All', 'Day', 'Late', 'Night']
const TYPE_COLOR: Record<string, string> = { Day: '#f59e0b', Late: '#03397B', Night: '#1e293b' }

function getShiftType(start: string): 'Day' | 'Late' | 'Night' {
  const h = new Date(start).getHours()
  if (h >= 7 && h < 15) return 'Day'
  if (h >= 15 && h < 20) return 'Late'
  return 'Night'
}

function safeFmt(dateStr: string, fmt: string): string {
  try {
    const d = new Date(dateStr)
    return isNaN(d.getTime()) ? '—' : format(d, fmt)
  } catch { return '—' }
}

export default function ShiftsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets()
  const [typeFilter, setTypeFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [applyingId, setApplyingId] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const { roles: professionRoles } = useProfessionRoles()

  const { shifts, loading, error, refetch } = useShifts({ status: 'open', limit: 50 })
  const { applications, refetch: refetchApps } = useApplications({ limit: 100 })

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await Promise.all([refetch(), refetchApps()])
    setRefreshing(false)
  }, [refetch, refetchApps])

  const appliedShiftIds = new Set(
    applications
      .filter(a => a.status !== 'withdrawn' && a.status !== 'rejected')
      .map(a => a.shiftId?._id)
      .filter(Boolean)
  )

  if (loading) return <ShiftsSkeleton />
  if (error)   return <ScreenState error={error} onRetry={refetch} />

  const filtered = (shifts || []).filter(s => {
    const type = getShiftType(s.startDateTime)
    return (typeFilter === 'All' || type === typeFilter) &&
      s.ward.toLowerCase().includes(search.toLowerCase()) &&
      !appliedShiftIds.has(s._id)
  })

  async function handleApply(shiftId: string) {
    if (applyingId) return
    setApplyingId(shiftId)
    try {
      await applyToShift(shiftId)
      setShowSuccess(true)
      refetch(); refetchApps()
    } catch (err: any) {
      const msg: string = err.message ?? ''
      if (msg.toLowerCase().includes('already')) Alert.alert('Already Applied', 'You have already applied for this shift.')
      else if (msg.toLowerCase().includes('capacity')) Alert.alert('Shift Full', 'This shift has been fully assigned.')
      else if (msg.toLowerCase().includes('eligible')) Alert.alert('Not Eligible', 'Your eligibility status prevents applying.')
      else Alert.alert('Error', msg || 'Could not submit your application.')
    } finally { setApplyingId(null) }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <StatusBar barStyle="light-content" backgroundColor="#03397B" />

      <SuccessModal
        visible={showSuccess}
        onClose={() => setShowSuccess(false)}
      />

      {/* Header */}
      <View style={{ backgroundColor: '#03397B', paddingTop: insets.top + 16, paddingBottom: 20, paddingHorizontal: 20 }}>
        <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>
          Browse
        </Text>
        <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 22, letterSpacing: -0.3, marginBottom: 14 }}>
          Find Shifts
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, height: 44, gap: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
          <SearchIcon width={15} height={15} stroke="rgba(255,255,255,0.5)" />
          <TextInput
            style={{ flex: 1, color: '#ffffff', fontSize: 14 }}
            placeholder="Search by ward..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Filter chips */}
      <View style={{ backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingVertical: 10, paddingHorizontal: 16 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {TYPE_FILTERS.map(f => (
              <TouchableOpacity key={f} onPress={() => setTypeFilter(f)}
                style={{ paddingHorizontal: 16, paddingVertical: 7, backgroundColor: typeFilter === f ? '#03397B' : '#f8fafc', borderWidth: 1.5, borderColor: typeFilter === f ? '#03397B' : '#e2e8f0' }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: typeFilter === f ? '#ffffff' : '#475569' }}>
                  {f === 'All' ? 'All Shifts' : f}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#03397B" colors={['#03397B']} />}>
        <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6 }}>
          <Text style={{ color: '#94a3b8', fontSize: 13 }}>
            <Text style={{ color: '#03397B', fontWeight: '700' }}>{filtered.length}</Text>
            {' '}shift{filtered.length !== 1 ? 's' : ''} available
          </Text>
        </View>

        <View style={{ paddingHorizontal: 16, gap: 10 }}>
          {filtered.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 56, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#f1f5f9' }}>
              <SearchIcon width={26} height={26} stroke="#cbd5e1" />
              <Text style={{ color: '#0f172a', fontWeight: '700', fontSize: 16, marginTop: 12, marginBottom: 6 }}>No shifts found</Text>
              <Text style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', paddingHorizontal: 32 }}>
                Try clearing your filters or check back later.
              </Text>
              <TouchableOpacity onPress={() => { setSearch(''); setTypeFilter('All') }}
                style={{ marginTop: 14, paddingHorizontal: 20, paddingVertical: 9, backgroundColor: '#03397B' }}>
                <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>Clear filters</Text>
              </TouchableOpacity>
            </View>
          ) : filtered.map(shift => {
            const type = getShiftType(shift.startDateTime)
            const alreadyApplied = appliedShiftIds.has(shift._id)
            const isApplying = applyingId === shift._id
            const accentColor = alreadyApplied ? '#16a34a' : (TYPE_COLOR[type] ?? '#03397B')
            const professionRole = professionRoles.find(r => r._id === shift.requiredProfession)

            return (
              <TouchableOpacity key={shift._id} activeOpacity={0.88}
                onPress={() => navigation.navigate('ShiftDetail', { shiftId: shift._id })}>
                <View style={{ backgroundColor: '#ffffff', borderRadius: 20, borderWidth: 1, borderColor: '#f1f5f9', padding: 14 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <View style={{ flex: 1, marginRight: 12 }}>
                      <Text style={{ color: '#0f172a', fontWeight: '800', fontSize: 16 }}>{shift.ward}</Text>
                      <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>
                        {professionRole?.roleName ?? shift.requiredRole.replace(/_/g, ' ')}
                      </Text>
                    </View>
                    <View style={{ paddingHorizontal: 10, paddingVertical: 4, backgroundColor: `${accentColor}18`, borderRadius: 8 }}>
                      <Text style={{ color: accentColor, fontSize: 11, fontWeight: '700' }}>{type}</Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 14 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                      <Text style={{ color: '#94a3b8', fontSize: 11 }}>📅</Text>
                      <Text style={{ color: '#475569', fontSize: 12, fontWeight: '500' }}>
                        {safeFmt(shift.startDateTime, 'EEE d MMM')}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                      <Text style={{ color: '#94a3b8', fontSize: 11 }}>🕐</Text>
                      <Text style={{ color: '#475569', fontSize: 12, fontWeight: '500' }}>
                        {safeFmt(shift.startDateTime, 'HH:mm')} – {safeFmt(shift.endDateTime, 'HH:mm')}
                      </Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <UsersIcon width={11} height={11} stroke="#4B5563" />
                      <Text style={{ color: '#94a3b8', fontSize: 11 }}>
                        {shift.requiredCount - shift.assignedCount} spot{shift.requiredCount - shift.assignedCount !== 1 ? 's' : ''} left
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity
                        style={{ paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8 }}
                        onPress={() => navigation.navigate('ShiftDetail', { shiftId: shift._id })}
                      >
                        <Text style={{ color: '#475569', fontSize: 12, fontWeight: '600' }}>Details</Text>
                      </TouchableOpacity>
                      {alreadyApplied ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0', borderRadius: 8 }}>
                          <CheckCircleIcon width={12} height={12} stroke="#16a34a" />
                          <Text style={{ color: '#16a34a', fontSize: 12, fontWeight: '700' }}>Applied</Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          disabled={applyingId !== null}
                          style={{ paddingHorizontal: 14, paddingVertical: 6, backgroundColor: isApplying ? '#7bafd4' : '#03397B', borderRadius: 8 }}
                          onPress={() => handleApply(shift._id)}
                        >
                          <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '700' }}>
                            {isApplying ? 'Applying…' : 'Apply Now'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )
          })}
        </View>
      </ScrollView>
    </View>
  )
}
