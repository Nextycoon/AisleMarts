#!/usr/bin/env node

/**
 * Backfill synthetic impressions for CTAs without impressions
 * Ensures funnel integrity: impressions ≥ CTAs ≥ purchases
 */

import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function backfillSyntheticImpressions() {
  console.log('🔍 Checking for CTAs without impressions...');
  
  try {
    // Find CTAs that don't have corresponding impressions
    const orphanCtas = await prisma.$queryRaw`
      SELECT DISTINCT sc.story_id, sc.user_id, sc.created_at
      FROM story_ctas sc
      LEFT JOIN story_impressions si ON (
        sc.story_id = si.story_id AND 
        sc.user_id = si.user_id AND
        si.created_at <= sc.created_at
      )
      WHERE si.story_id IS NULL
      AND sc.created_at >= CURRENT_DATE - INTERVAL '7 days'
    `;

    console.log(`📊 Found ${orphanCtas.length} CTAs without impressions`);

    if (orphanCtas.length === 0) {
      console.log('✅ No synthetic impressions needed');
      return;
    }

    // Create synthetic impressions (5 minutes before CTA)
    const syntheticImpressions = orphanCtas.map(cta => ({
      story_id: cta.story_id,
      user_id: cta.user_id,
      created_at: new Date(cta.created_at.getTime() - 5 * 60 * 1000), // 5 minutes before
      synthetic: true
    }));

    // Batch insert synthetic impressions
    const result = await prisma.story_impressions.createMany({
      data: syntheticImpressions,
      skipDuplicates: true
    });

    console.log(`✅ Created ${result.count} synthetic impressions`);
    console.log('🎯 Funnel integrity restored');
    
  } catch (error) {
    console.error('❌ Error backfilling impressions:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  backfillSyntheticImpressions()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

export default backfillSyntheticImpressions;