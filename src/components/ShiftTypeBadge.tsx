import { View, StyleSheet } from 'react-native'
import { Text } from './Text'

interface Props {
  type: 'Day' | 'Late' | 'Night'
  size?: 'sm' | 'md'
}

const config: Record<string, { bg: string; text: string; label: string }> = {
  Day: { bg: '#fffbeb', text: '#d97706', label: '☀️ Day' },
  Late: { bg: '#eff6ff', text: '#005EB8', label: '🌆 Late' },
  Night: { bg: '#1e293b', text: '#e2e8f0', label: '🌙 Night' },
}

export default function ShiftTypeBadge({ type, size = 'md' }: Props) {
  const c = config[type] ?? config.Day
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
