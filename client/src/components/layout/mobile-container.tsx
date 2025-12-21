import React from "react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { Home, MessageSquare, User, Menu } from "lucide-react";

interface MobileContainerProps {
  children: React.ReactNode;
  className?: string;
  showNav?: boolean; 
}

export function MobileContainer({ children, className }: MobileContainerProps) {
  // We removed the navigation bar as per request, but keeping the structure 
  // allows us to easily add it back or add sticky footers if needed.
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
