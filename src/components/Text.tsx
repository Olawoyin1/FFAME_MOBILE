import { Text as RNText, type TextProps, type TextStyle } from 'react-native'

/**
 * Drop-in replacement for React Native's <Text>.
 * Automatically applies GT Walsheim based on fontWeight.
 *
 * Usage: import { Text } from '../components/Text'
 */

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
  const flat = (
    Array.isArray(style)
      ? Object.assign({}, ...style.filter(Boolean))
      : { ...(style ?? {}) }
  ) as TextStyle

  const weight = String(flat.fontWeight ?? '400')
  const fontFamily = flat.fontFamily ?? FONT_MAP[weight] ?? 'GTWalsheim-Regular'

  return (
    <RNText
      {...props}
      style={{ ...flat, fontFamily, fontWeight: undefined }}
    />
  )
}
