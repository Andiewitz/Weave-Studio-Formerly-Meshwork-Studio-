import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  FolderOpen,
  Settings,
  Search,
  Bell,
  Menu,
  LogOut,
  Sparkles,
  User as UserIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: "Home", href: "/" },
    { icon: FolderOpen, label: "Workspaces", href: "/workspaces" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-black">
      <div className="p-6 flex justify-center">
        <div className="w-10 h-10 rounded-full bg-blue-600 border-2 border-black flex items-center justify-center text-white font-bold text-xl">
          +
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-4 mt-4">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} className={`
              flex items-center justify-center w-12 h-12 mx-auto rounded-xl transition-all duration-200 group
              ${isActive
                ? "text-black"
                : "text-black/40 hover:text-black"
              }
            `}>
              <item.icon className="w-6 h-6" />
            </Link>
          );
        })}
      </nav>

      <div className="p-4 flex flex-col items-center gap-4">
        <div className="w-6 h-6 text-blue-500">
          <Sparkles className="w-full h-full" />
        </div>
        <div className="w-6 h-6 text-black/40">
          <Settings className="w-full h-full" />
        </div>
        <Avatar className="w-10 h-10 border-2 border-black">
          <AvatarImage src={user?.profileImageUrl} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {user?.firstName?.[0] || user?.email?.[0] || "U"}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFCF8] dark:bg-background flex font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-20 border-r-2 border-black fixed h-full z-30">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-20 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="h-16 px-4 md:px-8 border-b-2 border-black bg-white sticky top-0 z-20 flex items-center justify-between">
          <div className="flex items-center gap-4 lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-20">
                <SidebarContent />
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-6">
            <Bell className="w-6 h-6 text-black cursor-pointer" />
            <div className="w-6 h-6 rounded-full border-2 border-black flex items-center justify-center font-bold text-xs cursor-pointer">
              ?
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-12 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

