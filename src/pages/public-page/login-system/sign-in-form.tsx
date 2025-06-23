import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useFormContext } from 'react-hook-form'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { LayoutDashboard, LockKeyhole, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Logo from '/images/mamafit-logo.svg'
import { SignInSchemaType } from './validators'

interface SignInFormProps {
  isPending?: boolean
}

export default function SignInForm({ isPending }: SignInFormProps) {
  const { control } = useFormContext<SignInSchemaType>()

  return (
    <Card className='w-full max-w-md shadow-lg'>
      <CardHeader className='flex flex-col items-center space-y-2 pb-2 pt-6'>
        <div className='flex flex-col items-center gap-2'>
          <div className='flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-md '>
            <img src={Logo} alt='Mamafit logo' className='w-full h-full' />
          </div>
          <h2 className='mt-3 text-2xl font-bold text-violet-500'>MamaFit System</h2>
        </div>
      </CardHeader>
      <CardContent className='space-y-4 pb-3 pt-4'>
        <div className='flex flex-col gap-4 w-full'>
          <FormField
            control={control}
            // name='identifier'
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
      </CardContent>
      <CardFooter className=' px-6 pb-6'>
        <Button className='w-full bg-violet-600 hover:bg-violet-700' type='submit' isLoading={isPending}>
          <LayoutDashboard className='mr-2 h-4 w-4' />
          Sign In
        </Button>
      </CardFooter>
    </Card>
  )
}
