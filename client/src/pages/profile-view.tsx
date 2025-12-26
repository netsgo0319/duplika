import { MobileContainer } from "@/components/layout/mobile-container";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share2, MoreVertical, Link as LinkIcon, Copy, MessageCircle, Users, MessageCircle as MsgIcon } from "lucide-react";
import { Link, useRoute } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";

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
       <div className="bg-primary/5 min-h-[40vh] relative">
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

        <div className="px-6 flex flex-col items-center text-center pb-10">
            <div className="relative mt-4">
                <Avatar className="h-28 w-28 border-4 border-background shadow-xl mb-5">
                    <AvatarImage src={profile.avatar} />
                    <AvatarFallback>{profile.name[0]}</AvatarFallback>
                </Avatar>
                {profile.active && (
                    <div className="absolute bottom-4 right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
                )}
            </div>
            
            <h1 className="text-2xl font-bold font-heading mb-1">{profile.name}</h1>
            <p className="text-sm font-medium text-primary mb-3">{profile.role}</p>
            
            <p className="text-sm text-muted-foreground mb-6 max-w-xs leading-relaxed">
                {profile.bio}
            </p>

            <div className="flex items-center gap-8 mb-8 text-sm">
                <div className="flex flex-col items-center">
                    <span className="font-bold text-xl">{profile.conversations}</span>
                    <span className="text-muted-foreground text-xs flex items-center gap-1 mt-1">
                        <MsgIcon className="w-3 h-3" /> Conversations
                    </span>
                </div>
                 <div className="w-px h-10 bg-border"></div>
                 <div className="flex flex-col items-center">
                    <span className="font-bold text-xl">{profile.followers}</span>
                    <span className="text-muted-foreground text-xs flex items-center gap-1 mt-1">
                        <Users className="w-3 h-3" /> Followers
                    </span>
                </div>
            </div>

            <button 
                onClick={handleCopyUrl}
                className="flex items-center gap-2 bg-background px-4 py-2 rounded-full border border-primary/20 shadow-sm text-xs font-medium text-primary hover:bg-primary/5 transition-colors mb-8"
            >
                <LinkIcon className="w-3 h-3" />
                duplika.me/{profile.handle}
                <Copy className="w-3 h-3 text-muted-foreground/50 ml-1" />
            </button>

            <Link href={`/chat/${id}`}>
                <Button className="w-full max-w-xs h-12 text-base font-semibold rounded-xl shadow-lg shadow-primary/25 animate-in zoom-in duration-300">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Start Chatting
                </Button>
            </Link>
        </div>
      </div>
      
      {/* Additional content could go here, e.g., sample conversations or posts */}
      <div className="px-6 py-8">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">About</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
            This AI clone is designed to share culinary expertise. Ask about Italian recipes, ingredient substitutions, or cooking techniques.
        </p>
      </div>

    </MobileContainer>
  );
}
