import { prisma } from "store/client";
import { 
  xReadGroup, 
  xAckBulk, 
  claimPendingMessages 
} from "redis-streams/client";

const REGION_ID = process.env.REGION_ID;
const WORKER_ID = process.env.WORKER_ID;

if (!REGION_ID || !WORKER_ID) {
  throw new Error("REGION_ID and WORKER_ID must be set");
}

console.log(`[Worker ${WORKER_ID}] Starting in region ${REGION_ID}`);

async function checkWebsite(url: string) {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(url, { 
      signal: controller.signal,
      redirect: 'follow'
    });
    
    clearTimeout(timeout);
    return {
      status: response.ok ? "UP" : "DOWN",
      statusCode: response.status,
      responseTime: Date.now() - start
    };
  } catch (error) {
    return {
      status: "DOWN",
      statusCode: 0,
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function processBatch(messages: any[]) {
  const ackIds: string[] = [];
  
  for (const message of messages) {
    const { id: websiteId, url } = message.message;
    
    try {
      const result = await checkWebsite(url);
      
      if (!REGION_ID) {
        throw new Error("REGION_ID must be set");
      }
      await prisma.check.create({
        data: {
          websiteId,
          regionId: REGION_ID,
          status:
            result.status === "UP"
              ? "UP"
              : result.status === "DOWN"
              ? "DOWN"
              : "UNKNOWN",
          responseTime: result.responseTime,
          statusCode: result.statusCode,
          error: result.error,
        }
      });
      
      ackIds.push(message.id);
      console.log(`[Worker ${WORKER_ID}] Processed ${websiteId}`);
    } catch (error) {
      console.error(`[Worker ${WORKER_ID}] Failed ${websiteId}:`, error);
    }
  }
  
  if (ackIds.length) {
    if (!REGION_ID) {
      throw new Error("REGION_ID must be set");
    }
    await xAckBulk(REGION_ID, ackIds);
    console.log(`[Worker ${WORKER_ID}] Acknowledged ${ackIds.length} messages`);
  }
}

async function main() {
  while (true) {
    try {
      if (!REGION_ID) {
        throw new Error("REGION_ID must be set");
      }
      if(!WORKER_ID){
        throw new Error("WORKER_ID must be set")
;      }
      const newMessages = await xReadGroup(REGION_ID, WORKER_ID);
      if (newMessages.length > 0) {
        await processBatch(newMessages);
      }

      const pendingMessages = await claimPendingMessages(REGION_ID, WORKER_ID);
      if (pendingMessages.length > 0) {
        await processBatch(pendingMessages);
      }

      if (newMessages.length === 0 && pendingMessages.length === 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`[Worker ${WORKER_ID}] Error:`, error);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

main();