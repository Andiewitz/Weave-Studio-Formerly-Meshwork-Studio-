import { Workspace } from "@shared/schema";
import { format } from "date-fns";
import {
  Box,
  MoreHorizontal,
  Pencil,
  Trash,
  ExternalLink,
  Copy,
  LayoutGrid,
  Server,
  Globe,
  Database,
  Shield,
  GitBranch,
  Zap,
  Cpu,
  Network,
  Cloud,
  Lock,
  BarChart3,
  Code2,
  Wifi,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useState, useRef, useEffect } from "react";
import { useUpdateWorkspace, useDuplicateWorkspace } from "@/hooks/use-workspaces";
import { useToast } from "@/hooks/use-toast";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Icon mapping for workspace icons
const ICON_MAP: Record<string, LucideIcon> = {
  server: Server,
  globe: Globe,
  box: Box,
  database: Database,
  shield: Shield,
  git: GitBranch,
  zap: Zap,
  cpu: Cpu,
  network: Network,
  cloud: Cloud,
  lock: Lock,
  chart: BarChart3,
  code: Code2,
  wifi: Wifi,
  grid: LayoutGrid,
};

function getWorkspaceIcon(iconId?: string): LucideIcon {
  return ICON_MAP[iconId || "box"] || Box;
}

interface WorkspaceCardProps {
  workspace: Workspace;
  onDelete?: (id: number) => void;
  isSelected?: boolean;
  onToggleSelect?: (id: number) => void;
  isMultiSelectMode?: boolean;
}

export function WorkspaceCard({ workspace, onDelete, isSelected, onToggleSelect, isMultiSelectMode }: WorkspaceCardProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const updateWorkspace = useUpdateWorkspace();
  const duplicateWorkspace = useDuplicateWorkspace();

  const [isRenaming, setIsRenaming] = useState(false);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [title, setTitle] = useState(workspace.title);
  const [titleError, setTitleError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const justStartedRenaming = useRef(false);
  const preventBlur = useRef(false);

  // Validation constants
  const titleRegex = /^[a-zA-Z0-9\-_\s]+$/;
  const hasEmojiRegex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|[\u3297\u3299][\ufe0f]?|[\u303d\u3030\u2b55\u2b50\u2b1c\u2b1b\u23f3\u23f0\u231b\u231a\u21aa\u2199\u2198\u2197\u2196\u2195\u2194\u2139\u2122\u2049\u203c\u3030]|[\u2600-\u26FF][\ufe0f]?|[\u2700-\u27BF][\ufe0f]?)/;

  useEffect(() => {
    if (isRenaming) {
      justStartedRenaming.current = true;
      preventBlur.current = true;
      // Small delay to let dropdown close before focusing
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
        justStartedRenaming.current = false;
      }, 50);
    }
  }, [isRenaming]);

  const validateTitle = (value: string): string | null => {
    if (value.length > 16) return "Max 16 characters";
    if (hasEmojiRegex.test(value)) return "No emojis allowed";
    if (!titleRegex.test(value)) return "Invalid characters";
    return null;
  };

  const handleRename = async () => {
    if (justStartedRenaming.current) return;
    
    const error = validateTitle(title);
    if (error) {
      setTitleError(error);
      return;
    }
    
    if (!title.trim() || title === workspace.title) {
      setIsRenaming(false);
      setTitle(workspace.title);
      setTitleError(null);
      return;
    }

    try {
      await updateWorkspace.mutateAsync({
        id: workspace.id,
        title: title.trim(),
      });
      setIsRenaming(false);
      toast({ title: "Updated", description: "Workspace renamed successfully." });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to rename workspace.",
        variant: "destructive"
      });
    }
  };

  const handleDuplicate = async () => {
    try {
      await duplicateWorkspace.mutateAsync({
        id: workspace.id,
        title: `${workspace.title} (Copy)`,
      });
      toast({ title: "Success", description: "Workspace duplicated with all nodes." });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to duplicate workspace.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateIcon = async (iconId: string) => {
    try {
      await updateWorkspace.mutateAsync({
        id: workspace.id,
        icon: iconId,
      });
      toast({ title: "Updated", description: "Icon updated successfully." });
      setIsIconPickerOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update icon.",
        variant: "destructive"
      });
    }
  };

  const MenuItems = () => (
    <>
      <DropdownMenuItem
        onClick={() => setLocation(`/workspace/${workspace.id}`)}
        className="gap-2 font-bold cursor-pointer"
      >
        <ExternalLink className="w-4 h-4" /> OPEN
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={() => setIsRenaming(true)}
        className="gap-2 font-bold cursor-pointer"
      >
        <Pencil className="w-4 h-4" /> RENAME
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={handleDuplicate}
        className="gap-2 font-bold cursor-pointer"
      >
        <Copy className="w-4 h-4" /> DUPLICATE
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={() => setIsIconPickerOpen(true)}
        className="gap-2 font-bold cursor-pointer"
      >
        <Box className="w-4 h-4" /> UPDATE ICON
      </DropdownMenuItem>
      <DropdownMenuSeparator className="bg-foreground/10" />
      <DropdownMenuItem
        onClick={() => onDelete?.(workspace.id)}
        className="gap-2 font-bold text-destructive focus:text-destructive cursor-pointer"
      >
        <Trash className="w-4 h-4" /> DELETE
      </DropdownMenuItem>
    </>
  );

  const ContextMenuItems = () => (
    <>
      <ContextMenuItem
        onClick={() => setLocation(`/workspace/${workspace.id}`)}
        className="gap-2 font-bold cursor-pointer"
      >
        <ExternalLink className="w-4 h-4" /> OPEN
      </ContextMenuItem>
      <ContextMenuItem
        onClick={() => setIsRenaming(true)}
        className="gap-2 font-bold cursor-pointer"
      >
        <Pencil className="w-4 h-4" /> RENAME
      </ContextMenuItem>
      <ContextMenuItem
        onClick={handleDuplicate}
        className="gap-2 font-bold cursor-pointer"
      >
        <Copy className="w-4 h-4" /> DUPLICATE
      </ContextMenuItem>
      <ContextMenuItem
        onClick={() => setIsIconPickerOpen(true)}
        className="gap-2 font-bold cursor-pointer"
      >
        <Box className="w-4 h-4" /> UPDATE ICON
      </ContextMenuItem>
      <ContextMenuSeparator className="bg-foreground/10" />
      <ContextMenuItem
        onClick={() => onDelete?.(workspace.id)}
        className="gap-2 font-bold text-destructive focus:text-destructive cursor-pointer"
      >
        <Trash className="w-4 h-4" /> DELETE
      </ContextMenuItem>
    </>
  );

  const Icon = getWorkspaceIcon(workspace.icon || undefined);

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div 
          className={cn(
            "brutal-card cursor-pointer flex items-center justify-between p-4 bg-card transition-all group hover:bg-black/5 relative overflow-hidden",
            isSelected && "bg-primary/10 border-primary"
          )}
          onClick={() => isMultiSelectMode && onToggleSelect?.(workspace.id)}
        >
          {/* Checkbox for multi-select */}
          {isMultiSelectMode && (
            <div className="mr-3">
              <div 
                className={cn(
                  "w-5 h-5 border-2 border-foreground flex items-center justify-center transition-colors",
                  isSelected ? "bg-primary border-primary" : "bg-card"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSelect?.(workspace.id);
                }}
              >
                {isSelected && <div className="w-3 h-3 bg-white" />}
              </div>
            </div>
          )}
          
          {/* Accent bar on hover */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />

          <div className="flex items-center gap-4 flex-1">
            <div className="w-10 h-10 border-2 border-foreground flex items-center justify-center bg-card transition-all group-hover:bg-foreground group-hover:text-white group-hover:-rotate-3 duration-300">
              <Icon className="w-5 h-5 transition-transform" />
            </div>

            <div className="flex flex-col flex-1 min-w-0">
              {isRenaming ? (
                <input
                  ref={inputRef}
                  value={title}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setTitle(newValue);
                    setTitleError(validateTitle(newValue));
                  }}
                  onBlur={handleRename}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRename();
                    if (e.key === 'Escape') {
                      setIsRenaming(false);
                      setTitle(workspace.title);
                      setTitleError(null);
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  maxLength={16}
                  className={cn(
                    "bg-transparent font-black text-xl uppercase tracking-tighter text-foreground outline-none border-b-2 w-full py-0",
                    titleError ? "border-red-500 text-red-500" : "border-primary"
                  )}
                />
              ) : (
                <h3 
                  onClick={() => setLocation(`/workspace/${workspace.id}`)}
                  className="font-black text-xl uppercase tracking-tighter text-foreground group-hover:text-primary transition-colors leading-tight truncate cursor-pointer"
                >
                  {workspace.title || "Untitled Blueprint"}
                </h3>
              )}
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                  {workspace.type || "Canvas"}
                </span>
                <span className="text-[10px] opacity-20 text-foreground">•</span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">
                  {format(new Date(workspace.createdAt || new Date()), "MMM dd, HH:mm")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
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
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="brutal-card border-2 border-foreground p-1 bg-card min-w-[160px]">
                <MenuItems />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="brutal-card border-2 border-foreground p-1 bg-card min-w-[180px]">
        <ContextMenuItems />
      </ContextMenuContent>

      {/* Icon Picker Overlay */}
      {isIconPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setIsIconPickerOpen(false)}>
          <div className="brutal-card bg-card border-2 border-foreground p-4 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-sm uppercase tracking-widest">SELECT ICON</h3>
              <button
                onClick={() => setIsIconPickerOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Box className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(ICON_MAP).map(([id, IconComp]) => (
                <button
                  key={id}
                  onClick={() => handleUpdateIcon(id)}
                  className={cn(
                    "w-10 h-10 flex items-center justify-center border-2 transition-all",
                    workspace.icon === id
                      ? "bg-foreground text-background border-foreground"
                      : "bg-card border-foreground/20 hover:border-foreground hover:bg-foreground/5"
                  )}
                >
                  <IconComp className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </ContextMenu>
  );
}

