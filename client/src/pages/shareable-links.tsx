import { MobileContainer } from "@/components/layout/mobile-container";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Link as LinkIcon, Trash2, Globe, Instagram, Youtube, ExternalLink, Loader2 } from "lucide-react";
import { Link, useRoute } from "wouter";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useShareableLinks, useCreateLink, useDeleteLink } from "@/hooks/use-duplikas";

function detectLinkType(url: string): string | undefined {
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.includes("instagram.com")) return "instagram";
  if (url.includes("http")) return "website";
  return undefined;
}

export default function ShareableLinks() {
  const [, params] = useRoute("/shareable-links/:id");
  const duplikaId = params?.id || "";

  const { data: links = [], isLoading } = useShareableLinks(duplikaId);
  const createLink = useCreateLink(duplikaId);
  const deleteLink = useDeleteLink(duplikaId);

  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");

  const handleAdd = async () => {
    if (!newTitle.trim() || !newUrl.trim()) return;
    try {
      await createLink.mutateAsync({ title: newTitle.trim(), url: newUrl.trim(), type: detectLinkType(newUrl) });
      setNewTitle("");
      setNewUrl("");
      toast({ title: "Link added", duration: 2000 });
    } catch {
      toast({ title: "Error", description: "Failed to add link.", variant: "destructive", duration: 2000 });
    }
  };

  const handleDelete = async (linkId: string) => {
    try {
      await deleteLink.mutateAsync(linkId);
      toast({ title: "Link removed", duration: 2000 });
    } catch {
      toast({ title: "Error", description: "Failed to remove link.", variant: "destructive", duration: 2000 });
    }
  };

  if (isLoading) {
    return (
      <MobileContainer>
        <div className="flex items-center justify-center h-full min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer>
      <header className="flex items-center gap-4 px-4 py-4 border-b border-border sticky top-0 bg-background z-10">
        <Link href={`/dashboard/${duplikaId}`}>
            <Button variant="ghost" size="icon" className="-ml-2">
                <ArrowLeft className="w-6 h-6" />
            </Button>
        </Link>
        <h1 className="text-lg font-bold font-heading">Shareable Links</h1>
      </header>

      <div className="px-6 py-6 space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3 text-blue-800">
            <LinkIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">These links will be suggested by your AI when relevant to the conversation.</p>
        </div>

        <div className="space-y-3">
            {links.map((link) => (
                <Card key={link.id} className="p-4 flex items-center gap-3 group hover:border-primary/50 transition-colors">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                        ${link.type === 'youtube' ? 'bg-red-100 text-red-600' :
                          link.type === 'instagram' ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-600'}`}>
                        {link.type === 'youtube' && <Youtube className="w-5 h-5" />}
                        {link.type === 'instagram' && <Instagram className="w-5 h-5" />}
                        {(!link.type || link.type === 'website') && <Globe className="w-5 h-5" />}
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">{link.title}</h3>
                        <a href={link.url} target="_blank" className="text-xs text-muted-foreground truncate hover:underline flex items-center gap-1">
                            {link.url} <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDelete(link.id)}
                      disabled={deleteLink.isPending}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </Card>
            ))}

            {links.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No links yet. Add your first link below.</p>
            )}
        </div>

        <Sheet>
            <SheetTrigger asChild>
                 <Button className="w-full h-12 gap-2 rounded-xl shadow-lg shadow-primary/20">
                    <Plus className="w-4 h-4" /> Add New Link
                </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-[20px] max-w-[480px] mx-auto">
                <SheetHeader>
                    <SheetTitle>Add Shareable Link</SheetTitle>
                </SheetHeader>
                <div className="py-6 space-y-4">
                    <div className="space-y-2">
                        <Label>Link Title</Label>
                        <Input
                          placeholder="e.g. My Portfolio"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>URL</Label>
                        <Input
                          placeholder="https://..."
                          value={newUrl}
                          onChange={(e) => setNewUrl(e.target.value)}
                        />
                    </div>
                    <div className="pt-4">
                        <SheetClose asChild>
                            <Button
                              className="w-full h-12 rounded-xl"
                              onClick={handleAdd}
                              disabled={createLink.isPending}
                            >
                              {createLink.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                              Save Link
                            </Button>
                        </SheetClose>
                    </div>
                </div>
            </SheetContent>
        </Sheet>

      </div>
    </MobileContainer>
  );
}
