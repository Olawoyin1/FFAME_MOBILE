import { View, StyleSheet } from 'react-native'
import { Text } from './Text'

type Status = 'pending' | 'approved' | 'rejected' | 'confirmed' | 'verified' | 'suspended' | 'assigned'

interface Props { status: Status; size?: 'sm' | 'md' }

const config: Record<Status, { bg: string; text: string; label: string }> = {
  pending: { bg: '#fffbeb', text: '#d97706', label: 'Pending' },
  approved: { bg: '#f0fdf4', text: '#16a34a', label: 'Approved' },
  confirmed: { bg: '#f0fdf4', text: '#16a34a', label: 'Confirmed' },
  rejected: { bg: '#fef2f2', text: '#dc2626', label: 'Rejected' },
  verified: { bg: '#f0fdf4', text: '#16a34a', label: 'Verified' },
  suspended: { bg: '#fef2f2', text: '#dc2626', label: 'Suspended' },
  assigned: { bg: '#f5f3ff', text: '#7c3aed', label: 'Assigned' },
}

export default function StatusBadge({ status, size = 'md' }: Props) {
  const c = config[status] ?? config.pending
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[
        styles.label,
        { color: c.text, fontSize: size === 'sm' ? 10 : 12 },
      ]}>
        {c.label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  label: {
    fontWeight: '700',
  },
})
