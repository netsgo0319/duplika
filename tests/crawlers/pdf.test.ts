import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGetText = vi.fn();
const mockGetInfo = vi.fn();
const mockDestroy = vi.fn();

vi.mock('pdf-parse', () => ({
  PDFParse: class MockPDFParse {
    getText = mockGetText;
    getInfo = mockGetInfo;
    destroy = mockDestroy;
  },
}));

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

import { PdfCrawler } from '../../worker/crawlers/pdf';

describe('PdfCrawler', () => {
  let crawler: PdfCrawler;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDestroy.mockResolvedValue(undefined);
    crawler = new PdfCrawler();
  });

  it('returns CrawlResult with extracted text from a PDF URL', async () => {
    const pdfBuffer = Buffer.from('fake-pdf-content');
    mockFetch.mockResolvedValue({
      ok: true,
      arrayBuffer: async () => pdfBuffer.buffer,
    });

    mockGetText.mockResolvedValue({
      text: '  This is the extracted PDF text content.  ',
      pages: [{ text: 'page1' }, { text: 'page2' }, { text: 'page3' }, { text: 'page4' }, { text: 'page5' }],
    });

    mockGetInfo.mockResolvedValue({
      info: {
        Title: 'My Research Paper',
        Author: 'Jane Doe',
      },
    });

    const result = await crawler.crawl('https://example.com/paper.pdf');

    expect(result).toEqual({
      sourceType: 'pdf',
      sourceUrl: 'https://example.com/paper.pdf',
      title: 'My Research Paper',
      content: 'This is the extracted PDF text content.',
      metadata: {
        author: 'Jane Doe',
        pageCount: 5,
      },
    });
    expect(mockFetch).toHaveBeenCalledWith('https://example.com/paper.pdf');
  });

  it('uses "Untitled PDF" when title is missing', async () => {
    const pdfBuffer = Buffer.from('fake-pdf');
    mockFetch.mockResolvedValue({
      ok: true,
      arrayBuffer: async () => pdfBuffer.buffer,
    });

    mockGetText.mockResolvedValue({
      text: 'Some content',
      pages: [{ text: 'p1' }],
    });

    mockGetInfo.mockResolvedValue({ info: {} });

    const result = await crawler.crawl('https://example.com/no-title.pdf');

    expect(result.title).toBe('Untitled PDF');
    expect(result.metadata.author).toBeUndefined();
  });

  it('throws when PDF fetch fails', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    await expect(crawler.crawl('https://example.com/missing.pdf')).rejects.toThrow(
      'Failed to fetch PDF: HTTP 404: Not Found',
    );
  });

  it('throws when PDF parsing fails', async () => {
    const pdfBuffer = Buffer.from('not-a-pdf');
    mockFetch.mockResolvedValue({
      ok: true,
      arrayBuffer: async () => pdfBuffer.buffer,
    });

    mockGetText.mockRejectedValue(new Error('Invalid PDF structure'));

    await expect(crawler.crawl('https://example.com/corrupt.pdf')).rejects.toThrow(
      'Failed to parse PDF: Invalid PDF structure',
    );
  });

  it('throws when PDF has no text content', async () => {
    const pdfBuffer = Buffer.from('image-only-pdf');
    mockFetch.mockResolvedValue({
      ok: true,
      arrayBuffer: async () => pdfBuffer.buffer,
    });

    mockGetText.mockResolvedValue({
      text: '   ',
      pages: [{ text: '' }, { text: '' }, { text: '' }],
    });

    mockGetInfo.mockResolvedValue({ info: {} });

    await expect(crawler.crawl('https://example.com/image-only.pdf')).rejects.toThrow(
      'No text content extracted from PDF',
    );
  });

  it('parses a buffer directly via parseBuffer', async () => {
    const pdfBuffer = Buffer.from('fake-pdf-data');

    mockGetText.mockResolvedValue({
      text: 'Direct buffer content',
      pages: [{ text: 'p1' }, { text: 'p2' }],
    });

    mockGetInfo.mockResolvedValue({
      info: {
        Title: 'Buffer PDF',
        Author: 'Test Author',
      },
    });

    const result = await crawler.parseBuffer(pdfBuffer, 'file:///local/doc.pdf');

    expect(result.sourceType).toBe('pdf');
    expect(result.sourceUrl).toBe('file:///local/doc.pdf');
    expect(result.content).toBe('Direct buffer content');
    expect(result.metadata.pageCount).toBe(2);
  });

  it('handles info extraction failure gracefully', async () => {
    const pdfBuffer = Buffer.from('fake-pdf');
    mockFetch.mockResolvedValue({
      ok: true,
      arrayBuffer: async () => pdfBuffer.buffer,
    });

    mockGetText.mockResolvedValue({
      text: 'Some text',
      pages: [{ text: 'p1' }],
    });

    mockGetInfo.mockRejectedValue(new Error('Info not available'));

    const result = await crawler.crawl('https://example.com/no-info.pdf');

    expect(result.title).toBe('Untitled PDF');
    expect(result.content).toBe('Some text');
  });
});
