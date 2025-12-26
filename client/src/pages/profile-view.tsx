import { MobileContainer } from "@/components/layout/mobile-container";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share2, MoreVertical, Link as LinkIcon, Copy, MessageCircle, Users, MessageCircle as MsgIcon, Play, FileText, ImageIcon } from "lucide-react";
import { Link, useRoute } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PROFILES = {
  "4": {
    name: "Chef Maria",
    role: "Culinary Expert",
    avatar: "https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&q=80&w=150&h=150",
    bio: "Passionate about authentic Italian cuisine. I can help you cook delicious meals with simple ingredients.",
    conversations: "8.5K",
    followers: "4K",
    handle: "maria",
    active: true
  }
};

const CONTENT_ITEMS = [
  { id: 1, type: "image", src: "https://images.unsplash.com/photo-1595295333158-4742f28fbd85?auto=format&fit=crop&q=80&w=300&h=300" },
  { id: 2, type: "video", src: "https://images.unsplash.com/photo-1556910103-1c02745a30bf?auto=format&fit=crop&q=80&w=300&h=300" },
  { id: 3, type: "image", src: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&q=80&w=300&h=300" },
  { id: 4, type: "article", src: "https://images.unsplash.com/photo-1543353071-087f9fbdd034?auto=format&fit=crop&q=80&w=300&h=300" },
  { id: 5, type: "video", src: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=300&h=300" },
  { id: 6, type: "image", src: "https://images.unsplash.com/photo-1476718408415-71080138dd2c?auto=format&fit=crop&q=80&w=300&h=300" },
  { id: 7, type: "image", src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=300&h=300" },
  { id: 8, type: "video", src: "https://images.unsplash.com/photo-1493770348161-369560ae357d?auto=format&fit=crop&q=80&w=300&h=300" },
  { id: 9, type: "article", src: "https://images.unsplash.com/photo-1506354666786-959d6d497f1a?auto=format&fit=crop&q=80&w=300&h=300" },
];

export default function ProfileView() {
  const [, params] = useRoute("/profile/:id");
  const id = params?.id || "4";
  // @ts-ignore
  const profile = PROFILES[id] || PROFILES["4"];

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(`duplika.me/${profile.handle}`);
    toast({
        title: "Link copied!",
        description: "Profile URL copied to clipboard.",
        duration: 2000,
    });
  };

  return (
    <MobileContainer>
       <div className="bg-primary/5 relative pb-6 rounded-b-[32px]">
        <div className="px-4 py-4 flex items-center justify-between relative z-10">
            <Link href="/">
                <Button variant="ghost" size="icon" className="-ml-2">
                    <ArrowLeft className="w-6 h-6" />
                </Button>
            </Link>
            <div className="flex gap-2">
                 <Button variant="ghost" size="icon">
                    <Share2 className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon">
                    <MoreVertical className="w-5 h-5" />
                </Button>
            </div>
        </div>

        <div className="px-6 flex flex-col items-center text-center">
            <div className="relative mt-2">
                <Avatar className="h-24 w-24 border-4 border-background shadow-xl mb-3">
                    <AvatarImage src={profile.avatar} />
                    <AvatarFallback>{profile.name[0]}</AvatarFallback>
                </Avatar>
                {profile.active && (
                    <div className="absolute bottom-3 right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                )}
            </div>
            
            <h1 className="text-xl font-bold font-heading mb-0.5">{profile.name}</h1>
            <p className="text-xs font-medium text-primary mb-2">{profile.role}</p>
            
            <p className="text-sm text-muted-foreground mb-4 max-w-xs leading-relaxed line-clamp-2">
                {profile.bio}
            </p>

            <div className="flex items-center gap-8 mb-5 text-sm">
                <div className="flex flex-col items-center">
                    <span className="font-bold text-lg">{profile.conversations}</span>
                    <span className="text-muted-foreground text-[10px] flex items-center gap-1 mt-0.5">
                        <MsgIcon className="w-2.5 h-2.5" /> Conversations
                    </span>
                </div>
                 <div className="w-px h-8 bg-border"></div>
                 <div className="flex flex-col items-center">
                    <span className="font-bold text-lg">{profile.followers}</span>
                    <span className="text-muted-foreground text-[10px] flex items-center gap-1 mt-0.5">
                        <Users className="w-2.5 h-2.5" /> Followers
                    </span>
                </div>
            </div>

            <div className="flex gap-2 w-full max-w-xs">
                 <Link href={`/chat/${id}`} className="flex-1">
                    <Button className="w-full h-10 text-sm font-semibold rounded-full shadow-lg shadow-primary/20 animate-in zoom-in duration-300">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Chat
                    </Button>
                </Link>
                <Button 
                    variant="outline"
                    onClick={handleCopyUrl}
                    className="h-10 px-4 rounded-full border-primary/20 bg-background text-primary hover:bg-primary/5"
                >
                    <LinkIcon className="w-4 h-4" />
                </Button>
            </div>
        </div>
      </div>
      
      <div className="px-2 py-4">
        <div className="flex items-center justify-between px-4 mb-2">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">About</h3>
        </div>
        
        <div className="grid grid-cols-3 gap-1 px-1">
            {CONTENT_ITEMS.map((item) => (
                <div key={item.id} className="aspect-square bg-muted relative group overflow-hidden cursor-pointer">
                    <img src={item.src} alt="Content" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                    <div className="absolute top-1 right-1">
                        {item.type === 'video' && <Play className="w-4 h-4 text-white drop-shadow-md fill-white" />}
                        {item.type === 'article' && <FileText className="w-4 h-4 text-white drop-shadow-md" />}
                    </div>
                </div>
            ))}
        </div>
      </div>

    </MobileContainer>
  );
}
