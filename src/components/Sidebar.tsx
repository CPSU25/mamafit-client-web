import { cn } from "@/lib/utils/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { UserRole } from "@/types/user";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  role: UserRole;
}

interface SidebarItem {
  title: string;
  href: string;
  icon?: React.ReactNode;
}

const getSidebarItems = (role: UserRole): SidebarItem[] => {
  const commonItems = [
    {
      title: "Dashboard",
      href: `/${role.split('_')[0]}/dashboard`,
    },
    {
      title: "Profile",
      href: `/${role.split('_')[0]}/profile`,
    },
  ];

  switch (role) {
    case 'admin':
      return [
        ...commonItems,
        {
          title: "Users",
          href: "/admin/users",
        },
        {
          title: "Settings",
          href: "/admin/settings",
        },
      ];
    case 'branch_manager':
      return [
        ...commonItems,
        {
          title: "POS",
          href: "/branch/pos",
        },
        {
          title: "Orders",
          href: "/branch/orders",
        },
        {
          title: "Inventory",
          href: "/branch/inventory",
        },
      ];
    case 'designer':
      return [
        ...commonItems,
        {
          title: "Designs",
          href: "/designer/designs",
        },
        {
          title: "Projects",
          href: "/designer/projects",
        },
      ];
    case 'factory_manager':
      return [
        ...commonItems,
        {
          title: "Production",
          href: "/factory/production",
        },
        {
          title: "Materials",
          href: "/factory/materials",
        },
        {
          title: "Quality",
          href: "/factory/quality",
        },
      ];
    default:
      return commonItems;
  }
};

export function Sidebar({ className, role }: SidebarProps) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const sidebarItems = getSidebarItems(role);

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="pl-1 pr-0">
          <div className="px-7">
            <Link
              to="/"
              className="flex items-center"
              onClick={() => setOpen(false)}
            >
              <span className="font-bold">MamaFit</span>
            </Link>
          </div>
          <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10">
            <div className="flex flex-col space-y-3 px-2">
              {sidebarItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                    location.pathname === item.href
                      ? "bg-accent"
                      : "transparent"
                  )}
                >
                  {item.icon}
                  <span className="ml-2">{item.title}</span>
                </Link>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
      <div
        className={cn(
          "hidden border-r bg-background lg:block",
          className
        )}
      >
        <div className="flex h-full flex-col gap-2">
          <div className="flex h-[60px] items-center border-b px-6">
            <Link to="/" className="flex items-center gap-2 font-semibold">
              <span>MamaFit</span>
            </Link>
          </div>
          <ScrollArea className="flex-1 px-3">
            <div className="space-y-4 py-2">
              <div className="px-3 py-2">
                <div className="space-y-1">
                  {sidebarItems.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={cn(
                        "flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                        location.pathname === item.href
                          ? "bg-accent"
                          : "transparent"
                      )}
                    >
                      {item.icon}
                      <span className="ml-2">{item.title}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  );
} 