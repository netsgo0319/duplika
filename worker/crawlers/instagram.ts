import type { Crawler, CrawlResult } from '../../shared/types.js';

interface OEmbedResponse {
  title?: string;
  author_name?: string;
  author_url?: string;
  html?: string;
  thumbnail_url?: string;
}

/**
 * Instagram crawler using the oEmbed API.
 * Extracts post caption and metadata from public Instagram posts.
 * No API key required for oEmbed.
 */
export class InstagramCrawler implements Crawler {
  private oEmbedUrl = 'https://api.instagram.com/oembed';

  async crawl(url: string): Promise<CrawlResult> {
    const normalizedUrl = this.normalizeUrl(url);

    let data: OEmbedResponse;
    try {
      const response = await fetch(
        `${this.oEmbedUrl}?url=${encodeURIComponent(normalizedUrl)}&omitscript=true`,
      );
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      data = await response.json() as OEmbedResponse;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`Failed to fetch Instagram oEmbed data: ${message}`);
    }

    const caption = this.extractCaption(data);

    if (!caption) {
      throw new Error(`No caption found for Instagram post: ${normalizedUrl}`);
    }

    return {
      sourceType: 'instagram',
      sourceUrl: normalizedUrl,
      title: data.title || `Post by ${data.author_name || 'Unknown'}`,
      content: caption,
      metadata: {
        author: data.author_name || undefined,
        authorUrl: data.author_url || undefined,
        thumbnailUrl: data.thumbnail_url || undefined,
      },
    };
  }

  private normalizeUrl(url: string): string {
    // Ensure the URL ends with / for oEmbed compatibility
    const cleaned = url.split('?')[0];
    return cleaned.endsWith('/') ? cleaned : cleaned + '/';
  }

  private extractCaption(data: OEmbedResponse): string | null {
    // The oEmbed title field contains the caption (first ~140 chars)
    if (data.title && data.title.trim().length > 0) {
      return data.title.trim();
    }

    // Fallback: try to extract from HTML embed code
    if (data.html) {
      const match = data.html.match(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/);
      if (match) {
        const text = match[1]
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        if (text.length > 0) return text;
      }
    }

    return null;
  }
}
