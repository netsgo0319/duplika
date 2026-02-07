import type { Crawler } from '../../shared/types.js';
import { YouTubeCrawler } from './youtube.js';
import { InstagramCrawler } from './instagram.js';
import { PdfCrawler } from './pdf.js';

export function createCrawler(sourceType: string): Crawler {
  switch (sourceType) {
    case 'youtube':
      return new YouTubeCrawler();
    case 'instagram':
      return new InstagramCrawler();
    case 'pdf':
      return new PdfCrawler();
    default:
      throw new Error(`Unknown source type: ${sourceType}`);
  }
}

export { YouTubeCrawler } from './youtube.js';
export { InstagramCrawler } from './instagram.js';
export { PdfCrawler } from './pdf.js';
