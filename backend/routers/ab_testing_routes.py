"""
AisleMarts A/B Testing API Routes
=================================
Production-grade experimentation endpoints for Universal Commerce AI Hub
"""

from fastapi import APIRouter, HTTPException, Query, Body
from typing import Dict, List, Any, Optional
from pydantic import BaseModel
from datetime import datetime
import logging

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from services.ab_testing_framework import ab_framework, ExperimentStatus

router = APIRouter(prefix="/ab-testing", tags=["ab_testing"])
logger = logging.getLogger(__name__)

# Pydantic models
class ExperimentAssignmentRequest(BaseModel):
    user_id: str
    experiment_id: str
    context: Optional[Dict[str, Any]] = None

class EventTrackingRequest(BaseModel):
    user_id: str
    experiment_id: str
    metric_name: str
    value: float
    context: Optional[Dict[str, Any]] = None

class FeatureFlagRequest(BaseModel):
    flag_name: str
    enabled: bool

@router.get("/health")
async def get_ab_testing_health():
    """Get A/B testing system health and status"""
    try:
        status = await ab_framework.get_system_status()
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"A/B testing system error: {str(e)}")

@router.get("/experiments")
async def get_active_experiments():
    """Get all active experiments"""
    try:
        experiments = await ab_framework.get_active_experiments()
        return {
            "experiments": experiments,
            "total_active": len(experiments),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get experiments: {str(e)}")

@router.post("/assign")
async def assign_user_to_experiment(request: ExperimentAssignmentRequest):
    """Assign user to experiment variant"""
    try:
        variant_id = await ab_framework.assign_user_to_experiment(
            user_id=request.user_id,
            experiment_id=request.experiment_id,
            context=request.context
        )
        
        if not variant_id:
            raise HTTPException(status_code=404, detail="Experiment not found or not running")
        
        # Get variant configuration
        config = await ab_framework.get_variant_config(request.user_id, request.experiment_id)
        
        return {
            "user_id": request.user_id,
            "experiment_id": request.experiment_id,
            "variant_id": variant_id,
            "configuration": config,
            "assigned_at": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Assignment failed: {str(e)}")

@router.get("/user/{user_id}/experiments")
async def get_user_experiments(user_id: str):
    """Get all experiment assignments for a user"""
    try:
        assignments = ab_framework.user_assignments.get(user_id, {})
        
        user_experiments = []
        for experiment_id, assignment in assignments.items():
            experiment = ab_framework.experiments.get(experiment_id)
            if experiment:
                variant_config = await ab_framework.get_variant_config(user_id, experiment_id)
                
                user_experiments.append({
                    "experiment_id": experiment_id,
                    "experiment_name": experiment.name,
                    "variant_id": assignment.variant_id,
                    "configuration": variant_config,
                    "assigned_at": assignment.assigned_at.isoformat(),
                    "status": experiment.status.value
                })
        
        return {
            "user_id": user_id,
            "experiments": user_experiments,
            "total_assignments": len(user_experiments)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user experiments: {str(e)}")

@router.post("/track")
async def track_experiment_event(request: EventTrackingRequest):
    """Track experiment event/metric"""
    try:
        await ab_framework.track_event(
            user_id=request.user_id,
            experiment_id=request.experiment_id,
            metric_name=request.metric_name,
            value=request.value,
            context=request.context
        )
        
        return {
            "status": "success",
            "message": f"Event {request.metric_name} tracked for user {request.user_id}",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Event tracking failed: {str(e)}")

@router.get("/experiments/{experiment_id}/results")
async def get_experiment_results(experiment_id: str):
    """Get statistical results for experiment"""
    try:
        results = await ab_framework.get_experiment_results(experiment_id)
        
        if "error" in results:
            raise HTTPException(status_code=404, detail=results["error"])
        
        return results
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get results: {str(e)}")

@router.post("/feature-flags")
async def set_feature_flag(request: FeatureFlagRequest):
    """Set feature flag"""
    try:
        await ab_framework.set_feature_flag(request.flag_name, request.enabled)
        
        return {
            "flag_name": request.flag_name,
            "enabled": request.enabled,
            "updated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to set feature flag: {str(e)}")

@router.get("/feature-flags/{flag_name}")
async def get_feature_flag(flag_name: str):
    """Check if feature flag is enabled"""
    try:
        enabled = await ab_framework.is_feature_enabled(flag_name)
        
        return {
            "flag_name": flag_name,
            "enabled": enabled,
            "checked_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to check feature flag: {str(e)}")

@router.get("/feature-flags")
async def get_all_feature_flags():
    """Get all feature flags"""
    try:
        return {
            "feature_flags": ab_framework.feature_flags,
            "total_flags": len(ab_framework.feature_flags),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get feature flags: {str(e)}")

# Convenience endpoints for common A/B test scenarios
@router.get("/recommendations/{user_id}")
async def get_recommendations_variant(user_id: str):
    """Get recommendations A/B test variant for user"""
    try:
        config = await ab_framework.get_variant_config(user_id, "personalized_recs_v1")
        
        return {
            "user_id": user_id,
            "experiment": "personalized_recs_v1",
            "personalization_enabled": config.get("personalization", False),
            "algorithm": config.get("algorithm", "trending"),
            "configuration": config
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get recommendations variant: {str(e)}")

@router.get("/visual-search/{user_id}")
async def get_visual_search_variant(user_id: str):
    """Get visual search A/B test variant for user"""
    try:
        config = await ab_framework.get_variant_config(user_id, "visual_search_v1")
        
        return {
            "user_id": user_id,
            "experiment": "visual_search_v1",
            "layout": config.get("layout", "grid"),
            "ai_insights": config.get("ai_insights", False),
            "configuration": config
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get visual search variant: {str(e)}")

@router.get("/assistant/{user_id}")
async def get_assistant_variant(user_id: str):
    """Get AI assistant A/B test variant for user"""
    try:
        config = await ab_framework.get_variant_config(user_id, "assistant_preanswers_v1")
        
        return {
            "user_id": user_id,
            "experiment": "assistant_preanswers_v1",
            "pre_answers": config.get("pre_answers", False),
            "cache_responses": config.get("cache_responses", False),
            "configuration": config
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get assistant variant: {str(e)}")

# Analytics and monitoring endpoints
@router.get("/analytics/summary")
async def get_ab_testing_analytics():
    """Get A/B testing analytics summary"""
    try:
        active_experiments = await ab_framework.get_active_experiments()
        
        total_assignments = sum(len(assignments) for assignments in ab_framework.user_assignments.values())
        total_events = len(ab_framework.events)
        
        # Calculate experiment performance
        experiment_performance = []
        for exp in active_experiments:
            results = await ab_framework.get_experiment_results(exp["id"])
            
            if "statistical_significance" in results:
                for metric, sig_data in results["statistical_significance"].items():
                    experiment_performance.append({
                        "experiment": exp["name"],
                        "metric": metric,
                        "improvement": sig_data.get("relative_improvement", 0),
                        "p_value": sig_data.get("p_value", 1.0),
                        "is_significant": sig_data.get("is_significant", False)
                    })
        
        return {
            "summary": {
                "total_experiments": len(ab_framework.experiments),
                "active_experiments": len(active_experiments),
                "total_assignments": total_assignments,
                "total_events": total_events,
                "feature_flags": len(ab_framework.feature_flags)
            },
            "experiment_performance": experiment_performance,
            "system_health": "operational",
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get analytics: {str(e)}")