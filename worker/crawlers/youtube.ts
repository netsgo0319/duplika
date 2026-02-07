import { YoutubeTranscript } from 'youtube-transcript';
import type { Crawler, CrawlResult } from '../../shared/types.js';

/**
 * Extract YouTube video ID from various URL formats.
 * Supports: youtube.com/watch?v=, youtu.be/, youtube.com/embed/, youtube.com/shorts/
 */
export function extractVideoId(url: string): string {
  const patterns = [
    /(?:youtube\.com\/watch\?.*v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  throw new Error(`Invalid YouTube URL: ${url}`);
}

export class YouTubeCrawler implements Crawler {
  async crawl(url: string): Promise<CrawlResult> {
    const videoId = extractVideoId(url);

    let transcriptItems;
    try {
      transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`Failed to fetch transcript for video ${videoId}: ${message}`);
    }

    if (!transcriptItems || transcriptItems.length === 0) {
      throw new Error(`No subtitles available for video ${videoId}`);
    }

    const content = transcriptItems.map((item) => item.text).join(' ');

    return {
      sourceType: 'youtube',
      sourceUrl: url,
      title: `YouTube video ${videoId}`,
      content,
      metadata: {
        videoId,
      },
    };
  }
}
