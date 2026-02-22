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
        "p-6 flex items-center transition-all duration-300 border-b-2 border-transparent",
        (isExpanded || isMobile) ? "justify-between border-border" : "justify-center"
      )}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-none bg-foreground flex items-center justify-center text-background font-bold font-serif text-xl border-2 border-foreground shrink-0 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
            W
          </div>
          {(isExpanded || isMobile) && (
            <span className="font-sans font-black text-xl tracking-tighter uppercase text-foreground truncate">
              Weave Studio
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
                "flex items-center gap-4 h-12 rounded-none transition-all duration-200 group relative border-2 border-transparent hover:border-foreground/20",
                (isExpanded || isMobile) ? "px-4" : "justify-center",
                isActive
                  ? "bg-foreground text-background brutal-card shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] border-foreground hover:border-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-black/5"
              )}>
                <item.icon className={cn("w-5 h-5 shrink-0", isActive && "text-background")} />
                {(isExpanded || isMobile) && (
                  <span className={cn("font-bold text-sm uppercase tracking-wider whitespace-nowrap opacity-100 transition-opacity duration-300", isActive && "text-background")}>
                    {item.label}
                  </span>
                )}
                {!isExpanded && !isMobile && (
                  <div className="absolute left-full ml-4 px-3 py-1.5 bg-foreground text-background font-bold text-xs uppercase tracking-wider rounded-none opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] border-2 border-foreground">
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
          "flex items-center gap-4 h-12 rounded-none text-primary border-2 border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all font-bold uppercase tracking-wider text-sm",
          (isExpanded || isMobile) ? "px-4 w-full" : "justify-center w-12"
        )}>
          <Sparkles className="w-5 h-5 shrink-0" />
          {(isExpanded || isMobile) && <span>Upgrade</span>}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(
              "flex items-center gap-3 rounded-none transition-all border-2 border-transparent hover:border-foreground/20 p-2 brutal-card shadow-none hover:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:bg-card hover:-translate-y-1 hover:-translate-x-1",
              (isExpanded || isMobile) ? "w-full" : "justify-center"
            )}>
              <Avatar className="w-10 h-10 border-2 border-foreground rounded-none shrink-0 bg-background">
                <AvatarImage src={user?.profileImageUrl || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary rounded-none font-bold">
                  {user?.firstName?.[0] || user?.email?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              {(isExpanded || isMobile) && (
                <div className="flex flex-col items-start overflow-hidden">
                  <span className="text-sm font-black uppercase tracking-tighter truncate w-full text-foreground">{user?.firstName || 'User'}</span>
                  <span className="text-[10px] text-muted-foreground truncate w-full uppercase tracking-widest">{user?.email}</span>
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
    <div className="min-h-screen bg-background text-foreground flex font-sans relative overflow-x-hidden">
      <div className="weave-bg-text">WEAVE STUDIO</div>

      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:block border-r-2 border-border fixed h-full z-30 transition-all duration-300 ease-in-out bg-card",
        isExpanded ? "w-64" : "w-20"
      )}>
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out relative z-10",
        isExpanded ? "lg:ml-64" : "lg:ml-20"
      )}>
        {/* Topbar */}
        <header className="h-16 px-4 md:px-8 border-b-2 border-border bg-card sticky top-0 z-20 flex items-center justify-between">
          <div className="flex items-center gap-4 lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5 text-foreground" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 border-border">
                <SidebarContent isMobile />
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-6">
            <Bell className="w-6 h-6 text-foreground cursor-pointer hover:rotate-12 transition-transform" />
            <div className="w-6 h-6 rounded-none border-2 border-border flex items-center justify-center font-bold text-xs cursor-pointer hover:bg-black hover:text-white transition-colors">
              ?
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-12 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-12 relative z-20">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

