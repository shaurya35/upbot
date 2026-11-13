-- AlterTable
ALTER TABLE "Check" ADD COLUMN     "observationKey" TEXT;

-- CreateTable
CREATE TABLE "IncidentState" (
    "websiteId" TEXT NOT NULL,
    "lastObservedAt" TIMESTAMP(3),
    "consecutiveDown" INTEGER NOT NULL DEFAULT 0,
    "firstDownAt" TIMESTAMP(3),
    "firstDownReason" TEXT,

    CONSTRAINT "IncidentState_pkey" PRIMARY KEY ("websiteId")
);

-- CreateTable
CREATE TABLE "Incident" (
    "id" TEXT NOT NULL,
    "websiteId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "recoveredAt" TIMESTAMP(3),
    "reason" TEXT,

    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookDelivery" (
    "id" TEXT NOT NULL,
    "incidentId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "nextAttempt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Incident_websiteId_startedAt_idx" ON "Incident"("websiteId", "startedAt");

-- CreateIndex
CREATE INDEX "WebhookDelivery_status_nextAttempt_idx" ON "WebhookDelivery"("status", "nextAttempt");

-- CreateIndex
CREATE UNIQUE INDEX "WebhookDelivery_incidentId_channelId_eventType_key" ON "WebhookDelivery"("incidentId", "channelId", "eventType");

-- CreateIndex
CREATE UNIQUE INDEX "Check_observationKey_key" ON "Check"("observationKey");

-- AddForeignKey
ALTER TABLE "IncidentState" ADD CONSTRAINT "IncidentState_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookDelivery" ADD CONSTRAINT "WebhookDelivery_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookDelivery" ADD CONSTRAINT "WebhookDelivery_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "AlertChannel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
