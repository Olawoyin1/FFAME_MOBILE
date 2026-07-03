import { ScrollView, View, TouchableOpacity, Alert, StatusBar, Image } from 'react-native'
import { Text } from '../components/Text'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../lib/hooks/useProfile'
import { UserIcon, MailIcon, PhoneIcon, LocationIcon, ShieldIcon } from '../components/icons'
import { Briefcase, Building2, LogOut, Hash, RotateCcw } from 'lucide-react-native'

const LOGO = require('../../assets/ffame_logo.png')

const ELIG_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  active:                 { label: 'Verified',     color: '#16a34a', bg: '#dcfce7' },
  verified_and_compliant: { label: 'Verified',     color: '#16a34a', bg: '#dcfce7' },
  verification_pending:   { label: 'Pending',      color: '#d97706', bg: '#fef3c7' },
  inactive:               { label: 'Needs Review', color: '#dc2626', bg: '#fee2e2' },
  suspended:              { label: 'Suspended',    color: '#dc2626', bg: '#fee2e2' },
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View>
      <Text style={{ fontSize: 11, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
        {title}
      </Text>
      <View style={{ backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#f1f5f9' }}>
        {children}
      </View>
    </View>
  )
}

function Row({ Icon, label, value, last = false }: { Icon: any; label: string; value: string; last?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: last ? 0 : 1, borderBottomColor: '#f8fafc', gap: 12 }}>
      <View style={{ width: 32, height: 32, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' }}>
        <Icon width={15} height={15} stroke="#4B5563" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 11, color: '#94a3b8', marginBottom: 1 }}>{label}</Text>
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#0f172a' }}>{value || '—'}</Text>
      </View>
    </View>
  )
}

export default function ProfileScreen() {
  const { user, logout } = useAuth()
  const { profile } = useProfile()
  const insets = useSafeAreaInsets()
  if (!user) return null

  const initials = (user.name || '').split(' ').filter(Boolean).map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'U'
  const elig = ELIG_CONFIG[user.eligibilityStatus] ?? ELIG_CONFIG.verification_pending

  async function handleResetOnboarding() {
    Alert.alert('Reset Onboarding', 'This will show onboarding again on next launch.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', onPress: async () => {
        await AsyncStorage.removeItem('ffame_onboarding_done')
        Alert.alert('Done', 'Sign out and reopen the app.')
      }},
    ])
  }

  function handleLogout() {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: logout },
    ])
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <StatusBar barStyle="light-content" backgroundColor="#03397B" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>

        {/* Header */}
        <View style={{ backgroundColor: '#03397B', paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 28 }}>
          <Image source={LOGO} style={{ width: 80, height: 24, resizeMode: 'contain', tintColor: 'rgba(255,255,255,0.4)', marginBottom: 20 }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{ width: 64, height: 64, backgroundColor: '#00A39D', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 22 }}>{initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 20, letterSpacing: -0.3 }}>{user.name}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, marginTop: 3 }}>
                {profile?.specialty ?? user.specialty ?? 'Healthcare Professional'}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8, backgroundColor: elig.bg, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start' }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: elig.color }} />
                <Text style={{ color: elig.color, fontSize: 11, fontWeight: '700' }}>{elig.label}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ padding: 20, gap: 24 }}>

          <Section title="Profile Information">
            <Row Icon={UserIcon}     label="Full name"   value={user.name} />
            <Row Icon={MailIcon}     label="Email"       value={user.email} />
            <Row Icon={PhoneIcon}    label="Phone"       value={profile?.phone ?? '—'} />
            <Row Icon={Briefcase}    label="Specialty"   value={profile?.specialty ?? user.specialty ?? '—'} />
            <Row Icon={Building2}    label="Department"  value={profile?.department ?? user.department ?? '—'} />
            <Row Icon={LocationIcon} label="Location"    value={profile?.location ?? '—'} last />
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13, gap: 12 }}>
              <View style={{ width: 32, height: 32, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' }}>
                <Hash size={15} color="#94a3b8" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, color: '#94a3b8', marginBottom: 1 }}>User ID</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#03397B', fontFamily: 'monospace' }}>
                  {user?._id?.slice(0, 18) ?? ''}…
                </Text>
              </View>
            </View>
          </Section>

          <Section title="Platform Eligibility">
            <View style={{ padding: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <ShieldIcon width={16} height={16} stroke={elig.color} />
                <Text style={{ color: elig.color, fontWeight: '800', fontSize: 15 }}>{elig.label}</Text>
              </View>
              <Text style={{ color: '#64748b', fontSize: 13, lineHeight: 20 }}>
                Your identity is linked via NHS authentication and recorded on the FFAME platform. Eligibility is maintained by your Trust administrator.
              </Text>
            </View>
          </Section>

          <Section title="App Information">
            {[
              { label: 'Platform',    value: 'FFAME v1.0' },
              { label: 'Environment', value: 'NHS Mock Mode' },
              { label: 'Auth type',   value: user.authType === 'nhs' ? 'NHS Login' : 'Traditional' },
            ].map((item, i, arr) => (
              <View key={item.label} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: '#f8fafc' }}>
                <Text style={{ color: '#64748b', fontSize: 13 }}>{item.label}</Text>
                <Text style={{ color: '#03397B', fontSize: 13, fontWeight: '600' }}>{item.value}</Text>
              </View>
            ))}
          </Section>

          {/* Dev reset */}
          <TouchableOpacity onPress={handleResetOnboarding}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: '#e2e8f0', borderStyle: 'dashed', paddingVertical: 13, backgroundColor: '#ffffff' }}>
            <RotateCcw size={13} color="#94a3b8" />
            <Text style={{ color: '#94a3b8', fontSize: 13 }}>Reset onboarding (dev)</Text>
          </TouchableOpacity>

          {/* Sign out */}
          <TouchableOpacity onPress={handleLogout}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#fee2e2', borderWidth: 1, borderColor: '#fecaca', paddingVertical: 15 }}>
            <LogOut size={17} color="#dc2626" />
            <Text style={{ color: '#dc2626', fontWeight: '800', fontSize: 15 }}>Sign out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}
