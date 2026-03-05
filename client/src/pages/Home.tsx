import { useState, useMemo, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useWorkspaces, useDeleteWorkspace } from "@/hooks/use-workspaces";
import { useAuth } from "@/hooks/use-auth";
import { FeaturedCard } from "@/components/workspace/FeaturedCard";
import { WorkspaceCard } from "@/components/workspace/WorkspaceCard";
import { CreateWorkspaceDialog } from "@/components/workspace/CreateWorkspaceDialog";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, Search, Box, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function Home() {
  const [location, setLocation] = useLocation();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { data: workspaces, isLoading: isWorkspacesLoading } = useWorkspaces();
  const deleteWorkspace = useDeleteWorkspace();
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "name">("recent");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);

  const isWorkspacesPage = location === "/workspaces";

  const handleDelete = (id: number) => {
    deleteWorkspace.mutate(id, {
      onSuccess: () => {
        toast({
          title: "Deleted",
          description: "Workspace has been removed.",
        });
        setSelectedIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      },
    });
  };

  const handleToggleSelection = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (filteredWorkspaces.length === selectedIds.size) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredWorkspaces.map(w => w.id)));
    }
  };

  const handleBulkDelete = () => {
    const ids = Array.from(selectedIds);
    let completed = 0;
    ids.forEach(id => {
      deleteWorkspace.mutate(id, {
        onSuccess: () => {
          completed++;
          if (completed === ids.length) {
            toast({
              title: "Deleted",
              description: `${completed} workspaces removed.`,
            });
            setSelectedIds(new Set());
            setIsMultiSelectMode(false);
          }
        },
      });
    });
  };

  const filteredWorkspaces = useMemo(() => {
    if (!workspaces) return [];

    let result = workspaces.filter(ws =>
      ws.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ws.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortBy === "name") {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    } else {
      result = [...result].sort((a, b) => b.id - a.id);
    }

    if (!isWorkspacesPage) {
      return result.slice(0, 5);
    }
    return result;
  }, [workspaces, searchTerm, sortBy, isWorkspacesPage]);

  // Must be ABOVE early returns — hooks cannot be called conditionally
  const mostRecent = useMemo(() => {
    if (!workspaces) return null;
    return [...workspaces].sort((a, b) => b.id - a.id)[0];
  }, [workspaces]);

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const greeting = getGreeting();
  const userName = user?.firstName || user?.email?.split('@')[0] || "Architect";

  if (isAuthLoading || isWorkspacesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pt-12 max-w-6xl mx-auto min-h-[calc(100vh-4rem)]">
      {/* Decorative curved lines */}
      <div className="absolute top-20 left-0 w-32 h-32 pointer-events-none opacity-10">
        <svg viewBox="0 0 100 100" className="w-full h-full stroke-foreground fill-none">
          <path d="M 10,50 Q 50,10 90,50 T 170,50" strokeWidth="2" />
          <path d="M 10,60 Q 50,20 90,60" strokeWidth="1" />
        </svg>
      </div>
      
      {/* Header Section */}
      <div className="flex flex-col gap-6 reveal-on-scroll">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-foreground leading-[1.1]">
            {isWorkspacesPage ? "All Projects" : <>{greeting}, {userName}.</>}
          </h1>
          <p className="text-base font-sans text-muted-foreground max-w-md leading-relaxed">
            {isWorkspacesPage ? "A complete blueprint of your infrastructure." : "Let's architect something extraordinary today."}
          </p>
        </div>
        
        {/* Action Buttons */}
        {!isWorkspacesPage && (
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="accent-btn h-10 px-5 text-sm font-medium"
            >
              New workspace
            </Button>
            <Button
              variant="outline"
              className="h-10 px-5 text-sm font-medium"
            >
              Import
            </Button>
            <Link href="/workspaces">
              <Button variant="ghost" className="text-foreground font-medium text-sm gap-2 hover:bg-transparent group h-10">
                View all
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Main Content Grid - Adjusted for bigger left column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        {/* Left Column - Featured/Actions - Now takes more space */}
        {!isWorkspacesPage && (
          <div className="lg:col-span-6 space-y-6 reveal-on-scroll delay-100 relative">
            {/* Curved decorative line */}
            <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-64 pointer-events-none hidden lg:block">
              <svg viewBox="0 0 40 200" className="w-full h-full stroke-foreground fill-none opacity-20">
                <path d="M 35,0 Q 5,100 35,200" strokeWidth="3" />
                <path d="M 38,20 Q 15,100 38,180" strokeWidth="1" />
              </svg>
            </div>
            
            {mostRecent ? (
              <div className="h-full min-h-[400px]">
                <FeaturedCard
                  workspace={mostRecent}
                  onContinue={() => setLocation(`/workspace/${mostRecent.id}`)}
                  onDelete={handleDelete}
                />
              </div>
            ) : (
              <div className="bg-foreground text-background rounded-2xl p-10 flex flex-col gap-5 items-center text-center justify-center min-h-[400px] relative overflow-hidden">
                <div className="w-16 h-16 rounded-xl bg-background/20 flex items-center justify-center">
                  <Box className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-display font-semibold tracking-tight">
                    Start Your First Project
                  </h3>
                  <p className="text-background/70 font-sans text-sm mt-2">
                    Create a workspace to begin architecting
                  </p>
                </div>
                <Button 
                  onClick={() => setIsCreateOpen(true)} 
                  className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 text-sm font-medium rounded-lg"
                >
                  Create Workspace
                </Button>
                
                {/* Curved accent lines inside card */}
                <svg className="absolute bottom-0 right-0 w-48 h-32 stroke-background/10 fill-none pointer-events-none" viewBox="0 0 200 130">
                  <path d="M 0,130 Q 100,50 200,80" strokeWidth="4" />
                  <path d="M 20,130 Q 110,70 200,100" strokeWidth="2" />
                </svg>
              </div>
            )}
          </div>
        )}

        {/* Right Column - Workspace List */}
        <div className={cn("space-y-4", isWorkspacesPage ? "lg:col-span-12" : "lg:col-span-6")}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-display font-semibold tracking-tight">
                {isWorkspacesPage ? "My projects" : "Recent"}
              </h2>
              {!isWorkspacesPage && (
                <span className="text-sm font-sans text-muted-foreground">
                  {filteredWorkspaces.length} workspaces
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative w-44">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 bg-card border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring font-sans text-sm"
                />
              </div>

              {/* Multi-select toggle */}
              {isWorkspacesPage && (
                <>
                  {!isMultiSelectMode ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsMultiSelectMode(true)}
                      className="font-label font-medium text-xs h-9"
                    >
                      Select
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAll}
                        className="font-label font-medium text-xs h-9"
                      >
                        {selectedIds.size === filteredWorkspaces.length ? "Deselect" : "Select all"}
                      </Button>
                      {selectedIds.size > 0 && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleBulkDelete}
                          className="font-label font-medium text-xs h-9 gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          {selectedIds.size}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsMultiSelectMode(false);
                          setSelectedIds(new Set());
                        }}
                        className="h-9 px-2"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}

              {/* Sort dropdown */}
              {isWorkspacesPage && (
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent font-sans font-medium text-sm focus:outline-none cursor-pointer hover:bg-muted px-3 py-2 rounded-lg border h-9"
                >
                  <option value="recent">Recent</option>
                  <option value="name">Name</option>
                </select>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {filteredWorkspaces.map((workspace) => (
              <WorkspaceCard
                key={workspace.id}
                workspace={workspace}
                onDelete={handleDelete}
                isSelected={selectedIds.has(workspace.id)}
                onToggleSelect={handleToggleSelection}
                isMultiSelectMode={isMultiSelectMode}
              />
            ))}
            {!filteredWorkspaces.length && (
              <div className="brutal-card border-dashed border-2 border-foreground/30 flex flex-col items-center justify-center gap-4 py-16 px-8 bg-card/50">
                <div className="w-16 h-16 border-2 border-foreground/20 flex items-center justify-center">
                  <Search className="w-8 h-8 text-foreground/30" />
                </div>
                <div className="text-center">
                  <p className="font-black text-lg uppercase tracking-widest text-foreground">
                    {searchTerm ? "No Matches Found" : "Start Your First Project"}
                  </p>
                  <p className="text-muted-foreground/60 font-bold text-xs uppercase tracking-widest mt-2">
                    {searchTerm ? "Try a different search term" : "Create a workspace to get started"}
                  </p>
                </div>
                {!searchTerm && (
                  <Button 
                    onClick={() => setIsCreateOpen(true)} 
                    className="accent-btn h-12 px-8 text-sm mt-2"
                  >
                    CREATE WORKSPACE
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <CreateWorkspaceDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </div>
  );
}
