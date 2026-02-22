import { ArrowRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeaturedCardProps {
  title: string;
  type: string;
  onContinue?: () => void;
}

export function FeaturedCard({ title, type, onContinue }: FeaturedCardProps) {
  return (
    <div className="brutal-card bg-foreground text-background p-8 md:p-12 flex flex-col gap-8 relative overflow-hidden group">
      <div className="flex justify-between items-start relative z-10">
        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-[0.9] mix-blend-difference">
          {title}
        </h2>
        <div className="bg-background text-foreground px-3 py-1 font-bold text-xs uppercase tracking-widest border-2 border-foreground">
          {type || "Workspace"}
        </div>
      </div>

      <div className="mt-8 relative z-10">
        <Button
          onClick={onContinue}
          className="accent-btn h-14 px-8 text-lg flex items-center gap-3 w-fit"
        >
          CONTINUE EDITING
          <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
        </Button>
      </div>

      {/* Decorative avant-garde elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary mix-blend-multiply rounded-full blur-3xl opacity-20 pointer-events-none"></div>
      <div className="absolute -bottom-10 -right-10 text-9xl font-black opacity-10 pointer-events-none transform -rotate-12 select-none">
        01
      </div>
    </div>
  );
}

