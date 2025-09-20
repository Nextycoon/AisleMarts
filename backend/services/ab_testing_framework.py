"""
AisleMarts A/B Testing Framework
================================
Production-grade experimentation platform for Universal Commerce AI Hub
Supports feature flags, multi-variant testing, and statistical significance tracking
"""

import asyncio
import json
import time
import hashlib
import random
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Union
from dataclasses import dataclass, asdict
from enum import Enum
import logging
from collections import defaultdict
import numpy as np
from scipy import stats
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

class ExperimentStatus(Enum):
    DRAFT = "draft"
    RUNNING = "running" 
    PAUSED = "paused"
    COMPLETED = "completed"
    ARCHIVED = "archived"

class VariantType(Enum):
    CONTROL = "control"
    TREATMENT = "treatment"

@dataclass
class ExperimentVariant:
    id: str
    name: str
    type: VariantType
    traffic_allocation: float  # 0.0 to 1.0
    parameters: Dict[str, Any]
    
@dataclass
class ExperimentMetric:
    name: str
    type: str  # "conversion", "revenue", "engagement"
    is_primary: bool = False
    target_improvement: float = 0.05  # 5% improvement target
    
@dataclass
class Experiment:
    id: str
    name: str
    description: str
    status: ExperimentStatus
    variants: List[ExperimentVariant]
    metrics: List[ExperimentMetric]
    start_date: datetime
    end_date: Optional[datetime]
    min_sample_size: int = 1000
    confidence_level: float = 0.95
    power: float = 0.8
    created_by: str = "system"
    
@dataclass
class UserAssignment:
    user_id: str
    experiment_id: str
    variant_id: str
    assigned_at: datetime
    context: Dict[str, Any]

@dataclass
class ExperimentEvent:
    id: str
    user_id: str
    experiment_id: str
    variant_id: str
    metric_name: str
    value: float
    timestamp: datetime
    context: Dict[str, Any]

class ABTestingFramework:
    """
    Production-grade A/B testing framework for AisleMarts Universal Commerce AI Hub
    """
    
    def __init__(self):
        self.experiments: Dict[str, Experiment] = {}
        self.user_assignments: Dict[str, Dict[str, UserAssignment]] = defaultdict(dict)
        self.events: List[ExperimentEvent] = []
        self.feature_flags: Dict[str, bool] = {}
        
        # Initialize default experiments for Universal AI Hub
        self._initialize_default_experiments()
        
        logger.info("🧪 A/B Testing Framework initialized")
    
    def _initialize_default_experiments(self):
        """Initialize key experiments for Universal Commerce AI Hub"""
        
        # Personalized Recommendations Experiment
        recs_experiment = Experiment(
            id="personalized_recs_v1",
            name="Personalized Home Recommendations",
            description="Test AI-powered personalized product recommendations vs baseline",
            status=ExperimentStatus.RUNNING,
            variants=[
                ExperimentVariant(
                    id="control",
                    name="Baseline Recommendations",
                    type=VariantType.CONTROL,
                    traffic_allocation=0.5,
                    parameters={"algorithm": "trending", "personalization": False}
                ),
                ExperimentVariant(
                    id="treatment",
                    name="AI Personalized Recommendations", 
                    type=VariantType.TREATMENT,
                    traffic_allocation=0.5,
                    parameters={"algorithm": "ai_personalized", "personalization": True}
                )
            ],
            metrics=[
                ExperimentMetric("ctr", "conversion", is_primary=True, target_improvement=0.08),
                ExperimentMetric("cvr", "conversion", target_improvement=0.06),
                ExperimentMetric("aov", "revenue", target_improvement=0.05)
            ],
            start_date=datetime.now(),
            end_date=None,
            min_sample_size=2000
        )
        self.experiments[recs_experiment.id] = recs_experiment
        
        # Visual Search Experiment
        visual_experiment = Experiment(
            id="visual_search_v1",
            name="Visual Search Results Page",
            description="Test enhanced visual search results vs basic display",
            status=ExperimentStatus.RUNNING,
            variants=[
                ExperimentVariant(
                    id="control",
                    name="Basic Visual Results",
                    type=VariantType.CONTROL,
                    traffic_allocation=0.5,
                    parameters={"layout": "grid", "ai_insights": False}
                ),
                ExperimentVariant(
                    id="treatment", 
                    name="Enhanced Visual Results",
                    type=VariantType.TREATMENT,
                    traffic_allocation=0.5,
                    parameters={"layout": "enhanced_grid", "ai_insights": True}
                )
            ],
            metrics=[
                ExperimentMetric("visual_search_cvr", "conversion", is_primary=True, target_improvement=0.12),
                ExperimentMetric("session_engagement", "engagement", target_improvement=0.15)
            ],
            start_date=datetime.now(),
            end_date=None,
            min_sample_size=1500
        )
        self.experiments[visual_experiment.id] = visual_experiment
        
        # AI Assistant Pre-answers Experiment
        assistant_experiment = Experiment(
            id="assistant_preanswers_v1",
            name="AI Assistant Pre-answers",
            description="Test pre-generated answers vs real-time generation",
            status=ExperimentStatus.RUNNING,
            variants=[
                ExperimentVariant(
                    id="control",
                    name="Real-time Generation",
                    type=VariantType.CONTROL,
                    traffic_allocation=0.5,
                    parameters={"pre_answers": False, "cache_responses": False}
                ),
                ExperimentVariant(
                    id="treatment",
                    name="Pre-generated Answers",
                    type=VariantType.TREATMENT,
                    traffic_allocation=0.5,
                    parameters={"pre_answers": True, "cache_responses": True}
                )
            ],
            metrics=[
                ExperimentMetric("response_time", "engagement", is_primary=True, target_improvement=-0.3),
                ExperimentMetric("csat", "conversion", target_improvement=0.1)
            ],
            start_date=datetime.now(),
            min_sample_size=1000
        )
        self.experiments[assistant_experiment.id] = assistant_experiment
    
    async def assign_user_to_experiment(self, user_id: str, experiment_id: str, context: Dict[str, Any] = None) -> Optional[str]:
        """Assign user to experiment variant using consistent hashing"""
        
        if experiment_id not in self.experiments:
            logger.warning(f"Experiment {experiment_id} not found")
            return None
            
        experiment = self.experiments[experiment_id]
        
        if experiment.status != ExperimentStatus.RUNNING:
            logger.info(f"Experiment {experiment_id} not running, status: {experiment.status}")
            return None
        
        # Check if user already assigned
        if experiment_id in self.user_assignments[user_id]:
            return self.user_assignments[user_id][experiment_id].variant_id
        
        # Consistent hash-based assignment
        hash_input = f"{user_id}_{experiment_id}"
        hash_value = int(hashlib.md5(hash_input.encode()).hexdigest(), 16)
        assignment_ratio = (hash_value % 10000) / 10000.0
        
        # Determine variant based on traffic allocation
        cumulative_allocation = 0.0
        selected_variant = None
        
        for variant in experiment.variants:
            cumulative_allocation += variant.traffic_allocation
            if assignment_ratio <= cumulative_allocation:
                selected_variant = variant
                break
        
        if not selected_variant:
            selected_variant = experiment.variants[0]  # Fallback to first variant
        
        # Store assignment
        assignment = UserAssignment(
            user_id=user_id,
            experiment_id=experiment_id,
            variant_id=selected_variant.id,
            assigned_at=datetime.now(),
            context=context or {}
        )
        
        self.user_assignments[user_id][experiment_id] = assignment
        
        logger.info(f"Assigned user {user_id} to experiment {experiment_id}, variant {selected_variant.id}")
        return selected_variant.id
    
    async def get_variant_config(self, user_id: str, experiment_id: str) -> Dict[str, Any]:
        """Get variant configuration for user"""
        
        variant_id = await self.assign_user_to_experiment(user_id, experiment_id)
        if not variant_id:
            return {}
        
        experiment = self.experiments[experiment_id]
        variant = next((v for v in experiment.variants if v.id == variant_id), None)
        
        if variant:
            return variant.parameters
        return {}
    
    async def track_event(self, user_id: str, experiment_id: str, metric_name: str, value: float, context: Dict[str, Any] = None):
        """Track experiment event/metric"""
        
        if experiment_id not in self.experiments:
            logger.warning(f"Cannot track event for unknown experiment: {experiment_id}")
            return
        
        if experiment_id not in self.user_assignments[user_id]:
            logger.warning(f"User {user_id} not assigned to experiment {experiment_id}")
            return
        
        assignment = self.user_assignments[user_id][experiment_id]
        
        event = ExperimentEvent(
            id=f"{experiment_id}_{user_id}_{metric_name}_{int(time.time())}",
            user_id=user_id,
            experiment_id=experiment_id,
            variant_id=assignment.variant_id,
            metric_name=metric_name,
            value=value,
            timestamp=datetime.now(),
            context=context or {}
        )
        
        self.events.append(event)
        logger.info(f"Tracked event: {metric_name}={value} for user {user_id} in experiment {experiment_id}")
    
    async def get_experiment_results(self, experiment_id: str) -> Dict[str, Any]:
        """Get statistical results for experiment"""
        
        if experiment_id not in self.experiments:
            return {"error": "Experiment not found"}
        
        experiment = self.experiments[experiment_id]
        experiment_events = [e for e in self.events if e.experiment_id == experiment_id]
        
        if not experiment_events:
            return {
                "experiment_id": experiment_id,
                "status": "insufficient_data",
                "message": "No events tracked yet"
            }
        
        # Group events by variant and metric
        variant_metrics = defaultdict(lambda: defaultdict(list))
        
        for event in experiment_events:
            variant_metrics[event.variant_id][event.metric_name].append(event.value)
        
        results = {
            "experiment_id": experiment_id,
            "experiment_name": experiment.name,
            "status": experiment.status.value,
            "total_events": len(experiment_events),
            "variants": {},
            "statistical_significance": {},
            "recommendations": []
        }
        
        # Calculate metrics per variant
        for variant_id, metrics in variant_metrics.items():
            variant_result = {
                "variant_id": variant_id,
                "sample_size": len(set(e.user_id for e in experiment_events if e.variant_id == variant_id)),
                "metrics": {}
            }
            
            for metric_name, values in metrics.items():
                if values:
                    variant_result["metrics"][metric_name] = {
                        "mean": np.mean(values),
                        "std": np.std(values),
                        "count": len(values),
                        "total": sum(values)
                    }
            
            results["variants"][variant_id] = variant_result
        
        # Statistical significance testing
        if len(results["variants"]) == 2:
            control_variant = next((v for v in experiment.variants if v.type == VariantType.CONTROL), None)
            treatment_variant = next((v for v in experiment.variants if v.type == VariantType.TREATMENT), None)
            
            if control_variant and treatment_variant:
                for metric in experiment.metrics:
                    metric_name = metric.name
                    
                    if (control_variant.id in variant_metrics and 
                        treatment_variant.id in variant_metrics and
                        metric_name in variant_metrics[control_variant.id] and
                        metric_name in variant_metrics[treatment_variant.id]):
                        
                        control_values = variant_metrics[control_variant.id][metric_name]
                        treatment_values = variant_metrics[treatment_variant.id][metric_name]
                        
                        if len(control_values) > 10 and len(treatment_values) > 10:
                            # Perform t-test
                            t_stat, p_value = stats.ttest_ind(treatment_values, control_values)
                            
                            control_mean = np.mean(control_values)
                            treatment_mean = np.mean(treatment_values)
                            
                            relative_improvement = ((treatment_mean - control_mean) / control_mean) if control_mean != 0 else 0
                            
                            significance_result = {
                                "metric": metric_name,
                                "control_mean": control_mean,
                                "treatment_mean": treatment_mean,
                                "relative_improvement": relative_improvement,
                                "p_value": p_value,
                                "is_significant": p_value < (1 - experiment.confidence_level),
                                "confidence_level": experiment.confidence_level,
                                "sample_size_control": len(control_values),
                                "sample_size_treatment": len(treatment_values)
                            }
                            
                            results["statistical_significance"][metric_name] = significance_result
                            
                            # Generate recommendations
                            if significance_result["is_significant"]:
                                if relative_improvement > metric.target_improvement:
                                    results["recommendations"].append(
                                        f"✅ {metric_name}: Treatment shows significant improvement ({relative_improvement:.1%}). Recommend rolling out."
                                    )
                                elif relative_improvement < -0.02:  # Significant negative impact
                                    results["recommendations"].append(
                                        f"⚠️ {metric_name}: Treatment shows significant decrease ({relative_improvement:.1%}). Recommend stopping."
                                    )
                            else:
                                results["recommendations"].append(
                                    f"⏳ {metric_name}: No significant difference yet. Continue experiment."
                                )
        
        return results
    
    async def get_active_experiments(self) -> List[Dict[str, Any]]:
        """Get all active experiments"""
        active = []
        
        for exp_id, experiment in self.experiments.items():
            if experiment.status == ExperimentStatus.RUNNING:
                # Calculate sample sizes
                assigned_users = sum(1 for assignments in self.user_assignments.values() if exp_id in assignments)
                
                active.append({
                    "id": experiment.id,
                    "name": experiment.name,
                    "description": experiment.description,
                    "status": experiment.status.value,
                    "variants": len(experiment.variants),
                    "metrics": len(experiment.metrics),
                    "assigned_users": assigned_users,
                    "min_sample_size": experiment.min_sample_size,
                    "start_date": experiment.start_date.isoformat(),
                    "days_running": (datetime.now() - experiment.start_date).days
                })
        
        return active
    
    async def set_feature_flag(self, flag_name: str, enabled: bool):
        """Set feature flag"""
        self.feature_flags[flag_name] = enabled
        logger.info(f"Feature flag {flag_name} set to {enabled}")
    
    async def is_feature_enabled(self, flag_name: str) -> bool:
        """Check if feature flag is enabled"""
        return self.feature_flags.get(flag_name, False)
    
    async def get_system_status(self) -> Dict[str, Any]:
        """Get A/B testing system status"""
        total_experiments = len(self.experiments)
        active_experiments = len([e for e in self.experiments.values() if e.status == ExperimentStatus.RUNNING])
        total_assignments = sum(len(assignments) for assignments in self.user_assignments.values())
        total_events = len(self.events)
        
        return {
            "system_name": "AisleMarts A/B Testing Framework",
            "status": "operational",
            "version": "1.0.0",
            "total_experiments": total_experiments,
            "active_experiments": active_experiments,
            "total_user_assignments": total_assignments,
            "total_events_tracked": total_events,
            "feature_flags": len(self.feature_flags),
            "capabilities": [
                "multi_variant_testing",
                "statistical_significance",
                "feature_flags",
                "consistent_hashing",
                "real_time_tracking",
                "automated_recommendations"
            ],
            "timestamp": datetime.now().isoformat()
        }

# Global instance
ab_framework = ABTestingFramework()