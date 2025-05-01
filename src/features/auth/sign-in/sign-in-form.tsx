import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { LockKeyhole, UserRound } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import { SignInSchemaType } from './validators'

export default function SignInForm() {
  const { control } = useFormContext<SignInSchemaType>()

  return (
    <div className='flex flex-col gap-4 w-full'>
      <FormField
        control={control}
        name='identifier'
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input placeholder='Email or username' StartIcon={UserRound} autoFocus {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name='password'
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input type='password' placeholder='Password' StartIcon={LockKeyhole} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
