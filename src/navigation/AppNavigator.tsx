import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { View } from 'react-native'
import { useAuth } from '../context/AuthContext'
import {
  HomeIcon, SearchIcon, ApplicationsIcon, BellIcon, ProfileIcon,
} from '../components/icons'

// Screens
import SplashScreen from '../screens/SplashScreen'
import OnboardingScreen from '../screens/OnboardingScreen'
import LoginScreen from '../screens/LoginScreen'
import HomeScreen from '../screens/HomeScreen'
import ShiftsScreen from '../screens/ShiftsScreen'
import ShiftDetailScreen from '../screens/ShiftDetailScreen'
import ApplicationsScreen from '../screens/ApplicationsScreen'
import NotificationsScreen from '../screens/NotificationsScreen'
import ProfileScreen from '../screens/ProfileScreen'

// ── Param lists ──────────────────────────────────────────────
export type RootStackParamList = {
  Onboarding: undefined
  Auth: undefined
  Main: undefined
}

export type AuthStackParamList = {
  Login: undefined
}

export type ShiftsStackParamList = {
  ShiftList: undefined
  ShiftDetail: { shiftId: string }
}

export type HomeStackParamList = {
  HomeMain: undefined
}

export type TabParamList = {
  Home: undefined
  Shifts: undefined
  Applications: undefined
  Notifications: undefined
  Profile: undefined
}

// ── Navigators ───────────────────────────────────────────────
const RootStack = createNativeStackNavigator<RootStackParamList>()
const AuthStack = createNativeStackNavigator<AuthStackParamList>()
const HomeStackN = createNativeStackNavigator<HomeStackParamList>()
const ShiftsStack = createNativeStackNavigator<ShiftsStackParamList>()
const Tab = createBottomTabNavigator<TabParamList>()

// ── Auth stack ───────────────────────────────────────────────
function AuthStackScreen() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
    </AuthStack.Navigator>
  )
}

// ── Tab stacks ───────────────────────────────────────────────
function HomeStackScreen() {
  return (
    <HomeStackN.Navigator screenOptions={{ headerShown: false }}>
      <HomeStackN.Screen name="HomeMain" component={HomeScreen} />
    </HomeStackN.Navigator>
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
          const iconMap: Record<string, React.FC<any>> = {
            Home:         HomeIcon,
            Shifts:       SearchIcon,
            Applications: ApplicationsIcon,
            Notifications: BellIcon,
            Profile:      ProfileIcon,
          }
          const SvgIcon = iconMap[route.name]
          return SvgIcon ? (
            <View style={{ alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <SvgIcon width={ICON_SIZE} height={ICON_SIZE} stroke={color} />
              {route.name === 'Notifications' && (
                <View style={{
                  position: 'absolute', top: -3, right: -6,
                  width: 7, height: 7, borderRadius: 4,
                  backgroundColor: '#ef4444', borderWidth: 1.5, borderColor: '#ffffff',
                }} />
              )}
            </View>
          ) : null
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStackScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Shifts" component={ShiftsStackScreen} options={{ title: 'Shifts' }} />
      <Tab.Screen name="Applications" component={ApplicationsScreen} options={{ title: 'Applications' }} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Alerts' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
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
