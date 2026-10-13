import type { Request, Response } from "express";
import { prisma, Prisma } from "store/client";

const MIN_INTERVAL = 30;
const MAX_INTERVAL = 3600;

const RANGES = {
    "24h": { interval: "24 hours", bucketSeconds: 30 * 60 },
    "7d": { interval: "7 days", bucketSeconds: 3 * 60 * 60 },
    "30d": { interval: "30 days", bucketSeconds: 12 * 60 * 60 },
} as const;

type RangeKey = keyof typeof RANGES;

const isHttpUrl = (value: unknown): value is string => {
    if (typeof value !== "string") return false;
    try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
};

const parseInterval = (value: unknown) => {
    const interval = Number(value);
    if (!Number.isInteger(interval) || interval < MIN_INTERVAL || interval > MAX_INTERVAL) {
        return null;
    }
    return interval;
};

const sinceSql = (range: RangeKey) =>
    Prisma.raw(`(now() AT TIME ZONE 'UTC') - interval '${RANGES[range].interval}'`);

type SummaryRow = {
    websiteId: string;
    total: number;
    up: number;
    avgResponseTime: number | null;
};

type LatestRow = {
    websiteId: string;
    status: "UP" | "DOWN" | "UNKNOWN";
    responseTime: number;
    statusCode: number | null;
    createdAt: Date;
};

const getSummaries = async (websiteIds: string[]) => {
    if (!websiteIds.length) return new Map();

    const ids = Prisma.join(websiteIds);
    const [latest, summaries] = await Promise.all([
        prisma.$queryRaw<LatestRow[]>`
            SELECT DISTINCT ON ("websiteId") "websiteId", status::text AS status, "responseTime", "statusCode", "createdAt"
            FROM "Check"
            WHERE "websiteId" IN (${ids})
            ORDER BY "websiteId", "createdAt" DESC`,
        prisma.$queryRaw<SummaryRow[]>`
            SELECT "websiteId",
                   count(*)::int AS total,
                   (count(*) FILTER (WHERE status = 'UP'))::int AS up,
                   avg("responseTime")::float AS "avgResponseTime"
            FROM "Check"
            WHERE "websiteId" IN (${ids}) AND "createdAt" >= ${sinceSql("24h")}
            GROUP BY "websiteId"`,
    ]);

    const byId = new Map<string, object>();
    for (const id of websiteIds) {
        const last = latest.find((row) => row.websiteId === id);
        const summary = summaries.find((row) => row.websiteId === id);
        byId.set(id, {
            status: last?.status ?? "UNKNOWN",
            lastCheckedAt: last?.createdAt ?? null,
            lastResponseTime: last?.responseTime ?? null,
            uptime24h: summary && summary.total ? (summary.up / summary.total) * 100 : null,
            avgResponseTime24h: summary?.avgResponseTime != null ? Math.round(summary.avgResponseTime) : null,
        });
    }
    return byId;
};

const findOwnedWebsite = (id: string, userId: string) =>
    prisma.website.findFirst({
        where: { id, userId, deletedAt: null },
        select: { id: true, url: true, name: true, monitorInterval: true, createdAt: true },
    });

const getAllWebsites = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const websites = await prisma.website.findMany({
            where: {
                userId,
                deletedAt: null
            },
            select: {
                id: true,
                url: true,
                name: true,
                monitorInterval: true,
                createdAt: true
            },
            orderBy: { createdAt: "desc" },
        });
        const summaries = await getSummaries(websites.map((website) => website.id));
        res.status(200).json(websites.map((website) => ({ ...website, ...summaries.get(website.id) })));
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to fetch websites" });
    }
};

const getWebsiteById = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const website = await findOwnedWebsite(req.params.id as string, userId);

        if (!website) {
            return res.status(404).json({ error: "Website not found" });
        }

        const summaries = await getSummaries([website.id]);
        res.status(200).json({ ...website, ...summaries.get(website.id) });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to fetch website" });
    }
};

const createWebsite = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { url, name, monitorInterval } = req.body;

        if (!name || typeof name !== "string" || !name.trim()) {
            return res.status(400).json({ error: "Name is required" });
        }
        if (!isHttpUrl(url)) {
            return res.status(400).json({ error: "URL must be a valid http(s) URL" });
        }
        const interval = monitorInterval === undefined ? 60 : parseInterval(monitorInterval);
        if (interval === null) {
            return res.status(400).json({ error: `Interval must be between ${MIN_INTERVAL} and ${MAX_INTERVAL} seconds` });
        }

        const website = await prisma.website.create({
            data: {
                url,
                name: name.trim(),
                monitorInterval: interval,
                userId,
            },
            select: { id: true, url: true, name: true, monitorInterval: true, createdAt: true },
        });

        return res.status(201).json({
            message: "Website created successfully!",
            website
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to create website" });
    }
};

const updateWebsiteById = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const id = req.params.id as string;
        const { url, name, monitorInterval } = req.body;

        if (url === undefined && name === undefined && monitorInterval === undefined) {
            return res.status(400).json({ error: "At least one field to update is required" });
        }
        if (url !== undefined && !isHttpUrl(url)) {
            return res.status(400).json({ error: "URL must be a valid http(s) URL" });
        }
        if (name !== undefined && (typeof name !== "string" || !name.trim())) {
            return res.status(400).json({ error: "Name cannot be empty" });
        }
        const interval = monitorInterval === undefined ? undefined : parseInterval(monitorInterval);
        if (interval === null) {
            return res.status(400).json({ error: `Interval must be between ${MIN_INTERVAL} and ${MAX_INTERVAL} seconds` });
        }

        const existingWebsite = await findOwnedWebsite(id, userId);
        if (!existingWebsite) {
            return res.status(404).json({ error: "Website not found" });
        }

        const updatedWebsite = await prisma.website.update({
            where: { id },
            data: {
                ...(url !== undefined && { url }),
                ...(name !== undefined && { name: name.trim() }),
                ...(interval !== undefined && { monitorInterval: interval }),
            },
            select: { id: true, url: true, name: true, monitorInterval: true, createdAt: true },
        });

        res.status(200).json({
            message: "Website updated successfully!",
            website: updatedWebsite
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to update website" });
    }
};

const deleteWebsiteById = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const id = req.params.id as string;

        const existingWebsite = await findOwnedWebsite(id, userId);
        if (!existingWebsite) {
            return res.status(404).json({ error: "Website not found" });
        }

        await prisma.website.update({
            where: { id },
            data: {
                deletedAt: new Date()
            }
        });

        res.status(200).json({ message: "Website deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to delete website" });
    }
};

type BucketRow = {
    bucket: number;
    total: number;
    up: number;
    avgResponseTime: number | null;
};

type RangeSummaryRow = {
    total: number;
    up: number;
    avgResponseTime: number | null;
    minResponseTime: number | null;
    maxResponseTime: number | null;
};

const getWebsiteStats = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const range = (req.query.range as RangeKey) || "24h";
        if (!(range in RANGES)) {
            return res.status(400).json({ error: "range must be one of 24h, 7d, 30d" });
        }

        const website = await findOwnedWebsite(req.params.id as string, userId);
        if (!website) {
            return res.status(404).json({ error: "Website not found" });
        }

        const bucketSeconds = RANGES[range].bucketSeconds;
        const [buckets, [summary], [uptime]] = await Promise.all([
            prisma.$queryRaw<BucketRow[]>`
                SELECT (floor(extract(epoch FROM "createdAt") / ${bucketSeconds}::int) * ${bucketSeconds}::int)::bigint::float AS bucket,
                       count(*)::int AS total,
                       (count(*) FILTER (WHERE status = 'UP'))::int AS up,
                       avg("responseTime") FILTER (WHERE status = 'UP')::float AS "avgResponseTime"
                FROM "Check"
                WHERE "websiteId" = ${website.id} AND "createdAt" >= ${sinceSql(range)}
                GROUP BY 1
                ORDER BY 1`,
            prisma.$queryRaw<RangeSummaryRow[]>`
                SELECT count(*)::int AS total,
                       (count(*) FILTER (WHERE status = 'UP'))::int AS up,
                       avg("responseTime") FILTER (WHERE status = 'UP')::float AS "avgResponseTime",
                       min("responseTime") FILTER (WHERE status = 'UP') AS "minResponseTime",
                       max("responseTime") FILTER (WHERE status = 'UP') AS "maxResponseTime"
                FROM "Check"
                WHERE "websiteId" = ${website.id} AND "createdAt" >= ${sinceSql(range)}`,
            prisma.$queryRaw<{ up24h: number; total24h: number; up7d: number; total7d: number; up30d: number; total30d: number }[]>`
                SELECT (count(*) FILTER (WHERE status = 'UP' AND "createdAt" >= ${sinceSql("24h")}))::int AS up24h,
                       (count(*) FILTER (WHERE "createdAt" >= ${sinceSql("24h")}))::int AS total24h,
                       (count(*) FILTER (WHERE status = 'UP' AND "createdAt" >= ${sinceSql("7d")}))::int AS up7d,
                       (count(*) FILTER (WHERE "createdAt" >= ${sinceSql("7d")}))::int AS total7d,
                       (count(*) FILTER (WHERE status = 'UP'))::int AS up30d,
                       count(*)::int AS total30d
                FROM "Check"
                WHERE "websiteId" = ${website.id} AND "createdAt" >= ${sinceSql("30d")}`,
        ]);

        const percent = (up: number, total: number) => (total ? (up / total) * 100 : null);

        res.status(200).json({
            range,
            bucketSeconds,
            buckets: buckets.map((row) => ({
                time: new Date(row.bucket * 1000).toISOString(),
                total: row.total,
                up: row.up,
                down: row.total - row.up,
                avgResponseTime: row.avgResponseTime != null ? Math.round(row.avgResponseTime) : null,
            })),
            summary: {
                totalChecks: summary?.total ?? 0,
                uptime: percent(summary?.up ?? 0, summary?.total ?? 0),
                avgResponseTime: summary?.avgResponseTime != null ? Math.round(summary.avgResponseTime) : null,
                minResponseTime: summary?.minResponseTime ?? null,
                maxResponseTime: summary?.maxResponseTime ?? null,
            },
            uptime: {
                "24h": percent(uptime?.up24h ?? 0, uptime?.total24h ?? 0),
                "7d": percent(uptime?.up7d ?? 0, uptime?.total7d ?? 0),
                "30d": percent(uptime?.up30d ?? 0, uptime?.total30d ?? 0),
            },
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to fetch website stats" });
    }
};

const getWebsiteChecks = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);

        const website = await findOwnedWebsite(req.params.id as string, userId);
        if (!website) {
            return res.status(404).json({ error: "Website not found" });
        }

        const checks = await prisma.check.findMany({
            where: { websiteId: website.id },
            orderBy: { createdAt: "desc" },
            take: limit,
            select: {
                id: true,
                status: true,
                responseTime: true,
                statusCode: true,
                error: true,
                createdAt: true,
                region: { select: { code: true, name: true } },
            },
        });

        res.status(200).json(checks);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to fetch checks" });
    }
};

export {
    getAllWebsites,
    getWebsiteById,
    createWebsite,
    updateWebsiteById,
    deleteWebsiteById,
    getWebsiteStats,
    getWebsiteChecks,
};
