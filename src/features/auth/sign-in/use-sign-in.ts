import { useForm } from 'react-hook-form'
import { signInSchema, type SignInSchemaType } from './validators'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'

const defaultValues: SignInSchemaType = {
  identifier: '',
  password: ''
}

export const useSignIn = () => {
  const methods = useForm<SignInSchemaType>({
    defaultValues,
    resolver: zodResolver(signInSchema)
  })

  const signInMutation = useMutation({
    mutationFn: async () => {}
  })

  return { methods, ...signInMutation }
}
