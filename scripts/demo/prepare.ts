import { prisma } from "../../packages/store/index";
const base = process.env.DEMO_TARGET_URL || "http://127.0.0.1:8790";
const email = "demo@upbot.invalid";
try {
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name: "Upbot Demo", signupMethod: "demo" },
  });
  for (const [name, path] of [
    ["Healthy service", "/healthy"],
    ["Outage demonstration", "/switchable"],
  ]) {
    const existing = await prisma.website.findFirst({
      where: { userId: user.id, name, deletedAt: null },
    });
    if (existing)
      await prisma.website.update({
        where: { id: existing.id },
        data: { url: `${base}${path}`, monitorInterval: 30 },
      });
    else
      await prisma.website.create({
        data: {
          name,
          url: `${base}${path}`,
          userId: user.id,
          monitorInterval: 30,
        },
      });
  }
  const webhookUrl = `${base}/webhook`;
  const channel = await prisma.alertChannel.findFirst({
    where: { userId: user.id, type: "WEBHOOK", webhookUrl, isActive: true },
  });
  if (!channel)
    await prisma.alertChannel.create({
      data: { userId: user.id, type: "WEBHOOK", webhookUrl },
    });
  console.log(
    `Set DEMO_USER_ID=${user.id} in the API environment, then restart the API.`,
  );
} finally {
  await prisma.$disconnect();
}
