import { createClient } from "redis";
import type { RedisClientType } from "redis";

const client = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
}) as RedisClientType;

let isConnected = false;
const MAX_RETRIES = 5;
let connectionRetries = 0;

const connectClient = async () => {
  if (isConnected) return client;

  client.on("error", (err) => {
    console.error("Redis Client Error:", err);
    isConnected = false;

    if (connectionRetries < MAX_RETRIES) {
      const delay = Math.pow(2, connectionRetries) * 1000;
      console.log(`Reconnecting in ${delay}ms...`);
      setTimeout(connectClient, delay);
      connectionRetries++;
    }
  });

  try {
    await client.connect();
    isConnected = true;
    connectionRetries = 0;
    console.log("Redis connected successfully");
    return client;
  } catch (err) {
    console.error("Redis connection failed:", err);
    throw err;
  }
};

const ensureConnection = async () => {
  if (!isConnected) {
    await connectClient();
  }
  return client;
};

type WebsiteEvent = { url: string; id: string; userId: string };
type StreamMessage = {
  id: string;
  message: WebsiteEvent;
};

const STREAM_NAME = "betteruptime:website";
const CONSUMER_GROUP_NAME = "monitoring-group";
const CONSUMER_PREFIX = "worker";

const initConsumerGroup = async () => {
  try {
    await client.xGroupCreate(STREAM_NAME, CONSUMER_GROUP_NAME, "0", {
      MKSTREAM: true,
    });
    console.log("Consumer group created");
  } catch (err) {
    if (err instanceof Error && err.message.includes("BUSYGROUP")) {
      console.log("Consumer group already exists");
    } else {
      console.error("Error creating consumer group:", err);
      throw err;
    }
  }
};

const getPendingMessageIds = async (
  streamName: string,
  groupName: string,
  minIdleTime: number,
  count: number
): Promise<string[]> => {
  const pendingSummary = await client.xPending(streamName, groupName);

  if (pendingSummary.pending === 0) return [];

  const pendingMessages = await client.xPendingRange(
    streamName,
    groupName,
    "-",
    "+",
    count,
    { IDLE: minIdleTime }
  );

  return pendingMessages
    .filter((msg): msg is NonNullable<typeof msg> => msg !== null)
    .map((msg) => msg.id);
};

export const xAdd = async (event: WebsiteEvent) => {
  await ensureConnection();
  return client.xAdd(STREAM_NAME, "*", {
    url: event.url,
    id: event.id,
    userId: event.userId,
  });
};

export const xAddBulk = async (websites: WebsiteEvent[]) => {
  await ensureConnection();
  const pipeline = client.multi();

  websites.forEach((website) => {
    pipeline.xAdd(STREAM_NAME, "*", {
      url: website.url,
      id: website.id,
      userId: website.userId,
    });
  });

  return pipeline.exec();
};

export const xReadGroup = async (
  workerId: string,
  batchSize = 5
): Promise<StreamMessage[]> => {
  await ensureConnection();

  try {
    const result = await client.xReadGroup(
      CONSUMER_GROUP_NAME,
      `${CONSUMER_PREFIX}-${workerId}`,
      {
        key: STREAM_NAME,
        id: ">",
      },
      {
        COUNT: batchSize,
        BLOCK: 5000,
      }
    );

    if (!result || result.length === 0) return [];

    return result[0].messages
      .filter((msg): msg is NonNullable<typeof msg> => msg !== null)
      .map((msg) => ({
        id: msg.id,
        message: {
          url: msg.message.url as string,
          id: msg.message.id as string,
          userId: msg.message.userId as string,
        },
      }));
  } catch (err) {
    console.error("Error reading from stream:", err);
    return [];
  }
};

export const xAck = async (messageId: string) => {
  await ensureConnection();
  return client.xAck(STREAM_NAME, CONSUMER_GROUP_NAME, messageId);
};

export const xAckBulk = async (messageIds: string[]) => {
  await ensureConnection();
  const pipeline = client.multi();

  messageIds.forEach((id) => {
    pipeline.xAck(STREAM_NAME, CONSUMER_GROUP_NAME, id);
  });

  return pipeline.exec();
};

export const claimPendingMessages = async (
  workerId: string,
  minIdleTime = 30000,
  batchSize = 5
): Promise<StreamMessage[]> => {
  await ensureConnection();

  try {
    const messageIds = await getPendingMessageIds(
      STREAM_NAME,
      CONSUMER_GROUP_NAME,
      minIdleTime,
      batchSize
    );

    if (messageIds.length === 0) return [];

    const messages = await client.xClaim(
      STREAM_NAME,
      CONSUMER_GROUP_NAME,
      `${CONSUMER_PREFIX}-${workerId}`,
      minIdleTime,
      messageIds
    );

    return messages
      .filter((msg): msg is NonNullable<typeof msg> => msg !== null)
      .map((msg) => ({
        id: msg.id,
        message: {
          url: msg.message.url as string,
          id: msg.message.id as string,
          userId: msg.message.userId as string,
        },
      }));
  } catch (err) {
    console.error("Error claiming pending messages:", err);
    return [];
  }
};

export const getStreamLength = async (): Promise<number> => {
  await ensureConnection();
  try {
    const info = await client.xLen(STREAM_NAME);
    return info;
  } catch (err) {
    console.error("Error getting stream length:", err);
    return -1;
  }
};

export const getPendingCount = async (): Promise<number> => {
  await ensureConnection();
  try {
    const pending = await client.xPending(STREAM_NAME, CONSUMER_GROUP_NAME);
    return pending.pending;
  } catch (err) {
    console.error("Error getting pending count:", err);
    return -1;
  }
};

(async () => {
  try {
    await ensureConnection();
    await initConsumerGroup();
    console.log("Redis streams initialized successfully");
  } catch (err) {
    console.error("Stream initialization failed:", err);
    process.exit(1);
  }
})();

process.on("SIGINT", async () => {
  console.log("Disconnecting from Redis...");
  await client.quit();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Disconnecting from Redis...");
  await client.quit();
  process.exit(0);
});

export default {
  xAdd,
  xAddBulk,
  xReadGroup,
  xAck,
  xAckBulk,
  claimPendingMessages,
  getStreamLength,
  getPendingCount,
};
