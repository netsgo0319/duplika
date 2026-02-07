import { MobileContainer } from "@/components/layout/mobile-container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Youtube, Instagram, FileText, Trash2, Plus, Loader2 } from "lucide-react";
import { Link, useRoute } from "wouter";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useContentSources, useCreateContentSource, useDeleteContentSource } from "@/hooks/use-duplikas";

const SOURCE_ICONS: Record<string, typeof Youtube> = {
  youtube: Youtube,
  instagram: Instagram,
  pdf: FileText,
};

const SOURCE_COLORS: Record<string, string> = {
  youtube: "bg-red-100 text-red-600",
  instagram: "bg-pink-100 text-pink-600",
  pdf: "bg-green-100 text-green-600",
};

const SOURCE_PLACEHOLDERS: Record<string, string> = {
  youtube: "https://youtube.com/watch?v=...",
  instagram: "https://www.instagram.com/p/...",
  pdf: "https://example.com/document.pdf",
};

export default function ContentSources() {
  const [, params] = useRoute("/content-sources/:id");
  const duplikaId = params?.id || "";

  const { data: sources, isLoading } = useContentSources(duplikaId);
  const createSource = useCreateContentSource(duplikaId);
  const deleteSource = useDeleteContentSource(duplikaId);

  const [sourceType, setSourceType] = useState<string>("youtube");
  const [sourceUrl, setSourceUrl] = useState("");

  const handleAdd = async () => {
    if (!sourceUrl.trim()) {
      toast({ title: "URL required", variant: "destructive", duration: 2000 });
      return;
    }
    try {
      await createSource.mutateAsync({ sourceType, sourceUrl: sourceUrl.trim() });
      setSourceUrl("");
      toast({ title: "Source added", description: "Crawling will start when the worker processes the queue.", duration: 3000 });
    } catch {
      toast({ title: "Failed to add source", variant: "destructive", duration: 2000 });
    }
  };

  const handleDelete = async (sourceId: string) => {
    try {
      await deleteSource.mutateAsync(sourceId);
      toast({ title: "Source removed", duration: 2000 });
    } catch {
      toast({ title: "Failed to remove source", variant: "destructive", duration: 2000 });
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
        <h1 className="text-lg font-bold font-heading">Content Sources</h1>
      </header>

      <div className="px-6 py-6 space-y-6">
        {/* Add Source Form */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Add Source</Label>
          <div className="flex gap-2">
            <Select value={sourceType} onValueChange={setSourceType}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder={SOURCE_PLACEHOLDERS[sourceType] || "URL"}
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              className="flex-1"
            />
          </div>
          <Button
            onClick={handleAdd}
            disabled={createSource.isPending}
            className="w-full"
          >
            {createSource.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Add Source
          </Button>
        </div>

        {/* Source List */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">
            Registered Sources ({sources?.length ?? 0})
          </Label>

          {(!sources || sources.length === 0) && (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No sources added yet. Add a YouTube video, Instagram post, or PDF to train your Duplika.
            </p>
          )}

          {sources?.map((source) => {
            const Icon = SOURCE_ICONS[source.sourceType] || FileText;
            const colorClass = SOURCE_COLORS[source.sourceType] || "bg-gray-100 text-gray-600";

            return (
              <Card key={source.id} className="p-3 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium uppercase text-muted-foreground">{source.sourceType}</p>
                  <p className="text-sm truncate">{source.sourceUrl}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive/60 hover:text-destructive flex-shrink-0"
                  onClick={() => handleDelete(source.id)}
                  disabled={deleteSource.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </Card>
            );
          })}
        </div>
      </div>
    </MobileContainer>
  );
}
