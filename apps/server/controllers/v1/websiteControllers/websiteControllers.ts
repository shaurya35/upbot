import type { Request, Response } from "express";
import dotenv from "dotenv";
import { prisma } from "store/client";

dotenv.config();

const getAllWebsites = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id;
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
                dormancyProtection: true,
                sslExpiryCheck: true,
                createdAt: true
            }
        });
        res.status(200).json(websites);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to fetch websites" });
    }
};

const getWebsiteById = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const website = await prisma.website.findFirst({
            where: {
                id,
                userId,
                deletedAt: null
            }
        });

        if (!website) {
            return res.status(404).json({ error: "Website not found" });
        }

        res.status(200).json(website);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to fetch website" });
    }
};

const createWebsite = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id;
        const { url, name } = req.body;

        if (!url || !name) {
            return res.status(400).json({ error: "URL and name are required!" });
        }

        // todo- complete validation

        const website = await prisma.website.create({
            data: {
                url: url,
                name: name,
                userId: userId,
            }
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
        const userId = req.user.id;
        const { id } = req.params;
        const { url, name, monitorInterval, dormancyProtection, sslExpiryCheck } = req.body;

        
        if (!url && !name && monitorInterval === undefined && dormancyProtection === undefined && sslExpiryCheck === undefined) {
            return res.status(400).json({ error: "At least one field to update is required" });
        }

        // todo- complete validation

        const existingWebsite = await prisma.website.findFirst({
            where: {
                id,
                userId,
                deletedAt: null
            }
        });

        if (!existingWebsite) {
            return res.status(404).json({ error: "Website not found" });
        }

        const updatedWebsite = await prisma.website.update({
            where: { id },
            data: {
                ...(url && { url }),
                ...(name && { name }),
                ...(monitorInterval !== undefined && { monitorInterval: parseInt(monitorInterval) }),
                ...(dormancyProtection !== undefined && { dormancyProtection }),
                ...(sslExpiryCheck !== undefined && { sslExpiryCheck })
            }
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
        const userId = req.user.id;
        const { id } = req.params;

        const existingWebsite = await prisma.website.findFirst({
            where: {
                id,
                userId,
                deletedAt: null
            }
        });

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

export { getAllWebsites, getWebsiteById, createWebsite, updateWebsiteById, deleteWebsiteById };