import { MobileContainer } from "@/components/layout/mobile-container";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, MessageCircle, Edit2, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";

const MOCK_KEYWORDS = [
  { id: 1, keyword: "price, cost, how much", response: "My consultation sessions start at $50/hour. You can book directly on my website!" },
  { id: 2, keyword: "collab, partnership", response: "For collaboration inquiries, please email business@inbora.com instead of chatting here." },
];

export default function KeywordResponses() {
  return (
    <MobileContainer>
      <header className="flex items-center gap-4 px-4 py-4 border-b border-border sticky top-0 bg-background z-10">
        <Link href="/dashboard/1">
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
            {MOCK_KEYWORDS.map((item) => (
                <Card key={item.id} className="p-4 group hover:border-primary/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex flex-wrap gap-1 mb-2">
                            {item.keyword.split(',').map((k, i) => (
                                <span key={i} className="bg-secondary text-secondary-foreground text-xs font-medium px-2 py-1 rounded-md">
                                    {k.trim()}
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary">
                                <Edit2 className="w-3 h-3" />
                            </Button>
                             <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive">
                                <Trash2 className="w-3 h-3" />
                            </Button>
                        </div>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
                        <p className="text-sm text-muted-foreground leading-relaxed">"{item.response}"</p>
                    </div>
                </Card>
            ))}
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
                        <Input placeholder="e.g. price, cost, rates" />
                    </div>
                    <div className="space-y-2">
                        <Label>Response</Label>
                        <Textarea placeholder="Type the exact response you want the AI to give..." className="min-h-[100px]" />
                    </div>
                    <div className="pt-4">
                        <SheetClose asChild>
                            <Button className="w-full h-12 rounded-xl">Save Response</Button>
                        </SheetClose>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
      </div>
    </MobileContainer>
  );
}
