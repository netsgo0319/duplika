import { MobileContainer } from "@/components/layout/mobile-container";
import { Button } from "@/components/ui/button";
import { Plus, Search, MoreHorizontal, Heart, LogIn } from "lucide-react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import type { Duplika } from "@shared/schema";

export default function Home() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();

  // Fetch user's Duplikas
  const { data: myDuplikas = [] } = useQuery<Duplika[]>({
    queryKey: ["/api/duplikas/my"],
    queryFn: async () => {
      const response = await fetch("/api/duplikas/my", {
        credentials: "include",
      });
      if (!response.ok) return [];
      return response.json();
    },
    enabled: isAuthenticated,
  });

  // Fetch public Duplikas
  const { data: publicDuplikas = [] } = useQuery<Duplika[]>({
    queryKey: ["/api/duplikas/public"],
    queryFn: async () => {
      const response = await fetch("/api/duplikas/public");
      if (!response.ok) throw new Error("Failed to fetch public Duplikas");
      return response.json();
    },
  });

  if (authLoading) {
    return (
      <MobileContainer>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </MobileContainer>
    );
  }

  // Landing page for logged out users
  if (!isAuthenticated) {
    return (
      <MobileContainer>
        <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold font-heading mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Duplika
            </h1>
            <p className="text-lg text-muted-foreground max-w-sm mx-auto mb-8">
              Create AI clones of yourself to engage with fans 24/7
            </p>
            
            <a href="/api/login">
              <Button size="lg" className="rounded-full shadow-lg shadow-primary/25 h-12 px-8">
                <LogIn className="w-5 h-5 mr-2" />
                Get Started
              </Button>
            </a>
          </div>

          {publicDuplikas.length > 0 && (
            <div className="w-full max-w-md">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4">
                Popular Duplikas
              </h3>
              <div className="space-y-3">
                {publicDuplikas.slice(0, 3).map((duplika) => (
                  <Card key={duplika.id} className="p-3 flex items-center gap-3 border-border/50 bg-secondary/10">
                    <Avatar className="h-10 w-10 border border-background shadow-sm">
                      <AvatarImage src={duplika.avatarUrl || undefined} />
                      <AvatarFallback>{duplika.displayName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{duplika.displayName}</h3>
                      <p className="text-[11px] text-muted-foreground truncate">{duplika.bio}</p>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium bg-background/50 px-2 py-1 rounded-full">
                      <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                      {(duplika.followerCount / 1000).toFixed(0)}K
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </MobileContainer>
    );
  }

  // Home page for logged in users
  return (
    <MobileContainer>
      <div className="px-6 py-8">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold font-heading">Duplika</h1>
            <p className="text-sm text-muted-foreground">Manage your AI clones</p>
          </div>
          <Link href="/create">
            <Button size="icon" className="rounded-full shadow-lg shadow-primary/25 h-10 w-10" data-testid="button-create">
              <Plus className="h-5 w-5" />
            </Button>
          </Link>
        </header>

        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search Duplikas..." 
            className="w-full bg-secondary/50 border-0 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            data-testid="input-search"
          />
        </div>

        {myDuplikas.length > 0 ? (
          <div className="space-y-4 mb-10">
            {myDuplikas.map((duplika) => (
              <Link key={duplika.id} href={`/dashboard/${duplika.id}`}>
                <Card className="p-4 flex items-center gap-4 hover:bg-secondary/30 transition-colors border-none shadow-sm cursor-pointer mb-4" data-testid={`card-duplika-${duplika.id}`}>
                  <Avatar className="h-14 w-14 border-2 border-background shadow-sm">
                    <AvatarImage src={duplika.avatarUrl || undefined} />
                    <AvatarFallback>{duplika.displayName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base truncate" data-testid={`text-name-${duplika.id}`}>{duplika.displayName}</h3>
                    <p className="text-xs text-primary font-medium mb-0.5">@{duplika.handle}</p>
                    <p className="text-xs text-muted-foreground truncate">{duplika.bio}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-muted-foreground">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 mb-10">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-10 h-10 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No Duplikas Yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
              Create your first AI clone to start engaging with your fans 24/7
            </p>
            <Link href="/create">
              <Button className="rounded-full">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Duplika
              </Button>
            </Link>
          </div>
        )}

        {publicDuplikas.length > 0 && (
          <div className="mt-8 pt-8 border-t border-dashed border-border">
            <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
              Explore Populars <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">New</span>
            </h3>
            <div className="space-y-4">
              {publicDuplikas.map((duplika) => (
                <Link key={duplika.id} href={`/profile/${duplika.id}`}>
                  <Card className="p-3 flex items-center gap-3 border-border/50 bg-secondary/10 hover:bg-secondary/20 transition-colors cursor-pointer mb-3" data-testid={`card-public-${duplika.id}`}>
                    <Avatar className="h-10 w-10 border border-background shadow-sm">
                      <AvatarImage src={duplika.avatarUrl || undefined} />
                      <AvatarFallback>{duplika.displayName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{duplika.displayName}</h3>
                      <p className="text-[11px] text-muted-foreground truncate">{duplika.bio}</p>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium bg-background/50 px-2 py-1 rounded-full">
                      <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                      {(duplika.followerCount / 1000).toFixed(0)}K
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </MobileContainer>
  );
}
