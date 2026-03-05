import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
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
  ChevronRight,
  FileText,
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
import { cn } from "@/lib/utils";
import { MobileWarning } from "@/components/MobileWarning";

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
    { icon: FileText, label: "Dev Logs", href: "/dev" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex flex-col h-full bg-card overflow-hidden">
      <div className={cn(
        "p-4 flex items-center transition-all duration-300 border-b border-border",
        (isExpanded || isMobile) ? "justify-between" : "justify-center"
      )}>
        <div className="flex items-center gap-3">
          {!(isExpanded || isMobile) && (
            <div className="w-9 h-9 rounded-md bg-foreground flex items-center justify-center text-background font-display font-semibold text-lg shrink-0">
              M
            </div>
          )}
          {(isExpanded || isMobile) && (
            <span className="font-display font-semibold text-lg tracking-tight text-foreground truncate">
              Meshwork Studio
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

      <nav className="flex-1 px-3 mt-2 overflow-y-auto scrollbar-hide">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} className={cn(
                "flex items-center gap-3 h-10 rounded-lg transition-all duration-200 group relative",
                (isExpanded || isMobile) ? "px-3" : "justify-center",
                isActive
                  ? "bg-foreground text-background font-medium shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}>
                <item.icon className={cn("w-4 h-4 shrink-0", isActive && "text-background")} />
                {(isExpanded || isMobile) && (
                  <span className={cn("font-sans text-sm font-medium whitespace-nowrap opacity-100 transition-opacity duration-300", isActive && "text-background")}>
                    {item.label}
                  </span>
                )}
                {!isExpanded && !isMobile && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground font-sans text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-md border">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className={cn(
        "p-3 flex flex-col gap-2 transition-all duration-300",
        (isExpanded || isMobile) ? "items-stretch" : "items-center"
      )}>
        <button className={cn(
          "flex items-center gap-3 h-9 rounded-md text-primary hover:bg-primary/5 transition-all font-sans font-medium text-sm",
          (isExpanded || isMobile) ? "px-3 w-full" : "justify-center w-9"
        )}>
          <Sparkles className="w-4 h-4 shrink-0" />
          {(isExpanded || isMobile) && <span>Upgrade</span>}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(
              "flex items-center gap-2 rounded-md transition-all hover:bg-muted p-1.5",
              (isExpanded || isMobile) ? "w-full" : "justify-center"
            )}>
              <Avatar className="w-8 h-8 border border-border rounded-full shrink-0 bg-background">
                <AvatarImage src={user?.profileImageUrl || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary rounded-full font-display font-semibold text-sm">
                  {user?.firstName?.[0] || user?.email?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              {(isExpanded || isMobile) && (
                <div className="flex flex-col items-start overflow-hidden">
                  <span className="font-sans text-sm font-medium truncate w-full text-foreground">{user?.firstName || 'User'}</span>
                  <span className="text-xs text-muted-foreground truncate w-full font-sans">{user?.email}</span>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="font-sans font-medium">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="font-sans text-sm">
              <Link href="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => logout()} className="font-sans text-sm">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-background text-foreground flex font-sans relative overflow-hidden">
      <MobileWarning />
      <div className="meshwork-bg-text">MESHWORK STUDIO</div>

      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:block border-r-2 border-border fixed h-full z-30 transition-all duration-300 ease-in-out bg-card",
        isExpanded ? "w-64" : "w-20"
      )}>
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className={cn(
        "flex-1 flex flex-col h-screen transition-all duration-300 ease-in-out relative z-10",
        isExpanded ? "lg:ml-64" : "lg:ml-20"
      )}>
        {/* Topbar - Fixed at top */}
        <header className="fixed top-0 right-0 left-0 lg:left-20 h-16 px-4 md:px-8 border-b-2 border-border bg-card z-50 flex items-center justify-between shrink-0 transition-all duration-300">
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

        {/* Page Content - Add padding-top for fixed header */}
        <main className="flex-1 p-6 md:p-12 pt-52 overflow-y-auto scrollbar-hide">
          <div className="max-w-[1400px] mx-auto space-y-12 relative z-20">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

