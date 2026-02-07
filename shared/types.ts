export interface CrawlResult {
  sourceType: 'youtube' | 'instagram' | 'pdf';
  sourceUrl: string;
  title: string;
  content: string;
  metadata: {
    author?: string;
    publishedAt?: string;
    language?: string;
    [key: string]: unknown;
  };
}

export interface Crawler {
  crawl(url: string): Promise<CrawlResult | CrawlResult[]>;
}
