import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'ghost' | 'outline'
interface Props extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: Variant }

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = 'primary', ...rest }, ref,
) {
  const styles =
    variant === 'primary' ? 'btn btn-primary'
    : variant === 'outline' ? 'btn border border-white/10 text-white/70 hover:bg-white/5 hover:text-white'
    : 'btn btn-ghost'
  return <button ref={ref} className={cn(styles, className)} {...rest} />
})
