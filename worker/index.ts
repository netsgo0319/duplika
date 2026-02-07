import { Worker, Job } from "bullmq";
import IORedis from "ioredis";
import { createCrawler } from "./crawlers/index";
import { PdfCrawler } from "./crawlers/pdf";
import { chunkText } from "./pipeline/chunker";
import { embedTexts } from "./pipeline/embedder";
import { storeChunks, deleteBySource } from "./pipeline/vectorStore";
import type { CrawlResult } from "../shared/types";
import { storage } from "../server/storage";

interface CrawlJobData {
  duplikaId: string;
  sourceUrl: string;
  sourceType: string;
  sourceId?: string;
}

async function processCrawlJob(job: Job<CrawlJobData>): Promise<void> {
  const { duplikaId, sourceUrl, sourceType, sourceId } = job.data;

  // Step 1: Get content
  await job.updateProgress(10);
  let results: CrawlResult[];

  if (sourceType === "pdf" && sourceId) {
    // PDF: read base64 from DB, parse text
    console.log(`Processing PDF from DB: ${sourceUrl}`);
    const source = await storage.getContentSource(sourceId);
    if (!source?.rawContent) {
      throw new Error(`No rawContent found for source ${sourceId}`);
    }
    const base64Data = source.rawContent.includes(",") ? source.rawContent.split(",")[1] : source.rawContent;
    const buffer = Buffer.from(base64Data, "base64");
    const pdfCrawler = new PdfCrawler();
    const result = await pdfCrawler.parseBuffer(buffer, sourceUrl);
    results = [result];
  } else {
    // YouTube/Instagram: crawl from URL
    console.log(`Crawling ${sourceType}: ${sourceUrl}`);
    const crawler = createCrawler(sourceType);
    const result = await crawler.crawl(sourceUrl);
    results = Array.isArray(result) ? result : [result];
  }

  let totalChunks = 0;

  for (const item of results) {
    if (!item.content) continue;

    // Step 2: Chunk text
    await job.updateProgress(30);
    const chunks = await chunkText(item.content);
    if (chunks.length === 0) continue;

    // Step 3: Generate embeddings
    await job.updateProgress(50);
    const embeddings = await embedTexts(chunks);

    // Step 4: Delete old chunks for this source (re-crawl scenario)
    await job.updateProgress(70);
    await deleteBySource(duplikaId, item.sourceUrl);

    // Step 5: Store chunks + embeddings
    await job.updateProgress(90);
    await storeChunks(duplikaId, item.sourceType, item.sourceUrl, chunks, embeddings);
    totalChunks += chunks.length;
  }

  await job.updateProgress(100);
  console.log(
    `Processed ${totalChunks} chunks for ${sourceType}: ${sourceUrl}`,
  );
}

export function startWorker(): Worker<CrawlJobData> {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    throw new Error("REDIS_URL environment variable is required");
  }

  const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });

  const worker = new Worker<CrawlJobData>(
    "crawl-pipeline",
    processCrawlJob,
    { connection, concurrency: 2 },
  );

  worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed for source: ${job.data.sourceUrl}`);
  });

  worker.on("failed", (job, error) => {
    console.error(
      `Job ${job?.id} failed for source: ${job?.data.sourceUrl}`,
      error.message,
    );
  });

  console.log("BullMQ Worker started — listening on 'crawl-pipeline' queue");
  return worker;
}

// Start worker when executed directly
startWorker();
