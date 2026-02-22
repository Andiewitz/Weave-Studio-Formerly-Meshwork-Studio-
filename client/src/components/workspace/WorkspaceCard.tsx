import { Workspace } from "@shared/schema";
import { format } from "date-fns";
import { Box, MoreHorizontal, Pencil, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

import { useLocation } from "wouter";

interface WorkspaceCardProps {
  workspace: Workspace;
  onDelete?: (id: number) => void;
  onEdit?: (id: number) => void;
}

export function WorkspaceCard({ workspace, onDelete, onEdit }: WorkspaceCardProps) {
  const [, setLocation] = useLocation();

  return (
    <div
      onClick={() => setLocation(`/workspace/${workspace.id}`)}
      className="brutal-card cursor-pointer flex items-center justify-between p-4 bg-card transition-all group hover:bg-black/5"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 border-[1px] border-foreground flex items-center justify-center bg-card transition-transform group-hover:-rotate-6 duration-300">
          <Box className="w-5 h-5 text-foreground" />
        </div>
        <div className="flex flex-col">
          <h3 className="font-black text-xl uppercase tracking-tighter text-foreground group-hover:text-primary transition-colors leading-tight">
            {workspace.title}
          </h3>
          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
            {workspace.type || "Canvas"} — {format(new Date(), "MMM dd")}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 text-foreground border-2 border-transparent hover:border-foreground hover:bg-foreground hover:text-white transition-all rounded-none"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <MoreHorizontal className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}

