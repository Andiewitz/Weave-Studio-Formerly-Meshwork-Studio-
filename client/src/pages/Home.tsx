import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useWorkspaces, useDeleteWorkspace } from "@/hooks/use-workspaces";
import { useAuth } from "@/hooks/use-auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FeaturedCard } from "@/components/workspace/FeaturedCard";
import { WorkspaceCard } from "@/components/workspace/WorkspaceCard";
import { CreateWorkspaceDialog } from "@/components/workspace/CreateWorkspaceDialog";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function Home() {
  const [location] = useLocation();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { data: workspaces, isLoading: isWorkspacesLoading } = useWorkspaces();
  const deleteWorkspace = useDeleteWorkspace();
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "name">("recent");

  const isWorkspacesPage = location === "/workspaces";

  const handleDelete = (id: number) => {
    deleteWorkspace.mutate(id, {
      onSuccess: () => {
        toast({
          title: "Deleted",
          description: "Workspace has been removed.",
        });
      },
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

  if (isAuthLoading || isWorkspacesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const mostRecent = workspaces?.[0];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-10 pt-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 reveal-on-scroll">
          <div className="flex flex-col gap-2 -ml-2">
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mix-blend-darken text-foreground leading-[0.85]">
              {isWorkspacesPage ? (
                <>All<br />Projects</>
              ) : (
                <>Welcome<br />Back.</>
              )}
            </h1>
            <p className="mt-6 text-xl font-bold uppercase tracking-widest border-l-4 border-foreground pl-4 ml-2 max-w-md">
              {isWorkspacesPage ? "A complete blueprint of your infrastructure." : "Architecting the future, one node at a time."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mt-8">
          {!isWorkspacesPage && (
            <div className="space-y-12 reveal-on-scroll delay-200">
              {mostRecent ? (
                <FeaturedCard
                  title={mostRecent.title}
                  type={mostRecent.type}
                  onContinue={() => console.log("Continue", mostRecent.id)}
                />
              ) : (
                <div className="h-64 brutal-card border-dashed flex items-center justify-center p-8 bg-card rotate-[-1deg]">
                  <Button onClick={() => setIsCreateOpen(true)} className="accent-btn h-14 px-8 text-sm">Deploy Project</Button>
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

          <div className={cn("space-y-6 reveal-on-scroll delay-300 -mt-32", isWorkspacesPage && "lg:col-span-2 mt-0")}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b-2 border-foreground pb-4">
              <div className="flex items-center gap-8">
                <h2 className="text-2xl font-black uppercase tracking-wider">
                  {isWorkspacesPage ? "My Projects" : "Recent"}
                </h2>
                {!isWorkspacesPage && <h2 className="text-2xl font-black text-muted-foreground uppercase tracking-wider">Team</h2>}
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
                />
              ))}
              {!filteredWorkspaces.length && (
                <div className="text-center py-20 flex flex-col items-center justify-center gap-4">
                  <Search className="w-12 h-12 text-muted-foreground/30" />
                  <p className="text-muted-foreground/60 font-bold uppercase tracking-widest">
                    {searchTerm ? "NO MATCHES IN THE VOID" : "EMPTY CATALOG"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <CreateWorkspaceDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </DashboardLayout>
  );
}
