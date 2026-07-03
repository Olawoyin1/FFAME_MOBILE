import { useEffect, useRef } from 'react'
import { View, Animated, StyleSheet } from 'react-native'
import { Text } from '../components/Text'

export default function SplashScreen() {
    const opacity = useRef(new Animated.Value(0)).current
    const translateY = useRef(new Animated.Value(12)).current
    const dotOpacity = useRef(new Animated.Value(0)).current

    useEffect(() => {
        Animated.sequence([
            Animated.parallel([
                Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
                Animated.timing(translateY, { toValue: 0, duration: 500, useNativeDriver: true }),
            ]),
            Animated.delay(300),
            Animated.timing(dotOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]).start()
    }, [])

    return (
        <View style={styles.root}>
            <Animated.View style={[styles.content, { opacity, transform: [{ translateY }] }]}>
                {/* Logo mark — minimal cross */}
                <View style={styles.logoMark}>
                    <View style={styles.crossH} />
                    <View style={styles.crossV} />
                </View>

                <Text style={styles.wordmark}>FFAME</Text>
                <Text style={styles.tagline}>Right staff. Right place. Right time.</Text>
            </Animated.View>

            {/* Loading dots */}
            <Animated.View style={[styles.dotsRow, { opacity: dotOpacity }]}>
                {[0, 1, 2].map(i => (
                    <View
                        key={i}
                        style={[styles.dot, i === 1 && styles.dotActive]}
                    />
                ))}
            </Animated.View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>NHS-linked platform</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    root: {
        flex: 1, backgroundColor: '#ffffff',
        alignItems: 'center', justifyContent: 'center',
    },
    content: {
        alignItems: 'center',
    },
    logoMark: {
        width: 48, height: 48,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 20,
    },
    crossH: {
        position: 'absolute',
        width: 36, height: 6, borderRadius: 3,
        backgroundColor: '#005EB8',
    },
    crossV: {
        position: 'absolute',
        width: 6, height: 36, borderRadius: 3,
        backgroundColor: '#005EB8',
    },
    wordmark: {
        fontSize: 28, fontWeight: '800',
        color: '#0a0a0a', letterSpacing: 3,
        marginBottom: 10,
    },
    tagline: {
        fontSize: 13, color: '#9ca3af',
        fontWeight: '400', letterSpacing: 0.2,
    },
    dotsRow: {
        flexDirection: 'row', gap: 6,
        position: 'absolute', bottom: 100,
    },
    dot: {
        width: 5, height: 5, borderRadius: 2.5,
        backgroundColor: '#e5e7eb',
    },
    dotActive: { backgroundColor: '#005EB8' },
    footer: {
        position: 'absolute', bottom: 44,
    },
    footerText: {
        fontSize: 11, color: '#d1d5db',
        letterSpacing: 1.5, textTransform: 'uppercase',
    },
})
