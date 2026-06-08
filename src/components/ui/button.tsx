import * as React from 'react'
import { cn } from '@/lib/utils/cn'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'default',
            'bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
            'border border-border bg-transparent hover:bg-muted': variant === 'outline',
            'hover:bg-muted': variant === 'ghost',
            'bg-destructive text-destructive-foreground hover:bg-destructive/90': variant === 'destructive',
          },
          {
            'h-7 px-2.5 text-xs': size === 'sm',
            'h-9 px-4': size === 'md',
            'h-11 px-6 text-base': size === 'lg',
            'h-8 w-8 p-0': size === 'icon',
          },
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button }
