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
      className="group cursor-pointer flex items-center justify-between p-4 rounded-2xl border-[3px] border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl border-[3px] border-black flex items-center justify-center bg-white transition-transform group-hover:scale-105 duration-300">
          <Box className="w-7 h-7 text-black" />
        </div>
        <div>
          <h3 className="font-bold text-xl text-black">
            {workspace.title}
          </h3>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-black"
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

