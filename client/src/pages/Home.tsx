import { useState } from "react";
import { useWorkspaces, useDeleteWorkspace } from "@/hooks/use-workspaces";
import { useAuth } from "@/hooks/use-auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FeaturedCard } from "@/components/workspace/FeaturedCard";
import { WorkspaceCard } from "@/components/workspace/WorkspaceCard";
import { CreateWorkspaceDialog } from "@/components/workspace/CreateWorkspaceDialog";
import { Button } from "@/components/ui/button";
import { Plus, Upload, ArrowRight, Loader2, Sparkles, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function Home() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { data: workspaces, isLoading: isWorkspacesLoading } = useWorkspaces();
  const deleteWorkspace = useDeleteWorkspace();
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Loading state
  if (isAuthLoading || isWorkspacesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium animate-pulse">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

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

  const handleEdit = (id: number) => {
    toast({
      title: "Coming Soon",
      description: "Edit functionality will be available in the next update.",
    });
  };

  const mostRecent = workspaces?.[0];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-10">
        {/* Search Bar */}
        <div className="relative max-w-2xl w-full">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-black" />
          </div>
          <input
            type="text"
            placeholder=""
            className="w-full h-16 pl-14 pr-6 bg-white border-[3px] border-black rounded-full shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:outline-none text-xl font-medium"
          />
        </div>

        {/* Welcome Section */}
        <div className="flex flex-col gap-2">
          <h1 className="text-5xl font-sans font-bold text-black border-b-[4px] border-black w-fit pb-1">
            Welcome back, {user?.firstName || "Andrei"}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Side: Featured and Actions */}
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

            {/* Action Buttons Row */}
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

              <Button variant="ghost" className="text-black font-bold text-lg gap-2 hover:bg-transparent">
                Search Library
                <ArrowRight className="w-6 h-6" />
              </Button>
            </div>
          </div>

          {/* Right Side: Workspace List */}
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <h2 className="text-2xl font-bold border-b-[3px] border-black pb-1">My Workspace</h2>
              <h2 className="text-2xl font-bold text-black/30">Team</h2>
            </div>

            <div className="rounded-[2.5rem] border-[3px] border-black p-6 space-y-4">
              {workspaces?.map((workspace) => (
                <WorkspaceCard
                  key={workspace.id}
                  workspace={workspace}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              ))}
              {!workspaces?.length && (
                <p className="text-center text-black/40 py-10 font-bold">No projects yet</p>
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

