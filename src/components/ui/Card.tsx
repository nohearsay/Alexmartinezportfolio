import React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'elevated'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
}

type Variant = NonNullable<CardProps['variant']>
type Padding = NonNullable<CardProps['padding']>

const variantStyles: Record<Variant, string> = {
  default: 'bg-[var(--color-bg-elevated)] border border-[var(--color-border)]',
  glass: 'bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] shadow-[var(--glass-shadow)]',
  elevated: 'bg-[var(--color-bg-elevated)] shadow-[0_8px_30px_var(--color-card-shadow)] border border-transparent'
}

const paddingStyles: Record<Padding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8'
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, variant = 'default', padding = 'md', hover = false, className = '', ...props }, ref) => {
    // NOTE: this must NOT be `transition-all` — GSAP drives opacity/transform on
    // these cards for the [data-animate] scroll reveal, and a CSS transition on
    // the same properties fights the tween (and can leave it mid-flight).
    const baseStyles = 'rounded-xl transition-[box-shadow,background-color,border-color] duration-300 ease-out'

    const hoverStyles = hover
      ? 'hover:shadow-[0_12px_40px_var(--color-card-shadow)] hover:-translate-y-1'
      : ''

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant as Variant]} ${paddingStyles[padding as Padding]} ${hoverStyles} ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'