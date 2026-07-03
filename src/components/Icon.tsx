import React from 'react'
import { SvgProps } from 'react-native-svg'

const DEFAULT_COLOR = '#4B5563'

interface IconProps extends SvgProps {
  svg: React.FC<SvgProps>
  size?: number
  color?: string
}

export function Icon({ svg: Svg, size = 24, color = DEFAULT_COLOR, ...rest }: IconProps) {
  return (
    <Svg
      width={size}
      height={size}
      color={color}
      stroke={color}
      fill="none"
      {...rest}
    />
  )
}
