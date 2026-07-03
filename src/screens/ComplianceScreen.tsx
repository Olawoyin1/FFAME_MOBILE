import { View, ScrollView, TouchableOpacity, StatusBar } from 'react-native'
import { Text } from '../components/Text'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '../context/AuthContext'
import { useVerificationStatus } from '../lib/hooks/useVerificationStatus'
import { ShieldIcon } from '../components/icons'
import { ArrowLeft, Link } from 'lucide-react-native'
import { format } from 'date-fns'

type Props = { navigation: any }

const STATE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  verified_and_compliant: { label: 'Verified & Compliant', color: '#16a34a', bg: '#dcfce7' },
  non_compliant:          { label: 'Non-Compliant',        color: '#dc2626', bg: '#fee2e2' },
  verification_pending:   { label: 'Pending Verification', color: '#d97706', bg: '#fef3c7' },
  under_review:           { label: 'Under Review',         color: '#7c3aed', bg: '#ede9fe' },
}

function formatCheck(check: string): string {
  return check.toUpperCase().replace(/_/g, ' ')
}

export default function ComplianceScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets()
  const { user } = useAuth()
  const { verification, loading } = useVerificationStatus(user?._id)

  const state = STATE_CONFIG[verification?.complianceState ?? ''] ?? STATE_CONFIG.verification_pending
  const score = verification?.complianceScore ?? 0

  const scoreColor = score >= 80 ? '#16a34a' : score >= 60 ? '#d97706' : '#dc2626'

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
            <ShieldIcon width={20} height={20} stroke="#ffffff" />
          </View>
          <Text style={{ color: '#ffffff', fontSize: 22, fontWeight: '800', letterSpacing: -0.3 }}>My Compliance</Text>
        </View>

        {/* Score badge */}
        {!loading && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 18, paddingVertical: 10, alignItems: 'center', minWidth: 90 }}>
              <Text style={{ color: '#ffffff', fontSize: 36, fontWeight: '900', lineHeight: 42 }}>{score}%</Text>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 }}>Score</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ backgroundColor: state.bg, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start', marginBottom: 6 }}>
                <Text style={{ color: state.color, fontSize: 12, fontWeight: '800' }}>{state.label}</Text>
              </View>
              {verification?.lastRunAt && (
                <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>
                  Last verified: {format(new Date(verification.lastRunAt), 'dd MMM yyyy')}
                </Text>
              )}
            </View>
          </View>
        )}

        {loading && (
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>Loading compliance data…</Text>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 100, gap: 20 }}
      >
        {/* Score progress bar */}
        {!loading && verification && (
          <View style={{ backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#f1f5f9', padding: 16 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Compliance Score</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ flex: 1, height: 8, backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
                <View style={{ height: '100%', width: `${score}%`, backgroundColor: scoreColor }} />
              </View>
              <Text style={{ fontSize: 15, fontWeight: '800', color: scoreColor, minWidth: 40, textAlign: 'right' }}>{score}%</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 20, marginTop: 10 }}>
              {score >= 80
                ? <Text style={{ fontSize: 12, color: '#16a34a', fontWeight: '600' }}>Excellent — fully eligible to work</Text>
                : score >= 60
                  ? <Text style={{ fontSize: 12, color: '#d97706', fontWeight: '600' }}>Some checks need attention</Text>
                  : <Text style={{ fontSize: 12, color: '#dc2626', fontWeight: '600' }}>Action required — may affect eligibility</Text>
              }
            </View>
          </View>
        )}

        {/* Checks performed */}
        {!loading && verification && verification.checksPerformed.length > 0 && (
          <View style={{ backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#f1f5f9' }}>
            <View style={{ paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f8fafc' }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>Checks Performed</Text>
            </View>
            {verification.checksPerformed.map((check, i) => (
              <View
                key={i}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingVertical: 13,
                  borderBottomWidth: i < verification.checksPerformed.length - 1 ? 1 : 0,
                  borderBottomColor: '#f8fafc',
                  gap: 10,
                }}
              >
                <View style={{ width: 28, height: 28, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#16a34a', fontSize: 12, fontWeight: '800' }}>✓</Text>
                </View>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#0f172a' }}>{formatCheck(check)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Blockchain anchor */}
        {!loading && verification?.blockchainTxId && (
          <View style={{ backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#f1f5f9', padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Link size={14} color="#03397B" />
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>Verified on Blockchain</Text>
            </View>
            <Text style={{ fontSize: 12, color: '#64748b', fontFamily: 'monospace', lineHeight: 18 }} numberOfLines={2}>
              {verification.blockchainTxId}
            </Text>
            <View style={{ marginTop: 8, backgroundColor: '#eff6ff', paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start' }}>
              <Text style={{ color: '#03397B', fontSize: 11, fontWeight: '700' }}>Immutable verification record</Text>
            </View>
          </View>
        )}

        {/* Empty state */}
        {!loading && !verification && (
          <View style={{ backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#f1f5f9', padding: 32, alignItems: 'center' }}>
            <ShieldIcon width={40} height={40} stroke="#cbd5e1" />
            <Text style={{ color: '#94a3b8', fontSize: 15, fontWeight: '600', marginTop: 12, textAlign: 'center' }}>No verification data</Text>
            <Text style={{ color: '#cbd5e1', fontSize: 13, marginTop: 6, textAlign: 'center' }}>Your compliance check hasn't run yet. Your trust administrator will trigger this.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}
