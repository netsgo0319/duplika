import { MobileContainer } from "@/components/layout/mobile-container";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, ChevronRight, Loader2 } from "lucide-react";
import { Link, useRoute } from "wouter";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useFacts, useCreateFact, useUpdateFact, useDeleteFact, useQaPairs, useCreateQaPair, useUpdateQaPair, useDeleteQaPair } from "@/hooks/use-duplikas";
import type { Fact, QaPair } from "@/lib/api";

export default function MyInfo() {
  const [, params] = useRoute("/my-info/:id");
  const duplikaId = params?.id || "";

  const { data: facts = [], isLoading: factsLoading } = useFacts(duplikaId);
  const { data: qaList = [], isLoading: qaLoading } = useQaPairs(duplikaId);

  const createFact = useCreateFact(duplikaId);
  const updateFact = useUpdateFact(duplikaId);
  const deleteFact = useDeleteFact(duplikaId);

  const createQa = useCreateQaPair(duplikaId);
  const updateQa = useUpdateQaPair(duplikaId);
  const deleteQa = useDeleteQaPair(duplikaId);

  // State for adding/editing
  const [editingFact, setEditingFact] = useState<Fact | null>(null);
  const [newFact, setNewFact] = useState("");

  const [editingQa, setEditingQa] = useState<QaPair | null>(null);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");

  const handleSaveFact = async () => {
    try {
      if (editingFact) {
        await updateFact.mutateAsync({ factId: editingFact.id, data: { text: editingFact.text } });
        setEditingFact(null);
        toast({ title: "Fact updated", duration: 2000 });
      } else if (newFact.trim()) {
        await createFact.mutateAsync({ text: newFact });
        setNewFact("");
        toast({ title: "Fact added", duration: 2000 });
      }
    } catch {
      toast({ title: "Error", description: "Failed to save fact.", variant: "destructive", duration: 2000 });
    }
  };

  const handleDeleteFact = async (factId: string) => {
    try {
      await deleteFact.mutateAsync(factId);
      setEditingFact(null);
      toast({ title: "Fact deleted", duration: 2000 });
    } catch {
      toast({ title: "Error", description: "Failed to delete fact.", variant: "destructive", duration: 2000 });
    }
  };

  const handleSaveQa = async () => {
    try {
      if (editingQa) {
        await updateQa.mutateAsync({ qaId: editingQa.id, data: { question: editingQa.question, answer: editingQa.answer } });
        setEditingQa(null);
        toast({ title: "Q&A updated", duration: 2000 });
      } else if (newQuestion.trim() && newAnswer.trim()) {
        await createQa.mutateAsync({ question: newQuestion, answer: newAnswer });
        setNewQuestion("");
        setNewAnswer("");
        toast({ title: "Q&A added", duration: 2000 });
      }
    } catch {
      toast({ title: "Error", description: "Failed to save Q&A.", variant: "destructive", duration: 2000 });
    }
  };

  const handleDeleteQa = async (qaId: string) => {
    try {
      await deleteQa.mutateAsync(qaId);
      setEditingQa(null);
      toast({ title: "Q&A deleted", duration: 2000 });
    } catch {
      toast({ title: "Error", description: "Failed to delete Q&A.", variant: "destructive", duration: 2000 });
    }
  };

  if (factsLoading || qaLoading) {
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
        <h1 className="text-lg font-bold font-heading">My Information</h1>
      </header>

      <div className="px-4 py-6">
        <Tabs defaultValue="facts" className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-6 h-12 rounded-xl bg-secondary/50 p-1">
                <TabsTrigger value="facts" className="rounded-lg text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">Facts</TabsTrigger>
                <TabsTrigger value="qa" className="rounded-lg text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">Q&A</TabsTrigger>
            </TabsList>

            {/* FACTS TAB */}
            <TabsContent value="facts" className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-muted-foreground">Core persona information</p>

                    <Sheet>
                        <SheetTrigger asChild>
                            <Button size="sm" variant="outline" className="h-8 gap-1 rounded-full text-xs" onClick={() => { setEditingFact(null); setNewFact(""); }}>
                                <Plus className="w-3 h-3" /> Add Fact
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="rounded-t-[20px] max-w-[480px] mx-auto">
                            <SheetHeader>
                                <SheetTitle>Add New Fact</SheetTitle>
                            </SheetHeader>
                            <div className="py-6 space-y-4">
                                <div className="space-y-2">
                                    <Label>Fact</Label>
                                    <Textarea
                                        placeholder="e.g. I have 3 cats named Luna, Star, and Sun."
                                        value={newFact}
                                        onChange={(e) => setNewFact(e.target.value)}
                                    />
                                </div>
                                <div className="pt-4">
                                    <SheetClose asChild>
                                        <Button
                                          className="w-full h-12 rounded-xl"
                                          onClick={handleSaveFact}
                                          disabled={createFact.isPending}
                                        >
                                          {createFact.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                          Save Fact
                                        </Button>
                                    </SheetClose>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                {facts.map((fact) => (
                    <Sheet key={fact.id}>
                        <SheetTrigger asChild>
                            <Card
                                className="p-4 flex items-center justify-between group bg-card hover:border-primary/50 transition-colors cursor-pointer active:scale-[0.99] transition-transform"
                                onClick={() => setEditingFact({ ...fact })}
                            >
                                <p className="text-sm font-medium">{fact.text}</p>
                                <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                            </Card>
                        </SheetTrigger>
                         <SheetContent side="bottom" className="rounded-t-[20px] max-w-[480px] mx-auto">
                            <SheetHeader>
                                <SheetTitle>Edit Fact</SheetTitle>
                            </SheetHeader>
                            <div className="py-6 space-y-4">
                                <div className="space-y-2">
                                    <Label>Fact</Label>
                                    <Textarea
                                        value={editingFact?.text || ""}
                                        onChange={(e) => setEditingFact(prev => prev ? {...prev, text: e.target.value} : null)}
                                    />
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <SheetClose asChild>
                                        <Button
                                          variant="outline"
                                          className="flex-1 h-12 rounded-xl text-destructive border-destructive/20 hover:bg-destructive/5"
                                          onClick={() => editingFact && handleDeleteFact(editingFact.id)}
                                          disabled={deleteFact.isPending}
                                        >
                                          Delete
                                        </Button>
                                    </SheetClose>
                                    <SheetClose asChild>
                                        <Button
                                          className="flex-[2] h-12 rounded-xl"
                                          onClick={handleSaveFact}
                                          disabled={updateFact.isPending}
                                        >
                                          Update Fact
                                        </Button>
                                    </SheetClose>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                ))}

                {facts.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">No facts yet. Add your first fact above.</p>
                )}
            </TabsContent>

            {/* Q&A TAB */}
            <TabsContent value="qa" className="space-y-4">
                 <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-muted-foreground">Common questions & answers</p>

                    <Sheet>
                        <SheetTrigger asChild>
                            <Button size="sm" variant="outline" className="h-8 gap-1 rounded-full text-xs" onClick={() => { setEditingQa(null); setNewQuestion(""); setNewAnswer(""); }}>
                                <Plus className="w-3 h-3" /> Add Q&A
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="rounded-t-[20px] max-w-[480px] mx-auto">
                            <SheetHeader>
                                <SheetTitle>Add New Q&A</SheetTitle>
                            </SheetHeader>
                            <div className="py-6 space-y-4">
                                <div className="space-y-2">
                                    <Label>Question</Label>
                                    <Input
                                        placeholder="e.g. What's your favorite lipstick?"
                                        value={newQuestion}
                                        onChange={(e) => setNewQuestion(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Answer</Label>
                                    <Textarea
                                        placeholder="e.g. I absolutely love the Ruby Woo from MAC!"
                                        value={newAnswer}
                                        onChange={(e) => setNewAnswer(e.target.value)}
                                        className="min-h-[100px]"
                                    />
                                </div>
                                <div className="pt-4">
                                    <SheetClose asChild>
                                        <Button
                                          className="w-full h-12 rounded-xl"
                                          onClick={handleSaveQa}
                                          disabled={createQa.isPending}
                                        >
                                          {createQa.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                          Save Q&A
                                        </Button>
                                    </SheetClose>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                {qaList.map((item) => (
                    <Sheet key={item.id}>
                        <SheetTrigger asChild>
                            <Card
                                className="p-4 group bg-card hover:border-primary/50 transition-colors cursor-pointer active:scale-[0.99] transition-transform relative pr-8"
                                onClick={() => setEditingQa({ ...item })}
                            >
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                </div>
                                <div className="flex justify-between items-start mb-2">
                                     <div className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide mb-1 inline-block">Q</div>
                                </div>
                                <p className="font-semibold text-sm mb-3">{item.question}</p>

                                <div className="bg-secondary/10 text-secondary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide mb-1 inline-block">A</div>
                                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{item.answer}</p>
                            </Card>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="rounded-t-[20px] max-w-[480px] mx-auto">
                            <SheetHeader>
                                <SheetTitle>Edit Q&A</SheetTitle>
                            </SheetHeader>
                            <div className="py-6 space-y-4">
                                <div className="space-y-2">
                                    <Label>Question</Label>
                                    <Input
                                        value={editingQa?.question || ""}
                                        onChange={(e) => setEditingQa(prev => prev ? {...prev, question: e.target.value} : null)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Answer</Label>
                                    <Textarea
                                        value={editingQa?.answer || ""}
                                        onChange={(e) => setEditingQa(prev => prev ? {...prev, answer: e.target.value} : null)}
                                        className="min-h-[100px]"
                                    />
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <SheetClose asChild>
                                        <Button
                                          variant="outline"
                                          className="flex-1 h-12 rounded-xl text-destructive border-destructive/20 hover:bg-destructive/5"
                                          onClick={() => editingQa && handleDeleteQa(editingQa.id)}
                                          disabled={deleteQa.isPending}
                                        >
                                          Delete
                                        </Button>
                                    </SheetClose>
                                    <SheetClose asChild>
                                        <Button
                                          className="flex-[2] h-12 rounded-xl"
                                          onClick={handleSaveQa}
                                          disabled={updateQa.isPending}
                                        >
                                          Update Q&A
                                        </Button>
                                    </SheetClose>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                ))}

                {qaList.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">No Q&A pairs yet. Add your first one above.</p>
                )}
            </TabsContent>
        </Tabs>
      </div>
    </MobileContainer>
  );
}
