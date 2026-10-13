import { prisma } from "store/client";
import {
  xReadGroup,
  xAckBulk,
  claimPendingMessages,
  disconnect,
} from "redis-streams/client";
import axios from "axios";

const WORKER_URL = process.env.WORKER_URL;
const WORKER_ID = process.env.WORKER_ID || `worker-${process.pid}`;
const CLOUDFLARE_TIMEOUT_MARGIN = parseInt(process.env.CLOUDFLARE_TIMEOUT_MARGIN || "10000");
const DEFAULT_CHECK_TIMEOUT = 10000;
const WORKER_SECRET = process.env.WORKER_SECRET;

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
      timeout: (payload.timeout || DEFAULT_CHECK_TIMEOUT) + CLOUDFLARE_TIMEOUT_MARGIN,
      headers: WORKER_SECRET ? { "X-Upbot-Secret": WORKER_SECRET } : undefined,
    });

    if (!Array.isArray(response.data?.checks)) {
      return {
        success: false,
        error: "Cloudflare worker response is missing checks",
        responseTime: Date.now() - start,
      };
    }

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

  const websitePromises = messages.map(async (message) => {
    try {
      const payload = message.message;
      console.log(`Processing website: ${payload.url} (${payload.id})`);

      const result = await callCloudflareWorker(payload);

      if (!result.success) {
        console.error(
          `Cloudflare call failed for ${payload.id}:`,
          result.error
        );
        return { messageId: message.id, checks: [] };
      }

      const checks = result.data!.checks.map((check: any) => ({
        websiteId: check.websiteId || payload.id,
        regionId: check.regionId,
        status: check.status,
        responseTime: check.responseTime,
        statusCode: check.statusCode,
        error: check.error,
      }));

      console.log(`Processed website: ${payload.url} (${checks.length} checks)`);
      return { messageId: message.id, checks };
    } catch (error) {
      console.error(`Failed to process message:`, error);
      return { messageId: message.id, checks: [] };
    }
  });

  const results = await Promise.all(websitePromises);

  for (const result of results) {
    allChecks.push(...result.checks);
    if (result.checks.length > 0) {
      ackIds.push(result.messageId);
    }
  }

  if (allChecks.length > 0) {
    try {
      console.log(`Bulk inserting ${allChecks.length} checks to database`);
      await prisma.check.createMany({
        data: allChecks,
        skipDuplicates: true, 
      });
      console.log(`Successfully inserted ${allChecks.length} checks`);
    } catch (error) {
      console.error(`Failed to bulk insert checks:`, error);
    }
  }

  if (ackIds.length > 0) {
    await xAckBulk(ackIds);
    console.log(`Acknowledged ${ackIds.length} messages`);
  }
}

async function main() {
  console.log(`Worker started with ID: ${WORKER_ID}`);
  
  while (true) {
    try {
      const newMessages = await xReadGroup(WORKER_ID);
      const pendingMessages = await claimPendingMessages(WORKER_ID);

      const allMessages = [...newMessages, ...pendingMessages];

      if (allMessages.length > 0) {
        console.log(`Processing ${allMessages.length} messages in batch`);
        const startTime = Date.now();
        await processBatch(allMessages);
        const processingTime = Date.now() - startTime;
        console.log(`Batch processed in ${processingTime}ms (${Math.round(allMessages.length / (processingTime / 1000))} websites/sec)`);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(` Error in main loop:`, error);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

let shuttingDown = false;

async function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`Received ${signal}, shutting down...`);
  await Promise.allSettled([disconnect(), prisma.$disconnect()]);
  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

main().catch((error) => {
  console.error(` Fatal error:`, error);
  process.exit(1);
});
