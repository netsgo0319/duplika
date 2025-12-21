import { ExternalLink, Play } from "lucide-react";

interface SourceCardProps {
  thumbnailUrl: string;
  sourceName: string;
  sourceUrl: string;
  timestamp: string;
}

export function SourceCard({ thumbnailUrl, sourceName, sourceUrl, timestamp }: SourceCardProps) {
  return (
    <div className="w-full max-w-[280px] ml-10 mb-6 bg-card rounded-xl border border-border shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-300 origin-top-left">
      <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="block relative group">
        <div className="aspect-video w-full bg-muted relative overflow-hidden">
            <img src={thumbnailUrl} alt="Source thumbnail" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg backdrop-blur-sm">
                    <Play className="w-4 h-4 text-black fill-current ml-0.5" />
                </div>
            </div>
        </div>
        <div className="p-3 bg-card hover:bg-muted/30 transition-colors">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span className="font-medium text-foreground">{sourceName}</span>
                <ExternalLink className="w-3 h-3" />
            </div>
            <div className="text-xs font-mono text-primary bg-primary/10 inline-block px-1.5 py-0.5 rounded-sm">
                📍 {timestamp}
            </div>
        </div>
      </a>
    </div>
  );
}
