import { createClient } from "redis";

export const client = createClient({ url: process.env.REDIS_URL });
const CONSUMER_GROUP = "monitoring";

let isConnected = false;

async function connect() {
  if (isConnected) return client;
  await client.connect();
  isConnected = true;
  return client;
}

export const xAddBulk = async (jobs: any[]) => {
  await connect();
  const pipeline = client.multi();
  
  jobs.forEach(job => {
    const stream = `upbot:websites`;
    pipeline.xAdd(stream, "*", {
      id: job.id,
      url: job.url,
      userId: job.userId,
      regions: JSON.stringify(job.regions),
      timeout: job.timeout.toString(),
      monitorInterval: job.monitorInterval?.toString()
    });
  });
  
  await pipeline.exec();
};

export const xReadGroup = async (workerId: string) => {
  await connect();
  const stream = `upbot:websites`;
  
  try {
    await client.xGroupCreate(stream, CONSUMER_GROUP, "0", { MKSTREAM: true });
  } catch (e) {
    if (typeof e === "object" && e !== null && "message" in e && typeof (e as any).message === "string") {
      if (!(e as any).message.includes("BUSYGROUP")) console.error(e);
    } else {
      console.error(e);
    }
  }

  const result = await client.xReadGroup(
    CONSUMER_GROUP,
    workerId,
    { key: stream, id: ">" },
    { COUNT: 10, BLOCK: 5000 }
  );
  
  if (
    !result ||
    !Array.isArray(result) ||
    typeof result[0] !== "object" ||
    result[0] === null ||
    !("messages" in result[0]) ||
    !Array.isArray((result[0] as any).messages)
  ) {
    return [];
  }
  return (result[0] as any).messages.map((msg: any) => ({
    id: msg.id,
    message: {
      id: msg.message?.id,
      url: msg.message?.url,
      userId: msg.message?.userId,
      regions: JSON.parse(msg.message?.regions || "[]"), 
      timeout: parseInt(msg.message?.timeout ?? "10000", 10),
      monitorInterval: parseInt(msg.message?.monitorInterval ?? "60", 10)
    }
  }));
};

export const xAckBulk = async (messageIds: string[]) => {
  if (!messageIds.length) return;
  await connect();
  
  const pipeline = client.multi();
  const stream = `upbot:websites`;
  
  messageIds.forEach(id => {
    pipeline.xAck(stream, CONSUMER_GROUP, id);
  });
  
  await pipeline.exec();
};

export const claimPendingMessages = async (workerId: string) => {
  await connect();
  const stream = `upbot:websites`;
  
  const pending = await client.xPendingRange(
    stream,
    CONSUMER_GROUP,
    "-", "+", 10, { IDLE: 30000 }
  );
  
  if (!pending.length) return [];
  
  const ids = pending.map(msg => msg.id);
  const messages = await client.xClaim(
    stream,
    CONSUMER_GROUP,
    workerId,
    30000,
    ids
  );
  
  return messages
    .filter((msg): msg is { id: string; message: any } => !!msg && !!msg.message)
    .map(msg => ({
      id: msg.id,
      message: {
        id: msg.message?.id,
        url: msg.message?.url,
        userId: msg.message?.userId,
        regions: JSON.parse(msg.message?.regions || "[]"), 
        timeout: parseInt(msg.message?.timeout ?? "10000", 10),
        monitorInterval: parseInt(msg.message?.monitorInterval ?? "60", 10)
      }
    }));
};

process.on("SIGINT", async () => {
  await client.quit();
});

process.on("SIGTERM", async () => {
  await client.quit();
});