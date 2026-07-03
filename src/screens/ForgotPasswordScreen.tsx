import { useState } from 'react'
import {
  View, TextInput, TouchableOpacity,
  ActivityIndicator, KeyboardAvoidingView, Platform,
  ScrollView, StatusBar, Image,
} from 'react-native'
import { Text } from '../components/Text'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { AuthStackParamList } from '../navigation/AppNavigator'
import { post } from '../lib/api'
import { ArrowLeftIcon } from '../components/icons'
import { ShieldCheck } from 'lucide-react-native'

const LOGO = require('../../assets/ffame_logo.png')

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>

export default function ForgotPasswordScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  async function handleSend() {
    if (!email.trim()) { setError('Please enter your email address.'); return }
    setError('')
    setLoading(true)
    try {
      await post('/auth/forgot-password', { email: email.trim() })
      setSent(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#ffffff' }}
    >
      <StatusBar barStyle="light-content" backgroundColor="#03397B" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 32 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Top band */}
        <View style={{ backgroundColor: '#03397B', paddingTop: insets.top + 40, paddingBottom: 40, paddingHorizontal: 28, alignItems: 'center' }}>
          <Image source={LOGO} style={{ width: 120, height: 40, resizeMode: 'contain', tintColor: '#ffffff' }} />
          <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, marginTop: 12, letterSpacing: 0.3 }}>
            Workforce Management Platform
          </Text>
        </View>

        {/* Form area */}
        <View style={{ flex: 1, paddingHorizontal: 28, paddingTop: 40 }}>
          {/* Back button */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 24 }}
          >
            <ArrowLeftIcon width={14} height={14} stroke="#03397B" />
            <Text style={{ fontSize: 13, color: '#03397B', fontWeight: '600' }}>Back to Sign in</Text>
          </TouchableOpacity>

          <Text style={{ fontSize: 26, fontWeight: '800', color: '#0f172a', letterSpacing: -0.5, marginBottom: 6 }}>
            Forgot password?
          </Text>
          <Text style={{ fontSize: 14, color: '#64748b', marginBottom: 32, lineHeight: 20 }}>
            Enter the email address linked to your account and we'll send you a reset link.
          </Text>

          {sent ? (
            <View style={{ backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0', padding: 20, alignItems: 'center', gap: 10 }}>
              <ShieldCheck size={28} color="#16a34a" />
              <Text style={{ color: '#15803d', fontWeight: '700', fontSize: 16, textAlign: 'center' }}>
                Check your email
              </Text>
              <Text style={{ color: '#15803d', fontSize: 13, textAlign: 'center', lineHeight: 18 }}>
                If an account exists for {email.trim()}, you'll receive a password reset link shortly.
              </Text>
            </View>
          ) : (
            <>
              {/* Email */}
              <View style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>
                  Email address
                </Text>
                <TextInput
                  style={{
                    height: 52, borderWidth: 1.5, borderColor: '#e2e8f0',
                    paddingHorizontal: 16, fontSize: 15, color: '#0f172a',
                    backgroundColor: '#f8fafc',
                  }}
                  placeholder="you@nhs.net"
                  placeholderTextColor="#94a3b8"
                  value={email}
                  onChangeText={t => { setEmail(t); setError('') }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>

              {/* Error */}
              {error ? (
                <Text style={{ color: '#ef4444', fontSize: 13, marginBottom: 16, marginTop: 4 }}>{error}</Text>
              ) : <View style={{ height: 16 }} />}

              {/* Send button */}
              <TouchableOpacity
                onPress={handleSend}
                disabled={loading}
                activeOpacity={0.85}
                style={{
                  height: 52, backgroundColor: '#03397B',
                  alignItems: 'center', justifyContent: 'center',
                  marginBottom: 24, opacity: loading ? 0.7 : 1,
                }}
              >
                {loading
                  ? <ActivityIndicator color="#ffffff" />
                  : <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '700', letterSpacing: 0.3 }}>Send reset link</Text>
                }
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
