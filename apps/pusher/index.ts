import { createClient } from "redis";
import { prisma } from "store/client";
import { xAddBulk } from "redis-streams/client";

const SCHEDULE_KEY = "upbot:schedule";
const CHECK_INTERVAL = 5000;
const redisClient = createClient({ url: process.env.REDIS_URL });

redisClient.on("error", (err) => console.error("[Pusher] Redis Error:", err));
await redisClient.connect();

async function processDueWebsites() {
  try {
    const now = Date.now();
    const dueWebsites = await redisClient.zRangeByScore(SCHEDULE_KEY, 0, now);
    
    if (!dueWebsites.length) return;

    const websites = dueWebsites.map((website) => JSON.parse(website));
    console.log(`[Pusher] Processing ${websites.length} websites`);

    // Separate free and pro users
    const proWebsites = websites.filter(w => w.subscriptionPlan !== 'FREE');
    const freeWebsites = websites.filter(w => w.subscriptionPlan === 'FREE');

    if (proWebsites.length > 0) {
      await xAddBulk(proWebsites);
    }

    if (freeWebsites.length > 0) {
      await processFreeChecks(freeWebsites);
    }

    const pipeline = redisClient.multi();
    websites.forEach(website => {
      const nextRun = now + website.monitorInterval * 1000;
      pipeline.zAdd(SCHEDULE_KEY, { score: nextRun, value: JSON.stringify(website) });
    });
    
    await pipeline.exec();
  } catch (error) {
    console.error("[Pusher] Processing error:", error);
  }
}

async function processFreeChecks(websites: any[]) {
  for (const website of websites) {
    try {
      const result = await checkWebsite(website.url);
      await prisma.check.create({
        data: {
          websiteId: website.id,
          regionId: 'free-tier',
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
    } catch (error) {
      console.error(`[Pusher] Free check failed: ${website.id}`, error);
    }
  }
}

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

async function initScheduler() {
  try {
    await redisClient.del(SCHEDULE_KEY);
    
    const websites = await prisma.website.findMany({
      where: { deletedAt: null },
      select: { 
        id: true, 
        url: true, 
        userId: true, 
        monitorInterval: true,
        user: { select: { plan: true } }
      }
    });

    const regions = await prisma.region.findMany({ select: { id: true } });

    const jobs = websites.flatMap(website => 
      regions.map(region => ({
        ...website,
        regionId: region.id,
        nextRun: Date.now()
      }))
    );

    const pipeline = redisClient.multi();
    jobs.forEach(job => {
      pipeline.zAdd(SCHEDULE_KEY, { score: job.nextRun, value: JSON.stringify(job) });
    });
    
    await pipeline.exec();
    console.log(`[Pusher] Scheduled ${jobs.length} jobs`);
    
    setInterval(processDueWebsites, CHECK_INTERVAL);
  } catch (error) {
    console.error("[Pusher] Initialization failed:", error);
    process.exit(1);
  }
}

initScheduler();

process.on("SIGINT", async () => {
  await redisClient.quit();
  process.exit(0);
});