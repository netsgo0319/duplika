import { MobileContainer } from "@/components/layout/mobile-container";
import { Button } from "@/components/ui/button";
import { Plus, Search, MoreHorizontal, Heart } from "lucide-react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import type { Duplika } from "@shared/schema";

export default function Home() {
  const { data: allDuplikas = [] } = useQuery<Duplika[]>({
    queryKey: ["/api/duplikas"],
  });

  const { data: publicDuplikas = [] } = useQuery<Duplika[]>({
    queryKey: ["/api/duplikas/public"],
  });

  // Filter user's own Duplikas (for simplicity, we assume first 2 are user's)
  const userDuplikas = allDuplikas.filter(d => !d.isPublic || allDuplikas.indexOf(d) < 2);
  const popularDuplikas = publicDuplikas.slice(0, 5);

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <MobileContainer>
      <div className="px-6 py-8">
        <header className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-2xl font-bold font-heading">Duplika</h1>
                <p className="text-sm text-muted-foreground">Manage your AI clones</p>
            </div>
            <Link href="/create">
                <Button size="icon" className="rounded-full shadow-lg shadow-primary/25 h-10 w-10" data-testid="button-create-duplika">
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

        <div className="space-y-4 mb-10">
            {userDuplikas.map((duplika) => (
                <Link key={duplika.id} href={`/dashboard/${duplika.id}`}>
                    <Card className="p-4 flex items-center gap-4 hover:bg-secondary/30 transition-colors border-none shadow-sm cursor-pointer mb-4" data-testid={`card-duplika-${duplika.id}`}>
                        <Avatar className="h-14 w-14 border-2 border-background shadow-sm">
                            <AvatarImage src={duplika.avatar || undefined} />
                            <AvatarFallback>{duplika.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base truncate" data-testid={`text-name-${duplika.id}`}>{duplika.name}</h3>
                            <p className="text-xs text-primary font-medium mb-0.5">{duplika.role}</p>
                            <p className="text-xs text-muted-foreground truncate">{duplika.bio}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="text-muted-foreground">
                            <MoreHorizontal className="h-5 w-5" />
                        </Button>
                    </Card>
                </Link>
            ))}
        </div>

        {popularDuplikas.length > 0 && (
          <div className="mt-8 pt-8 border-t border-dashed border-border">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                  Explore Populars <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">New</span>
              </h3>
              <div className="space-y-4">
                  {popularDuplikas.map((duplika) => (
                      <Link key={duplika.id} href={`/profile/${duplika.id}`}>
                          <Card className="p-3 flex items-center gap-3 border-border/50 bg-secondary/10 hover:bg-secondary/20 transition-colors cursor-pointer mb-3" data-testid={`card-popular-${duplika.id}`}>
                              <Avatar className="h-10 w-10 border border-background shadow-sm">
                                  <AvatarImage src={duplika.avatar || undefined} />
                                  <AvatarFallback>{duplika.name[0]}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                  <h3 className="font-medium text-sm truncate">{duplika.name}</h3>
                                  <p className="text-[11px] text-muted-foreground truncate">{duplika.bio}</p>
                              </div>
                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium bg-background/50 px-2 py-1 rounded-full">
                                  <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                                  {formatNumber(duplika.followers)}
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
