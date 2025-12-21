import { MobileContainer } from "@/components/layout/mobile-container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, MessageSquare, BookOpen, Ban, Link as LinkIcon, MessageCircle, Trash2, Edit2, Share2, MoreVertical } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Dashboard() {
  const [, setLocation] = useLocation();

  const menuItems = [
    { icon: MessageSquare, label: "Test my Duplika", href: "/test-chat", action: true },
    { icon: BookOpen, label: "My Information", href: "/my-info" },
    { icon: Ban, label: "Topics to avoid", href: "#" },
    { icon: LinkIcon, label: "Shareable links", href: "#" },
    { icon: MessageCircle, label: "Keyword responses", href: "#" },
  ];

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
                    <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150" />
                    <AvatarFallback>IB</AvatarFallback>
                </Avatar>
                <div className="absolute bottom-4 right-0 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            
            <h1 className="text-2xl font-bold font-heading">Inbora</h1>
            <p className="text-sm text-muted-foreground mb-4">Beauty YouTuber • Active now</p>
            
            <div className="flex items-center gap-2 bg-background/50 px-4 py-2 rounded-full border border-border/50">
                <span className="text-sm font-medium">Public Status</span>
                <Switch checked={true} />
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
