import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/layouts/admin/app-sidebar'
import React from 'react'

const AdminHome = ({chilldren}:{chilldren: React.ReactNode}) => {
  return (
    <SidebarProvider>
        <AppSidebar/>
         <main>
            <SidebarTrigger />
            {chilldren}
         </main>
    </SidebarProvider>
  )
}
export default AdminHome