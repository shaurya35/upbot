import { prisma } from "./index";
import { ALL_REGIONS } from "./regions";

async function seedRegions() {
  for (const region of ALL_REGIONS) {
    await prisma.region.upsert({
      where: { id: region.id },
      update: { code: region.code, name: region.name },
      create: { id: region.id, code: region.code, name: region.name },
    });
  }

  console.log(`Seeded ${ALL_REGIONS.length} regions`);
}

seedRegions()
  .catch((error) => {
    console.error("Region seed failed:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
