import SignInForm from '@/features/auth/sign-in/sign-in-form'
import { Form } from '@/components/ui/form'
import { useSignIn } from '@/features/auth/sign-in/use-sign-in'
import { SubmitHandler } from 'react-hook-form'
import BackgroundLogin from '/images/soft-violet-lavender-abstract.png'
import { SignInSchemaType } from '@/features/auth/sign-in/validators'
export default function SignInPage() {
  const { methods, signInMutation, isPending } = useSignIn()

  const onSubmit: SubmitHandler<SignInSchemaType> = async (data) => {
    signInMutation.mutate(data)
  }

  return (
    <div className='relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-violet-50 to-violet-100'>
      <div className='absolute inset-0 z-0'>
        <img
          src={BackgroundLogin || '/placeholder.svg'}
          alt='background login'
          className='object-cover opacity-40 w-full'
        />
        <div className='absolute inset-0 bg-gradient-to-br from-violet-500/10 to-violet-300/20' />
      </div>
      <div className='absolute -left-20 -top-20 h-64 w-64 rounded-full bg-violet-200/50 blur-3xl' />
      <div className='absolute -right-20 bottom-1/3 h-80 w-80 rounded-full bg-violet-300/40 blur-3xl' />
      <div className='absolute bottom-20 left-1/4 h-40 w-40 rounded-full bg-purple-200/30 blur-2xl' />
      <div className='relative z-10 flex min-h-screen items-center justify-center px-4 py-12'>
        <Form {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className='w-96 flex flex-col gap-4'>
            <SignInForm isPending={isPending} />
          </form>
        </Form>
      </div>
    </div>
  )
}
