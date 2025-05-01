import SignInForm from '@/features/auth/sign-in/sign-in-form'
import { Form } from '@/components/ui/form'
import { useSignIn } from '@/features/auth/sign-in/use-sign-in'
import { SignInSchemaType } from '@/features/auth/sign-in/validators'
import { SubmitHandler } from 'react-hook-form'
import { Button } from '@/components/ui/button'

export default function SignInPage() {
  const { methods, isPending } = useSignIn()

  const onSubmit: SubmitHandler<SignInSchemaType> = async (data) => {
    console.log('data', data)
  }

  return (
    <Form {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className='w-96 flex flex-col gap-4'>
        <SignInForm />
        <Button type='submit' isLoading={isPending}>
          Let's Go!
        </Button>
      </form>
    </Form>
  )
}
