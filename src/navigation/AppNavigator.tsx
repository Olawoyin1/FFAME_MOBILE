import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { View } from 'react-native'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  HomeIcon, SearchIcon, ApplicationsIcon, BellIcon, ProfileIcon, CalendarIcon,
} from '../components/icons'
import { get } from '../lib/api'

function NotificationsTabIcon({ color }: { color: string }) {
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    let cancelled = false
    async function poll() {
      try {
        const res = await get<{ success: boolean; data: unknown[]; meta?: { unreadCount?: number } }>(
          '/notifications?limit=1',
        )
        if (!cancelled) setUnread(res.meta?.unreadCount ?? 0)
      } catch { /* silent — badge is non-critical */ }
    }
    poll()
    const interval = setInterval(poll, 60_000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [])

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <BellIcon width={ICON_SIZE} height={ICON_SIZE} stroke={color} />
      {unread > 0 && (
        <View style={{
          position: 'absolute', top: -3, right: -6,
          width: 7, height: 7, borderRadius: 4,
          backgroundColor: '#ef4444', borderWidth: 1.5, borderColor: '#ffffff',
        }} />
      )}
    </View>
  )
}

// Screens
import SplashScreen from '../screens/SplashScreen'
import OnboardingScreen from '../screens/OnboardingScreen'
import LoginScreen from '../screens/LoginScreen'
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen'
import ResetPasswordScreen from '../screens/ResetPasswordScreen'
import HomeScreen from '../screens/HomeScreen'
import ShiftsScreen from '../screens/ShiftsScreen'
import ShiftDetailScreen from '../screens/ShiftDetailScreen'
import ApplicationsScreen from '../screens/ApplicationsScreen'
import ScheduleScreen from '../screens/ScheduleScreen'
import NotificationsScreen from '../screens/NotificationsScreen'
import ProfileScreen from '../screens/ProfileScreen'
import ComplianceScreen from '../screens/ComplianceScreen'
import MyPayScreen from '../screens/MyPayScreen'

// ── Param lists ──────────────────────────────────────────────
export type RootStackParamList = {
  Onboarding: undefined
  Auth: undefined
  Main: undefined
}

export type AuthStackParamList = {
  Login: undefined
  ForgotPassword: undefined
  ResetPassword: undefined
}

export type ShiftsStackParamList = {
  ShiftList: undefined
  ShiftDetail: { shiftId: string }
}

export type HomeStackParamList = {
  HomeMain: undefined
  Compliance: undefined
}

export type ProfileStackParamList = {
  ProfileMain: undefined
  Compliance: undefined
  MyPay: undefined
}

export type TabParamList = {
  Home: undefined
  Shifts: undefined
  Applications: undefined
  Schedule: undefined
  Notifications: undefined
  Profile: undefined
}

// ── Navigators ───────────────────────────────────────────────
const RootStack = createNativeStackNavigator<RootStackParamList>()
const AuthStack = createNativeStackNavigator<AuthStackParamList>()
const HomeStackN = createNativeStackNavigator<HomeStackParamList>()
const ProfileStackN = createNativeStackNavigator<ProfileStackParamList>()
const ShiftsStack = createNativeStackNavigator<ShiftsStackParamList>()
const Tab = createBottomTabNavigator<TabParamList>()

// ── Auth stack ───────────────────────────────────────────────
function AuthStackScreen() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <AuthStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </AuthStack.Navigator>
  )
}

// ── Tab stacks ───────────────────────────────────────────────
function HomeStackScreen() {
  return (
    <HomeStackN.Navigator screenOptions={{ headerShown: false }}>
      <HomeStackN.Screen name="HomeMain" component={HomeScreen} />
      <HomeStackN.Screen name="Compliance" component={ComplianceScreen} />
    </HomeStackN.Navigator>
  )
}

function ProfileStackScreen() {
  return (
    <ProfileStackN.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStackN.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStackN.Screen name="Compliance" component={ComplianceScreen} />
      <ProfileStackN.Screen name="MyPay" component={MyPayScreen} />
    </ProfileStackN.Navigator>
  )
}

function ShiftsStackScreen() {
  return (
    <ShiftsStack.Navigator screenOptions={{ headerShown: false }}>
      <ShiftsStack.Screen name="ShiftList" component={ShiftsScreen} />
      <ShiftsStack.Screen name="ShiftDetail" component={ShiftDetailScreen} />
    </ShiftsStack.Navigator>
  )
}

// ── Bottom tab bar ────────────────────────────────────────────
const ACTIVE_COLOR = '#03397B'
const INACTIVE_COLOR = '#4B5563'
const ICON_SIZE = 22

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#f1f5f9',
          borderTopWidth: 1,
          height: 76,
          paddingBottom: 14,
          paddingTop: 10,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10, fontWeight: '600', marginTop: 3,
        },
        tabBarIcon: ({ focused, color }) => {
          if (route.name === 'Notifications') {
            return <NotificationsTabIcon color={color} />
          }
          const iconMap: Record<string, React.FC<any>> = {
            Home:         HomeIcon,
            Shifts:       SearchIcon,
            Applications: ApplicationsIcon,
            Schedule:     CalendarIcon,
            Profile:      ProfileIcon,
          }
          const SvgIcon = iconMap[route.name]
          return SvgIcon ? (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <SvgIcon width={ICON_SIZE} height={ICON_SIZE} stroke={color} />
            </View>
          ) : null
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStackScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Shifts" component={ShiftsStackScreen} options={{ title: 'Shifts' }} />
      <Tab.Screen name="Applications" component={ApplicationsScreen} options={{ title: 'Applications' }} />
      <Tab.Screen name="Schedule" component={ScheduleScreen} options={{ title: 'Schedule' }} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
      <Tab.Screen name="Profile" component={ProfileStackScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  )
}

// ── Splash / loading ─────────────────────────────────────────
function AppLoadingSplash() {
  return <SplashScreen />
}

// ── Root navigator ───────────────────────────────────────────
function RootNavigator() {
  const { user, loading, hasSeenOnboarding } = useAuth()

  if (loading) return <AppLoadingSplash />

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {!hasSeenOnboarding ? (
        <RootStack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ animation: 'fade' }}
        />
      ) : !user ? (
        <RootStack.Screen
          name="Auth"
          component={AuthStackScreen}
          options={{ animation: 'fade' }}
        />
      ) : (
        <RootStack.Screen
          name="Main"
          component={MainTabs}
          options={{ animation: 'fade' }}
        />
      )}
    </RootStack.Navigator>
  )
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  )
}
