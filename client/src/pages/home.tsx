import { MobileContainer } from "@/components/layout/mobile-container";
import { Button } from "@/components/ui/button";
import { Plus, Search, MoreHorizontal, Heart, LogOut } from "lucide-react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMyDuplikas, usePopularDuplikas } from "@/hooks/use-duplikas";
import { useAuth } from "@/hooks/use-auth";
import type { Duplika, DuplikaWithCount } from "@/lib/api";

export default function Home() {
  const { user, logout, isLoggingOut } = useAuth();
  const { data: myDuplikas, isLoading: loadingMine } = useMyDuplikas();
  const { data: popularDuplikas, isLoading: loadingPopular } = usePopularDuplikas();

  return (
    <MobileContainer>
      <div className="px-6 py-8">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold font-heading">Duplika</h1>
            <p className="text-sm text-muted-foreground">
              {user ? `Welcome, ${user.username}` : "Manage your AI clones"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-10 w-10 text-muted-foreground"
              onClick={() => logout()}
              disabled={isLoggingOut}
              title="Log out"
            >
              <LogOut className="h-5 w-5" />
            </Button>
            <Link href="/create">
              <Button size="icon" className="rounded-full shadow-lg shadow-primary/25 h-10 w-10">
                <Plus className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </header>

        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search Duplikas..."
            className="w-full bg-secondary/50 border-0 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* My Duplikas */}
        <div className="space-y-4 mb-10">
          {loadingMine ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
            </div>
          ) : myDuplikas && myDuplikas.length > 0 ? (
            myDuplikas.map((duplika: Duplika) => (
              <Link key={duplika.id} href={`/dashboard/${duplika.id}`}>
                <Card className="p-4 flex items-center gap-4 hover:bg-secondary/30 transition-colors border-none shadow-sm cursor-pointer mb-4">
                  <Avatar className="h-14 w-14 border-2 border-background shadow-sm">
                    <AvatarImage src={duplika.avatar ?? undefined} />
                    <AvatarFallback>{duplika.displayName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base truncate">{duplika.displayName}</h3>
                    <p className="text-xs text-primary font-medium mb-0.5">@{duplika.handle}</p>
                    <p className="text-xs text-muted-foreground truncate">{duplika.bio || "No bio yet"}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-muted-foreground">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </Card>
              </Link>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No duplikas yet.</p>
              <Link href="/create">
                <Button variant="link" className="text-sm mt-1">
                  Create your first Duplika
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Popular Duplikas */}
        <div className="mt-8 pt-8 border-t border-dashed border-border">
          <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
            Explore Populars <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">New</span>
          </h3>
          <div className="space-y-4">
            {loadingPopular ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900" />
              </div>
            ) : popularDuplikas && popularDuplikas.length > 0 ? (
              popularDuplikas.map((duplika: DuplikaWithCount) => (
                <Link key={duplika.id} href={`/profile/${duplika.handle}`}>
                  <Card className="p-3 flex items-center gap-3 border-border/50 bg-secondary/10 hover:bg-secondary/20 transition-colors cursor-pointer mb-3">
                    <Avatar className="h-10 w-10 border border-background shadow-sm">
                      <AvatarImage src={duplika.avatar ?? undefined} />
                      <AvatarFallback>{duplika.displayName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{duplika.displayName}</h3>
                      <p className="text-[11px] text-muted-foreground truncate">{duplika.bio || "No description"}</p>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium bg-background/50 px-2 py-1 rounded-full">
                      <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                      {duplika.conversationCount}
                    </div>
                  </Card>
                </Link>
              ))
            ) : (
              <p className="text-center text-sm text-muted-foreground py-4">
                No popular duplikas yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}
