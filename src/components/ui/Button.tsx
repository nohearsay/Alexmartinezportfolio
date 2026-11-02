import React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

type Variant = NonNullable<ButtonProps['variant']>
type Size = NonNullable<ButtonProps['size']>

const variantStyles: Record<Variant, string> = {
  primary: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] focus-visible:ring-[var(--color-primary)] shadow-[0_4px_14px_var(--color-card-shadow)]',
  secondary: 'bg-[var(--color-bg-elevated)] text-[var(--color-fg)] border border-[var(--color-border)] hover:bg-[var(--color-border)] focus-visible:ring-[var(--color-border)]',
  ghost: 'text-[var(--color-fg)] hover:bg-[var(--color-border)] focus-visible:ring-[var(--color-border)]'
}

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-7 py-3.5 text-lg'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'primary', size = 'md', isLoading = false, className = '', disabled, ...props }, ref) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2 font-medium rounded-lg
      transition-all duration-200 ease-out
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
    `

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant as Variant]} ${sizeStyles[size as Size]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'