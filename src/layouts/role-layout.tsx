import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { UserRole } from '@/types/user';

interface RoleLayoutProps {
  role: UserRole;
}

export function RoleLayout({ role }: RoleLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar role={role} className="w-64" />
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
} 