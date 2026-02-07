import { MobileContainer } from "@/components/layout/mobile-container";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share2, MoreVertical, Link as LinkIcon, Copy, MessageCircle, Users, MessageCircle as MsgIcon, Loader2 } from "lucide-react";
import { Link, useRoute } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { usePublicProfile } from "@/hooks/use-duplikas";

export default function ProfileView() {
  const [, params] = useRoute("/profile/:handle");
  const handle = params?.handle || "";

  const { data: duplika, isLoading, error } = usePublicProfile(handle);

  const handleCopyUrl = () => {
    if (!duplika) return;
    navigator.clipboard.writeText(`duplika.me/${duplika.handle}`);
    toast({
      title: "Link copied!",
      description: "Profile URL copied to clipboard.",
      duration: 2000,
    });
  };

  if (isLoading) {
    return (
      <MobileContainer>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </MobileContainer>
    );
  }

  if (!duplika || error) {
    return (
      <MobileContainer>
        <div className="flex flex-col items-center justify-center h-screen gap-4">
          <p className="text-muted-foreground">Profile not found</p>
          <Link href="/">
            <Button variant="outline">Go Home</Button>
          </Link>
        </div>
      </MobileContainer>
    );
  }

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
              <AvatarImage src={duplika.avatar ?? undefined} />
              <AvatarFallback>{duplika.displayName[0]}</AvatarFallback>
            </Avatar>
            <div className="absolute bottom-3 right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
          </div>

          <h1 className="text-xl font-bold font-heading mb-0.5">{duplika.displayName}</h1>
          <p className="text-xs font-medium text-primary mb-2">@{duplika.handle}</p>

          {duplika.bio && (
            <p className="text-sm text-muted-foreground mb-4 max-w-xs leading-relaxed line-clamp-2">
              {duplika.bio}
            </p>
          )}

          <div className="flex gap-2 w-full max-w-xs mt-2">
            <Link href={`/chat/${duplika.id}`} className="flex-1">
              <Button className="w-full h-10 text-sm font-semibold rounded-full shadow-lg shadow-primary/20 animate-in zoom-in duration-300">
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={handleCopyUrl}
              className="h-10 px-4 rounded-full border-primary/20 bg-background text-primary hover:bg-primary/5 flex items-center gap-2"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">duplika.me/{duplika.handle}</span>
              <Copy className="w-3 h-3 text-muted-foreground/50 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}
