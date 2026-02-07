import { MobileContainer } from "@/components/layout/mobile-container";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, MessageCircle, Edit2, Trash2, Loader2 } from "lucide-react";
import { Link, useRoute } from "wouter";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useKeywordResponses, useCreateKeywordResponse, useUpdateKeywordResponse, useDeleteKeywordResponse } from "@/hooks/use-duplikas";
import type { KeywordResponse } from "@/lib/api";

export default function KeywordResponses() {
  const [, params] = useRoute("/keyword-responses/:id");
  const duplikaId = params?.id || "";

  const { data: keywords = [], isLoading } = useKeywordResponses(duplikaId);
  const createKeyword = useCreateKeywordResponse(duplikaId);
  const updateKeyword = useUpdateKeywordResponse(duplikaId);
  const deleteKeyword = useDeleteKeywordResponse(duplikaId);

  const [newKeywords, setNewKeywords] = useState("");
  const [newResponse, setNewResponse] = useState("");
  const [editing, setEditing] = useState<KeywordResponse | null>(null);

  const handleAdd = async () => {
    if (!newKeywords.trim() || !newResponse.trim()) return;
    try {
      await createKeyword.mutateAsync({ keywords: newKeywords.trim(), response: newResponse.trim() });
      setNewKeywords("");
      setNewResponse("");
      toast({ title: "Keyword response added", duration: 2000 });
    } catch {
      toast({ title: "Error", description: "Failed to add keyword response.", variant: "destructive", duration: 2000 });
    }
  };

  const handleUpdate = async () => {
    if (!editing) return;
    try {
      await updateKeyword.mutateAsync({ resId: editing.id, data: { keywords: editing.keywords, response: editing.response } });
      setEditing(null);
      toast({ title: "Keyword response updated", duration: 2000 });
    } catch {
      toast({ title: "Error", description: "Failed to update keyword response.", variant: "destructive", duration: 2000 });
    }
  };

  const handleDelete = async (resId: string) => {
    try {
      await deleteKeyword.mutateAsync(resId);
      setEditing(null);
      toast({ title: "Keyword response deleted", duration: 2000 });
    } catch {
      toast({ title: "Error", description: "Failed to delete keyword response.", variant: "destructive", duration: 2000 });
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
        <h1 className="text-lg font-bold font-heading">Keyword Responses</h1>
      </header>

      <div className="px-6 py-6 space-y-6">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex gap-3 text-purple-800">
            <MessageCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">Set specific responses triggered by keywords. Useful for FAQs or business inquiries.</p>
        </div>

        <div className="space-y-3">
            {keywords.map((item) => (
                <Sheet key={item.id}>
                    <Card className="p-4 group hover:border-primary/50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex flex-wrap gap-1 mb-2">
                                {item.keywords.split(',').map((k, i) => (
                                    <span key={i} className="bg-secondary text-secondary-foreground text-xs font-medium px-2 py-1 rounded-md">
                                        {k.trim()}
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <SheetTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 text-muted-foreground hover:text-primary"
                                      onClick={() => setEditing({ ...item })}
                                    >
                                        <Edit2 className="w-3 h-3" />
                                    </Button>
                                </SheetTrigger>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                  onClick={() => handleDelete(item.id)}
                                  disabled={deleteKeyword.isPending}
                                >
                                    <Trash2 className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>
                        <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
                            <p className="text-sm text-muted-foreground leading-relaxed">"{item.response}"</p>
                        </div>
                    </Card>
                    <SheetContent side="bottom" className="rounded-t-[20px] max-w-[480px] mx-auto">
                        <SheetHeader>
                            <SheetTitle>Edit Keyword Response</SheetTitle>
                        </SheetHeader>
                        <div className="py-6 space-y-4">
                            <div className="space-y-2">
                                <Label>Keywords (comma separated)</Label>
                                <Input
                                  value={editing?.keywords || ""}
                                  onChange={(e) => setEditing(prev => prev ? {...prev, keywords: e.target.value} : null)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Response</Label>
                                <Textarea
                                  value={editing?.response || ""}
                                  onChange={(e) => setEditing(prev => prev ? {...prev, response: e.target.value} : null)}
                                  className="min-h-[100px]"
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <SheetClose asChild>
                                    <Button
                                      variant="outline"
                                      className="flex-1 h-12 rounded-xl text-destructive border-destructive/20 hover:bg-destructive/5"
                                      onClick={() => editing && handleDelete(editing.id)}
                                      disabled={deleteKeyword.isPending}
                                    >
                                      Delete
                                    </Button>
                                </SheetClose>
                                <SheetClose asChild>
                                    <Button
                                      className="flex-[2] h-12 rounded-xl"
                                      onClick={handleUpdate}
                                      disabled={updateKeyword.isPending}
                                    >
                                      Update
                                    </Button>
                                </SheetClose>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            ))}

            {keywords.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No keyword responses yet. Add your first one below.</p>
            )}
        </div>

        <Sheet>
            <SheetTrigger asChild>
                 <Button className="w-full h-12 gap-2 rounded-xl shadow-lg shadow-primary/20">
                    <Plus className="w-4 h-4" /> Add Keyword Response
                </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-[20px] max-w-[480px] mx-auto">
                <SheetHeader>
                    <SheetTitle>New Keyword Response</SheetTitle>
                </SheetHeader>
                <div className="py-6 space-y-4">
                    <div className="space-y-2">
                        <Label>Keywords (comma separated)</Label>
                        <Input
                          placeholder="e.g. price, cost, rates"
                          value={newKeywords}
                          onChange={(e) => setNewKeywords(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Response</Label>
                        <Textarea
                          placeholder="Type the exact response you want the AI to give..."
                          className="min-h-[100px]"
                          value={newResponse}
                          onChange={(e) => setNewResponse(e.target.value)}
                        />
                    </div>
                    <div className="pt-4">
                        <SheetClose asChild>
                            <Button
                              className="w-full h-12 rounded-xl"
                              onClick={handleAdd}
                              disabled={createKeyword.isPending}
                            >
                              {createKeyword.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                              Save Response
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
