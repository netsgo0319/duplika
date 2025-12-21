import { MobileContainer } from "@/components/layout/mobile-container";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

const INITIAL_FACTS = [
  { id: 1, text: "I have dry skin type." },
  { id: 2, text: "My favorite color is pastel pink." },
  { id: 3, text: "I prefer dewy finish over matte." },
];

const INITIAL_QA = [
  { id: 1, q: "What cushion do you recommend?", a: "I love the Hince Cover Master Pink Cushion for dry skin!" },
  { id: 2, q: "How do you start your routine?", a: "Always start with a gentle toner pad." },
];

export default function MyInfo() {
  const [facts, setFacts] = useState(INITIAL_FACTS);
  const [qaList, setQaList] = useState(INITIAL_QA);
  
  // State for adding/editing
  const [editingFact, setEditingFact] = useState<{id: number, text: string} | null>(null);
  const [newFact, setNewFact] = useState("");
  
  const [editingQa, setEditingQa] = useState<{id: number, q: string, a: string} | null>(null);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");

  const handleSaveFact = () => {
    if (editingFact) {
        setFacts(facts.map(f => f.id === editingFact.id ? { ...f, text: editingFact.text } : f));
        setEditingFact(null);
    } else if (newFact) {
        setFacts([...facts, { id: Date.now(), text: newFact }]);
        setNewFact("");
    }
  };

  const handleSaveQa = () => {
    if (editingQa) {
        setQaList(qaList.map(item => item.id === editingQa.id ? { ...item, q: editingQa.q, a: editingQa.a } : item));
        setEditingQa(null);
    } else if (newQuestion && newAnswer) {
        setQaList([...qaList, { id: Date.now(), q: newQuestion, a: newAnswer }]);
        setNewQuestion("");
        setNewAnswer("");
    }
  };

  return (
    <MobileContainer>
      <header className="flex items-center gap-4 px-4 py-4 border-b border-border sticky top-0 bg-background z-10">
        <Link href="/dashboard/1">
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
                                        <Button className="w-full h-12 rounded-xl" onClick={handleSaveFact}>Save Fact</Button>
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
                                onClick={() => setEditingFact(fact)}
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
                                        <Button variant="outline" className="flex-1 h-12 rounded-xl text-destructive border-destructive/20 hover:bg-destructive/5">Delete</Button>
                                    </SheetClose>
                                    <SheetClose asChild>
                                        <Button className="flex-[2] h-12 rounded-xl" onClick={handleSaveFact}>Update Fact</Button>
                                    </SheetClose>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                ))}
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
                                        <Button className="w-full h-12 rounded-xl" onClick={handleSaveQa}>Save Q&A</Button>
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
                                onClick={() => setEditingQa(item)}
                            >
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                </div>
                                <div className="flex justify-between items-start mb-2">
                                     <div className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide mb-1 inline-block">Q</div>
                                </div>
                                <p className="font-semibold text-sm mb-3">{item.q}</p>
                                
                                <div className="bg-secondary/10 text-secondary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide mb-1 inline-block">A</div>
                                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{item.a}</p>
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
                                        value={editingQa?.q || ""}
                                        onChange={(e) => setEditingQa(prev => prev ? {...prev, q: e.target.value} : null)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Answer</Label>
                                    <Textarea 
                                        value={editingQa?.a || ""}
                                        onChange={(e) => setEditingQa(prev => prev ? {...prev, a: e.target.value} : null)}
                                        className="min-h-[100px]"
                                    />
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <SheetClose asChild>
                                        <Button variant="outline" className="flex-1 h-12 rounded-xl text-destructive border-destructive/20 hover:bg-destructive/5">Delete</Button>
                                    </SheetClose>
                                    <SheetClose asChild>
                                        <Button className="flex-[2] h-12 rounded-xl" onClick={handleSaveQa}>Update Q&A</Button>
                                    </SheetClose>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                ))}
            </TabsContent>
        </Tabs>
      </div>
    </MobileContainer>
  );
}
