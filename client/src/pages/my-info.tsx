import { MobileContainer } from "@/components/layout/mobile-container";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Edit2, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

const MOCK_FACTS = [
  { id: 1, text: "I have dry skin type." },
  { id: 2, text: "My favorite color is pastel pink." },
  { id: 3, text: "I prefer dewy finish over matte." },
];

const MOCK_QA = [
  { id: 1, q: "What cushion do you recommend?", a: "I love the Hince Cover Master Pink Cushion for dry skin!" },
  { id: 2, q: "How do you start your routine?", a: "Always start with a gentle toner pad." },
];

export default function MyInfo() {
  return (
    <MobileContainer showNav={false}>
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

            <TabsContent value="facts" className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-muted-foreground">Core persona information</p>
                    <Button size="sm" variant="outline" className="h-8 gap-1 rounded-full text-xs">
                        <Plus className="w-3 h-3" /> Add Fact
                    </Button>
                </div>
                {MOCK_FACTS.map((fact) => (
                    <Card key={fact.id} className="p-4 flex items-center justify-between group bg-card hover:border-primary/50 transition-colors">
                        <p className="text-sm font-medium">{fact.text}</p>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </Card>
                ))}
            </TabsContent>

            <TabsContent value="qa" className="space-y-4">
                 <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-muted-foreground">Common questions & answers</p>
                    <Button size="sm" variant="outline" className="h-8 gap-1 rounded-full text-xs">
                        <Plus className="w-3 h-3" /> Add Q&A
                    </Button>
                </div>
                {MOCK_QA.map((item) => (
                    <Card key={item.id} className="p-4 group bg-card hover:border-primary/50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                             <div className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide mb-1 inline-block">Q</div>
                             <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary">
                                    <Edit2 className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>
                        <p className="font-semibold text-sm mb-3">{item.q}</p>
                        
                         <div className="bg-secondary/10 text-secondary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide mb-1 inline-block">A</div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                    </Card>
                ))}
            </TabsContent>
        </Tabs>
      </div>
    </MobileContainer>
  );
}
