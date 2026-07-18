import { useState } from 'react'
import { View, TouchableOpacity, ScrollView, StatusBar, Alert } from 'react-native'
import { Text } from '../components/Text'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useApplications, withdrawApplication } from '../lib/hooks/useApplications'
import type { ApiApplication } from '../lib/hooks/useApplications'
import ScreenState from '../components/ScreenState'
import { ApplicationsSkeleton } from '../components/Skeleton'
import { ClockIcon, CheckCircleIcon, CalendarIcon } from '../components/icons'
import { XCircle, AlertCircle } from 'lucide-react-native'
import { format } from 'date-fns'

type TabKey = 'all' | 'applied' | 'approved' | 'assigned' | 'completed' | 'rejected'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all',       label: 'All'       },
  { key: 'applied',   label: 'Pending'   },
  { key: 'approved',  label: 'Approved'  },
  { key: 'assigned',  label: 'Assigned'  },
  { key: 'completed', label: 'Completed' },
  { key: 'rejected',  label: 'Rejected'  },
]

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string; Icon: any }> = {
  applied:        { label: 'Pending',    color: '#d97706', bg: '#fef3c7', Icon: ClockIcon        },
  pending_review: { label: 'In Review',  color: '#d97706', bg: '#fef3c7', Icon: ClockIcon        },
  approved:       { label: 'Approved',   color: '#16a34a', bg: '#dcfce7', Icon: CheckCircleIcon  },
  assigned:       { label: 'Assigned',   color: '#7c3aed', bg: '#ede9fe', Icon: CheckCircleIcon  },
  rejected:       { label: 'Rejected',   color: '#dc2626', bg: '#fee2e2', Icon: XCircle          },
  waitlisted:     { label: 'Waitlisted', color: '#64748b', bg: '#f1f5f9', Icon: ClockIcon        },
  withdrawn:      { label: 'Withdrawn',  color: '#94a3b8', bg: '#f8fafc', Icon: XCircle          },
  completed:      { label: 'Completed',  color: '#03397B', bg: '#dbeafe', Icon: CheckCircleIcon  },
}

/** Statuses that count as "pending" in the applied tab */
const APPLIED_STATUSES  = new Set(['applied', 'pending_review', 'waitlisted'])
/** Statuses that count as "rejected" in the rejected tab */
const REJECTED_STATUSES = new Set(['rejected', 'withdrawn'])
/**
 * Statuses that can be withdrawn — matches the backend rule exactly
 * (application.service.ts withdraw() only blocks ASSIGNED/COMPLETED),
 * so 'approved' must be withdrawable too, not just 'applied'/'waitlisted'.
 */
const WITHDRAWABLE = new Set(['applied', 'pending_review', 'waitlisted', 'approved'])

function filterForTab(apps: ApiApplication[], tab: TabKey): ApiApplication[] {
  if (tab === 'all')       return apps
  if (tab === 'applied')   return apps.filter(a => APPLIED_STATUSES.has(a.status))
  if (tab === 'approved')  return apps.filter(a => a.status === 'approved')
  if (tab === 'assigned')  return apps.filter(a => a.status === 'assigned')
  if (tab === 'completed') return apps.filter(a => a.status === 'completed')
  if (tab === 'rejected')  return apps.filter(a => REJECTED_STATUSES.has(a.status))
  return apps
}

function safeFmt(dateStr?: string, fmt = 'EEE d MMM') {
  if (!dateStr) return '—'
  try { const d = new Date(dateStr); return isNaN(d.getTime()) ? '—' : format(d, fmt) }
  catch { return '—' }
}

function shiftHours(start?: string, end?: string): string {
  if (!start || !end) return ''
  try {
    const diff = (new Date(end).getTime() - new Date(start).getTime()) / 3_600_000
    return isNaN(diff) || diff <= 0 ? '' : `${Math.round(diff)}h`
  } catch { return '' }
}

export default function ApplicationsScreen() {
  const insets = useSafeAreaInsets()
  const [activeTab, setActiveTab] = useState<TabKey>('all')
  const [withdrawing, setWithdrawing] = useState<string | null>(null)

  // Always fetch ALL applications — filtering is done locally
  const { applications, loading, error, refetch } = useApplications({ limit: 100 })

  if (loading) return <ApplicationsSkeleton />
  if (error)   return <ScreenState error={error} onRetry={refetch} />

  // Compute counts from all fetched applications
  const counts: Record<TabKey, number> = {
    all:       applications.length,
    applied:   applications.filter(a => APPLIED_STATUSES.has(a.status)).length,
    approved:  applications.filter(a => a.status === 'approved').length,
    assigned:  applications.filter(a => a.status === 'assigned').length,
    completed: applications.filter(a => a.status === 'completed').length,
    rejected:  applications.filter(a => REJECTED_STATUSES.has(a.status)).length,
  }

  // Filter for the active tab
  const visibleApps = filterForTab(applications, activeTab)

  async function handleWithdraw(app: ApiApplication) {
    Alert.alert(
      'Withdraw Application',
      'Are you sure you want to withdraw this application?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Withdraw',
          style: 'destructive',
          onPress: async () => {
            setWithdrawing(app._id)
            try {
              await withdrawApplication(app._id)
              await refetch()
            } catch (err: any) {
              Alert.alert('Error', err.message ?? 'Could not withdraw application. Please try again.')
            } finally {
              setWithdrawing(null)
            }
          },
        },
      ],
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <StatusBar barStyle="light-content" backgroundColor="#03397B" />

      {/* Header */}
      <View style={{ backgroundColor: '#03397B', paddingTop: insets.top + 16, paddingBottom: 20, paddingHorizontal: 20 }}>
        <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>
          Tracking
        </Text>
        <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 22, letterSpacing: -0.3, marginBottom: 2 }}>
          My Applications
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>
          {counts.all} total · {counts.applied} pending review
        </Text>
      </View>

      {/* Tab bar */}
      <View style={{ backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8, flexDirection: 'row' }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.key
            return (
              <TouchableOpacity key={tab.key} onPress={() => setActiveTab(tab.key)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6,
                  paddingHorizontal: 14, paddingVertical: 7,
                  backgroundColor: isActive ? '#03397B' : '#f8fafc',
                  borderWidth: 1.5, borderColor: isActive ? '#03397B' : '#e2e8f0',
                }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: isActive ? '#ffffff' : '#64748b' }}>
                  {tab.label}
                </Text>
                {counts[tab.key] > 0 && (
                  <View style={{ minWidth: 18, height: 18, borderRadius: 2, backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : '#e2e8f0', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }}>
                    <Text style={{ color: isActive ? '#fff' : '#64748b', fontSize: 10, fontWeight: '700' }}>{counts[tab.key]}</Text>
                  </View>
                )}
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: insets.bottom + 100 }}>
        {visibleApps.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 60, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#f1f5f9', marginTop: 8 }}>
            <AlertCircle size={26} color="#cbd5e1" />
            <Text style={{ color: '#0f172a', fontWeight: '700', fontSize: 16, marginTop: 12, marginBottom: 6 }}>No applications yet</Text>
            <Text style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', paddingHorizontal: 40 }}>
              Browse available shifts and apply to see them here.
            </Text>
          </View>
        ) : visibleApps.map(app => {
          const s = STATUS_STYLE[app.status] ?? STATUS_STYLE.applied
          const { Icon } = s
          const ward      = app.shiftId?.ward ?? '—'
          const role      = app.shiftId?.requiredRole?.replace(/_/g, ' ') ?? '—'
          const dateStr   = safeFmt(app.shiftId?.startDateTime, 'EEE d MMM')
          const timeStr   = app.shiftId?.startDateTime ? safeFmt(app.shiftId.startDateTime, 'HH:mm') : ''
          const endTime   = app.shiftId?.endDateTime   ? safeFmt(app.shiftId.endDateTime,   'HH:mm') : ''
          const hrs       = shiftHours(app.shiftId?.startDateTime, app.shiftId?.endDateTime)
          const appliedOn = safeFmt(app.createdAt, 'd MMM yyyy')
          const canWithdraw = WITHDRAWABLE.has(app.status)
          const isWithdrawing = withdrawing === app._id

          return (
            <View key={app._id} style={{ backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#f1f5f9' }}>
              {/* Accent bar */}
              <View style={{ height: 3, backgroundColor: s.color }} />
              <View style={{ padding: 14 }}>
                {/* Ward + status */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={{ color: '#0f172a', fontWeight: '800', fontSize: 16, letterSpacing: -0.2 }}>{ward}</Text>
                    <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2, textTransform: 'capitalize' }}>{role}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: s.bg, paddingHorizontal: 10, paddingVertical: 5 }}>
                    <Icon size={11} color={s.color} />
                    <Text style={{ color: s.color, fontSize: 11, fontWeight: '700' }}>{s.label}</Text>
                  </View>
                </View>

                <View style={{ height: 1, backgroundColor: '#f1f5f9', marginBottom: 10 }} />

                {/* Date / time */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <CalendarIcon width={12} height={12} stroke="#4B5563" />
                    <Text style={{ color: '#475569', fontSize: 12 }}>{dateStr}</Text>
                  </View>
                  {timeStr ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                      <ClockIcon width={12} height={12} stroke="#4B5563" />
                      <Text style={{ color: '#475569', fontSize: 12 }}>
                        {timeStr}{endTime ? ` – ${endTime}` : ''}
                      </Text>
                    </View>
                  ) : null}
                  {hrs ? (
                    <View style={{ backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 3 }}>
                      <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '700' }}>{hrs}</Text>
                    </View>
                  ) : null}
                </View>

                <Text style={{ color: '#cbd5e1', fontSize: 11, marginTop: 8 }}>Applied {appliedOn}</Text>

                {/* Rejection reason */}
                {app.status === 'rejected' && (
                  <Text style={{ color: '#dc2626', fontSize: 12, marginTop: 8, fontWeight: '600', lineHeight: 17 }}>
                    {app.rejectionReason
                      ? `Reason: ${app.rejectionReason}`
                      : 'No reason provided. Contact your ward manager for details.'}
                  </Text>
                )}

                {/* Withdraw button */}
                {canWithdraw && (
                  <TouchableOpacity
                    onPress={() => handleWithdraw(app)}
                    disabled={isWithdrawing}
                    style={{
                      marginTop: 10,
                      alignSelf: 'flex-start',
                      borderWidth: 1,
                      borderColor: '#ef4444',
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      opacity: isWithdrawing ? 0.5 : 1,
                    }}
                  >
                    <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: '700' }}>
                      {isWithdrawing ? 'Withdrawing…' : 'Withdraw'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )
        })}
      </ScrollView>
    </View>
  )
}
