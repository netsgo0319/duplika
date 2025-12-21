import { MobileContainer } from "@/components/layout/mobile-container";
import { Button } from "@/components/ui/button";
import { Plus, Search, MoreHorizontal, Heart, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const MOCK_DUPLIKAS = [
  {
    id: 1,
    name: "Inbora",
    role: "Beauty YouTuber",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100&h=100",
    description: "Expert in K-Beauty trends and skincare routines.",
    interactions: "1.2k"
  },
  {
    id: 2,
    name: "Tech Guru",
    role: "Gadget Reviewer",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100&h=100",
    description: "Detailed reviews on latest tech and coding tips.",
    interactions: "850"
  }
];

const POPULAR_DUPLIKAS = [
  {
    id: 3,
    name: "Chris, the Talking Dog",
    role: "Pet Influencer",
    avatar: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=100&h=100",
    description: "Barking wisdom and treat reviews.",
    interactions: "50K"
  },
  {
    id: 4,
    name: "Chef Maria",
    role: "Culinary Expert",
    avatar: "https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&q=80&w=100&h=100",
    description: "Italian recipes and cooking tips.",
    interactions: "12K"
  }
];

export default function Home() {
  return (
    <MobileContainer>
      <div className="px-6 py-8">
        <header className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-2xl font-bold font-heading">My Duplikas</h1>
                <p className="text-sm text-muted-foreground">Manage your AI clones</p>
            </div>
            <Link href="/create">
                <Button size="icon" className="rounded-full shadow-lg shadow-primary/25 h-10 w-10">
                    <Plus className="h-5 w-5" />
                </Button>
            </Link>
        </header>

        <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
                type="text" 
                placeholder="Search Duplikas..." 
                className="w-full bg-secondary/50 border-0 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
        </div>

        <div className="space-y-4">
            {MOCK_DUPLIKAS.map((duplika) => (
                <Link key={duplika.id} href={`/dashboard/${duplika.id}`}>
                    <Card className="p-4 flex items-center gap-4 hover:bg-secondary/30 transition-colors border-none shadow-sm cursor-pointer">
                        <Avatar className="h-14 w-14 border-2 border-background shadow-sm">
                            <AvatarImage src={duplika.avatar} />
                            <AvatarFallback>{duplika.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base truncate">{duplika.name}</h3>
                            <p className="text-xs text-primary font-medium mb-0.5">{duplika.role}</p>
                            <p className="text-xs text-muted-foreground truncate">{duplika.description}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="text-muted-foreground">
                            <MoreHorizontal className="h-5 w-5" />
                        </Button>
                    </Card>
                </Link>
            ))}
        </div>

        <div className="mt-8 pt-8 border-t border-dashed border-border">
            <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                Explore Populars <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">New</span>
            </h3>
            <div className="space-y-3">
                {POPULAR_DUPLIKAS.map((duplika) => (
                    <Card key={duplika.id} className="p-3 flex items-center gap-3 border-border/50 bg-secondary/10 hover:bg-secondary/20 transition-colors cursor-pointer">
                        <Avatar className="h-10 w-10 border border-background shadow-sm">
                            <AvatarImage src={duplika.avatar} />
                            <AvatarFallback>{duplika.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm truncate">{duplika.name}</h3>
                            <p className="text-[11px] text-muted-foreground truncate">{duplika.description}</p>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium bg-background/50 px-2 py-1 rounded-full">
                            <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                            {duplika.interactions}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
      </div>
    </MobileContainer>
  );
}
