import type { Request, Response } from "express";
import { prisma } from "store/client";

const getAllAlertChannels = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const alertChannels = await prisma.alertChannel.findMany({
      where: { userId, isActive: true },
      select: {
        id: true,
        type: true,
        webhookUrl: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true
      }
    });
    res.status(200).json(alertChannels);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch alert channels" });
  }
};

const getAlertChannelById = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const alertChannel = await prisma.alertChannel.findFirst({
      where: { id, userId, isActive: true }
    });

    if (!alertChannel) {
      return res.status(404).json({ error: "Alert channel not found" });
    }

    res.status(200).json(alertChannel);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch alert channel" });
  }
};

const createAlertChannel = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { type, webhookUrl, email, phone } = req.body;

    if (!type) {
      return res.status(400).json({ error: "Alert type is required" });
    }

    // todo - create alert validations

    const newAlertChannel = await prisma.alertChannel.create({
      data: {
        type,
        webhookUrl,
        email,
        phone,
        userId,
        isActive: true
      }
    });

    res.status(201).json({
      message: "Alert channel created successfully",
      alertChannel: newAlertChannel
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create alert channel" });
  }
};

const updateAlertChannelById = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { type, webhookUrl, email, phone, isActive } = req.body;

    const existingChannel = await prisma.alertChannel.findFirst({
      where: { id, userId }
    });

    if (!existingChannel) {
      return res.status(404).json({ error: "Alert channel not found" });
    }

    // todo - validate alert 

    const updatedChannel = await prisma.alertChannel.update({
      where: { id },
      data: {
        ...(type && { type }),
        ...(webhookUrl !== undefined && { webhookUrl }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(isActive !== undefined && { isActive })
      }
    });

    res.status(200).json({
      message: "Alert channel updated successfully",
      alertChannel: updatedChannel
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update alert channel" });
  }
};

const deleteAlertChannelById = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const existingChannel = await prisma.alertChannel.findFirst({
      where: { id, userId }
    });

    if (!existingChannel) {
      return res.status(404).json({ error: "Alert channel not found" });
    }

    await prisma.alertChannel.update({
      where: { id },
      data: { isActive: false }
    });

    res.status(200).json({ message: "Alert channel deactivated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete alert channel" });
  }
};

export {
  getAllAlertChannels,
  getAlertChannelById,
  createAlertChannel,
  updateAlertChannelById,
  deleteAlertChannelById
};