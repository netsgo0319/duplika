Start the BullMQ worker locally to process crawl jobs from the Railway Redis queue.

Run the following command:

```bash
DATABASE_URL="postgres://postgres:YK~W8abFLSduEy6aaKMv~L3CtjEApZSf@switchback.proxy.rlwy.net:11409/railway" REDIS_URL="redis://default:hMPrYxlzmcqNOTVJQMjkCMgRfOwHkiXC@ballast.proxy.rlwy.net:13300" GEMINI_API_KEY="$GEMINI_API_KEY" npm run dev:worker
```

This connects to:
- Railway PostgreSQL (remote)
- Railway Redis (remote)
- Gemini API for embeddings (text-embedding-004)

The worker listens on the `crawl-pipeline` queue and processes: crawl → chunk → embed (Gemini) → vector store.

Before running, make sure `GEMINI_API_KEY` is set in your environment.
