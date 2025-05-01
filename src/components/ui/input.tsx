import * as React from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { ArrowBigUpDash, EyeIcon, EyeOffIcon } from 'lucide-react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  StartIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
  EndIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

function InputComponent(
  { StartIcon, EndIcon, className, type, ...props }: InputProps,
  ref: React.Ref<HTMLInputElement>
) {
  const [showPassword, setShowPassword] = React.useState(false)
  const [capsLockActive, setCapsLockActive] = React.useState(false)

  const handleKeyPress: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
    const capsLockOn = event.getModifierState('CapsLock')
    setCapsLockActive(capsLockOn)
  }

  const togglePasswordVisibility = () => setShowPassword(!showPassword)

  const inputClasses = cn(
    'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
    'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
    'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
    StartIcon && 'pl-10',
    type === 'password' && (!capsLockActive ? 'pr-8' : 'pr-16'),
    EndIcon && 'pr-10',
    className
  )

  return (
    <div className={cn('relative', className)}>
      {StartIcon && (
        <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
          <StartIcon className='size-4 text-muted-foreground' />
        </div>
      )}
      <input
        type={type === 'password' && showPassword ? 'text' : type}
        className={inputClasses}
        onKeyDown={handleKeyPress}
        ref={ref}
        {...props}
      />
      {EndIcon && (
        <div className='absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none'>
          <EndIcon className='size-4 text-muted-foreground' />
        </div>
      )}
      {type === 'password' && (
        <div className='absolute right-0 flex items-center pr-3 -translate-y-1/2 top-1/2 gap-x-1'>
          {showPassword ? (
            <EyeOffIcon className='cursor-pointer size-4 text-muted-foreground' onClick={togglePasswordVisibility} />
          ) : (
            <EyeIcon className='cursor-pointer size-4 text-muted-foreground' onClick={togglePasswordVisibility} />
          )}
          {capsLockActive && type === 'password' && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ArrowBigUpDash size={20} />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Caps Lock is on!</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )}
    </div>
  )
}

const Input = React.forwardRef(InputComponent)
Input.displayName = 'Input'

export { Input }
