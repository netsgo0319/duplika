import { MobileContainer } from "@/components/layout/mobile-container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, MessageSquare, BookOpen, Ban, Link as LinkIcon, MessageCircle, Trash2, Edit2, Share2, MoreVertical, Copy, Users, MessageCircle as MsgIcon, User, Loader2 } from "lucide-react";
import { Link, useLocation, useRoute } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { useDuplika, useDuplikaStats, useUpdateVisibility, useDeleteDuplika } from "@/hooks/use-duplikas";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/dashboard/:id");
  const id = params?.id;

  const { data: duplika, isLoading } = useDuplika(id);
  const { data: stats } = useDuplikaStats(id);
  const updateVisibility = useUpdateVisibility(id || "");
  const deleteDuplika = useDeleteDuplika();

  const menuItems = [
    { icon: MessageSquare, label: "Test my Duplika", href: `/chat/${id}`, action: true },
    { icon: User, label: "My Profile", href: `/my-profile/${id}` },
    { icon: BookOpen, label: "My Information", href: `/my-info/${id}` },
    { icon: Ban, label: "Topics to avoid", href: `/topics-to-avoid/${id}` },
    { icon: LinkIcon, label: "Shareable links", href: `/shareable-links/${id}` },
    { icon: MessageCircle, label: "Keyword responses", href: `/keyword-responses/${id}` },
  ];

  const handleCopyUrl = () => {
    if (duplika) {
      navigator.clipboard.writeText(`duplika.me/${duplika.handle}`);
      toast({
        title: "Link copied!",
        description: "Duplika URL copied to clipboard.",
        duration: 2000,
      });
    }
  };

  const handlePublicToggle = async (checked: boolean) => {
    try {
      await updateVisibility.mutateAsync(checked);
      toast({
        title: checked ? "Duplika is now Public" : "Duplika is now Private",
        description: checked ? "Anyone can find and chat with your Duplika." : "Only you can access your Duplika.",
        duration: 2000,
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update visibility.",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteDuplika.mutateAsync(id);
      toast({
        title: "Duplika deleted",
        description: "Your duplika has been permanently deleted.",
        duration: 2000,
      });
      setLocation("/");
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete duplika.",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  if (isLoading || !duplika) {
    return (
      <MobileContainer>
        <div className="flex items-center justify-center h-full min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </MobileContainer>
    );
  }

  const initials = duplika.displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

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
                    <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className={`absolute bottom-4 right-0 w-6 h-6 border-2 border-white rounded-full transition-colors ${duplika.isPublic ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            </div>

            <h1 className="text-2xl font-bold font-heading">{duplika.displayName}</h1>
            <p className="text-sm text-muted-foreground mb-4">
              {duplika.bio || "No bio set"}
            </p>

            <div className="flex items-center gap-6 mb-6 text-sm">
                <div className="flex flex-col items-center">
                    <span className="font-bold text-lg">{stats?.conversationCount ?? 0}</span>
                    <span className="text-muted-foreground text-xs flex items-center gap-1">
                        <MsgIcon className="w-3 h-3" /> Conversations
                    </span>
                </div>
                 <div className="w-px h-8 bg-border"></div>
                 <div className="flex flex-col items-center">
                    <span className="font-bold text-lg">{(stats?.factsCount ?? 0) + (stats?.qaCount ?? 0)}</span>
                    <span className="text-muted-foreground text-xs flex items-center gap-1">
                        <BookOpen className="w-3 h-3" /> Knowledge
                    </span>
                </div>
            </div>

            <button
                onClick={handleCopyUrl}
                className="flex items-center gap-2 bg-background px-4 py-2 rounded-full border border-primary/20 shadow-sm text-sm font-medium text-primary hover:bg-primary/5 transition-colors mb-4"
            >
                <LinkIcon className="w-3 h-3" />
                duplika.me/{duplika.handle}
                <Copy className="w-3 h-3 text-muted-foreground/50 ml-1" />
            </button>

            <div className="flex items-center gap-2 bg-background/50 px-4 py-2 rounded-full border border-border/50">
                <span className="text-sm font-medium">Public Status</span>
                <Switch
                  checked={duplika.isPublic}
                  onCheckedChange={handlePublicToggle}
                  disabled={updateVisibility.isPending}
                />
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
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full text-destructive border-destructive/20 hover:bg-destructive/5 hover:text-destructive h-12 font-semibold">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Duplika
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete "{duplika.displayName}"?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this duplika and all its data including facts, Q&A pairs, topics, links, keyword responses, and conversations. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleteDuplika.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>
      </div>
    </MobileContainer>
  );
}
