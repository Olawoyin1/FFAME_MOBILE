import { View, TouchableOpacity, ScrollView, StatusBar } from 'react-native'
import { Text } from '../components/Text'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNotifications } from '../lib/hooks/useNotifications'
import ScreenState from '../components/ScreenState'
import { NotificationsSkeleton } from '../components/Skeleton'
import { BellIcon, CheckCircleIcon, ShieldIcon } from '../components/icons'
import { Info, AlertTriangle, CheckCheck } from 'lucide-react-native'
import { format, isToday, isYesterday } from 'date-fns'

const TYPE_CONFIG = {
  shift:        { iconBg: '#dcfce7', iconColor: '#16a34a', Icon: CheckCircleIcon  },
  application:  { iconBg: '#dbeafe', iconColor: '#03397B', Icon: Info         },
  verification: { iconBg: '#dbeafe', iconColor: '#03397B', Icon: CheckCircleIcon  },
  compliance:   { iconBg: '#fef3c7', iconColor: '#d97706', Icon: AlertTriangle },
  system:       { iconBg: '#f1f5f9', iconColor: '#64748b', Icon: Info         },
  default:      { iconBg: '#dbeafe', iconColor: '#03397B', Icon: Info         },
}

function getConfig(category: string) {
  return TYPE_CONFIG[category as keyof typeof TYPE_CONFIG] ?? TYPE_CONFIG.default
}

function groupLabel(dateStr: string) {
  const d = new Date(dateStr)
  if (isToday(d))     return 'Today'
  if (isYesterday(d)) return 'Yesterday'
  return format(d, 'dd MMM yyyy')
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets()
  const { notifications, unreadCount, loading, error, refetch, markRead, markAllRead } = useNotifications()

  if (loading) return <NotificationsSkeleton />
  if (error)   return <ScreenState error={error} onRetry={refetch} />

  const grouped: Record<string, typeof notifications> = {}
  notifications.forEach(n => {
    const label = groupLabel(n.createdAt)
    if (!grouped[label]) grouped[label] = []
    grouped[label].push(n)
  })

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <StatusBar barStyle="light-content" backgroundColor="#03397B" />

      {/* Header */}
      <View style={{ backgroundColor: '#03397B', paddingTop: insets.top + 16, paddingBottom: 20, paddingHorizontal: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <View>
            <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>
              Inbox
            </Text>
            <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 22, letterSpacing: -0.3 }}>Notifications</Text>
            {unreadCount > 0 && (
              <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, marginTop: 2 }}>
                {unreadCount} unread
              </Text>
            )}
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllRead}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
              <CheckCheck size={13} color="#ffffff" />
              <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '600' }}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ padding: 16, gap: 24, paddingBottom: insets.bottom + 100 }}>
          {notifications.length === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: 60, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#f1f5f9' }}>
              <View style={{ width: 52, height: 52, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <CheckCheck size={22} color="#16a34a" />
              </View>
              <Text style={{ color: '#0f172a', fontWeight: '700', fontSize: 16, marginBottom: 4 }}>All caught up</Text>
              <Text style={{ color: '#94a3b8', fontSize: 13 }}>No notifications yet</Text>
            </View>
          )}

          {Object.entries(grouped).map(([label, items]) => (
            <View key={label}>
              <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                {label}
              </Text>
              <View style={{ gap: 8 }}>
                {items.map(n => {
                  const cfg = getConfig(n.category)
                  const Icon = cfg.Icon
                  return (
                    <TouchableOpacity key={n._id} activeOpacity={0.82} onPress={() => markRead(n._id)}>
                      <View style={{
                        flexDirection: 'row', gap: 12, backgroundColor: '#ffffff',
                        padding: 14, borderWidth: 1.5,
                        borderColor: !n.read ? '#bfdbfe' : '#f1f5f9',
                        borderLeftWidth: !n.read ? 3 : 1,
                        borderLeftColor: !n.read ? '#03397B' : '#f1f5f9',
                      }}>
                        <View style={{ width: 38, height: 38, backgroundColor: cfg.iconBg, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon size={17} color={cfg.iconColor} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3 }}>
                            <Text style={{ fontWeight: n.read ? '600' : '700', fontSize: 13, color: n.read ? '#374151' : '#0f172a', flex: 1, marginRight: 8 }}>
                              {n.title}
                            </Text>
                            {!n.read && <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#03397B', marginTop: 3, flexShrink: 0 }} />}
                          </View>
                          <Text style={{ color: '#64748b', fontSize: 12, lineHeight: 18 }}>{n.body}</Text>
                          <Text style={{ color: '#cbd5e1', fontSize: 11, marginTop: 5 }}>
                            {format(new Date(n.createdAt), 'HH:mm')}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}
