"""
AisleMarts Grafana Dashboard Configurations
Pre-built dashboard JSON configurations for Health and Commerce monitoring
"""

import json
from typing import Dict, Any

def get_health_dashboard() -> Dict[str, Any]:
    """Returns Grafana JSON configuration for Health/Infrastructure dashboard"""
    
    return {
        "dashboard": {
            "id": None,
            "title": "AisleMarts - Health & Infrastructure",
            "tags": ["aislemarts", "health", "infrastructure"],
            "timezone": "utc",
            "refresh": "30s",
            "time": {
                "from": "now-24h",
                "to": "now"
            },
            "panels": [
                {
                    "id": 1,
                    "title": "API Request Rate",
                    "type": "stat",
                    "targets": [
                        {
                            "expr": "rate(http_requests_total[5m])",
                            "legendFormat": "{{route}} - {{method}}"
                        }
                    ],
                    "fieldConfig": {
                        "defaults": {
                            "unit": "reqps",
                            "thresholds": {
                                "steps": [
                                    {"color": "green", "value": 0},
                                    {"color": "yellow", "value": 50},
                                    {"color": "red", "value": 100}
                                ]
                            }
                        }
                    },
                    "gridPos": {"h": 8, "w": 12, "x": 0, "y": 0}
                },
                {
                    "id": 2, 
                    "title": "API Response Times (P95)",
                    "type": "stat",
                    "targets": [
                        {
                            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
                            "legendFormat": "P95 Latency"
                        }
                    ],
                    "fieldConfig": {
                        "defaults": {
                            "unit": "s",
                            "thresholds": {
                                "steps": [
                                    {"color": "green", "value": 0},
                                    {"color": "yellow", "value": 0.4},
                                    {"color": "red", "value": 0.8}
                                ]
                            }
                        }
                    },
                    "gridPos": {"h": 8, "w": 12, "x": 12, "y": 0}
                },
                {
                    "id": 3,
                    "title": "Error Rate by Route",
                    "type": "timeseries",
                    "targets": [
                        {
                            "expr": "rate(http_requests_total{status_code=~\"5..\"}[5m])",
                            "legendFormat": "{{route}} - 5xx"
                        },
                        {
                            "expr": "rate(http_requests_total{status_code=~\"4..\"}[5m])",
                            "legendFormat": "{{route}} - 4xx"
                        }
                    ],
                    "fieldConfig": {
                        "defaults": {
                            "unit": "reqps"
                        }
                    },
                    "gridPos": {"h": 8, "w": 24, "x": 0, "y": 8}
                },
                {
                    "id": 4,
                    "title": "Rate Limit Violations",
                    "type": "timeseries", 
                    "targets": [
                        {
                            "expr": "rate(rate_limit_hits_total[5m])",
                            "legendFormat": "{{route}} - {{limit_type}}"
                        }
                    ],
                    "fieldConfig": {
                        "defaults": {
                            "unit": "reqps"
                        }
                    },
                    "gridPos": {"h": 8, "w": 12, "x": 0, "y": 16}
                },
                {
                    "id": 5,
                    "title": "Event Queue Depth",
                    "type": "timeseries",
                    "targets": [
                        {
                            "expr": "event_queue_depth",
                            "legendFormat": "Queue Depth"
                        }
                    ],
                    "fieldConfig": {
                        "defaults": {
                            "unit": "short"
                        }
                    },
                    "gridPos": {"h": 8, "w": 12, "x": 12, "y": 16}
                }
            ]
        }
    }

def get_commerce_dashboard() -> Dict[str, Any]:
    """Returns Grafana JSON configuration for Commerce/Business dashboard"""
    
    return {
        "dashboard": {
            "id": None,
            "title": "AisleMarts - Commerce & Business Metrics", 
            "tags": ["aislemarts", "commerce", "business"],
            "timezone": "utc",
            "refresh": "1m",
            "time": {
                "from": "now-7d",
                "to": "now"
            },
            "panels": [
                {
                    "id": 1,
                    "title": "RFQ Funnel (24h)",
                    "type": "stat",
                    "targets": [
                        {
                            "expr": "increase(rfq_created_total[24h])",
                            "legendFormat": "Created"
                        },
                        {
                            "expr": "increase(rfq_quoted_total[24h])",
                            "legendFormat": "Quoted"  
                        },
                        {
                            "expr": "increase(rfq_accepted_total[24h])",
                            "legendFormat": "Accepted"
                        }
                    ],
                    "fieldConfig": {
                        "defaults": {
                            "unit": "short"
                        }
                    },
                    "gridPos": {"h": 8, "w": 8, "x": 0, "y": 0}
                },
                {
                    "id": 2,
                    "title": "Affiliate Performance (24h)",
                    "type": "stat",
                    "targets": [
                        {
                            "expr": "increase(affiliate_clicks_total[24h])",
                            "legendFormat": "Clicks"
                        },
                        {
                            "expr": "increase(affiliate_purchases_total[24h])",
                            "legendFormat": "Purchases"
                        },
                        {
                            "expr": "increase(affiliate_gmv_usd_total[24h])",
                            "legendFormat": "GMV ($)"
                        }
                    ],
                    "fieldConfig": {
                        "defaults": {
                            "unit": "short"
                        }
                    },
                    "gridPos": {"h": 8, "w": 8, "x": 8, "y": 0}
                },
                {
                    "id": 3,
                    "title": "Live Metrics",
                    "type": "stat",
                    "targets": [
                        {
                            "expr": "rfq_active_count",
                            "legendFormat": "Active RFQs"
                        },
                        {
                            "expr": "affiliate_active_links_count",
                            "legendFormat": "Active Links"
                        }
                    ],
                    "fieldConfig": {
                        "defaults": {
                            "unit": "short"
                        }
                    },
                    "gridPos": {"h": 8, "w": 8, "x": 16, "y": 0}
                },
                {
                    "id": 4,
                    "title": "RFQ Creation Rate",
                    "type": "timeseries",
                    "targets": [
                        {
                            "expr": "rate(rfq_created_total[1h])",
                            "legendFormat": "{{category}}"
                        }
                    ],
                    "fieldConfig": {
                        "defaults": {
                            "unit": "reqps"
                        }
                    },
                    "gridPos": {"h": 8, "w": 12, "x": 0, "y": 8}
                },
                {
                    "id": 5,
                    "title": "Affiliate Conversion Rate",
                    "type": "timeseries", 
                    "targets": [
                        {
                            "expr": "affiliate_conversion_rate",
                            "legendFormat": "{{campaign_id}}"
                        }
                    ],
                    "fieldConfig": {
                        "defaults": {
                            "unit": "percentunit",
                            "max": 1,
                            "min": 0
                        }
                    },
                    "gridPos": {"h": 8, "w": 12, "x": 12, "y": 8}
                },
                {
                    "id": 6,
                    "title": "RFQ Value Distribution",
                    "type": "piechart",
                    "targets": [
                        {
                            "expr": "rfq_value_usd_total",
                            "legendFormat": "{{category}}"
                        }
                    ],
                    "gridPos": {"h": 8, "w": 12, "x": 0, "y": 16}
                },
                {
                    "id": 7,
                    "title": "Top Affiliate Products (GMV)",
                    "type": "barchart",
                    "targets": [
                        {
                            "expr": "topk(10, affiliate_gmv_usd_total)",
                            "legendFormat": "{{product_category}}"
                        }
                    ],
                    "gridPos": {"h": 8, "w": 12, "x": 12, "y": 16}
                }
            ]
        }
    }

def get_alert_rules() -> Dict[str, Any]:
    """Returns Prometheus alerting rules configuration"""
    
    return {
        "groups": [
            {
                "name": "aislemarts_critical",
                "rules": [
                    {
                        "alert": "HighErrorRate", 
                        "expr": "rate(http_requests_total{status_code=~\"5..\"}[5m]) > 0.01",
                        "for": "5m",
                        "labels": {
                            "severity": "critical"
                        },
                        "annotations": {
                            "summary": "High 5xx error rate detected",
                            "description": "5xx error rate is {{ $value }} requests per second for {{ $labels.route }}"
                        }
                    },
                    {
                        "alert": "HighLatency",
                        "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[10m])) > 0.8",
                        "for": "10m", 
                        "labels": {
                            "severity": "critical"
                        },
                        "annotations": {
                            "summary": "High API latency detected",
                            "description": "P95 latency is {{ $value }}s for {{ $labels.route }}"
                        }
                    },
                    {
                        "alert": "EventQueueBacklog",
                        "expr": "event_queue_depth > 1000",
                        "for": "5m",
                        "labels": {
                            "severity": "warning"
                        },
                        "annotations": {
                            "summary": "Event queue backlog building up",
                            "description": "Event queue has {{ $value }} pending events"
                        }
                    }
                ]
            },
            {
                "name": "aislemarts_business",
                "rules": [
                    {
                        "alert": "RFQCreationDrop",
                        "expr": "rate(rfq_created_total[1h]) < (rate(rfq_created_total[7d]) offset 7d) * 0.4",
                        "for": "1h",
                        "labels": {
                            "severity": "warning"
                        },
                        "annotations": {
                            "summary": "RFQ creation rate dropped significantly",
                            "description": "RFQ creation is 60%+ below 7-day average"
                        }
                    },
                    {
                        "alert": "AffiliateConversionDrop",
                        "expr": "affiliate_conversion_rate < 0.01",
                        "for": "2h",
                        "labels": {
                            "severity": "warning"
                        },
                        "annotations": {
                            "summary": "Affiliate conversion rate very low",
                            "description": "Affiliate conversion rate dropped to {{ $value }}%"
                        }
                    }
                ]
            }
        ]
    }

def export_dashboard_json(dashboard_type: str) -> str:
    """Export dashboard configuration as JSON string"""
    
    if dashboard_type == "health":
        dashboard = get_health_dashboard()
    elif dashboard_type == "commerce": 
        dashboard = get_commerce_dashboard()
    else:
        raise ValueError(f"Unknown dashboard type: {dashboard_type}")
    
    return json.dumps(dashboard, indent=2)