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
      <div className="flex flex-col gap-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-5xl font-sans font-bold text-black border-b-[4px] border-black w-fit pb-1">
              {isWorkspacesPage ? "All Projects" : `Welcome back, ${user?.firstName || "Andrei"}`}
            </h1>
          </div>

          <div className="relative max-w-sm w-full">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-black/40" />
            </div>
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-11 pr-4 bg-white border-[2px] border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {!isWorkspacesPage && (
            <div className="space-y-8">
              {mostRecent ? (
                <FeaturedCard
                  title={mostRecent.title}
                  type={mostRecent.type}
                  onContinue={() => console.log("Continue", mostRecent.id)}
                />
              ) : (
                <div className="h-64 rounded-[2rem] border-[3px] border-dashed border-black flex items-center justify-center">
                  <Button onClick={() => setIsCreateOpen(true)}>Create First Workspace</Button>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-4">
                <Button
                  onClick={() => setIsCreateOpen(true)}
                  className="h-14 px-8 bg-[#0047FF] text-white border-[3px] border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-[#0047FF] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all font-bold text-lg"
                >
                  + New Workspace
                </Button>

                <Button
                  className="h-14 px-8 bg-[#D946EF] text-white border-[3px] border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-[#D946EF] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all font-bold text-lg"
                >
                  + Import Project
                </Button>

                <Link href="/workspaces">
                  <Button variant="ghost" className="text-black font-bold text-lg gap-2 hover:bg-transparent">
                    View All
                    <ArrowRight className="w-6 h-6" />
                  </Button>
                </Link>
              </div>
            </div>
          )}

          <div className={cn("space-y-6", isWorkspacesPage && "lg:col-span-2")}>
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <h2 className="text-2xl font-bold border-b-[3px] border-black pb-1">
                  {isWorkspacesPage ? "My Projects" : "Recent Workspace"}
                </h2>
                {!isWorkspacesPage && <h2 className="text-2xl font-bold text-black/30">Team</h2>}
              </div>

              {isWorkspacesPage && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-black/40 uppercase tracking-wider">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent font-bold text-sm focus:outline-none cursor-pointer"
                  >
                    <option value="recent">Recent</option>
                    <option value="name">Name</option>
                  </select>
                </div>
              )}
            </div>

            <div className="rounded-[2.5rem] border-[3px] border-black p-6 space-y-4 bg-white/50">
              {filteredWorkspaces.map((workspace) => (
                <WorkspaceCard
                  key={workspace.id}
                  workspace={workspace}
                  onDelete={handleDelete}
                />
              ))}
              {!filteredWorkspaces.length && (
                <p className="text-center text-black/40 py-10 font-bold">
                  {searchTerm ? "No projects match your search" : "No projects yet"}
                </p>
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
