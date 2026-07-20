import { View, ScrollView, TouchableOpacity, StatusBar } from 'react-native'
import { Text } from '../components/Text'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useMyPay, wardOf, titleOf, type ApiTimesheet, type TimesheetStatus } from '../lib/hooks/useMyPay'
import ScreenState from '../components/ScreenState'
import { ArrowLeft, Wallet, Clock, Banknote } from 'lucide-react-native'
import { format } from 'date-fns'

type Props = { navigation: any }

const STATUS_CONFIG: Record<TimesheetStatus, { label: string; color: string; bg: string }> = {
  pending_attendance: { label: 'Awaiting sign-off', color: '#64748b', bg: '#f1f5f9' },
  submitted:          { label: 'Awaiting approval', color: '#d97706', bg: '#fef3c7' },
  approved:           { label: 'Approved',           color: '#00A39D', bg: '#ccfbf1' },
  paid:               { label: 'Paid',               color: '#16a34a', bg: '#dcfce7' },
}

const ATTENDANCE_NOTE: Partial<Record<ApiTimesheet['attendanceStatus'], string>> = {
  no_show: 'Marked as no-show',
  partial: 'Partial attendance — pay pro-rated',
}

function fmtGbp(pence: number) {
  return `£${(pence / 100).toFixed(2)}`
}

function safeFmt(dateStr: string) {
  try {
    const d = new Date(dateStr)
    return isNaN(d.getTime()) ? '—' : format(d, 'dd MMM yyyy')
  } catch { return '—' }
}

function hoursOf(ts: ApiTimesheet): number {
  return ts.authorisedHours ?? ts.regularHours + ts.overtimeHours
}

export default function MyPayScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets()
  const { timesheets, total, loading, error, refetch } = useMyPay()

  const totalPaid = timesheets.filter(t => t.status === 'paid').reduce((s, t) => s + t.totalPayPence, 0)
  const pendingCount = timesheets.filter(t => t.status !== 'paid').length

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <StatusBar barStyle="light-content" backgroundColor="#03397B" />

      {/* Header */}
      <View style={{ backgroundColor: '#03397B', paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 28 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 }}>
          <ArrowLeft width={16} height={16} color="rgba(255,255,255,0.7)" />
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600' }}>Back</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <View style={{ width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}>
            <Wallet width={20} height={20} color="#ffffff" />
          </View>
          <Text style={{ color: '#ffffff', fontSize: 22, fontWeight: '800', letterSpacing: -0.3 }}>My Pay</Text>
        </View>

        {!loading && !error && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 18, paddingVertical: 10, alignItems: 'center', minWidth: 110 }}>
              <Text style={{ color: '#ffffff', fontSize: 28, fontWeight: '900', lineHeight: 34 }}>{fmtGbp(totalPaid)}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 }}>Total Paid</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '600' }}>
                {pendingCount} shift{pendingCount !== 1 ? 's' : ''} awaiting payment
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 3 }}>
                {total} shift{total !== 1 ? 's' : ''} worked in total
              </Text>
            </View>
          </View>
        )}
      </View>

      {(loading || error) ? (
        <ScreenState loading={loading} error={error} onRetry={refetch} loadingText="Loading your pay…" />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 100, gap: 20 }}
        >
          {timesheets.length === 0 ? (
            <View style={{ backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#f1f5f9', padding: 32, alignItems: 'center' }}>
              <Banknote width={40} height={40} color="#cbd5e1" />
              <Text style={{ color: '#94a3b8', fontSize: 15, fontWeight: '600', marginTop: 12, textAlign: 'center' }}>No shifts worked yet</Text>
              <Text style={{ color: '#cbd5e1', fontSize: 13, marginTop: 6, textAlign: 'center' }}>Your pay history will appear here once you've completed shifts.</Text>
            </View>
          ) : (
            <View style={{ backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#f1f5f9' }}>
              <View style={{ paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f8fafc' }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Shift History{timesheets.length < total ? ` (most recent ${timesheets.length} of ${total})` : ''}
                </Text>
              </View>
              {timesheets.map((ts, i) => {
                const cfg = STATUS_CONFIG[ts.status]
                return (
                  <View
                    key={ts._id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingHorizontal: 16,
                      paddingVertical: 13,
                      borderBottomWidth: i < timesheets.length - 1 ? 1 : 0,
                      borderBottomColor: '#f8fafc',
                      gap: 12,
                    }}
                  >
                    <View style={{ width: 32, height: 32, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' }}>
                      <Clock width={15} height={15} color="#4B5563" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#0f172a' }}>{titleOf(ts) ?? wardOf(ts)}</Text>
                      <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 1 }}>
                        {wardOf(ts)} · {safeFmt(ts.scheduledStart)} · {hoursOf(ts)}h
                      </Text>
                      {ATTENDANCE_NOTE[ts.attendanceStatus] && (
                        <Text style={{ fontSize: 11, color: '#d97706', marginTop: 2, fontWeight: '600' }}>
                          {ATTENDANCE_NOTE[ts.attendanceStatus]}
                        </Text>
                      )}
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      <Text style={{ fontSize: 14, fontWeight: '800', color: '#0f172a' }}>{fmtGbp(ts.totalPayPence)}</Text>
                      <View style={{ backgroundColor: cfg.bg, paddingHorizontal: 8, paddingVertical: 3 }}>
                        <Text style={{ color: cfg.color, fontSize: 10, fontWeight: '700' }}>{cfg.label}</Text>
                      </View>
                    </View>
                  </View>
                )
              })}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  )
}
