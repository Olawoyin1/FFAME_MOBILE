import { useState } from 'react'
import {
  View, TextInput, TouchableOpacity,
  ActivityIndicator, KeyboardAvoidingView, Platform,
  ScrollView, StatusBar, Image, Alert,
} from 'react-native'
import { Text } from '../components/Text'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { AuthStackParamList } from '../navigation/AppNavigator'
import { post } from '../lib/api'
import { ArrowLeftIcon } from '../components/icons'
import { Eye, EyeOff } from 'lucide-react-native'

const LOGO = require('../../assets/ffame_logo.png')

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>

export default function ResetPasswordScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets()
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleReset() {
    if (!token.trim()) { setError('Please enter the reset token from your email.'); return }
    if (!newPassword)  { setError('Please enter a new password.'); return }
    if (newPassword.length < 8) { setError('Password must be at least 8 characters.'); return }
    setError('')
    setLoading(true)
    try {
      await post('/auth/reset-password', { token: token.trim(), newPassword })
      Alert.alert('Password reset', 'Your password has been reset. Please sign in with your new password.', [
        { text: 'Sign in', onPress: () => navigation.navigate('Login') },
      ])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not reset password. Please try again.')
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
            <Text style={{ fontSize: 13, color: '#03397B', fontWeight: '600' }}>Back</Text>
          </TouchableOpacity>

          <Text style={{ fontSize: 26, fontWeight: '800', color: '#0f172a', letterSpacing: -0.5, marginBottom: 6 }}>
            Reset password
          </Text>
          <Text style={{ fontSize: 14, color: '#64748b', marginBottom: 32, lineHeight: 20 }}>
            Enter the reset token from your email and choose a new password.
          </Text>

          {/* Reset token */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>
              Reset token
            </Text>
            <TextInput
              style={{
                height: 52, borderWidth: 1.5, borderColor: '#e2e8f0',
                paddingHorizontal: 16, fontSize: 15, color: '#0f172a',
                backgroundColor: '#f8fafc',
              }}
              placeholder="Paste token from your email"
              placeholderTextColor="#94a3b8"
              value={token}
              onChangeText={t => { setToken(t); setError('') }}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* New password */}
          <View style={{ marginBottom: 8 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>
              New password
            </Text>
            <View style={{ position: 'relative' }}>
              <TextInput
                style={{
                  height: 52, borderWidth: 1.5, borderColor: '#e2e8f0',
                  paddingHorizontal: 16, paddingRight: 48, fontSize: 15, color: '#0f172a',
                  backgroundColor: '#f8fafc',
                }}
                placeholder="At least 8 characters"
                placeholderTextColor="#94a3b8"
                value={newPassword}
                onChangeText={t => { setNewPassword(t); setError('') }}
                secureTextEntry={!showPw}
                autoComplete="new-password"
              />
              <TouchableOpacity
                onPress={() => setShowPw(v => !v)}
                style={{ position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center' }}
              >
                {showPw
                  ? <EyeOff size={18} color="#94a3b8" />
                  : <Eye size={18} color="#94a3b8" />
                }
              </TouchableOpacity>
            </View>
          </View>

          {/* Error */}
          {error ? (
            <Text style={{ color: '#ef4444', fontSize: 13, marginBottom: 16, marginTop: 4 }}>{error}</Text>
          ) : <View style={{ height: 16 }} />}

          {/* Reset button */}
          <TouchableOpacity
            onPress={handleReset}
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
              : <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '700', letterSpacing: 0.3 }}>Reset password</Text>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
