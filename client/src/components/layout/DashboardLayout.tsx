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
  User as UserIcon,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight
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
import { useState } from "react";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  const navItems = [
    { icon: LayoutDashboard, label: "Home", href: "/" },
    { icon: FolderOpen, label: "Workspaces", href: "/workspaces" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex flex-col h-full bg-white dark:bg-black overflow-hidden">
      <div className={cn(
        "p-6 flex items-center transition-all duration-300",
        (isExpanded || isMobile) ? "justify-between" : "justify-center"
      )}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white font-bold font-serif text-xl border-2 border-black shrink-0">
            W
          </div>
          {(isExpanded || isMobile) && (
            <span className="font-serif font-bold text-xl tracking-tight text-black truncate">
              Studio
            </span>
          )}
        </div>

        {!isMobile && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "p-1.5 rounded-lg hover:bg-black/5 transition-all text-black/40 hover:text-black",
              !isExpanded && "absolute -right-4 top-14 bg-white border-2 border-black z-50 rounded-full"
            )}
          >
            {isExpanded ? <PanelLeftClose className="w-5 h-5" /> : <ChevronRight className="w-4 h-4 text-black" />}
          </button>
        )}
      </div>

      <nav className="flex-1 px-4 mt-4 overflow-y-auto">
        <div className="space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} className={cn(
                "flex items-center gap-4 h-12 rounded-xl transition-all duration-200 group relative",
                (isExpanded || isMobile) ? "px-4" : "justify-center",
                isActive
                  ? "bg-black text-white"
                  : "text-black/40 hover:text-black hover:bg-black/5"
              )}>
                <item.icon className="w-6 h-6 shrink-0" />
                {(isExpanded || isMobile) && (
                  <span className="font-medium whitespace-nowrap opacity-100 transition-opacity duration-300">
                    {item.label}
                  </span>
                )}
                {!isExpanded && !isMobile && (
                  <div className="absolute left-full ml-4 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className={cn(
        "p-4 flex flex-col gap-4 transition-all duration-300",
        (isExpanded || isMobile) ? "items-stretch" : "items-center"
      )}>
        <button className={cn(
          "flex items-center gap-4 h-12 rounded-xl text-blue-500 hover:bg-blue-50 transition-all",
          (isExpanded || isMobile) ? "px-4 w-full" : "justify-center w-12"
        )}>
          <Sparkles className="w-6 h-6 shrink-0" />
          {(isExpanded || isMobile) && <span className="font-medium">Upgrade</span>}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(
              "flex items-center gap-3 rounded-xl transition-all border-2 border-transparent hover:border-black/5 p-1",
              (isExpanded || isMobile) ? "w-full" : "justify-center"
            )}>
              <Avatar className="w-10 h-10 border-2 border-black shrink-0">
                <AvatarImage src={user?.profileImageUrl} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user?.firstName?.[0] || user?.email?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              {(isExpanded || isMobile) && (
                <div className="flex flex-col items-start overflow-hidden">
                  <span className="text-sm font-bold truncate w-full text-black">{user?.firstName || 'User'}</span>
                  <span className="text-[10px] text-black/40 truncate w-full">{user?.email}</span>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => logout()}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFCF8] dark:bg-background flex font-sans">
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:block border-r-2 border-black fixed h-full z-30 transition-all duration-300 ease-in-out bg-white",
        isExpanded ? "w-64" : "w-20"
      )}>
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out",
        isExpanded ? "lg:ml-64" : "lg:ml-20"
      )}>
        {/* Topbar */}
        <header className="h-16 px-4 md:px-8 border-b-2 border-black bg-white sticky top-0 z-20 flex items-center justify-between">
          <div className="flex items-center gap-4 lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <SidebarContent isMobile />
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

