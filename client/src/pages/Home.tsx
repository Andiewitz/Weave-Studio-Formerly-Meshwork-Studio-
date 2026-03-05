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
    <div className="flex flex-col gap-10 pt-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 reveal-on-scroll">
        <div className="flex flex-col gap-2 -ml-2">
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mix-blend-darken text-foreground leading-[0.85]">
            {isWorkspacesPage ? (
              <>All<br />Projects</>
            ) : (
              <>{greeting},<br />{userName}.</>
            )}
          </h1>
          <p className="mt-6 text-xl font-bold uppercase tracking-widest border-l-4 border-foreground pl-4 ml-2 max-w-md">
            {isWorkspacesPage ? "A complete blueprint of your infrastructure." : "Let's architect something extraordinary today."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mt-8">
        {!isWorkspacesPage && (
          <div className="space-y-12 reveal-on-scroll delay-200">
            {mostRecent ? (
              <FeaturedCard
                workspace={mostRecent}
                onContinue={() => setLocation(`/workspace/${mostRecent.id}`)}
                onDelete={handleDelete}
              />
            ) : (
              <div className="brutal-card bg-foreground text-background p-8 md:p-12 flex flex-col gap-6 relative overflow-hidden group min-h-[280px] justify-center">
                <div className="flex flex-col items-center text-center gap-4 relative z-10">
                  <div className="w-16 h-16 border-4 border-background flex items-center justify-center">
                    <Box className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter leading-tight">
                      Start Your First Project
                    </h3>
                    <p className="text-background/60 font-bold text-sm uppercase tracking-widest mt-2">
                      Create a workspace to begin architecting
                    </p>
                  </div>
                  <Button 
                    onClick={() => setIsCreateOpen(true)} 
                    className="accent-btn h-14 px-10 text-lg mt-4"
                  >
                    CREATE WORKSPACE
                  </Button>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary mix-blend-multiply rounded-full blur-3xl opacity-20 pointer-events-none" />
              </div>
            )}

            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-6">
              <Button
                onClick={() => setIsCreateOpen(true)}
                className="accent-btn h-16 px-10 text-lg flex-1 sm:flex-none"
              >
                NEW WORKSPACE
              </Button>

              <Button
                className="brutal-card h-16 px-8 text-foreground font-bold uppercase tracking-wider text-lg hover:bg-foreground hover:text-white transition-colors flex-1 sm:flex-none"
              >
                IMPORT
              </Button>

              <Link href="/workspaces">
                <Button variant="ghost" className="text-foreground font-bold text-lg uppercase tracking-wider gap-3 hover:bg-transparent group">
                  VIEW ALL
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        <div className={cn("space-y-6 reveal-on-scroll delay-300", isWorkspacesPage ? "lg:col-span-2 mt-0" : "lg:-mt-32")}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b-2 border-foreground pb-4">
            <div className="flex items-center gap-8">
              <h2 className="text-2xl font-black uppercase tracking-wider">
                {isWorkspacesPage ? "My Projects" : "Recent"}
              </h2>
              {!isWorkspacesPage && <h2 className="text-2xl font-black text-muted-foreground uppercase tracking-wider">Team</h2>}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {isWorkspacesPage && (
                <>
                  {!isMultiSelectMode ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsMultiSelectMode(true)}
                      className="font-bold uppercase tracking-wider text-xs"
                    >
                      Select Multiple
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAll}
                        className="font-bold uppercase tracking-wider text-xs"
                      >
                        {selectedIds.size === filteredWorkspaces.length ? "Deselect All" : "Select All"}
                      </Button>
                      {selectedIds.size > 0 && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleBulkDelete}
                          className="font-bold uppercase tracking-wider text-xs gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete ({selectedIds.size})
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsMultiSelectMode(false);
                          setSelectedIds(new Set());
                        }}
                        className="font-bold uppercase tracking-wider text-xs"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>

            <div className="relative w-full max-w-[240px] reveal-on-scroll delay-100">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-foreground/40" />
              </div>
              <input
                type="text"
                placeholder="SEARCH..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-9 pr-4 bg-card border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] focus:outline-none focus:shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] transition-all font-bold uppercase tracking-widest text-[10px]"
              />
            </div>

            {isWorkspacesPage && (
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent font-bold text-sm uppercase tracking-wider focus:outline-none cursor-pointer hover:bg-black/5 p-1 transition-colors"
                >
                  <option value="recent">Recent</option>
                  <option value="name">Name</option>
                </select>
              </div>
            )}
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
