import type { Request, Response } from "express";
import { prisma } from "store/client";
import { publicUserSelect } from "../authControllers";

const getProfile = async (req: Request, res: Response) => {
    try {
        const user = await prisma.user.findFirst({
            where: { id: (req as any).user.id, deletedAt: null },
            select: publicUserSelect,
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ profile: user });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to fetch profile" });
    }
};

const updateProfile = async (req: Request, res: Response) => {
    try {
        const { name, company } = req.body;

        if (name !== undefined && (typeof name !== "string" || !name.trim())) {
            return res.status(400).json({ message: "Name cannot be empty" });
        }
        if (company !== undefined && company !== null && typeof company !== "string") {
            return res.status(400).json({ message: "Company must be a string" });
        }

        const user = await prisma.user.update({
            where: { id: (req as any).user.id },
            data: {
                ...(name !== undefined && { name: name.trim() }),
                ...(company !== undefined && { company: company?.trim() || null }),
            },
            select: publicUserSelect,
        });

        return res.status(200).json({ profile: user });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to update profile" });
    }
};

export { getProfile, updateProfile };
