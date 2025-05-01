import { AppLayout, DefaultLayout, GuardLayout, GuestLayout } from '@/layouts'
import { HomePage, NotFoundPage, SignInPage } from '@/pages'
import { createBrowserRouter } from 'react-router'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      // Catch all routes that are not defined in the app
      {
        path: '/*',
        element: <NotFoundPage />
      },
      // Non-authenticated routes
      {
        element: <GuestLayout />,
        children: [
          {
            path: '/sign-in',
            element: <SignInPage />
          }
        ]
      },
      // Authenticated routes
      {
        element: <DefaultLayout />,
        children: [
          {
            path: '/',
            element: (
              <GuardLayout allowPermissions={['view:dasboard']}>
                <HomePage />
              </GuardLayout>
            )
          }
        ]
      }
    ]
  }
])
