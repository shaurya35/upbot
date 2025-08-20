import { createClient } from "redis";
import { prisma } from "store/client";
import {
  xReadGroup,
  xAckBulk,
  claimPendingMessages,
} from "redis-streams/client";
import axios from "axios";

const REDIS_URL = process.env.REDIS_URL;
const WORKER_URL = process.env.WORKER_URL;
const WORKER_ID = process.env.WORKER_ID;

if (!REDIS_URL || !WORKER_URL || !WORKER_ID) {
  throw new Error("REDIS_URL, WORKER_URL and WORKER_ID must be set");
}

const redisClient = createClient({ url: REDIS_URL });

redisClient.on("error", (err) => console.error("Redis Error:", err));

async function callCloudflareWorker(payload: any) {
  if (!WORKER_URL) {
    throw new Error("WORKER_URL is required!");
  }
  const start = Date.now();
  try {
    const response = await axios.post(WORKER_URL, payload, {
      timeout: 30000,
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

  for (const message of messages) {
    try {
      const payload = message.message;
      const result = await callCloudflareWorker(payload);

      if (!result.success) {
        console.error(
          `Cloudflare call failed for ${payload.id}:`,
          result.error
        );
        continue;
      }

      for (const check of result.data.checks) {
        await prisma.check.create({
          data: {
            websiteId: check.websiteId,
            regionId: check.regionId,
            status: check.status,
            responseTime: check.responseTime,
            statusCode: check.statusCode,
            error: check.error,
          },
        });
      }

      ackIds.push(message.id);
    } catch (error) {
      console.error(`Failed to process message:`, error);
    }
  }

  if (ackIds.length > 0) {
    await xAckBulk("websites", ackIds);
  }
}

async function main() {
  await redisClient.connect();

  if (!WORKER_ID) {
    throw new Error("WORKER_ID is required!");
  }

  while (true) {
    try {
      const newMessages = await xReadGroup("websites", WORKER_ID);
      const pendingMessages = await claimPendingMessages("websites", WORKER_ID);

      const allMessages = [...newMessages, ...pendingMessages];

      if (allMessages.length > 0) {
        await processBatch(allMessages);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`Error:`, error);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

process.on("SIGINT", async () => {
  await redisClient.quit();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await redisClient.quit();
  process.exit(0);
});

main().catch((error) => {
  console.error(`Fatal error:`, error);
  process.exit(1);
});
