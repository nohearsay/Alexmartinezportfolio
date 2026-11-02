import React from 'react'

export interface TypeScaleProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div'
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl'
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  color?: 'default' | 'muted' | 'primary'
  variableFont?: {
    weight?: number
    width?: number
    slant?: number
  }
}

type Size = NonNullable<TypeScaleProps['size']>
type Weight = NonNullable<TypeScaleProps['weight']>
type Color = NonNullable<TypeScaleProps['color']>

export const TypeScale = React.forwardRef<HTMLElement, TypeScaleProps>(
  ({ children, as = 'p', size = 'base', weight = 'normal', color = 'default', variableFont, className = '', style, ...props }, ref) => {
    const sizeClasses: Record<Size, string> = {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
      '4xl': 'text-4xl',
      '5xl': 'text-5xl',
      '6xl': 'text-6xl'
    }

    const weightClasses: Record<Weight, string> = {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold'
    }

    const colorClasses: Record<Color, string> = {
      default: 'text-[var(--color-fg)]',
      muted: 'text-[var(--color-fg-muted)]',
      primary: 'text-[var(--color-primary)]'
    }

    const fontVariationSettings = variableFont
      ? `"wght" ${variableFont.weight ?? 400}, "wdth" ${variableFont.width ?? 100}, "slnt" ${variableFont.slant ?? 0}`
      : undefined

    const Component = as as React.ElementType

    return React.createElement(
      Component,
      {
        ref,
        className: `${sizeClasses[size as Size]} ${weightClasses[weight as Weight]} ${colorClasses[color as Color]} ${className}`,
        style: {
          ...style,
          fontVariationSettings,
          fontFamily: 'var(--font-sans)'
        } as React.CSSProperties,
        ...props
      },
      children
    )
  }
)

TypeScale.displayName = 'TypeScale';