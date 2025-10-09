import { prisma } from "store/client";
import {
  xReadGroup,
  xAckBulk,
  claimPendingMessages,
} from "redis-streams/client";
import axios from "axios";

const WORKER_URL = process.env.WORKER_URL;
const WORKER_ID = process.env.WORKER_ID || `worker-${process.pid}`;

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
      timeout: payload.timeout || 10000,
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
      console.log(`🔄 Processing website: ${payload.url} (${payload.id})`);

      const result = await callCloudflareWorker(payload);

      if (!result.success) {
        console.error(
          ` Cloudflare call failed for ${payload.id}:`,
          result.error
        );
        continue;
      }

      // Save checks to database
      for (const check of result.data.checks) {
        await prisma.check.create({
          data: {
            websiteId: check.websiteId || payload.id,
            regionId: check.regionId,
            status: check.status,
            responseTime: check.responseTime,
            statusCode: check.statusCode,
            error: check.error,
          },
        });
      }

      ackIds.push(message.id);
      console.log(` Processed website: ${payload.url}`);
    } catch (error) {
      console.error(` Failed to process message:`, error);
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
        console.log(` Processing ${allMessages.length} messages`);
        await processBatch(allMessages);
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