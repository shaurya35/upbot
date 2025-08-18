import { prisma } from "store/client";

async function seedRegions() {
  const regions = [
    { code: "us-east", name: "US East (Virginia)", provider: "CLOUDFLARE" },
    { code: "eu-west", name: "EU West (London)", provider: "CLOUDFLARE" },
    { code: "ap-south", name: "Asia Pacific (Mumbai)", provider: "CLOUDFLARE" },
    {
      code: "sa-east",
      name: "South America (São Paulo)",
      provider: "CLOUDFLARE",
    },
    { code: "me-central", name: "Middle East (Dubai)", provider: "CLOUDFLARE" },
    { code: "af-south", name: "Africa (Cape Town)", provider: "CLOUDFLARE" },
    { code: "oc-sydney", name: "Oceania (Sydney)", provider: "CLOUDFLARE" },
  ];

  for (const region of regions) {
    await prisma.region.upsert({
      where: { code: region.code },
      update: {},
      create: region as any,
    });
  }

  console.log("✅ 7 regions created!");
}

seedRegions();
