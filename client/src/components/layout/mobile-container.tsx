import React from "react";
import { cn } from "@/lib/utils";

interface MobileContainerProps {
  children: React.ReactNode;
  className?: string;
  showNav?: boolean; // Kept for backward compatibility but unused based on request
}

export function MobileContainer({ children, className }: MobileContainerProps) {
  return (
    <div className="min-h-screen w-full bg-slate-50 flex justify-center">
      <div className={cn("w-full max-w-[480px] min-h-screen bg-background flex flex-col relative shadow-2xl", className)}>
        <div className="flex-1 overflow-y-auto pb-safe">
            {children}
        </div>
      </div>
    </div>
  );
}
