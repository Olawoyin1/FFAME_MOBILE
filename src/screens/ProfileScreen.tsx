import {
  ScrollView, View, TouchableOpacity, Alert, StatusBar, Image,
  TextInput, Modal, ActivityIndicator,
} from 'react-native'
import { useState } from 'react'
import { Text } from '../components/Text'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../lib/hooks/useProfile'
import { useVerificationStatus } from '../lib/hooks/useVerificationStatus'
import { patch, post } from '../lib/api'
import { UserIcon, MailIcon, PhoneIcon, LocationIcon, ShieldIcon } from '../components/icons'
import { Briefcase, Building2, LogOut, Hash, RotateCcw, Eye, EyeOff, ChevronRight, Lock, Wallet } from 'lucide-react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { HomeStackParamList } from '../navigation/AppNavigator'

const LOGO = require('../../assets/ffame_logo.png')

const ELIG_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  active:                 { label: 'Verified',     color: '#16a34a', bg: '#dcfce7' },
  verified_and_compliant: { label: 'Verified',     color: '#16a34a', bg: '#dcfce7' },
  verification_pending:   { label: 'Pending',      color: '#d97706', bg: '#fef3c7' },
  inactive:               { label: 'Needs Review', color: '#dc2626', bg: '#fee2e2' },
  suspended:              { label: 'Suspended',    color: '#dc2626', bg: '#fee2e2' },
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

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

function EditField({
  label, value, onChangeText, placeholder, keyboardType,
}: {
  label: string
  value: string
  onChangeText: (v: string) => void
  placeholder?: string
  keyboardType?: any
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ fontSize: 11, color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 5 }}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? label}
        placeholderTextColor="#cbd5e1"
        keyboardType={keyboardType}
        style={{
          borderWidth: 1,
          borderColor: '#e2e8f0',
          backgroundColor: '#ffffff',
          paddingHorizontal: 12,
          paddingVertical: 11,
          fontSize: 14,
          color: '#0f172a',
          fontFamily: 'GTWalsheim-Regular',
        }}
      />
    </View>
  )
}

type Props = { navigation?: any }

export default function ProfileScreen({ navigation }: Props) {
  const { user, logout } = useAuth()
  const { profile, updateProfile } = useProfile()
  const { verification } = useVerificationStatus(user?._id)
  const insets = useSafeAreaInsets()

  // ── Edit profile state ────────────────────────────────────
  const [editing, setEditing] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [department, setDepartment] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  // ── Availability state ────────────────────────────────────
  const [editingAvail, setEditingAvail] = useState(false)
  const [availSlots, setAvailSlots] = useState<{ day: string; startTime: string; endTime: string }[]>([])
  const [newDay, setNewDay] = useState('Monday')
  const [newStart, setNewStart] = useState('')
  const [newEnd, setNewEnd] = useState('')
  const [savingAvail, setSavingAvail] = useState(false)
  const [availMsg, setAvailMsg] = useState<string | null>(null)
  const [availError, setAvailError] = useState<string | null>(null)
  const [dayPickerOpen, setDayPickerOpen] = useState(false)

  // ── Change password state ─────────────────────────────────
  const [pwModalVisible, setPwModalVisible] = useState(false)
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [pwSaving, setPwSaving] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)

  if (!user) return null

  const initials = (user.name || '').split(' ').filter(Boolean).map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'U'
  const elig = ELIG_CONFIG[user.eligibilityStatus] ?? ELIG_CONFIG.verification_pending

  // ── Handlers: Edit Profile ────────────────────────────────
  function openEdit() {
    const nameParts = (user.name || '').split(' ')
    setFirstName(profile?.firstName ?? nameParts[0] ?? '')
    setLastName(profile?.lastName ?? nameParts.slice(1).join(' ') ?? '')
    setPhone(profile?.phone ?? '')
    setSpecialty(profile?.specialty ?? user.specialty ?? '')
    setDepartment(profile?.department ?? user.department ?? '')
    setSaveMsg(null)
    setSaveError(null)
    setEditing(true)
  }

  function cancelEdit() {
    setEditing(false)
    setSaveMsg(null)
    setSaveError(null)
  }

  async function handleSaveProfile() {
    setSaving(true)
    setSaveError(null)
    setSaveMsg(null)
    try {
      await updateProfile({ firstName, lastName, phone, specialty, department })
      setSaveMsg('Profile updated')
      setTimeout(() => {
        setSaveMsg(null)
        setEditing(false)
      }, 1500)
    } catch (err: any) {
      setSaveError(err.message ?? 'Could not save profile')
    } finally {
      setSaving(false)
    }
  }

  // ── Handlers: Availability ────────────────────────────────
  function openAvailEdit() {
    setAvailSlots(profile?.availability ? [...profile.availability] : [])
    setNewDay('Monday')
    setNewStart('')
    setNewEnd('')
    setAvailMsg(null)
    setAvailError(null)
    setEditingAvail(true)
  }

  function cancelAvailEdit() {
    setEditingAvail(false)
    setAvailMsg(null)
    setAvailError(null)
  }

  function addAvailSlot() {
    if (!newStart || !newEnd) {
      setAvailError('Enter both start and end times (HH:MM)')
      return
    }
    const timeRe = /^\d{2}:\d{2}$/
    if (!timeRe.test(newStart) || !timeRe.test(newEnd)) {
      setAvailError('Times must be in HH:MM format')
      return
    }
    setAvailError(null)
    setAvailSlots(prev => [...prev, { day: newDay, startTime: newStart, endTime: newEnd }])
    setNewStart('')
    setNewEnd('')
  }

  function removeAvailSlot(index: number) {
    setAvailSlots(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSaveAvailability() {
    setSavingAvail(true)
    setAvailError(null)
    setAvailMsg(null)
    try {
      await patch('/profiles/me/availability', { availability: availSlots })
      setAvailMsg('Availability saved')
      setTimeout(() => {
        setAvailMsg(null)
        setEditingAvail(false)
      }, 1500)
    } catch (err: any) {
      setAvailError(err.message ?? 'Could not save availability')
    } finally {
      setSavingAvail(false)
    }
  }

  // ── Handlers: Change Password ─────────────────────────────
  function openPwModal() {
    setCurrentPw('')
    setNewPw('')
    setConfirmPw('')
    setPwError(null)
    setPwModalVisible(true)
  }

  function closePwModal() {
    setPwModalVisible(false)
    setPwError(null)
  }

  async function handleChangePassword() {
    if (!currentPw || !newPw || !confirmPw) {
      setPwError('All fields are required')
      return
    }
    if (newPw !== confirmPw) {
      setPwError('New passwords do not match')
      return
    }
    if (newPw.length < 8) {
      setPwError('New password must be at least 8 characters')
      return
    }
    setPwSaving(true)
    setPwError(null)
    try {
      await post('/auth/change-password', { currentPassword: currentPw, newPassword: newPw })
      closePwModal()
      Alert.alert('Password updated', 'Your password has been changed successfully.')
    } catch (err: any) {
      setPwError(err.message ?? 'Could not update password')
    } finally {
      setPwSaving(false)
    }
  }

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

  const currentAvailability = profile?.availability ?? []

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <StatusBar barStyle="light-content" backgroundColor="#03397B" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>

        {/* Header */}
        <View style={{ backgroundColor: '#03397B', paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 28 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <Image source={LOGO} style={{ width: 80, height: 24, resizeMode: 'contain', tintColor: 'rgba(255,255,255,0.4)' }} />
            {!editing && (
              <TouchableOpacity
                onPress={openEdit}
                style={{ backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 14, paddingVertical: 7 }}
              >
                <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: '600' }}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>
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

          {/* ── Profile Information ── */}
          <Section title="Profile Information">
            {editing ? (
              <View style={{ padding: 16 }}>
                <EditField label="First name" value={firstName} onChangeText={setFirstName} />
                <EditField label="Last name" value={lastName} onChangeText={setLastName} />
                <EditField label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                <EditField label="Specialty" value={specialty} onChangeText={setSpecialty} />
                <EditField label="Department" value={department} onChangeText={setDepartment} />

                {saveMsg && (
                  <View style={{ backgroundColor: '#dcfce7', borderWidth: 1, borderColor: '#bbf7d0', padding: 10, marginBottom: 12 }}>
                    <Text style={{ color: '#16a34a', fontSize: 13, fontWeight: '600' }}>{saveMsg}</Text>
                  </View>
                )}
                {saveError && (
                  <View style={{ backgroundColor: '#fee2e2', borderWidth: 1, borderColor: '#fecaca', padding: 10, marginBottom: 12 }}>
                    <Text style={{ color: '#dc2626', fontSize: 13 }}>{saveError}</Text>
                  </View>
                )}

                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity
                    onPress={cancelEdit}
                    style={{ flex: 1, borderWidth: 1, borderColor: '#e2e8f0', paddingVertical: 13, alignItems: 'center', backgroundColor: '#ffffff' }}
                  >
                    <Text style={{ color: '#64748b', fontWeight: '600', fontSize: 14 }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSaveProfile}
                    disabled={saving}
                    style={{ flex: 1, backgroundColor: '#03397B', paddingVertical: 13, alignItems: 'center' }}
                  >
                    {saving
                      ? <ActivityIndicator color="#ffffff" size="small" />
                      : <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 14 }}>Save</Text>
                    }
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
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
              </>
            )}
          </Section>

          {/* ── Availability ── */}
          <Section title="Availability">
            {editingAvail ? (
              <View style={{ padding: 16 }}>
                {/* Existing slots */}
                {availSlots.length === 0 ? (
                  <Text style={{ color: '#94a3b8', fontSize: 13, marginBottom: 12 }}>No slots added yet.</Text>
                ) : (
                  <View style={{ gap: 8, marginBottom: 16 }}>
                    {availSlots.map((slot, i) => (
                      <View key={i} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 12, paddingVertical: 10 }}>
                        <View>
                          <Text style={{ fontSize: 13, fontWeight: '700', color: '#0f172a' }}>{slot.day}</Text>
                          <Text style={{ fontSize: 12, color: '#64748b', marginTop: 1 }}>{slot.startTime} – {slot.endTime}</Text>
                        </View>
                        <TouchableOpacity onPress={() => removeAvailSlot(i)} style={{ width: 28, height: 28, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ color: '#dc2626', fontSize: 16, fontWeight: '700', lineHeight: 18 }}>×</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                {/* Add slot */}
                <View style={{ backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', padding: 12, marginBottom: 14 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>Add slot</Text>

                  {/* Day picker */}
                  <View style={{ marginBottom: 10 }}>
                    <Text style={{ fontSize: 11, color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 5 }}>Day</Text>
                    <TouchableOpacity
                      onPress={() => setDayPickerOpen(p => !p)}
                      style={{ borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff', paddingHorizontal: 12, paddingVertical: 11, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <Text style={{ fontSize: 14, color: '#0f172a' }}>{newDay}</Text>
                      <ChevronRight size={14} color="#94a3b8" style={{ transform: [{ rotate: dayPickerOpen ? '270deg' : '90deg' }] }} />
                    </TouchableOpacity>
                    {dayPickerOpen && (
                      <View style={{ borderWidth: 1, borderTopWidth: 0, borderColor: '#e2e8f0', backgroundColor: '#ffffff' }}>
                        {DAYS.map(d => (
                          <TouchableOpacity
                            key={d}
                            onPress={() => { setNewDay(d); setDayPickerOpen(false) }}
                            style={{ paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', backgroundColor: d === newDay ? '#eff6ff' : '#ffffff' }}
                          >
                            <Text style={{ fontSize: 14, color: d === newDay ? '#03397B' : '#0f172a', fontWeight: d === newDay ? '700' : '400' }}>{d}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>

                  <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 11, color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 5 }}>Start (HH:MM)</Text>
                      <TextInput
                        value={newStart}
                        onChangeText={setNewStart}
                        placeholder="08:00"
                        placeholderTextColor="#cbd5e1"
                        keyboardType="numbers-and-punctuation"
                        maxLength={5}
                        style={{ borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff', paddingHorizontal: 12, paddingVertical: 11, fontSize: 14, color: '#0f172a', fontFamily: 'GTWalsheim-Regular' }}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 11, color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 5 }}>End (HH:MM)</Text>
                      <TextInput
                        value={newEnd}
                        onChangeText={setNewEnd}
                        placeholder="16:00"
                        placeholderTextColor="#cbd5e1"
                        keyboardType="numbers-and-punctuation"
                        maxLength={5}
                        style={{ borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff', paddingHorizontal: 12, paddingVertical: 11, fontSize: 14, color: '#0f172a', fontFamily: 'GTWalsheim-Regular' }}
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={addAvailSlot}
                    style={{ backgroundColor: '#0f172a', paddingVertical: 11, alignItems: 'center' }}
                  >
                    <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 13 }}>+ Add</Text>
                  </TouchableOpacity>
                </View>

                {availMsg && (
                  <View style={{ backgroundColor: '#dcfce7', borderWidth: 1, borderColor: '#bbf7d0', padding: 10, marginBottom: 12 }}>
                    <Text style={{ color: '#16a34a', fontSize: 13, fontWeight: '600' }}>{availMsg}</Text>
                  </View>
                )}
                {availError && (
                  <View style={{ backgroundColor: '#fee2e2', borderWidth: 1, borderColor: '#fecaca', padding: 10, marginBottom: 12 }}>
                    <Text style={{ color: '#dc2626', fontSize: 13 }}>{availError}</Text>
                  </View>
                )}

                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity
                    onPress={cancelAvailEdit}
                    style={{ flex: 1, borderWidth: 1, borderColor: '#e2e8f0', paddingVertical: 13, alignItems: 'center', backgroundColor: '#ffffff' }}
                  >
                    <Text style={{ color: '#64748b', fontWeight: '600', fontSize: 14 }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSaveAvailability}
                    disabled={savingAvail}
                    style={{ flex: 1, backgroundColor: '#03397B', paddingVertical: 13, alignItems: 'center' }}
                  >
                    {savingAvail
                      ? <ActivityIndicator color="#ffffff" size="small" />
                      : <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 14 }}>Save Availability</Text>
                    }
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View>
                {currentAvailability.length === 0 ? (
                  <View style={{ padding: 16 }}>
                    <Text style={{ color: '#94a3b8', fontSize: 13 }}>No availability set — tap Edit to add.</Text>
                  </View>
                ) : (
                  <View>
                    {currentAvailability.map((slot, i) => (
                      <View key={i} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: i < currentAvailability.length - 1 ? 1 : 0, borderBottomColor: '#f8fafc', gap: 12 }}>
                        <View style={{ width: 32, height: 32, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ color: '#03397B', fontSize: 10, fontWeight: '800' }}>{slot.day.slice(0, 3).toUpperCase()}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 13, fontWeight: '700', color: '#0f172a' }}>{slot.day}</Text>
                          <Text style={{ fontSize: 12, color: '#64748b', marginTop: 1 }}>{slot.startTime} – {slot.endTime}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
                <TouchableOpacity
                  onPress={openAvailEdit}
                  style={{ borderTopWidth: currentAvailability.length > 0 ? 1 : 0, borderTopColor: '#f1f5f9', paddingHorizontal: 16, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <Text style={{ color: '#03397B', fontSize: 13, fontWeight: '700' }}>Edit Availability</Text>
                </TouchableOpacity>
              </View>
            )}
          </Section>

          {/* ── Platform Eligibility ── */}
          <Section title="Platform Eligibility">
            <View style={{ padding: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <ShieldIcon width={16} height={16} stroke={elig.color} />
                  <Text style={{ color: elig.color, fontWeight: '800', fontSize: 15 }}>{elig.label}</Text>
                </View>
                {verification && (
                  <View style={{ backgroundColor: elig.bg, paddingHorizontal: 10, paddingVertical: 4 }}>
                    <Text style={{ color: elig.color, fontWeight: '800', fontSize: 13 }}>
                      {verification.complianceScore}%
                    </Text>
                  </View>
                )}
              </View>
              <Text style={{ color: '#64748b', fontSize: 13, lineHeight: 20 }}>
                Your identity is linked via NHS authentication and recorded on the FFAME platform. Eligibility is maintained by your Trust administrator.
              </Text>
              {verification?.lastRunAt && (
                <Text style={{ color: '#94a3b8', fontSize: 11, marginTop: 8 }}>
                  Last verified: {new Date(verification.lastRunAt).toLocaleDateString('en-GB')}
                </Text>
              )}
            </View>
          </Section>

          {/* ── My Compliance ── */}
          <Section title="Compliance">
            <TouchableOpacity
              onPress={() => navigation?.navigate('Compliance')}
              style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 }}
            >
              <View style={{ width: 32, height: 32, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldIcon width={15} height={15} stroke="#03397B" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#0f172a' }}>My Compliance</Text>
                <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 1 }}>View verification & compliance details</Text>
              </View>
              <ChevronRight size={16} color="#94a3b8" />
            </TouchableOpacity>
          </Section>

          {/* ── My Pay ── */}
          <Section title="Pay">
            <TouchableOpacity
              onPress={() => navigation?.navigate('MyPay')}
              style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 }}
            >
              <View style={{ width: 32, height: 32, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' }}>
                <Wallet size={15} color="#03397B" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#0f172a' }}>My Pay</Text>
                <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 1 }}>Shift history, hours & payment status</Text>
              </View>
              <ChevronRight size={16} color="#94a3b8" />
            </TouchableOpacity>
          </Section>

          {/* ── App Information ── */}
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

          {/* ── Security ── */}
          <Section title="Security">
            <TouchableOpacity
              onPress={openPwModal}
              style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 }}
            >
              <View style={{ width: 32, height: 32, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' }}>
                <Lock size={15} color="#4B5563" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#0f172a' }}>Change Password</Text>
              </View>
              <ChevronRight size={16} color="#94a3b8" />
            </TouchableOpacity>
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

      {/* ── Change Password Modal ── */}
      <Modal
        visible={pwModalVisible}
        animationType="slide"
        transparent
        onRequestClose={closePwModal}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#ffffff', paddingHorizontal: 20, paddingTop: 24, paddingBottom: insets.bottom + 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 17, fontWeight: '800', color: '#0f172a' }}>Change Password</Text>
              <TouchableOpacity onPress={closePwModal} style={{ paddingHorizontal: 8, paddingVertical: 4 }}>
                <Text style={{ color: '#64748b', fontSize: 14 }}>Cancel</Text>
              </TouchableOpacity>
            </View>

            {/* Current password */}
            <View style={{ marginBottom: 14 }}>
              <Text style={{ fontSize: 11, color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 5 }}>Current password</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff' }}>
                <TextInput
                  value={currentPw}
                  onChangeText={setCurrentPw}
                  secureTextEntry={!showCurrentPw}
                  placeholder="Enter current password"
                  placeholderTextColor="#cbd5e1"
                  style={{ flex: 1, paddingHorizontal: 12, paddingVertical: 11, fontSize: 14, color: '#0f172a', fontFamily: 'GTWalsheim-Regular' }}
                />
                <TouchableOpacity onPress={() => setShowCurrentPw(p => !p)} style={{ padding: 12 }}>
                  {showCurrentPw ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
                </TouchableOpacity>
              </View>
            </View>

            {/* New password */}
            <View style={{ marginBottom: 14 }}>
              <Text style={{ fontSize: 11, color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 5 }}>New password</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff' }}>
                <TextInput
                  value={newPw}
                  onChangeText={setNewPw}
                  secureTextEntry={!showNewPw}
                  placeholder="Min. 8 characters"
                  placeholderTextColor="#cbd5e1"
                  style={{ flex: 1, paddingHorizontal: 12, paddingVertical: 11, fontSize: 14, color: '#0f172a', fontFamily: 'GTWalsheim-Regular' }}
                />
                <TouchableOpacity onPress={() => setShowNewPw(p => !p)} style={{ padding: 12 }}>
                  {showNewPw ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm password */}
            <View style={{ marginBottom: 18 }}>
              <Text style={{ fontSize: 11, color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 5 }}>Confirm new password</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff' }}>
                <TextInput
                  value={confirmPw}
                  onChangeText={setConfirmPw}
                  secureTextEntry={!showConfirmPw}
                  placeholder="Repeat new password"
                  placeholderTextColor="#cbd5e1"
                  style={{ flex: 1, paddingHorizontal: 12, paddingVertical: 11, fontSize: 14, color: '#0f172a', fontFamily: 'GTWalsheim-Regular' }}
                />
                <TouchableOpacity onPress={() => setShowConfirmPw(p => !p)} style={{ padding: 12 }}>
                  {showConfirmPw ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
                </TouchableOpacity>
              </View>
            </View>

            {pwError && (
              <View style={{ backgroundColor: '#fee2e2', borderWidth: 1, borderColor: '#fecaca', padding: 10, marginBottom: 14 }}>
                <Text style={{ color: '#dc2626', fontSize: 13 }}>{pwError}</Text>
              </View>
            )}

            <TouchableOpacity
              onPress={handleChangePassword}
              disabled={pwSaving}
              style={{ backgroundColor: '#03397B', paddingVertical: 15, alignItems: 'center' }}
            >
              {pwSaving
                ? <ActivityIndicator color="#ffffff" size="small" />
                : <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 15 }}>Update Password</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}
