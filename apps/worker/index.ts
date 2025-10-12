import { prisma } from "store/client";
import {
  xReadGroup,
  xAckBulk,
  claimPendingMessages,
} from "redis-streams/client";
import axios from "axios";

const WORKER_URL = process.env.WORKER_URL;
const WORKER_ID = process.env.WORKER_ID || `worker-${process.pid}`;
const MAX_BATCH_SIZE = parseInt(process.env.MAX_BATCH_SIZE || "50"); 
const WEBSITE_TIMEOUT = parseInt(process.env.WEBSITE_TIMEOUT || "3600000");

if (!WORKER_URL) {
  throw new Error("WORKER_URL must be set");
}

async function callCloudflareWorker(payload: any) {
  if(!WORKER_URL){
    throw new Error("WORKER_URL not set!")
  }
  const start = Date.now();
  try {
    const response = await axios.post(WORKER_URL, payload, {
      timeout: payload.timeout || 30000, // 30 seconds for individual website checks
      validateStatus: (status) => status < 500,
    });

    return {
      success: true,
      data: response.data,
      responseTime: Date.now() - start,
    };
  } catch (error) {
    let errorMessage = "Unknown error";

    if (axios.isAxiosError(error)) {
      const axiosError = error;
      if (axiosError.response) {
        errorMessage = `Cloudflare worker returned ${axiosError.response.status}: ${axiosError.response.statusText}`;
      } else if (axiosError.request) {
        errorMessage = "No response received from Cloudflare worker";
      } else {
        errorMessage = axiosError.message;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
      responseTime: Date.now() - start,
    };
  }
}

async function processBatch(messages: any[]) {
  const ackIds: string[] = [];
  const allChecks: any[] = [];

  // Limit batch size to prevent memory issues
  const messagesToProcess = messages.slice(0, MAX_BATCH_SIZE);
  if (messages.length > MAX_BATCH_SIZE) {
    console.log(`⚠️  Batch size limited to ${MAX_BATCH_SIZE} (${messages.length - MAX_BATCH_SIZE} messages will be processed in next batch)`);
  }

  // Process all websites in parallel with simple long timeout
  const websitePromises = messagesToProcess.map(async (message) => {
    try {
      const payload = message.message;
      console.log(`🔄 Processing website: ${payload.url} (${payload.id})`);

      // Simple timeout - only for truly stuck requests (1 hour default)
      const result = await Promise.race([
        callCloudflareWorker(payload),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Website processing timeout (1 hour)')), WEBSITE_TIMEOUT)
        )
      ]) as any;

      if (!result.success) {
        console.error(
          ` Cloudflare call failed for ${payload.id}:`,
          result.error
        );
        return { messageId: message.id, checks: [] };
      }

      // Collect checks for bulk insert
      const checks = result.data.checks.map((check: any) => ({
        websiteId: check.websiteId || payload.id,
        regionId: check.regionId,
        status: check.status,
        responseTime: check.responseTime,
        statusCode: check.statusCode,
        error: check.error,
      }));

      console.log(` Processed website: ${payload.url} (${checks.length} checks)`);
      return { messageId: message.id, checks };
    } catch (error) {
      console.error(` Failed to process message:`, error);
      return { messageId: message.id, checks: [] };
    }
  });

  // Wait for all website processing to complete
  const results = await Promise.all(websitePromises);

  // Collect all checks and ack IDs
  for (const result of results) {
    allChecks.push(...result.checks);
    if (result.checks.length > 0) {
      ackIds.push(result.messageId);
    }
  }

  // Bulk insert all checks at once
  if (allChecks.length > 0) {
    try {
      console.log(`💾 Bulk inserting ${allChecks.length} checks to database`);
      await prisma.check.createMany({
        data: allChecks,
        skipDuplicates: true, // Skip duplicates if any
      });
      console.log(`✅ Successfully inserted ${allChecks.length} checks`);
    } catch (error) {
      console.error(`❌ Failed to bulk insert checks:`, error);
      // If bulk insert fails, we still ack the messages to avoid reprocessing
      // In production, you might want to implement retry logic or dead letter queue
    }
  }

  if (ackIds.length > 0) {
    await xAckBulk(ackIds);
    console.log(` Acknowledged ${ackIds.length} messages`);
  }
}

async function main() {
  console.log(` Worker started with ID: ${WORKER_ID}`);
  
  while (true) {
    try {
      const newMessages = await xReadGroup(WORKER_ID);
      const pendingMessages = await claimPendingMessages(WORKER_ID);

      const allMessages = [...newMessages, ...pendingMessages];

      if (allMessages.length > 0) {
        console.log(`📦 Processing ${allMessages.length} messages in batch`);
        const startTime = Date.now();
        await processBatch(allMessages);
        const processingTime = Date.now() - startTime;
        console.log(`⚡ Batch processed in ${processingTime}ms (${Math.round(allMessages.length / (processingTime / 1000))} websites/sec)`);
      } else {
        // No messages, wait a bit before checking again
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(` Error in main loop:`, error);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

process.on("SIGINT", async () => {
  console.log(" Received SIGINT, shutting down...");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log(" Received SIGTERM, shutting down...");
  process.exit(0);
});

main().catch((error) => {
  console.error(` Fatal error:`, error);
  process.exit(1);
});