import 'dotenv/config';
import pkg from '@prisma/client';
import fs from 'fs';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const seed = JSON.parse(fs.readFileSync(new URL('../../data/seed.json', import.meta.url)));

function toDate(seconds) { return new Date(seconds * 1000); }

async function main() {
  console.log('Seeding...');
  await prisma.storyCTA.deleteMany();
  await prisma.storyImpression.deleteMany();
  await prisma.story.deleteMany();
  await prisma.creatorProduct.deleteMany();
  await prisma.affiliateContract.deleteMany();
  await prisma.product.deleteMany();
  await prisma.creator.deleteMany();

  await prisma.product.createMany({ data: seed.products });
  await prisma.creator.createMany({ data: seed.creators });
  for (const s of seed.stories) {
    await prisma.story.create({ data: { ...s, expiresAt: new Date(Date.now() + 23*3600*1000) } });
  }
  // simple contracts
  for (const c of seed.creators) {
    await prisma.affiliateContract.create({
      data: { creatorId: c.id, brandId: 'aislemarts', rateOverride: null, windowDays: 7 }
    });
  }
  console.log('Seed complete.');
}
main().finally(() => prisma.$disconnect());
