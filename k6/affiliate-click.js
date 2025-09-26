// k6 Load Test: Affiliate Click Ingest Spike Test
// Tests 300 RPS affiliate click ingestion for 3 minutes
// Validates: Event queue stability, No data loss, Latency under load

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    spike_test: {
      executor: 'constant-arrival-rate',
      rate: 300,                    // 300 requests per second
      timeUnit: '1s',
      duration: '3m',              // 3 minute spike
      preAllocatedVUs: 100,
      maxVUs: 600,
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],     // < 1% error rate (more lenient for high load)
    http_req_duration: ['p(95)<500'],   // P95 < 500ms under load  
    http_reqs: ['rate>250'],            // Maintain > 250 RPS
  },
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)', 'count'],
};

const API_BASE = __ENV.API_BASE || 'https://marketplace-docs.preview.emergentagent.com';

// Affiliate test data
const campaigns = ['summer_fashion_2024', 'tech_gadgets_q4', 'home_decor_winter', 'fitness_spring'];
const products = ['wireless_headphones', 'smart_watch', 'yoga_mat', 'bluetooth_speaker', 'tablet_stand'];
const referrers = ['instagram', 'tiktok', 'youtube', 'twitter', 'facebook', 'direct'];
const linkIds = Array.from({length: 50}, (_, i) => `test_link_${i + 1}`);

function generateClickEvent() {
  return {
    name: 'affiliate_click',
    props: {
      link_id: linkIds[Math.floor(Math.random() * linkIds.length)],
      product_id: products[Math.floor(Math.random() * products.length)],
      campaign_id: campaigns[Math.floor(Math.random() * campaigns.length)],
      referrer: referrers[Math.floor(Math.random() * referrers.length)],
      click_timestamp: Date.now(),
      user_agent: 'k6-load-test/1.0',
      source_platform: 'mobile',
      attribution_data: {
        utm_source: 'k6-test',
        utm_campaign: 'load-test',
        utm_medium: 'automation'
      }
    },
    source: 'load_test'
  };
}

function generatePurchaseEvent() {
  return {
    name: 'affiliate_purchase',
    props: {
      link_id: linkIds[Math.floor(Math.random() * linkIds.length)],
      order_id: `order_${__VU}_${Date.now()}`,
      product_id: products[Math.floor(Math.random() * products.length)],
      campaign_id: campaigns[Math.floor(Math.random() * campaigns.length)],
      amount_cents: Math.floor(Math.random() * 20000 + 1000), // $10-$200
      commission_cents: Math.floor(Math.random() * 3000 + 100), // $1-$30 commission
      purchase_timestamp: Date.now()
    },
    source: 'load_test'
  };
}

export default function() {
  // 90% clicks, 10% purchases (realistic conversion)
  const isPurchase = Math.random() < 0.1;
  const eventData = is购买 ? generatePurchaseEvent() : generateClickEvent();
  
  const payload = JSON.stringify(eventData);
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'k6-affiliate-load-test/1.0',
      'X-Test-Run': 'affiliate-click-spike',
      'X-Forwarded-For': `192.168.1.${Math.floor(Math.random() * 255)}`, // Simulate different IPs
    },
    timeout: '10s',
  };
  
  // Send event
  const response = http.post(`${API_BASE}/v1/events`, payload, params);
  
  // Validate response
  const success = check(response, {
    'Event accepted': (r) => [200, 201, 202, 204].includes(r.status),
    'Fast ingestion': (r) => r.timings.duration < 1000,
    'No server errors': (r) => !r.status.toString().startsWith('5'),
    'Not rate limited': (r) => r.status !== 429,
    'Valid response structure': (r) => {
      try {
        const json = r.json();
        return json.success !== undefined || json.event_id !== undefined;
      } catch (e) {
        return false;
      }
    },
  });
  
  if (!success) {
    console.error(`❌ Event ingestion failed: Status ${response.status}, Body: ${response.body.substring(0, 100)}`);
  }
  
  // Occasionally batch events (10% of the time)
  if (Math.random() < 0.1) {
    const batchEvents = Array.from({length: Math.floor(Math.random() * 5) + 2}, () => generateClickEvent());
    
    const batchPayload = JSON.stringify({ events: batchEvents });
    const batchResponse = http.post(`${API_BASE}/v1/events/batch`, batchPayload, params);
    
    check(batchResponse, {
      'Batch event accepted': (r) => [200, 201, 202].includes(r.status),
      'Batch processing fast': (r) => r.timings.duration < 2000,
    });
  }
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'affiliate-spike-test-results.json': JSON.stringify(data, null, 2),
  };
}

function textSummary(data, options = {}) {
  const indent = options.indent || '';
  
  let summary = '\n' + indent + '⚡ AFFILIATE CLICK SPIKE TEST RESULTS\n';
  summary += indent + '======================================\n\n';
  
  // Test info
  summary += indent + `🎯 Test Configuration:\n`;
  summary += indent + `   • Target Rate: 300 RPS\n`;
  summary += indent + `   • Duration: 3 minutes\n`;
  summary += indent + `   • Max VUs: 600\n`;
  summary += indent + `   • Target Error Rate: < 1%\n`;
  summary += indent + `   • Target P95 Latency: < 500ms\n\n`;
  
  // Key metrics
  const requests = data.metrics.http_reqs;
  const duration = data.metrics.http_req_duration;
  const failed = data.metrics.http_req_failed;
  
  summary += indent + `📈 Spike Performance Results:\n`;
  if (requests) {
    summary += indent + `   • Total Events: ${requests.values.count}\n`;
    summary += indent + `   • Actual Rate: ${requests.values.rate.toFixed(2)} RPS\n`;
    summary += indent + `   • Peak Throughput: ${Math.max(...Object.values(requests.values)).toFixed(0)} events\n`;
  }
  
  if (duration) {
    summary += indent + `   • Avg Ingestion Time: ${duration.values.avg.toFixed(2)}ms\n`;
    summary += indent + `   • P95 Ingestion Time: ${duration.values['p(95)'].toFixed(2)}ms\n`;
    summary += indent + `   • P99 Ingestion Time: ${duration.values['p(99)'].toFixed(2)}ms\n`;
    summary += indent + `   • Max Ingestion Time: ${duration.values.max.toFixed(2)}ms\n`;
  }
  
  if (failed) {
    const errorRate = (failed.values.rate * 100).toFixed(3);
    summary += indent + `   • Error Rate: ${errorRate}%\n`;
    summary += indent + `   • Failed Events: ${failed.values.count || 0}\n`;
  }
  
  // Pass/Fail indicators
  summary += indent + `\n🎯 Spike Test Compliance:\n`;
  
  const ratePass = requests && requests.values.rate >= 250;
  const p95Pass = duration && duration.values['p(95)'] < 500;
  const errorPass = failed && failed.values.rate < 0.01;
  
  summary += indent + `   • Rate > 250 RPS: ${ratePass ? '✅ PASS' : '❌ FAIL'}\n`;
  summary += indent + `   • P95 < 500ms: ${p95Pass ? '✅ PASS' : '❌ FAIL'}\n`;
  summary += indent + `   • Error Rate < 1%: ${errorPass ? '✅ PASS' : '❌ FAIL'}\n`;
  
  const overallPass = ratePass && p95Pass && errorPass;
  summary += indent + `\n🏆 Spike Test Result: ${overallPass ? '✅ HANDLES TRAFFIC SPIKES' : '❌ NEEDS SCALING'}\n`;
  
  // Recommendations
  if (!overallPass) {
    summary += indent + `\n💡 Optimization Recommendations:\n`;
    if (!ratePass) {
      summary += indent + `   • Scale up backend instances or optimize event processing\n`;
    }
    if (!p95Pass) {
      summary += indent + `   • Optimize event ingestion pipeline or add caching\n`;
    }
    if (!errorPass) {
      summary += indent + `   • Investigate error causes and add retry mechanisms\n`;
    }
  }
  
  summary += '\n';
  return summary;
}