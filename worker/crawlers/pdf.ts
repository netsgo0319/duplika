import { PDFParse } from 'pdf-parse';
import type { Crawler, CrawlResult } from '../../shared/types.js';

export class PdfCrawler implements Crawler {
  async crawl(url: string): Promise<CrawlResult> {
    let buffer: Buffer;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      buffer = Buffer.from(await response.arrayBuffer());
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`Failed to fetch PDF: ${message}`);
    }

    return this.parseBuffer(buffer, url);
  }

  async parseBuffer(buffer: Buffer, sourceUrl: string): Promise<CrawlResult> {
    let textContent: string;
    let pageCount: number;
    let title: string | undefined;
    let author: string | undefined;

    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    try {
      const textResult = await parser.getText();
      textContent = textResult.text?.trim() ?? '';
      pageCount = textResult.pages?.length ?? 0;

      try {
        const info = await parser.getInfo();
        title = info.info?.Title as string | undefined;
        author = info.info?.Author as string | undefined;
      } catch {
        // Info extraction is optional
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`Failed to parse PDF: ${message}`);
    } finally {
      await parser.destroy().catch(() => {});
    }

    if (!textContent) {
      throw new Error(`No text content extracted from PDF: ${sourceUrl}`);
    }

    return {
      sourceType: 'pdf',
      sourceUrl,
      title: title || 'Untitled PDF',
      content: textContent,
      metadata: {
        author: author || undefined,
        pageCount,
      },
    };
  }
}
