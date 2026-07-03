import { useState, useEffect } from 'react'
import { ScrollView, View, TouchableOpacity, Alert, ActivityIndicator, StatusBar } from 'react-native'
import { Text } from '../components/Text'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { ShiftsStackParamList } from '../navigation/AppNavigator'
import { get } from '../lib/api'
import { applyToShift } from '../lib/hooks/useShifts'
import type { ApiShift } from '../lib/hooks/useShifts'
import type { ApiApplication } from '../lib/hooks/useApplications'
import ScreenState from '../components/ScreenState'
import { ArrowLeftIcon, ClockIcon, UsersIcon, CheckCircleIcon } from '../components/icons'
import { FileText } from 'lucide-react-native'
import { format, differenceInHours } from 'date-fns'

type Props = NativeStackScreenProps<ShiftsStackParamList, 'ShiftDetail'>

function getShiftType(start: string): 'Day' | 'Late' | 'Night' {
  const h = new Date(start).getHours()
  if (h >= 7 && h < 15) return 'Day'
  if (h >= 15 && h < 20) return 'Late'
  return 'Night'
}

const TYPE_COLOR: Record<string, string> = { Day: '#f59e0b', Late: '#03397B', Night: '#1e293b' }

export default function ShiftDetailScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets()
  const { shiftId } = route.params

  const [shift,    setShift]    = useState<ApiShift | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)
  const [applying, setApplying] = useState(false)
  const [applied,  setApplied]  = useState(false)

  async function fetchShift() {
    setLoading(true); setError(null)
    try {
      const [shiftRes, appsRes] = await Promise.all([
        get<{ success: boolean; data: ApiShift }>(`/shifts/${shiftId}`),
        get<{ success: boolean; data: ApiApplication[] }>(`/applications?shiftId=${shiftId}&limit=1`).catch(() => ({ success: false, data: [] as ApiApplication[] })),
      ])
      setShift(shiftRes.data)
      const existingApp = appsRes.data?.[0]
      if (existingApp && !['withdrawn', 'rejected'].includes(existingApp.status)) {
        setApplied(true)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchShift() }, [shiftId])

  if (loading || error) return <ScreenState loading={loading} error={error} onRetry={fetchShift} />
  if (!shift) return null

  const type        = getShiftType(shift.startDateTime)
  const accentColor = TYPE_COLOR[type]
  const startFmt    = format(new Date(shift.startDateTime), 'EEE d MMM · HH:mm')
  const endFmt      = format(new Date(shift.endDateTime), 'HH:mm')
  const durationHrs = differenceInHours(new Date(shift.endDateTime), new Date(shift.startDateTime))
  const spotsLeft   = shift.requiredCount - shift.assignedCount

  async function handleApply() {
    if (applied || applying) return
    setApplying(true)
    try {
      await applyToShift(shift!._id)
      setApplied(true)
      Alert.alert('Application Submitted', `Your application for ${shift!.ward} has been submitted. You'll be notified once reviewed.`)
    } catch (err: any) {
      const code = err.message ?? ''
      if (code.includes('already'))   Alert.alert('Already applied', 'You have already applied for this shift.')
      else if (code.includes('eligible')) Alert.alert('Not eligible', 'Your eligibility status does not allow applying right now.')
      else if (code.includes('capacity')) Alert.alert('Shift full', 'This shift is now fully filled.')
      else Alert.alert('Error', code || 'Could not submit application. Please try again.')
    } finally { setApplying(false) }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <StatusBar barStyle="light-content" backgroundColor={accentColor} />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={{ backgroundColor: accentColor, paddingTop: insets.top + 12, paddingBottom: 28, paddingHorizontal: 20 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}
            style={{ width: 36, height: 36, backgroundColor: 'rgba(0,0,0,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
            <ArrowLeftIcon width={18} height={18} stroke="#ffffff" />
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginBottom: 4 }}>
                {shift.requiredRole.replace(/_/g, ' ')}
              </Text>
              <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 26, letterSpacing: -0.5, lineHeight: 32 }}>
                {shift.ward}
              </Text>
            </View>
            <View style={{ backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 10, paddingVertical: 5 }}>
              <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '700' }}>{type}</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 }}>
            <ClockIcon width={12} height={12} stroke="rgba(255,255,255,0.65)" />
            <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>{startFmt} – {endFmt}</Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[
              { label: 'Pay Rate', value: shift.payRateRef ?? '£22/hr' },
              { label: 'Duration', value: `${durationHrs}h` },
              { label: 'Spots',    value: `${spotsLeft} left` },
            ].map(item => (
              <View key={item.label} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.15)', padding: 12 }}>
                <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 16 }}>{item.value}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10, marginTop: 2 }}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Body ── */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: insets.bottom + 108, gap: 14 }}>

          {/* Shift details */}
          <View>
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              Shift Details
            </Text>
            <View style={{ backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#f1f5f9' }}>
              {[
                { icon: UsersIcon, label: 'Ward',      value: shift.ward },
                { icon: UsersIcon,     label: 'Role',       value: shift.requiredRole.replace(/_/g, ' ') },
                { icon: ClockIcon,     label: 'Start',      value: format(new Date(shift.startDateTime), 'EEE d MMM yyyy · HH:mm') },
                { icon: ClockIcon,     label: 'End',        value: format(new Date(shift.endDateTime), 'EEE d MMM yyyy · HH:mm') },
                { icon: UsersIcon,     label: 'Spots left', value: `${spotsLeft} of ${shift.requiredCount}` },
              ].map((row, i, arr) => (
                <View key={row.label} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: '#f8fafc' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <row.icon size={13} color="#94a3b8" />
                    <Text style={{ color: '#64748b', fontSize: 13 }}>{row.label}</Text>
                  </View>
                  <Text style={{ color: '#0f172a', fontWeight: '600', fontSize: 13 }}>{row.value}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Skills */}
          {shift.skills?.length > 0 && (
            <View>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                Required Skills
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {shift.skills.map(skill => (
                  <View key={skill} style={{ backgroundColor: '#dbeafe', paddingHorizontal: 12, paddingVertical: 5 }}>
                    <Text style={{ color: '#03397B', fontSize: 12, fontWeight: '600' }}>{skill.replace(/_/g, ' ')}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Notes */}
          {shift.notes && (
            <View style={{ backgroundColor: '#f0f9ff', padding: 16, borderWidth: 1, borderColor: '#bae6fd' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <FileText size={13} color="#0369a1" />
                <Text style={{ color: '#0369a1', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 }}>Manager Notes</Text>
              </View>
              <Text style={{ color: '#0c4a6e', fontSize: 13, lineHeight: 20 }}>{shift.notes}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingBottom: insets.bottom + 12, paddingTop: 14, backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#f1f5f9' }}>
        {applied ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#f0fdf4', paddingVertical: 16, borderWidth: 1, borderColor: '#bbf7d0' }}>
            <CheckCircleIcon width={18} height={18} stroke="#16a34a" />
            <Text style={{ color: '#15803d', fontWeight: '700', fontSize: 15 }}>Application Submitted</Text>
          </View>
        ) : (
          <TouchableOpacity onPress={handleApply} disabled={applying} activeOpacity={0.85}
            style={{ height: 52, backgroundColor: applying ? '#7bafd4' : '#03397B', alignItems: 'center', justifyContent: 'center' }}>
            {applying
              ? <ActivityIndicator color="#ffffff" />
              : <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 15, letterSpacing: 0.3 }}>Apply for this shift</Text>
            }
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}
