import { z } from 'zod'

export const signInSchema = z.object({
  identifier: z.string().nonempty({
    message: 'Email or username is required'
  }),
  password: z.string().min(8, {
    message: 'Password must be at least 8 characters long'
  })
})

export type SignInSchemaType = z.infer<typeof signInSchema>
