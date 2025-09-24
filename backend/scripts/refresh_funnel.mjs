#!/usr/bin/env node

/**
 * Refresh funnel materialized views and analytics
 * Ensures data consistency for Series A analytics
 */

import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function refreshFunnel() {
  console.log('🔄 Refreshing funnel materialized views...');
  
  try {
    // Refresh the materialized view
    await prisma.$executeRaw`REFRESH MATERIALIZED VIEW funnel_daily`;
    console.log('✅ Materialized view refreshed');

    // Check data integrity
    const funnelCheck = await prisma.$queryRaw`
      SELECT 
        day,
        SUM(impressions) as total_impressions,
        SUM(ctas) as total_ctas,
        SUM(purchases) as total_purchases,
        CASE 
          WHEN SUM(impressions) >= SUM(ctas) AND SUM(ctas) >= SUM(purchases) 
          THEN 'PASS' 
          ELSE 'FAIL' 
        END as integrity_check
      FROM funnel_daily 
      WHERE day >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY day
      ORDER BY day DESC
    `;

    console.log('📊 Funnel Integrity Check (Last 7 days):');
    funnelCheck.forEach(row => {
      const status = row.integrity_check === 'PASS' ? '✅' : '❌';
      console.log(`${status} ${row.day.toISOString().split('T')[0]}: ${row.total_impressions} → ${row.total_ctas} → ${row.total_purchases}`);
    });

    // Summary stats
    const summary = await prisma.$queryRaw`
      SELECT 
        COUNT(DISTINCT day) as days_analyzed,
        SUM(impressions) as total_impressions,
        SUM(ctas) as total_ctas, 
        SUM(purchases) as total_purchases,
        ROUND(AVG(conversion_rate), 2) as avg_conversion_rate
      FROM funnel_daily 
      WHERE day >= CURRENT_DATE - INTERVAL '7 days'
    `;

    if (summary.length > 0) {
      const stats = summary[0];
      console.log('\n📈 Summary (Last 7 days):');
      console.log(`   Days: ${stats.days_analyzed}`);
      console.log(`   Impressions: ${stats.total_impressions}`);
      console.log(`   CTAs: ${stats.total_ctas}`);  
      console.log(`   Purchases: ${stats.total_purchases}`);
      console.log(`   Avg Conversion: ${stats.avg_conversion_rate}%`);
    }

    console.log('\n🎯 Funnel refresh complete');
    
  } catch (error) {
    console.error('❌ Error refreshing funnel:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  refreshFunnel()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

export default refreshFunnel;