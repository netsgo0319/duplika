import { Worker, Job } from "bullmq";
import IORedis from "ioredis";
import { createCrawler } from "./crawlers/index";
import { chunkText } from "./pipeline/chunker";
import { embedTexts } from "./pipeline/embedder";
import { storeChunks, deleteBySource } from "./pipeline/vectorStore";
import type { CrawlResult } from "../shared/types";

interface CrawlJobData {
  duplikaId: string;
  sourceUrl: string;
  sourceType: string;
}

async function processCrawlJob(job: Job<CrawlJobData>): Promise<void> {
  const { duplikaId, sourceUrl, sourceType } = job.data;

  // Step 1: Crawl source to get raw text
  await job.updateProgress(10);
  console.log(`Crawling ${sourceType}: ${sourceUrl}`);
  const crawler = createCrawler(sourceType);
  const result = await crawler.crawl(sourceUrl);
  const results: CrawlResult[] = Array.isArray(result) ? result : [result];

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
