import React from "react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { Home, MessageSquare, User, Menu } from "lucide-react";

interface MobileContainerProps {
  children: React.ReactNode;
  className?: string;
  showNav?: boolean;
}

export function MobileContainer({ children, className, showNav = true }: MobileContainerProps) {
  const [location] = useLocation();

  const navItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: MessageSquare, label: "Chat", href: "/test-chat" }, // Temporary link for testing
    { icon: User, label: "Dashboard", href: "/dashboard/1" }, // Mock ID
  ];

  return (
    <div className="min-h-screen w-full bg-slate-50 flex justify-center">
      <div className={cn("w-full max-w-[480px] min-h-screen bg-background flex flex-col relative shadow-2xl", className)}>
        <div className="flex-1 overflow-y-auto pb-20">
            {children}
        </div>

        {showNav && (
          <nav className="absolute bottom-0 left-0 right-0 bg-background border-t border-border h-16 flex items-center justify-around z-50 pb-safe">
            {navItems.map((item) => {
              const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
              return (
                <Link key={item.label} href={item.href}>
                  <a className={cn("flex flex-col items-center justify-center gap-1 w-16 h-full", isActive ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
                    <item.icon className={cn("h-6 w-6", isActive && "fill-current/20")} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">{item.label}</span>
                  </a>
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}
