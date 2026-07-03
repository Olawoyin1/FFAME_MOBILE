import './global.css'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useFonts } from 'expo-font'
import { AuthProvider } from './src/context/AuthContext'
import AppNavigator from './src/navigation/AppNavigator'

export default function App() {
  const [fontsLoaded] = useFonts({
    'GTWalsheim-Light':   require('./assets/font/GT-Walsheim-Light-Trial.otf'),
    'GTWalsheim-Regular': require('./assets/font/GT-Walsheim-Regular-Trial.otf'),
    'GTWalsheim-Medium':  require('./assets/font/GT-Walsheim-Medium-Trial.otf'),
    'GTWalsheim-Bold':    require('./assets/font/GT-Walsheim-Bold-Trial.otf'),
    'GTWalsheim-Black':   require('./assets/font/GT-Walsheim-Black-Trial.otf'),
  })

  if (!fontsLoaded) return null

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  )
}
