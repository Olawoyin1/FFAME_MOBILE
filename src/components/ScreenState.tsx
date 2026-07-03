import { View, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Text } from './Text'
import { AlertCircle, RefreshCw } from 'lucide-react-native'

interface Props {
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  loadingText?: string
}

export default function ScreenState({ loading, error, onRetry, loadingText = 'Loading…' }: Props) {
  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" color="#005EB8" />
        <Text style={{ color: '#94a3b8', fontSize: 14 }}>{loadingText}</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 32, backgroundColor: '#f8fafc' }}>
        <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center' }}>
          <AlertCircle size={26} color="#dc2626" />
        </View>
        <Text style={{ color: '#0f172a', fontWeight: '700', fontSize: 16, textAlign: 'center' }}>
          Something went wrong
        </Text>
        <Text style={{ color: '#64748b', fontSize: 13, textAlign: 'center', lineHeight: 20 }}>{error}</Text>
        {onRetry && (
          <TouchableOpacity onPress={onRetry}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 6,
              backgroundColor: '#005EB8', borderRadius: 16,
              paddingHorizontal: 18, paddingVertical: 10, marginTop: 4,
            }}>
            <RefreshCw size={14} color="#ffffff" />
            <Text style={{ color: '#ffffff', fontWeight: '600', fontSize: 13 }}>Try again</Text>
          </TouchableOpacity>
        )}
      </View>
    )
  }

  return null
}
