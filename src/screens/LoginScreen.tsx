import { useState } from 'react'
import {
  View, TextInput, TouchableOpacity, Image,
  ActivityIndicator, KeyboardAvoidingView, Platform,
  ScrollView, StatusBar,
} from 'react-native'
import { Text } from '../components/Text'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react-native'

const LOGO = require('../../assets/ffame_logo.png')

export default function LoginScreen() {
  const { login } = useAuth()
  const insets = useSafeAreaInsets()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    if (!email || !password) { setError('Please fill in all fields.'); return }
    setError('')
    setLoading(true)
    try { await login(email, password) }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'Login failed') }
    finally { setLoading(false) }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#ffffff' }}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
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
          <Text style={{ fontSize: 26, fontWeight: '800', color: '#0f172a', letterSpacing: -0.5, marginBottom: 6 }}>
            Welcome back
          </Text>
          <Text style={{ fontSize: 14, color: '#64748b', marginBottom: 32 }}>
            Sign in to access your NHS shifts
          </Text>

          {/* Email */}
          <View style={{ marginBottom: 16 }}>
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

          {/* Password */}
          <View style={{ marginBottom: 8 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>
              Password
            </Text>
            <View style={{ position: 'relative' }}>
              <TextInput
                style={{
                  height: 52, borderWidth: 1.5, borderColor: '#e2e8f0',
                  paddingHorizontal: 16, paddingRight: 48, fontSize: 15, color: '#0f172a',
                  backgroundColor: '#f8fafc',
                }}
                placeholder="Enter your password"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={t => { setPassword(t); setError('') }}
                secureTextEntry={!showPw}
                autoComplete="password"
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

          {/* Sign in button */}
          <TouchableOpacity
            onPress={handleLogin}
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
              : <Text style={{ color: '#ffffff', fontSize: 15, fontWeight: '700', letterSpacing: 0.3 }}>Sign in</Text>
            }
          </TouchableOpacity>

          {/* Trust badge */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, backgroundColor: '#f0f9ff', borderWidth: 1, borderColor: '#bae6fd' }}>
            <ShieldCheck size={15} color="#0369a1" />
            <Text style={{ fontSize: 12, color: '#0369a1', flex: 1, lineHeight: 18 }}>
              Access is restricted to verified NHS staff only.
            </Text>
          </View>

          {/* Dev shortcut */}
          <TouchableOpacity
            onPress={() => { setEmail('hp.nurse@ffame.dev'); setPassword('DevTest123') }}
            style={{ marginTop: 28, alignSelf: 'center' }}
          >
            <Text style={{ fontSize: 12, color: '#94a3b8', textDecorationLine: 'underline' }}>
              Fill demo credentials
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
