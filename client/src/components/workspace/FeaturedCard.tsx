import { ArrowRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeaturedCardProps {
  title: string;
  type: string;
  onContinue?: () => void;
}

export function FeaturedCard({ title, type, onContinue }: FeaturedCardProps) {
  return (
    <div className="relative rounded-[2rem] bg-[#A855F7] p-8 md:p-10 border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-6">
      <div className="flex justify-between items-start">
        <h2 className="text-3xl md:text-4xl font-sans font-bold text-white max-w-sm leading-tight">
          {title}
        </h2>
        <MoreHorizontal className="text-white w-8 h-8 cursor-pointer" />
      </div>

      <div className="mt-auto relative">
        <Button
          onClick={onContinue}
          className="bg-white text-black border-[3px] border-black rounded-2xl px-6 h-12 hover:bg-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all font-bold group"
        >
          Continue Editing
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>

        {/* Decorative arrow path */}
        <div className="absolute top-[-40px] left-[160px] text-white pointer-events-none hidden md:block">
          <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 70C30 70 50 60 60 40C70 20 90 10 110 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <path d="M100 0L115 10L100 20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

