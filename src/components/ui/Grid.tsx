import React from 'react'

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 1 | 2 | 3 | 4 | { base: number; sm?: number; md?: number; lg?: number; xl?: number }
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

type Gap = NonNullable<GridProps['gap']>

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ children, columns = 1, gap = 'md', className = '', ...props }, ref) => {
    const columnClasses = (() => {
      if (typeof columns === 'number') {
        return `grid-cols-${columns}`
      }
      let cls = `grid-cols-${columns.base}`
      if (columns.sm) cls += ` sm:grid-cols-${columns.sm}`
      if (columns.md) cls += ` md:grid-cols-${columns.md}`
      if (columns.lg) cls += ` lg:grid-cols-${columns.lg}`
      if (columns.xl) cls += ` xl:grid-cols-${columns.xl}`
      return cls
    })()

    const gapClasses: Record<Gap, string> = {
      none: 'gap-0',
      xs: 'gap-2',
      sm: 'gap-3',
      md: 'gap-6',
      lg: 'gap-8',
      xl: 'gap-12'
    }

    return (
      <div
        ref={ref}
        className={`grid ${columnClasses} ${gapClasses[gap as Gap]} ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Grid.displayName = 'Grid'