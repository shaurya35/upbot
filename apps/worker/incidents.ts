import { prisma } from "store/client";

type Observation = {
  observationKey: string;
  websiteId: string;
  regionId: string;
  status: "UP" | "DOWN" | "UNKNOWN";
  responseTime: number;
  statusCode?: number;
  error?: string;
  createdAt: Date;
};

export async function saveObservation(check: Observation) {
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "Website" WHERE id = ${check.websiteId} FOR UPDATE`;
    const site = await tx.website.findFirst({
      where: {
        id: check.websiteId,
        deletedAt: null,
        user: { deletedAt: null },
      },
    });
    if (!site) return;
    const inserted = await tx.check.createMany({
      data: [check],
      skipDuplicates: true,
    });
    if (!inserted.count) return;
    const state = await tx.incidentState.upsert({
      where: { websiteId: site.id },
      create: { websiteId: site.id },
      update: {},
    });
    const time = check.createdAt;
    if (state.lastObservedAt && time <= state.lastObservedAt) return;
    const staleMs = Math.max(3 * site.monitorInterval * 1000, 120000);
    if (Date.now() - time.getTime() > staleMs) return;
    const gap =
      state.lastObservedAt &&
      time.getTime() - state.lastObservedAt.getTime() > staleMs;
    const down =
      check.status === "DOWN" ? (gap ? 1 : state.consecutiveDown + 1) : 0;
    const firstDownAt = down === 1 ? time : down > 1 ? state.firstDownAt : null;
    const firstDownReason =
      down === 1
        ? check.error || `HTTP ${check.statusCode ?? "error"}`
        : down > 1
          ? state.firstDownReason
          : null;
    await tx.incidentState.update({
      where: { websiteId: site.id },
      data: {
        lastObservedAt: time,
        consecutiveDown: down,
        firstDownAt,
        firstDownReason,
      },
    });
    let incident = await tx.incident.findFirst({
      where: { websiteId: site.id, recoveredAt: null },
    });
    let eventType: string | null = null;
    if (!incident && down >= 2 && firstDownAt) {
      incident = await tx.incident.create({
        data: {
          websiteId: site.id,
          startedAt: firstDownAt,
          reason: firstDownReason,
        },
      });
      eventType = "outage";
    } else if (incident && check.status === "UP") {
      incident = await tx.incident.update({
        where: { id: incident.id },
        data: { recoveredAt: time },
      });
      eventType = "recovery";
    }
    if (incident && eventType) {
      const channels = await tx.alertChannel.findMany({
        where: {
          userId: site.userId,
          type: "WEBHOOK",
          isActive: true,
          webhookUrl: { not: null },
        },
      });
      await tx.webhookDelivery.createMany({
        data: channels.map((channel) => ({
          incidentId: incident!.id,
          channelId: channel.id,
          eventType: eventType!,
          occurredAt: time,
        })),
        skipDuplicates: true,
      });
    }
  });
}

const delays = [5000, 15000, 60000, 300000];
export async function deliverPending() {
  const deliveries = await prisma.webhookDelivery.findMany({
    where: { status: "PENDING", nextAttempt: { lte: new Date() } },
    include: { channel: true, incident: { include: { website: true } } },
    take: 10,
  });
  for (const delivery of deliveries) {
    const attempts = delivery.attempts + 1;
    let success = false;
    try {
      if (!delivery.channel.isActive || !delivery.channel.webhookUrl)
        throw new Error("Channel unavailable");
      const response = await fetch(delivery.channel.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": delivery.id,
        },
        body: JSON.stringify({
          id: delivery.id,
          type: delivery.eventType,
          incidentId: delivery.incidentId,
          websiteId: delivery.incident.websiteId,
          websiteName: delivery.incident.website.name,
          occurredAt: delivery.occurredAt,
        }),
        signal: AbortSignal.timeout(5000),
      });
      success = response.ok;
      await response.body?.cancel();
    } catch (error) {
      console.error("Webhook delivery failed:", error);
    }
    await prisma.webhookDelivery.update({
      where: { id: delivery.id },
      data: {
        attempts,
        status: success ? "SENT" : attempts >= 5 ? "FAILED" : "PENDING",
        nextAttempt: new Date(Date.now() + (delays[attempts - 1] || 0)),
      },
    });
  }
}
