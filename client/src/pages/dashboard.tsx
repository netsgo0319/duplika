import { MobileContainer } from "@/components/layout/mobile-container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, MessageSquare, BookOpen, Ban, Link as LinkIcon, MessageCircle, Trash2, Edit2, Share2, MoreVertical, Copy, Users, MessageCircle as MsgIcon } from "lucide-react";
import { Link, useLocation, useRoute } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Duplika } from "@shared/schema";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/dashboard/:id");
  const queryClient = useQueryClient();
  const id = params?.id || "";

  const { data: duplika, isLoading } = useQuery<Duplika>({
    queryKey: [`/api/duplikas/${id}`],
    enabled: !!id,
  });

  const [isPublic, setIsPublic] = useState(duplika?.isPublic ?? true);

  useEffect(() => {
    if (duplika) {
      setIsPublic(duplika.isPublic);
    }
  }, [duplika]);

  const updateDuplikaMutation = useMutation({
    mutationFn: async (data: Partial<Duplika>) => {
      const res = await fetch(`/api/duplikas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update Duplika");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/duplikas/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/duplikas"] });
    },
  });

  if (isLoading || !duplika) {
    return (
      <MobileContainer>
        <div className="flex items-center justify-center h-screen">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </MobileContainer>
    );
  } 

  const menuItems = [
    { icon: MessageSquare, label: "Test my Duplika", href: `/chat/${id}`, action: true },
    { icon: BookOpen, label: "My Information", href: "/my-info" },
    { icon: Ban, label: "Topics to avoid", href: "/topics-to-avoid" },
    { icon: LinkIcon, label: "Shareable links", href: "/shareable-links" },
    { icon: MessageCircle, label: "Keyword responses", href: "/keyword-responses" },
  ];

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(`duplika.me/${duplika.handle}`);
    toast({
        title: "Link copied!",
        description: "Duplika URL copied to clipboard.",
        duration: 2000,
    });
  };

  const handlePublicToggle = (checked: boolean) => {
    setIsPublic(checked);
    updateDuplikaMutation.mutate({ isPublic: checked });
    toast({
        title: checked ? "Duplika is now Public" : "Duplika is now Private",
        description: checked ? "Anyone can find and chat with your Duplika." : "Only you can access your Duplika.",
        duration: 2000,
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <MobileContainer>
      <div className="bg-primary/5 pb-6">
        <div className="px-4 py-4 flex items-center justify-between">
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
            <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-background shadow-lg mb-4">
                    <AvatarImage src={duplika.avatar || undefined} />
                    <AvatarFallback>{duplika.name[0]}</AvatarFallback>
                </Avatar>
                <div className={`absolute bottom-4 right-0 w-6 h-6 border-2 border-white rounded-full transition-colors ${isPublic ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            </div>
            
            <h1 className="text-2xl font-bold font-heading" data-testid="text-duplika-name">{duplika.name}</h1>
            <p className="text-sm text-muted-foreground mb-4">{duplika.role} • Active now</p>

            <div className="flex items-center gap-6 mb-6 text-sm">
                <div className="flex flex-col items-center">
                    <span className="font-bold text-lg" data-testid="text-conversations">{formatNumber(duplika.conversations)}</span>
                    <span className="text-muted-foreground text-xs flex items-center gap-1">
                        <MsgIcon className="w-3 h-3" /> Conversations
                    </span>
                </div>
                 <div className="w-px h-8 bg-border"></div>
                 <div className="flex flex-col items-center">
                    <span className="font-bold text-lg" data-testid="text-followers">{formatNumber(duplika.followers)}</span>
                    <span className="text-muted-foreground text-xs flex items-center gap-1">
                        <Users className="w-3 h-3" /> Followers
                    </span>
                </div>
            </div>

            <button 
                onClick={handleCopyUrl}
                className="flex items-center gap-2 bg-background px-4 py-2 rounded-full border border-primary/20 shadow-sm text-sm font-medium text-primary hover:bg-primary/5 transition-colors mb-4"
                data-testid="button-copy-url"
            >
                <LinkIcon className="w-3 h-3" />
                duplika.me/{duplika.handle}
                <Copy className="w-3 h-3 text-muted-foreground/50 ml-1" />
            </button>
            
            <div className="flex items-center gap-2 bg-background/50 px-4 py-2 rounded-full border border-border/50">
                <span className="text-sm font-medium">Public Status</span>
                <Switch checked={isPublic} onCheckedChange={handlePublicToggle} />
            </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-4">
        <div className="grid grid-cols-1 gap-3">
            {menuItems.map((item, index) => (
                <Link key={index} href={item.href}>
                    <Card className={`p-4 flex items-center gap-4 transition-all hover:bg-secondary/20 cursor-pointer border-border/60 shadow-sm ${item.action ? 'bg-primary/5 border-primary/20' : ''}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.action ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'}`}>
                            <item.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 font-medium text-base">
                            {item.label}
                        </div>
                        <div className="text-muted-foreground/50">
                            <Edit2 className="w-4 h-4" />
                        </div>
                    </Card>
                </Link>
            ))}
        </div>

        <div className="pt-6 mt-6 border-t border-border">
            <Button variant="outline" className="w-full text-destructive border-destructive/20 hover:bg-destructive/5 hover:text-destructive h-12 font-semibold">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Duplika
            </Button>
        </div>
      </div>
    </MobileContainer>
  );
}
