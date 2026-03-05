import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertWorkspaceSchema } from "@shared/schema";
import { useCreateWorkspace } from "@/hooks/use-workspaces";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Loader2, X,
  Server, Globe, Box, Database, Shield, GitBranch, Zap,
  ShoppingCart, Activity, CreditCard, Layers, Cpu, Network,
  LayoutGrid, Code2, Cloud, Lock, BarChart3, Wifi,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const formSchema = insertWorkspaceSchema.pick({
  title: true,
  type: true,
  icon: true,
}).extend({
  title: z.string().min(1, "Project name is required").default("Untitled Project"),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ── Project icon options ────────────────────────────────────────────────────
const PROJECT_ICONS = [
  { id: "server", Icon: Server },
  { id: "globe", Icon: Globe },
  { id: "box", Icon: Box },
  { id: "database", Icon: Database },
  { id: "shield", Icon: Shield },
  { id: "git", Icon: GitBranch },
  { id: "zap", Icon: Zap },
  { id: "cpu", Icon: Cpu },
  { id: "network", Icon: Network },
  { id: "cloud", Icon: Cloud },
  { id: "lock", Icon: Lock },
  { id: "chart", Icon: BarChart3 },
  { id: "code", Icon: Code2 },
  { id: "wifi", Icon: Wifi },
  { id: "grid", Icon: LayoutGrid },
];

// ── Template options (mirrors Workspace.tsx templates) ──────────────────────
const TEMPLATES = [
  {
    id: "blank",
    label: "Start Blank",
    icon: LayoutGrid,
    description: "Empty canvas, build from scratch",
    tag: "BLANK",
    accent: "bg-foreground",
    type: "system",
  },
  {
    id: "template:ecommerce",
    label: "E-Commerce",
    icon: ShoppingCart,
    description: "Microservices, payments, inventory",
    tag: "RETAIL",
    accent: "bg-orange-500",
    type: "template:ecommerce",
  },
  {
    id: "template:ai-platform",
    label: "AI / ML Platform",
    icon: Activity,
    description: "Data ingestion, training, inference",
    tag: "AI",
    accent: "bg-violet-600",
    type: "template:ai-platform",
  },
  {
    id: "template:enterprise-k8s",
    label: "Enterprise K8s",
    icon: Layers,
    description: "Clusters, namespaces, deployments",
    tag: "K8S",
    accent: "bg-sky-500",
    type: "template:enterprise-k8s",
  },
  {
    id: "template:fintech-saas",
    label: "FinTech SaaS",
    icon: CreditCard,
    description: "Payments, compliance, multi-tenant",
    tag: "FINTECH",
    accent: "bg-emerald-600",
    type: "template:fintech-saas",
  },
  {
    id: "template:realtime",
    label: "Realtime System",
    icon: Wifi,
    description: "WebSockets, pub/sub, event streams",
    tag: "LIVE",
    accent: "bg-rose-500",
    type: "realtime",
  },
];

export function CreateWorkspaceDialog({ open, onOpenChange }: CreateWorkspaceDialogProps) {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const createWorkspace = useCreateWorkspace();

  const [selectedTemplate, setSelectedTemplate] = useState("blank");
  const [selectedIcon, setSelectedIcon] = useState("server");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "Untitled Project", type: "system" },
  });

  const handleClose = () => {
    form.reset();
    setSelectedTemplate("blank");
    setSelectedIcon("server");
    onOpenChange(false);
  };

  const onSubmit = (values: FormValues) => {
    if (!user) return;
    const template = TEMPLATES.find(t => t.id === selectedTemplate);

    createWorkspace.mutate(
      { 
        ...values, 
        type: template?.type ?? "system", 
        userId: user.id,
        icon: selectedIcon,
      },
      {
        onSuccess: (newWorkspace) => {
          toast({
            title: "Workspace created",
            description: `"${values.title}" is ready.`,
          });
          handleClose();
          setLocation(`/workspace/${newWorkspace.id}`);
        },
        onError: () => {
          toast({
            title: "Failed to create",
            description: "Something went wrong. Try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  // Selected icon component
  const SelectedIconComp = PROJECT_ICONS.find(i => i.id === selectedIcon)?.Icon ?? Server;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="p-0 gap-0 border-0 max-w-2xl w-full overflow-hidden"
        style={{
          borderRadius: 0,
          border: "2px solid #1a1a1a",
          boxShadow: "8px 8px 0px 0px #1a1a1a",
        }}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* ── Dark Header ─────────────────────────────────────────────────── */}
        <div className="bg-[#121212] text-white px-6 py-4 flex items-center justify-between border-b-2 border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="font-black text-xs uppercase tracking-[0.25em] text-white/60">
              New Workspace
            </span>
          </div>
          <button
            onClick={handleClose}
            className="w-7 h-7 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-background p-6 flex flex-col gap-6">

          {/* ── Project name + icon picker ───────────────────────────────── */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/50">
              Project Name
            </label>
            <div className="flex gap-3">
              {/* Icon preview / picker trigger */}
              <div className="relative group">
                <button
                  type="button"
                  className="w-14 h-14 border-2 border-foreground bg-foreground text-background flex items-center justify-center shrink-0 hover:bg-primary hover:border-primary transition-colors"
                  aria-label="Change icon"
                >
                  <SelectedIconComp className="w-6 h-6" />
                </button>
              </div>

              <input
                {...form.register("title")}
                placeholder="e.g. Production Platform v2"
                autoFocus
                className={cn(
                  "flex-1 h-14 px-4 bg-card border-2 border-foreground font-bold text-lg tracking-tight",
                  "placeholder:text-muted-foreground/40 placeholder:font-normal placeholder:text-base",
                  "focus:outline-none focus:shadow-[4px_4px_0px_0px_#1a1a1a] transition-all",
                  form.formState.errors.title && "border-red-500"
                )}
              />
            </div>
            {form.formState.errors.title && (
              <p className="text-red-500 text-xs font-bold uppercase tracking-wider">
                {form.formState.errors.title.message}
              </p>
            )}

            {/* Icon picker row */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {PROJECT_ICONS.map(({ id, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedIcon(id)}
                  className={cn(
                    "w-8 h-8 flex items-center justify-center border transition-all",
                    selectedIcon === id
                      ? "bg-foreground text-background border-foreground shadow-[2px_2px_0px_0px_#1a1a1a]"
                      : "bg-card border-foreground/20 text-foreground/40 hover:border-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </div>

          {/* ── Template selection ───────────────────────────────────────── */}
          <div className="flex flex-col gap-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/50">
              Start from Template
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TEMPLATES.map((tpl) => {
                const Icon = tpl.icon;
                const isSelected = selectedTemplate === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setSelectedTemplate(tpl.id)}
                    className={cn(
                      "relative flex flex-col items-start gap-2 p-3 border-2 text-left transition-all",
                      "hover:-translate-y-0.5 hover:-translate-x-0.5",
                      isSelected
                        ? "bg-foreground text-background border-foreground shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
                        : "bg-card border-foreground/15 hover:border-foreground hover:shadow-[4px_4px_0px_0px_rgba(26,26,26,0.15)]"
                    )}
                  >
                    {/* Tag */}
                    <span
                      className={cn(
                        "absolute top-2 right-2 text-[8px] font-black tracking-widest px-1.5 py-0.5 text-white",
                        isSelected ? "opacity-0" : tpl.accent
                      )}
                    >
                      {tpl.tag}
                    </span>

                    <Icon
                      className={cn(
                        "w-5 h-5 shrink-0",
                        isSelected ? "text-background" : "text-foreground/60"
                      )}
                    />
                    <div className="flex flex-col gap-0.5 pr-9">
                      <span
                        className={cn(
                          "font-black text-sm uppercase tracking-tight leading-none",
                          isSelected ? "text-background" : "text-foreground"
                        )}
                      >
                        {tpl.label}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] leading-tight mt-1",
                          isSelected ? "text-background/60" : "text-muted-foreground"
                        )}
                      >
                        {tpl.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Footer ──────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between pt-2 border-t-2 border-foreground/10">
            <button
              type="button"
              onClick={handleClose}
              className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={form.handleSubmit(onSubmit)}
              disabled={createWorkspace.isPending}
              className={cn(
                "accent-btn h-12 px-8 text-sm flex items-center gap-2",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              )}
            >
              {createWorkspace.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  CREATING...
                </>
              ) : (
                "CREATE WORKSPACE →"
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
