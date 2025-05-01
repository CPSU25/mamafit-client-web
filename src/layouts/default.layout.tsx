import { Outlet } from 'react-router'

interface DefaultLayoutProps {
  layouts?: string[]
}

export default function DefaultLayout({ layouts = ['nav', 'sidebar', 'footer'] }: DefaultLayoutProps) {
  // This is the default layout for all pages
  // It can be used to wrap all pages with a common layout, such as a header and footer

  return (
    <main>
      <Outlet />
    </main>
  )
}
