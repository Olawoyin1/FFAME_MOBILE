import { useEffect, useRef } from 'react'
import { Animated, View, type ViewStyle } from 'react-native'

interface SkeletonProps {
  width?: number | string
  height?: number
  borderRadius?: number
  style?: ViewStyle
}

// Single animated shimmer bone
export default function Skeleton({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.4)).current

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1,   duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    )
    anim.start()
    return () => anim.stop()
  }, [opacity])

  return (
    <Animated.View
      style={[
        { width: width as any, height, borderRadius, backgroundColor: '#e2e8f0', opacity },
        style,
      ]}
    />
  )
}

// ── Pre-built skeleton layouts ────────────────────────────

// Home screen skeleton
export function HomeSkeleton() {
  const inset = 24
  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      {/* Header placeholder */}
      <View style={{ backgroundColor: '#ffffff', paddingTop: 60, paddingHorizontal: inset, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: '#f4f4f5' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ gap: 8 }}>
            <Skeleton width={80}  height={12} />
            <Skeleton width={160} height={24} />
            <Skeleton width={120} height={12} style={{ marginTop: 4 }} />
          </View>
          <Skeleton width={48} height={48} borderRadius={24} />
        </View>
      </View>

      {/* Stat cards */}
      <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: inset, marginTop: 24 }}>
        {[0, 1, 2].map(i => (
          <View key={i} style={{ flex: 1, backgroundColor: '#ffffff', borderRadius: 20, padding: 16, alignItems: 'center', gap: 8 }}>
            <Skeleton width={36} height={36} borderRadius={10} />
            <Skeleton width={32} height={22} />
            <Skeleton width={56} height={10} />
          </View>
        ))}
      </View>

      {/* Section title */}
      <View style={{ paddingHorizontal: inset, marginTop: 32, marginBottom: 16 }}>
        <Skeleton width={140} height={18} />
      </View>

      {/* Shift cards */}
      <View style={{ paddingHorizontal: inset, gap: 12 }}>
        {[0, 1, 2].map(i => (
          <View key={i} style={{ backgroundColor: '#ffffff', borderRadius: 24, padding: 16, gap: 10, borderWidth: 1, borderColor: '#f4f4f5' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Skeleton width={120} height={16} />
              <Skeleton width={60}  height={16} borderRadius={12} />
            </View>
            <Skeleton width={160} height={12} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Skeleton width={60} height={24} borderRadius={12} />
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Skeleton width={64} height={32} borderRadius={14} />
                <Skeleton width={80} height={32} borderRadius={14} />
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

// Shifts / list screen skeleton
export function ShiftsSkeleton() {
  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      {/* Blue header */}
      <View style={{ backgroundColor: '#005EB8', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, gap: 12 }}>
        <Skeleton width={100} height={12} borderRadius={6} style={{ opacity: 0.4 } as any} />
        <Skeleton width={160} height={22} style={{ opacity: 0.4 } as any} />
        <Skeleton height={48} borderRadius={16} style={{ opacity: 0.2 } as any} />
      </View>
      {/* Filter chips */}
      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingVertical: 14 }}>
        {[80, 60, 60, 70].map((w, i) => <Skeleton key={i} width={w} height={34} borderRadius={20} />)}
      </View>
      {/* Cards */}
      <View style={{ paddingHorizontal: 20, gap: 12 }}>
        {[0, 1, 2, 3].map(i => (
          <View key={i} style={{ backgroundColor: '#ffffff', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#f1f5f9' }}>
            <Skeleton height={3} borderRadius={0} />
            <View style={{ padding: 16, gap: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Skeleton width={130} height={16} />
                <Skeleton width={50} height={16} borderRadius={12} />
              </View>
              <Skeleton width={180} height={11} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Skeleton width={56} height={24} borderRadius={12} />
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Skeleton width={60} height={30} borderRadius={20} />
                  <Skeleton width={84} height={30} borderRadius={20} />
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

// Applications screen skeleton
export function ApplicationsSkeleton() {
  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      {/* Blue header */}
      <View style={{ backgroundColor: '#005EB8', paddingTop: 60, paddingBottom: 24, paddingHorizontal: 20, gap: 10 }}>
        <Skeleton width={140} height={22} style={{ opacity: 0.4 } as any} />
        <Skeleton width={100} height={12} style={{ opacity: 0.3 } as any} />
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
          {[0, 1, 2].map(i => (
            <Skeleton key={i} height={56} style={{ flex: 1, opacity: 0.2 } as any} borderRadius={14} />
          ))}
        </View>
      </View>
      {/* Tabs */}
      <View style={{ backgroundColor: '#ffffff', flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}>
        {[80, 70, 80, 80, 70].map((w, i) => <Skeleton key={i} width={w} height={34} borderRadius={20} />)}
      </View>
      {/* Cards */}
      <View style={{ padding: 16, gap: 10 }}>
        {[0, 1, 2].map(i => (
          <View key={i} style={{ backgroundColor: '#ffffff', borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: '#f1f5f9', padding: 16, gap: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ gap: 6 }}>
                <Skeleton width={140} height={17} />
                <Skeleton width={100} height={12} />
              </View>
              <Skeleton width={72} height={28} borderRadius={20} />
            </View>
            <Skeleton height={1} borderRadius={0} style={{ backgroundColor: '#f1f5f9' } as any} />
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <Skeleton width={90} height={12} />
              <Skeleton width={100} height={12} />
              <Skeleton width={32} height={22} borderRadius={8} />
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

// Notifications screen skeleton
export function NotificationsSkeleton() {
  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={{ backgroundColor: '#005EB8', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, gap: 8 }}>
        <Skeleton width={160} height={22} style={{ opacity: 0.4 } as any} />
        <Skeleton width={120} height={12} style={{ opacity: 0.3 } as any} />
      </View>
      <View style={{ padding: 20, gap: 10 }}>
        <Skeleton width={60} height={11} />
        {[0, 1, 2, 3].map(i => (
          <View key={i} style={{ flexDirection: 'row', gap: 12, backgroundColor: '#ffffff', borderRadius: 18, padding: 14, borderWidth: 1, borderColor: '#f1f5f9' }}>
            <Skeleton width={40} height={40} borderRadius={20} />
            <View style={{ flex: 1, gap: 8 }}>
              <Skeleton width={'70%' as any} height={13} />
              <Skeleton width={'90%' as any} height={11} />
              <Skeleton width={40} height={10} />
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

// Profile screen skeleton
export function ProfileSkeleton() {
  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      {/* Header */}
      <View style={{ backgroundColor: '#ffffff', paddingTop: 60, paddingHorizontal: 24, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: '#f4f4f5' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <Skeleton width={72} height={72} borderRadius={36} />
          <View style={{ gap: 8 }}>
            <Skeleton width={140} height={18} />
            <Skeleton width={100} height={12} />
            <Skeleton width={80} height={24} borderRadius={12} />
          </View>
        </View>
      </View>
      {/* Card */}
      <View style={{ paddingHorizontal: 24, paddingTop: 24, gap: 12 }}>
        <View style={{ backgroundColor: '#ffffff', borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: '#f4f4f5' }}>
          <View style={{ padding: 14, backgroundColor: '#fafafa', borderBottomWidth: 1, borderBottomColor: '#f4f4f5' }}>
            <Skeleton width={120} height={11} />
          </View>
          {[0, 1, 2, 3, 4, 5].map(i => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: i < 5 ? 1 : 0, borderBottomColor: '#f4f4f5' }}>
              <Skeleton width={36} height={36} borderRadius={12} />
              <View style={{ gap: 6 }}>
                <Skeleton width={60}  height={10} />
                <Skeleton width={120} height={14} />
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}
