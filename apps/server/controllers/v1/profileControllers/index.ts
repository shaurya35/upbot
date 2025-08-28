import type { Request, Response } from "express";
import { decodeToken } from "../../../helpers/jwt";
import { prisma } from "store/client";

const getProfile = async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token missing" });
    }

    try {
        const data = decodeToken(refreshToken);
        if (!data) {
            return res.status(403).json({ message: "Invalid refresh token" });
        }

        let userId: string | undefined;
        if (typeof data === "string") {
            return res.status(403).json({ message: "Invalid refresh token" });
        } else if ("userId" in data && (typeof data.userId === "string" || typeof data.userId === "number")) {
            userId = String(data.userId);
        } else {
            return res.status(403).json({ message: "Invalid refresh token" });
        }

        const user = await prisma.user.findFirst({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                plan: true,
                signupMethod: true,
            },
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ profile: user });
    } catch (error) {
        return res.status(403).json({ message: "Invalid refresh token" });
    }
};

export { getProfile }