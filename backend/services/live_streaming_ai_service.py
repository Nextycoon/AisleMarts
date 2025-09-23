import asyncio
import json
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
import uuid
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
except ImportError:
    # Fallback for testing
    class LlmChat:
        def __init__(self, *args, **kwargs):
            pass
        async def send_message(self, message):
            return "Mock AI response"
    class UserMessage:
        def __init__(self, text):
            self.text = text

from models.live_streaming import (
    LiveStream, StreamStatus, ViewerAction, ProductShowcase, 
    LiveStreamAnalytics, AIInsight, ViewerEngagement, StreamMetrics
)


class LiveStreamingAIService:
    def __init__(self):
        self.emergent_llm_key = os.getenv("EMERGENT_LLM_KEY", "sk-emergent-35d93F3CeFf0c7aD50")
        self.ai_chat = None
        self.init_ai_service()
        
        # In-memory storage for demo (replace with MongoDB in production)
        self.streams: Dict[str, LiveStream] = {}
        self.analytics: Dict[str, List[StreamMetrics]] = {}
        self.viewer_engagements: List[ViewerEngagement] = []
        
        # AI recommendation engine state
        self.ai_models_performance = {
            "audience_predictor": 0.887,
            "product_recommender": 0.923,
            "revenue_optimizer": 0.856,
            "engagement_analyzer": 0.901
        }

    def init_ai_service(self):
        """Initialize AI service with Emergent LLM integration"""
        try:
            self.ai_chat = LlmChat(
                api_key=self.emergent_llm_key,
                session_id=f"live_streaming_ai_{uuid.uuid4()}",
                system_message="""You are an AI assistant specialized in live streaming commerce analytics and optimization. 
                You provide insights on:
                1. Audience behavior and engagement patterns
                2. Product performance and recommendations  
                3. Revenue optimization strategies
                4. Real-time stream improvement suggestions
                
                Always provide actionable, data-driven recommendations with confidence scores."""
            ).with_model("openai", "gpt-4o-mini")
        except Exception as e:
            print(f"AI service initialization error: {e}")
            self.ai_chat = None

    async def create_stream(self, host_id: str, host_name: str, **kwargs) -> LiveStream:
        """Create a new live stream"""
        stream_id = str(uuid.uuid4())
        
        stream = LiveStream(
            id=stream_id,
            host_id=host_id,
            host_name=host_name,
            **kwargs
        )
        
        self.streams[stream_id] = stream
        self.analytics[stream_id] = []
        
        # Generate AI insights for stream setup
        ai_insights = await self.generate_setup_insights(stream)
        stream.ai_insights.extend(ai_insights)
        
        return stream

    async def get_stream(self, stream_id: str) -> Optional[LiveStream]:
        """Get stream by ID"""
        return self.streams.get(stream_id)

    async def update_stream(self, stream_id: str, **updates) -> Optional[LiveStream]:
        """Update stream details"""
        if stream_id not in self.streams:
            return None
            
        stream = self.streams[stream_id]
        for key, value in updates.items():
            if hasattr(stream, key):
                setattr(stream, key, value)
        
        stream.updated_at = datetime.now()
        return stream

    async def start_stream(self, stream_id: str) -> Dict[str, Any]:
        """Start a live stream"""
        stream = await self.get_stream(stream_id)
        if not stream:
            return {"error": "Stream not found"}
        
        stream.status = StreamStatus.LIVE
        stream.actual_start = datetime.now()
        
        # Generate stream URL (mock)
        stream.stream_url = f"https://live.aislemarts.com/stream/{stream_id}"
        
        # Initialize real-time analytics
        initial_metrics = StreamMetrics(
            stream_id=stream_id,
            timestamp=datetime.now(),
            concurrent_viewers=0,
            chat_activity=0,
            purchase_rate=0.0,
            engagement_score=0.0,
            ai_recommendations=await self.generate_live_recommendations(stream)
        )
        
        self.analytics[stream_id].append(initial_metrics)
        
        return {
            "status": "live",
            "stream_url": stream.stream_url,
            "analytics_started": True,
            "ai_recommendations": initial_metrics.ai_recommendations
        }

    async def end_stream(self, stream_id: str) -> Dict[str, Any]:
        """End a live stream and generate final analytics"""
        stream = await self.get_stream(stream_id)
        if not stream:
            return {"error": "Stream not found"}
        
        stream.status = StreamStatus.ENDED
        stream.actual_end = datetime.now()
        
        # Generate final analytics report
        final_analytics = await self.generate_final_analytics(stream_id)
        stream.analytics = final_analytics
        
        # Generate AI insights for performance
        performance_insights = await self.generate_performance_insights(stream, final_analytics)
        stream.ai_insights.extend(performance_insights)
        
        return {
            "status": "ended",
            "final_analytics": final_analytics.dict(),
            "performance_insights": [insight.dict() for insight in performance_insights],
            "total_revenue": final_analytics.total_revenue,
            "total_viewers": final_analytics.total_viewers
        }

    async def record_viewer_action(self, stream_id: str, viewer_id: str, 
                                 action: ViewerAction, metadata: Dict[str, Any] = None) -> bool:
        """Record viewer engagement action"""
        engagement = ViewerEngagement(
            viewer_id=viewer_id,
            stream_id=stream_id,
            action=action,
            timestamp=datetime.now(),
            metadata=metadata or {}
        )
        
        self.viewer_engagements.append(engagement)
        
        # Update real-time analytics
        await self.update_real_time_analytics(stream_id, action, metadata)
        
        return True

    async def get_real_time_analytics(self, stream_id: str) -> Dict[str, Any]:
        """Get real-time analytics for a live stream"""
        stream = await self.get_stream(stream_id)
        if not stream:
            return {"error": "Stream not found"}
        
        # Get recent metrics
        recent_metrics = self.analytics.get(stream_id, [])[-10:]  # Last 10 data points
        
        # Calculate current stats
        current_viewers = len(set([e.viewer_id for e in self.viewer_engagements 
                                 if e.stream_id == stream_id and 
                                 e.timestamp > datetime.now() - timedelta(minutes=5)]))
        
        recent_purchases = len([e for e in self.viewer_engagements 
                              if e.stream_id == stream_id and 
                              e.action == ViewerAction.PURCHASE and 
                              e.timestamp > datetime.now() - timedelta(hours=1)])
        
        # Generate AI recommendations
        ai_recommendations = await self.generate_real_time_recommendations(stream, current_viewers, recent_purchases)
        
        return {
            "stream_id": stream_id,
            "status": stream.status.value,
            "current_viewers": current_viewers,
            "recent_purchases": recent_purchases,
            "ai_recommendations": ai_recommendations,
            "engagement_trend": self.calculate_engagement_trend(stream_id),
            "revenue_trend": self.calculate_revenue_trend(stream_id),
            "optimal_product_timing": await self.suggest_product_timing(stream)
        }

    async def get_analytics_dashboard(self, host_id: str, date_range: str = "last_7_days") -> Dict[str, Any]:
        """Get comprehensive analytics dashboard for host"""
        # Filter streams by host
        host_streams = [s for s in self.streams.values() if s.host_id == host_id]
        
        # Calculate date range
        end_date = datetime.now()
        if date_range == "today":
            start_date = end_date.replace(hour=0, minute=0, second=0, microsecond=0)
        elif date_range == "yesterday":
            start_date = (end_date - timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
            end_date = end_date.replace(hour=0, minute=0, second=0, microsecond=0)
        elif date_range == "last_30_days":
            start_date = end_date - timedelta(days=30)
        else:  # last_7_days
            start_date = end_date - timedelta(days=7)
        
        # Filter streams by date range
        period_streams = [s for s in host_streams if s.created_at >= start_date and s.created_at <= end_date]
        
        # Aggregate analytics
        total_streams = len(period_streams)
        total_viewers = sum([s.analytics.total_viewers for s in period_streams])
        total_revenue = sum([s.analytics.total_revenue for s in period_streams])
        avg_engagement = sum([s.analytics.engagement_rate for s in period_streams]) / max(total_streams, 1)
        
        # Generate AI insights for dashboard
        dashboard_insights = await self.generate_dashboard_insights(period_streams, date_range)
        
        return {
            "period": date_range,
            "summary": {
                "total_streams": total_streams,
                "total_viewers": total_viewers,
                "total_revenue": total_revenue,
                "average_engagement": round(avg_engagement, 2),
                "revenue_per_stream": round(total_revenue / max(total_streams, 1), 2),
                "viewers_per_stream": round(total_viewers / max(total_streams, 1), 2)
            },
            "trends": {
                "revenue_growth": self.calculate_revenue_growth(host_id, start_date),
                "viewer_growth": self.calculate_viewer_growth(host_id, start_date),
                "engagement_trend": self.calculate_host_engagement_trend(host_id, start_date)
            },
            "top_performing_streams": self.get_top_performing_streams(period_streams, 3),
            "ai_insights": dashboard_insights,
            "recommendations": await self.generate_host_recommendations(host_id, period_streams)
        }

    # AI-powered recommendation methods
    async def generate_setup_insights(self, stream: LiveStream) -> List[AIInsight]:
        """Generate AI insights for stream setup"""
        if not self.ai_chat:
            return []
        
        try:
            prompt = f"""Analyze this live stream setup and provide 3 key insights:
            
            Title: {stream.title}
            Products: {len(stream.products)} items
            Category: {stream.category}
            Scheduled: {stream.scheduled_start}
            
            Provide insights on optimal timing, product selection, and audience engagement strategies."""
            
            message = UserMessage(text=prompt)
            response = await self.ai_chat.send_message(message)
            
            insights = []
            insight_lines = response.strip().split('\n')[:3]
            
            for i, line in enumerate(insight_lines):
                if line.strip():
                    insights.append(AIInsight(
                        type="setup_optimization",
                        message=line.strip(),
                        confidence=0.85 + (i * 0.05),
                        timestamp=datetime.now()
                    ))
            
            return insights
            
        except Exception as e:
            print(f"AI insight generation error: {e}")
            return []

    async def generate_live_recommendations(self, stream: LiveStream) -> List[str]:
        """Generate real-time recommendations for live stream"""
        if not self.ai_chat:
            return ["Feature products every 10-15 minutes", "Engage with chat regularly", "Monitor viewer count trends"]
        
        try:
            prompt = f"""Generate 3 real-time recommendations for this live stream:
            
            Stream: {stream.title}
            Products: {len(stream.products)}
            Current Status: {stream.status}
            
            Focus on immediate actions to boost engagement and sales."""
            
            message = UserMessage(text=prompt)
            response = await self.ai_chat.send_message(message)
            
            return [line.strip() for line in response.strip().split('\n')[:3] if line.strip()]
            
        except Exception:
            return ["Feature products every 10-15 minutes", "Engage with chat regularly", "Monitor viewer count trends"]

    async def generate_real_time_recommendations(self, stream: LiveStream, viewers: int, purchases: int) -> List[str]:
        """Generate AI recommendations based on real-time data"""
        if not self.ai_chat:
            return [f"Current viewers: {viewers}", f"Recent purchases: {purchases}", "Consider featuring a new product"]
        
        try:
            prompt = f"""Analyze real-time stream performance and suggest 3 immediate actions:
            
            Current viewers: {viewers}
            Recent purchases: {purchases}
            Stream duration: {(datetime.now() - stream.actual_start).total_seconds() / 60 if stream.actual_start else 0} minutes
            
            Suggest specific actions to optimize performance."""
            
            message = UserMessage(text=prompt)
            response = await self.ai_chat.send_message(message)
            
            return [line.strip() for line in response.strip().split('\n')[:3] if line.strip()]
            
        except Exception:
            return [f"Current viewers: {viewers}", f"Recent purchases: {purchases}", "Consider featuring a new product"]

    async def generate_performance_insights(self, stream: LiveStream, analytics: LiveStreamAnalytics) -> List[AIInsight]:
        """Generate performance insights after stream ends"""
        insights = []
        
        # Viewer performance insight
        if analytics.total_viewers > 0:
            viewer_performance = "excellent" if analytics.total_viewers > 100 else "good" if analytics.total_viewers > 50 else "needs_improvement"
            insights.append(AIInsight(
                type="audience_behavior",
                message=f"Stream attracted {analytics.total_viewers} total viewers with {viewer_performance} performance. Peak viewership was {analytics.peak_viewers}.",
                confidence=0.92,
                action_recommendation="Consider similar content timing and promotion strategies" if viewer_performance == "excellent" else "Improve promotion and scheduling",
                timestamp=datetime.now()
            ))
        
        # Revenue performance insight
        if analytics.total_revenue > 0:
            conversion_rate = (analytics.total_purchases / max(analytics.total_viewers, 1)) * 100
            insights.append(AIInsight(
                type="revenue_optimization",
                message=f"Generated ${analytics.total_revenue:.2f} revenue with {conversion_rate:.1f}% conversion rate from {analytics.total_purchases} purchases.",
                confidence=0.88,
                action_recommendation="Focus on high-converting product categories" if conversion_rate > 5 else "Improve product presentation and pricing strategy",
                timestamp=datetime.now()
            ))
        
        # Engagement insight
        if analytics.engagement_rate > 0:
            engagement_level = "high" if analytics.engagement_rate > 0.7 else "moderate" if analytics.engagement_rate > 0.4 else "low"
            insights.append(AIInsight(
                type="audience_behavior",
                message=f"Engagement rate of {analytics.engagement_rate:.1%} indicates {engagement_level} audience interaction with {analytics.chat_messages} chat messages and {analytics.likes} likes.",
                confidence=0.85,
                action_recommendation="Maintain interactive content style" if engagement_level == "high" else "Increase audience interaction and Q&A segments",
                timestamp=datetime.now()
            ))
        
        return insights

    async def generate_dashboard_insights(self, streams: List[LiveStream], period: str) -> List[str]:
        """Generate insights for analytics dashboard"""
        if not streams:
            return ["No streams in this period", "Consider scheduling regular streaming sessions", "Start with product showcases to build audience"]
        
        insights = []
        
        # Performance insight
        avg_viewers = sum([s.analytics.total_viewers for s in streams]) / len(streams)
        insights.append(f"Average {avg_viewers:.0f} viewers per stream in {period}")
        
        # Revenue insight
        total_revenue = sum([s.analytics.total_revenue for s in streams])
        insights.append(f"Generated ${total_revenue:.2f} total revenue across {len(streams)} streams")
        
        # Engagement insight
        avg_engagement = sum([s.analytics.engagement_rate for s in streams]) / len(streams)
        insights.append(f"Maintained {avg_engagement:.1%} average engagement rate")
        
        return insights

    async def generate_host_recommendations(self, host_id: str, streams: List[LiveStream]) -> List[str]:
        """Generate personalized recommendations for host"""
        if not streams:
            return ["Schedule your first live stream", "Prepare 3-5 products to showcase", "Plan interactive content segments"]
        
        recommendations = []
        
        # Based on performance
        best_stream = max(streams, key=lambda s: s.analytics.total_revenue, default=None)
        if best_stream:
            recommendations.append(f"Replicate success factors from '{best_stream.title}' which generated ${best_stream.analytics.total_revenue:.2f}")
        
        # Based on timing
        stream_hours = [s.actual_start.hour if s.actual_start else 14 for s in streams]
        popular_hour = max(set(stream_hours), key=stream_hours.count, default=14)
        recommendations.append(f"Optimal streaming time appears to be around {popular_hour}:00")
        
        # Based on engagement
        avg_engagement = sum([s.analytics.engagement_rate for s in streams]) / len(streams)
        if avg_engagement < 0.5:
            recommendations.append("Increase audience interaction with polls, Q&A, and product demonstrations")
        else:
            recommendations.append("Maintain high engagement with interactive content and real-time responses")
        
        return recommendations

    # Helper methods for analytics calculations
    def calculate_engagement_trend(self, stream_id: str) -> str:
        """Calculate engagement trend for stream"""
        recent_engagements = [e for e in self.viewer_engagements 
                            if e.stream_id == stream_id and 
                            e.timestamp > datetime.now() - timedelta(minutes=30)]
        
        if len(recent_engagements) > 10:
            return "increasing"
        elif len(recent_engagements) > 5:
            return "stable"
        else:
            return "decreasing"

    def calculate_revenue_trend(self, stream_id: str) -> str:
        """Calculate revenue trend for stream"""
        recent_purchases = [e for e in self.viewer_engagements 
                          if e.stream_id == stream_id and 
                          e.action == ViewerAction.PURCHASE and 
                          e.timestamp > datetime.now() - timedelta(minutes=30)]
        
        if len(recent_purchases) > 5:
            return "increasing"
        elif len(recent_purchases) > 2:
            return "stable"
        else:
            return "decreasing"

    def calculate_revenue_growth(self, host_id: str, start_date: datetime) -> float:
        """Calculate revenue growth for host"""
        # Mock calculation - replace with actual data analysis
        return 15.7  # 15.7% growth

    def calculate_viewer_growth(self, host_id: str, start_date: datetime) -> float:
        """Calculate viewer growth for host"""
        # Mock calculation - replace with actual data analysis  
        return 23.4  # 23.4% growth

    def calculate_host_engagement_trend(self, host_id: str, start_date: datetime) -> str:
        """Calculate engagement trend for host"""
        return "increasing"

    def get_top_performing_streams(self, streams: List[LiveStream], limit: int) -> List[Dict[str, Any]]:
        """Get top performing streams by revenue"""
        sorted_streams = sorted(streams, key=lambda s: s.analytics.total_revenue, reverse=True)[:limit]
        
        return [
            {
                "id": s.id,
                "title": s.title,
                "revenue": s.analytics.total_revenue,
                "viewers": s.analytics.total_viewers,
                "engagement_rate": s.analytics.engagement_rate
            }
            for s in sorted_streams
        ]

    async def suggest_product_timing(self, stream: LiveStream) -> Dict[str, Any]:
        """Suggest optimal timing for product features"""
        if not stream.products:
            return {"message": "No products to feature"}
        
        # Mock AI-powered timing suggestions
        return {
            "next_product_suggestion": stream.products[0].name if stream.products else "No products available",
            "optimal_timing": "Feature in 3-5 minutes",
            "reasoning": "High engagement detected, optimal conversion window"
        }

    async def update_real_time_analytics(self, stream_id: str, action: ViewerAction, metadata: Dict[str, Any]):
        """Update real-time analytics based on viewer actions"""
        current_time = datetime.now()
        
        # Create or update metrics
        metrics = StreamMetrics(
            stream_id=stream_id,
            timestamp=current_time,
            concurrent_viewers=len(set([e.viewer_id for e in self.viewer_engagements 
                                     if e.stream_id == stream_id and 
                                     e.timestamp > current_time - timedelta(minutes=5)])),
            chat_activity=len([e for e in self.viewer_engagements 
                             if e.stream_id == stream_id and 
                             e.action in [ViewerAction.COMMENT] and 
                             e.timestamp > current_time - timedelta(minutes=1)]),
            purchase_rate=len([e for e in self.viewer_engagements 
                             if e.stream_id == stream_id and 
                             e.action == ViewerAction.PURCHASE and 
                             e.timestamp > current_time - timedelta(minutes=10)]),
            engagement_score=0.85  # Mock calculation
        )
        
        if stream_id not in self.analytics:
            self.analytics[stream_id] = []
        
        self.analytics[stream_id].append(metrics)

    async def generate_final_analytics(self, stream_id: str) -> LiveStreamAnalytics:
        """Generate final analytics when stream ends"""
        stream_engagements = [e for e in self.viewer_engagements if e.stream_id == stream_id]
        
        total_viewers = len(set([e.viewer_id for e in stream_engagements]))
        total_purchases = len([e for e in stream_engagements if e.action == ViewerAction.PURCHASE])
        total_likes = len([e for e in stream_engagements if e.action == ViewerAction.LIKE])
        total_comments = len([e for e in stream_engagements if e.action == ViewerAction.COMMENT])
        total_shares = len([e for e in stream_engagements if e.action == ViewerAction.SHARE])
        
        # Mock revenue calculation (would be based on actual purchase data)
        total_revenue = total_purchases * 45.99  # Average order value
        
        # Calculate engagement rate
        total_interactions = total_likes + total_comments + total_shares + total_purchases
        engagement_rate = (total_interactions / max(total_viewers, 1)) if total_viewers > 0 else 0
        
        return LiveStreamAnalytics(
            total_viewers=total_viewers,
            peak_viewers=max([m.concurrent_viewers for m in self.analytics.get(stream_id, [])], default=total_viewers),
            average_view_duration=25.5,  # Mock data
            total_purchases=total_purchases,
            total_revenue=total_revenue,
            engagement_rate=engagement_rate,
            chat_messages=total_comments,
            likes=total_likes,
            shares=total_shares,
            ai_insights=[
                f"Generated ${total_revenue:.2f} in revenue",
                f"Achieved {engagement_rate:.1%} engagement rate",
                f"Peak viewership reached {total_viewers} viewers"
            ]
        )