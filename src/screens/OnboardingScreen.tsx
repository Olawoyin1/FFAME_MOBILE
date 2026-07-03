import { useRef, useState } from 'react'
import {
  View, TouchableOpacity, Dimensions,
  ScrollView, StatusBar, StyleSheet
} from 'react-native'
import { Text } from '../components/Text'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '../context/AuthContext'
import { SvgXml } from 'react-native-svg'

// Import SVG strings
import {
  MedicalCareSvgStr,
  DoctorsOrdersSvgStr,
  DoctorsSvgStr
} from '../lib/svg-strings'

const { width: W } = Dimensions.get('window')

const SLIDES = [
  {
    id: '1',
    pill: 'NHS Staff',
    title: 'Smarter\nworkforce.',
    body: 'FFAME connects healthcare professionals with shifts across NHS trusts — secure and compliant.',
    svgXml: DoctorsSvgStr,
  },
  {
    id: '2',
    pill: 'Shifts',
    title: 'Find shifts.\nApply fast.',
    body: 'Browse available shifts by ward, date, or type with real-time status updates.',
    svgXml: MedicalCareSvgStr,
  },
  {
    id: '3',
    pill: 'Schedule',
    title: 'All shifts,\none view.',
    body: 'A personal calendar, earnings tracker, and notification centre — right in your pocket.',
    svgXml: DoctorsOrdersSvgStr,
  },
]

export default function OnboardingScreen() {
  const { completeOnboarding } = useAuth()
  const insets = useSafeAreaInsets()
  const scrollRef = useRef<ScrollView>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const isLast = activeIndex === SLIDES.length - 1

  function goNext() {
    if (!isLast) {
      const next = activeIndex + 1
      scrollRef.current?.scrollTo({ x: next * W, animated: true })
      setActiveIndex(next)
    } else {
      completeOnboarding()
    }
  }

  function handleScroll(e: { nativeEvent: { contentOffset: { x: number } } }) {
    const idx = Math.round(e.nativeEvent.contentOffset.x / W)
    if (idx !== activeIndex) setActiveIndex(idx)
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Top Bar - Logo Only */}
      <View style={[styles.topBar, { paddingTop: insets.top + 16 }]}>
        <View style={styles.logoRow}>
          <View style={styles.logoDot} />
          <Text style={styles.logo}>FFAME</Text>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={styles.scroll}
      >
        {SLIDES.map((s) => (
          <View key={s.id} style={styles.slide}>
            <View style={styles.imageContainer}>
              <SvgXml xml={s.svgXml} width={W * 0.75} height={W * 0.55} />
            </View>

            <View style={[styles.textContent, { paddingBottom: insets.bottom + 160 }]}>
              <View style={styles.pillContainer}>
                <Text style={styles.pillText}>{s.pill}</Text>
              </View>
              <Text style={styles.title}>{s.title}</Text>
              <Text style={styles.body}>{s.body}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom || 16 }]}>
        <View style={styles.indicatorContainer}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.indicator,
                activeIndex === i && styles.indicatorActive
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          onPress={goNext}
          activeOpacity={0.8}
          style={styles.button}
        >
          <Text style={styles.buttonText}>{isLast ? 'Get Started' : 'Continue'}</Text>
        </TouchableOpacity>

        {/* Skip button below continue */}
        {!isLast ? (
          <TouchableOpacity onPress={completeOnboarding} style={styles.skipBtnWrapper}>
            <Text style={styles.skipBtn}>Skip for now</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.skipBtnWrapper}>
            <Text style={[styles.skipBtn, { color: 'transparent' }]}>-</Text>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  topBar: {
    paddingHorizontal: 28,
    position: 'absolute',
    top: 0, left: 0, right: 0,
    zIndex: 10,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: '#00A39D',
  },
  logo: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0a0a0a',
    letterSpacing: 1,
  },
  scroll: {
    flex: 1,
  },
  slide: {
    width: W,
    flex: 1,
    paddingTop: 80,
  },
  imageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContent: {
    justifyContent: 'flex-end',
    paddingHorizontal: 28,
  },
  pillContainer: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(0,163,157,0.1)',
    borderRadius: 20,
    marginBottom: 20,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00A39D',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#0a0a0a',
    lineHeight: 40,
    letterSpacing: -1,
    marginBottom: 16,
  },
  body: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 22,
    fontWeight: '400',
    maxWidth: '95%',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 28,
    backgroundColor: '#ffffff',
    paddingTop: 16,
  },
  indicatorContainer: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 24,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e5e7eb',
  },
  indicatorActive: {
    width: 24,
    backgroundColor: '#005EB8',
  },
  button: {
    height: 56,
    backgroundColor: '#005EB8',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  skipBtnWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  skipBtn: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
})
