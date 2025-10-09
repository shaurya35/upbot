import type { Request, Response} from "express";
import { prisma }from "store/client";

const getAllChecks = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const websiteId = req.params.websiteId;

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const checks = await prisma.check.findMany({
            where: {
                websiteId,
            },
            select: {
                id: true,
                regionId: true,
                region: true,
                status: true,
                responseTime: true,
                statusCode: true,
                error: true,
                createdAt: true,
            }
        });
        res.status(200).json(checks);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to fetch checks" });
    }
}

export { getAllChecks }