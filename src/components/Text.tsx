import { Text as RNText, StyleSheet, type TextProps, type TextStyle } from 'react-native'

/**
 * Drop-in replacement for React Native's <Text>.
 * Automatically applies GT Walsheim based on fontWeight.
 *
 * Usage: import { Text } from '../components/Text'
 */

// Global font scale — increase this value to bump all text up uniformly
const FONT_SCALE = 1.15

const FONT_MAP: Record<string, string> = {
  '100': 'GTWalsheim-Light',
  '200': 'GTWalsheim-Light',
  '300': 'GTWalsheim-Light',
  '400': 'GTWalsheim-Regular',
  'normal': 'GTWalsheim-Regular',
  '500': 'GTWalsheim-Medium',
  '600': 'GTWalsheim-Medium',
  '700': 'GTWalsheim-Bold',
  'bold': 'GTWalsheim-Bold',
  '800': 'GTWalsheim-Black',
  '900': 'GTWalsheim-Black',
}

export function Text({ style, ...props }: TextProps) {
  const flat = (StyleSheet.flatten(style) ?? {}) as TextStyle

  const weight = String(flat.fontWeight ?? '400')
  const fontFamily = flat.fontFamily ?? FONT_MAP[weight] ?? 'GTWalsheim-Regular'

  const fontSize = flat.fontSize != null
    ? Math.round(flat.fontSize * FONT_SCALE)
    : Math.round(14 * FONT_SCALE)  // default base size

  return (
    <RNText
      {...props}
      style={{ ...flat, fontFamily, fontSize, fontWeight: undefined }}
    />
  )
}
