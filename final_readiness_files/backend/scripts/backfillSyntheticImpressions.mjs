import 'dotenv/config';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const LOOKBACK_MIN = 30;

async function run() {
  const since = new Date(Date.now() - 7*24*60*60*1000);
  const ctas = await prisma.$queryRaw`
    SELECT c.id, c.story_id, c.user_id, c.clicked_at
    FROM story_ctas c
    LEFT JOIN story_impressions i
      ON i.story_id = c.story_id
     AND i.user_id  = c.user_id
     AND i.viewed_at >= c.clicked_at - interval '${LOOKBACK_MIN} minutes'
     AND i.viewed_at <= c.clicked_at
    WHERE c.clicked_at >= ${since}
      AND i.id IS NULL
  `;
  for (const c of ctas) {
    await prisma.storyImpression.create({
      data: { storyId: c.story_id, userId: c.user_id, viewedAt: new Date(new Date(c.clicked_at).getTime() - 1000) }
    });
  }
  console.log('Backfilled', ctas.length, 'synthetic impressions');
}
run().finally(()=>prisma.$disconnect());
