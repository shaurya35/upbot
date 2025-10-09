import { createClient } from "redis";
import { prisma } from "store/client";
import { xAddBulk } from "redis-streams/client";
import { getRegionsForPlan } from "./region.config";

const SCHEDULE_KEY = "upbot:schedule";
const CHECK_INTERVAL = 5000;
const WEBSITE_REFRESH_INTERVAL = 300000; 
const DEFAULT_TIMEOUT = 10000;

const redisClient = createClient({ url: process.env.REDIS_URL });

redisClient.on("error", (err) => console.error("Redis Error:", err));

let processedWebsites = new Set<string>();
let processingCycle = 1;

async function processDueWebsites() {
  try {
    const now = Date.now();
    console.log(`\n=== Cycle ${processingCycle} - ${new Date(now).toISOString()} ===`);
    
    const dueWebsites = await redisClient.zRangeByScore(SCHEDULE_KEY, 0, now);

    if (!dueWebsites.length) {
      console.log("No due websites found");
      processingCycle++;
      return;
    }

    console.log(`Found ${dueWebsites.length} due websites`);
    const websites = dueWebsites.map((website) => JSON.parse(website));

    const payloads = [];
    const pipeline = redisClient.multi();
    const upcomingReschedules = [];

    for (const website of websites) {
      try {
        if (!processedWebsites.has(website.id)) {
          console.log(` New website added: ${website.url} (${website.id})`);
          processedWebsites.add(website.id);
        }

        console.log(` Processing: ${website.url} (${website.id})`);
        
        const regions = getRegionsForPlan(website.userPlan);
        console.log(` Regions for ${website.url}: ${regions.map(r => r.code).join(', ')}`);

        const payload = {
          id: website.id,
          url: website.url,
          userId: website.userId,
          regions: regions.map(region => ({
            regionId: region.id,
            regionCode: region.code
          })),
          timeout: website.timeout || DEFAULT_TIMEOUT,
          monitorInterval: website.monitorInterval
        };

        payloads.push(payload);
        console.log(` Created payload for ${website.url}`);

        const nextRun = now + (website.monitorInterval * 1000);
        const rescheduleValue = JSON.stringify({
          ...website,
          regions: payload.regions
        });
        
        pipeline.zAdd(SCHEDULE_KEY, {
          score: nextRun,
          value: rescheduleValue,
        });
        
        console.log(` Rescheduled ${website.url} for ${new Date(nextRun).toISOString()} (in ${website.monitorInterval}s)`);
        upcomingReschedules.push({
          url: website.url,
          nextRun: new Date(nextRun).toISOString(),
          interval: website.monitorInterval
        });
      } catch (error) {
        console.error(
          `❌ Error processing website ${website.id}:`,
          error
        );
      }
    }

    if (payloads.length > 0) {
      console.log(` Adding ${payloads.length} payloads to Redis streams`);
      await xAddBulk(payloads);
      console.log(" Successfully added payloads to streams");
    }

    await pipeline.exec();
    
    if (upcomingReschedules.length > 0) {
      console.log("\n Upcoming reschedules:");
      upcomingReschedules.forEach(rs => {
        console.log(`   - ${rs.url}: ${rs.nextRun} (every ${rs.interval}s)`);
      });
    }
    
    console.log(" Pipeline executed successfully");
    processingCycle++;
  } catch (error) {
    console.error(" Processing error:", error);
  }
}

async function refreshWebsites() {
  try {
    console.log("\n Refreshing websites from database...");
    const websites = await prisma.website.findMany({
      where: { deletedAt: null },
      include: {
        user: {
          select: {
            plan: true,
          },
        },
      },
    });

    const existingWebsites = await redisClient.zRange(SCHEDULE_KEY, 0, -1);
    const existingIds = new Set(existingWebsites.map(w => JSON.parse(w).id));

    const newWebsites = websites.filter(w => !existingIds.has(w.id));
    
    if (newWebsites.length > 0) {
      console.log(` Found ${newWebsites.length} new websites`);
      const pipeline = redisClient.multi();
      const now = Date.now();

      for (const website of newWebsites) {
        const regions = getRegionsForPlan(website.user.plan);
        const job = {
          id: website.id,
          url: website.url,
          userId: website.userId,
          monitorInterval: website.monitorInterval,
          timeout: DEFAULT_TIMEOUT,
          regions: regions.map(region => ({
            regionId: region.id,
            regionCode: region.code
          })),
          userPlan: website.user.plan
        };

        const initialDelay = Math.random() * job.monitorInterval * 1000;
        const nextRun = now + initialDelay;
        
        pipeline.zAdd(SCHEDULE_KEY, {
          score: nextRun,
          value: JSON.stringify(job),
        });
        
        console.log(` Scheduled new website ${website.url} for ${new Date(nextRun).toISOString()}`);
        console.log(`   Plan: ${job.userPlan}, Regions: ${job.regions.map(r => r.regionCode).join(', ')}`);
      }

      await pipeline.exec();
      console.log(" New websites scheduled successfully");
    } else {
      console.log(" No new websites found");
    }
  } catch (error) {
    console.error(" Error refreshing websites:", error);
  }
}

async function initScheduler() {
  try {
    console.log(" Initializing scheduler...");
    await redisClient.del(SCHEDULE_KEY);
    console.log(" Cleared existing schedule");

    const websites = await prisma.website.findMany({
      where: { deletedAt: null },
      include: {
        user: {
          select: {
            plan: true,
          },
        },
      },
    });

    console.log(` Fetched ${websites.length} websites from database`);

    const jobs = websites.map((website) => {
      const regions = getRegionsForPlan(website.user.plan);
      
      return {
        id: website.id,
        url: website.url,
        userId: website.userId,
        monitorInterval: website.monitorInterval,
        timeout: DEFAULT_TIMEOUT,
        regions: regions.map(region => ({
          regionId: region.id,
          regionCode: region.code
        })),
        userPlan: website.user.plan
      };
    });

    console.log(` Creating ${jobs.length} jobs`);

    const pipeline = redisClient.multi();
    const now = Date.now();

    jobs.forEach((job) => {
      const initialDelay = Math.random() * job.monitorInterval * 1000;
      const nextRun = now + initialDelay;
      
      pipeline.zAdd(SCHEDULE_KEY, {
        score: nextRun,
        value: JSON.stringify(job),
      });
      
      console.log(` Scheduled ${job.url} with ${job.regions.length} regions for ${new Date(nextRun).toISOString()} (in ${Math.round(initialDelay/1000)}s)`);
      console.log(`   Plan: ${job.userPlan}, Regions: ${job.regions.map(r => r.regionCode).join(', ')}`);
    });

    await pipeline.exec();
    console.log(" All jobs scheduled successfully");

    setTimeout(processDueWebsites, 1000);
    
    setInterval(processDueWebsites, CHECK_INTERVAL);
    setInterval(refreshWebsites, WEBSITE_REFRESH_INTERVAL);
    console.log(` Started interval check every ${CHECK_INTERVAL}ms`);
    console.log(` Started website refresh every ${WEBSITE_REFRESH_INTERVAL}ms`);
  } catch (error) {
    console.error("❌ Initialization failed:", error);
    process.exit(1);
  }
}

async function initialize() {
  try {
    console.log("🔌 Connecting to Redis...");
    await redisClient.connect();
    console.log(" Connected to Redis");
    await initScheduler();
  } catch (error) {
    console.error("❌ Initialization failed:", error);
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  console.log(" Received SIGINT, shutting down...");
  await redisClient.quit();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log(" Received SIGTERM, shutting down...");
  await redisClient.quit();
  process.exit(0);
});

initialize();