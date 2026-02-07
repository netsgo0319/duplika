import { describe, it, expect, vi, beforeEach } from 'vitest';
import { YouTubeCrawler, extractVideoId } from '../../worker/crawlers/youtube';

// Mock youtube-transcript
vi.mock('youtube-transcript', () => ({
  YoutubeTranscript: {
    fetchTranscript: vi.fn(),
  },
}));

import { YoutubeTranscript } from 'youtube-transcript';

const mockFetchTranscript = vi.mocked(YoutubeTranscript.fetchTranscript);

describe('extractVideoId', () => {
  it('extracts ID from standard watch URL', () => {
    expect(extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('extracts ID from short URL', () => {
    expect(extractVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('extracts ID from embed URL', () => {
    expect(extractVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('extracts ID from shorts URL', () => {
    expect(extractVideoId('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('extracts ID from URL with extra params', () => {
    expect(extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=120')).toBe('dQw4w9WgXcQ');
  });

  it('throws on invalid URL', () => {
    expect(() => extractVideoId('https://example.com/page')).toThrow('Invalid YouTube URL');
  });

  it('throws on empty string', () => {
    expect(() => extractVideoId('')).toThrow('Invalid YouTube URL');
  });
});

describe('YouTubeCrawler', () => {
  let crawler: YouTubeCrawler;

  beforeEach(() => {
    crawler = new YouTubeCrawler();
    vi.clearAllMocks();
  });

  it('returns CrawlResult with transcript text for a valid URL', async () => {
    mockFetchTranscript.mockResolvedValue([
      { text: 'Hello world', duration: 5, offset: 0, lang: 'en' },
      { text: 'This is a test', duration: 3, offset: 5, lang: 'en' },
      { text: 'of the transcript', duration: 4, offset: 8, lang: 'en' },
    ]);

    const result = await crawler.crawl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');

    expect(result).toEqual({
      sourceType: 'youtube',
      sourceUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      title: 'YouTube video dQw4w9WgXcQ',
      content: 'Hello world This is a test of the transcript',
      metadata: {
        videoId: 'dQw4w9WgXcQ',
      },
    });

    expect(mockFetchTranscript).toHaveBeenCalledWith('dQw4w9WgXcQ');
  });

  it('throws on invalid URL', async () => {
    await expect(crawler.crawl('https://example.com/page')).rejects.toThrow('Invalid YouTube URL');
  });

  it('throws when transcript fetch fails', async () => {
    mockFetchTranscript.mockRejectedValue(new Error('Network error'));

    await expect(
      crawler.crawl('https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
    ).rejects.toThrow('Failed to fetch transcript for video dQw4w9WgXcQ: Network error');
  });

  it('throws when no subtitles are available', async () => {
    mockFetchTranscript.mockResolvedValue([]);

    await expect(
      crawler.crawl('https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
    ).rejects.toThrow('No subtitles available for video dQw4w9WgXcQ');
  });
});
