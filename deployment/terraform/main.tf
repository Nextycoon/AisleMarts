# 🚀 AisleMarts Production Infrastructure - GCP Only
# World's First 0% Commission AI Commerce Platform

terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 4.0"
    }
  }
}

# Variables
variable "project_id" {
  description = "GCP Project ID for AisleMarts production"
  type        = string
}

variable "environment" {
  description = "Environment (prod, staging)"
  type        = string
  default     = "prod"
}

variable "regions" {
  description = "GCP regions for global deployment"
  type        = list(string)
  default     = ["us-central1", "us-east1", "europe-west1", "europe-west4", "asia-south1", "asia-east1"]
}

# Configure providers
provider "google" {
  project = var.project_id
  region  = "us-central1"
}

provider "google-beta" {
  project = var.project_id
  region  = "us-central1"
}

# Enable required APIs
resource "google_project_service" "apis" {
  for_each = toset([
    "run.googleapis.com",
    "container.googleapis.com",
    "spanner.googleapis.com",
    "firestore.googleapis.com",
    "bigquery.googleapis.com",
    "secretmanager.googleapis.com",
    "cloudkms.googleapis.com",
    "aiplatform.googleapis.com",
    "cloudbuild.googleapis.com",
    "artifactregistry.googleapis.com",
    "compute.googleapis.com",
    "dns.googleapis.com"
  ])
  
  service = each.value
  project = var.project_id
}

# Service Accounts
resource "google_service_account" "cloudrun_sa" {
  account_id   = "aislemarts-run-exec"
  display_name = "AisleMarts Cloud Run Execution"
  description  = "Service account for AisleMarts Cloud Run services"
}

resource "google_service_account" "gke_sa" {
  account_id   = "aislemarts-gke-exec"
  display_name = "AisleMarts GKE Execution"
  description  = "Service account for AisleMarts GKE workloads"
}

# IAM bindings for service accounts
resource "google_project_iam_member" "cloudrun_permissions" {
  for_each = toset([
    "roles/secretmanager.secretAccessor",
    "roles/spanner.databaseUser",
    "roles/datastore.user",
    "roles/bigquery.dataEditor",
    "roles/storage.objectAdmin",
    "roles/aiplatform.user"
  ])
  
  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.cloudrun_sa.email}"
}

# Artifact Registry for Docker images
resource "google_artifact_registry_repository" "aislemarts" {
  location      = "us-central1"
  repository_id = "aislemarts-images"
  description   = "AisleMarts Docker images repository"
  format        = "DOCKER"
}

# Secret Manager for API keys
resource "google_secret_manager_secret" "openai_key" {
  secret_id = "openai-api-key"
  
  replication {
    automatic = true
  }
}

resource "google_secret_manager_secret" "stripe_key" {
  secret_id = "stripe-secret-key"
  
  replication {
    automatic = true
  }
}

# Cloud Spanner for global data consistency
resource "google_spanner_instance" "aislemarts" {
  config       = "regional-us-central1"
  display_name = "AisleMarts Primary Database"
  name         = "aislemarts-${var.environment}"
  num_nodes    = 3
  
  labels = {
    environment = var.environment
    service     = "aislemarts"
  }
}

resource "google_spanner_database" "aislemarts" {
  instance = google_spanner_instance.aislemarts.name
  name     = "aislemarts"
  
  ddl = [
    "CREATE TABLE Vendors (VendorId STRING(36) NOT NULL, Name STRING(255), CreatedAt TIMESTAMP, Revenue FLOAT64) PRIMARY KEY (VendorId)",
    "CREATE TABLE Leads (LeadId STRING(36) NOT NULL, VendorId STRING(36), UserId STRING(36), Status STRING(50), CreatedAt TIMESTAMP, QualificationScore FLOAT64) PRIMARY KEY (LeadId)",
    "CREATE TABLE Transactions (TransactionId STRING(36) NOT NULL, VendorId STRING(36), Amount FLOAT64, Currency STRING(3), Status STRING(50), CreatedAt TIMESTAMP) PRIMARY KEY (TransactionId)"
  ]
}

# Firestore for user sessions and real-time data
resource "google_firestore_database" "aislemarts" {
  project     = var.project_id
  name        = "(default)"
  location_id = "nam5"  # Multi-region
  type        = "FIRESTORE_NATIVE"
}

# BigQuery for analytics
resource "google_bigquery_dataset" "aislemarts_analytics" {
  dataset_id = "aislemarts_analytics"
  location   = "US"
  
  description = "AisleMarts business intelligence and analytics"
  
  labels = {
    environment = var.environment
    service     = "aislemarts"
  }
}

# Cloud Storage for media and exports
resource "google_storage_bucket" "aislemarts_media" {
  name     = "${var.project_id}-aislemarts-media"
  location = "US"
  
  uniform_bucket_level_access = true
  
  cors {
    origin          = ["*"]
    method          = ["GET", "HEAD", "PUT", "POST", "DELETE"]
    response_header = ["*"]
    max_age_seconds = 3600
  }
}

# Global HTTP Load Balancer
resource "google_compute_global_address" "aislemarts_ip" {
  name = "aislemarts-global-ip"
}

# Cloud Run services for each region
resource "google_cloud_run_v2_service" "aislemarts_api" {
  for_each = toset(var.regions)
  
  name     = "aislemarts-api"
  location = each.value
  
  template {
    containers {
      image = "${google_artifact_registry_repository.aislemarts.location}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.aislemarts.repository_id}/api:latest"
      
      ports {
        container_port = 8001
      }
      
      resources {
        limits = {
          cpu    = "2"
          memory = "4Gi"
        }
      }
      
      env {
        name = "PROJECT_ID"
        value = var.project_id
      }
      
      env {
        name = "ENVIRONMENT"
        value = var.environment
      }
      
      env {
        name = "OPENAI_API_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.openai_key.secret_id
            version = "latest"
          }
        }
      }
      
      env {
        name = "STRIPE_SECRET_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.stripe_key.secret_id
            version = "latest"
          }
        }
      }
      
      env {
        name = "SPANNER_INSTANCE"
        value = google_spanner_instance.aislemarts.name
      }
      
      env {
        name = "SPANNER_DATABASE"
        value = google_spanner_database.aislemarts.name
      }
    }
    
    service_account = google_service_account.cloudrun_sa.email
    
    scaling {
      min_instance_count = 0
      max_instance_count = 1000
    }
  }
  
  ingress = "INGRESS_TRAFFIC_ALL"
  
  depends_on = [google_project_service.apis]
}

# Cloud Run service IAM for public access
resource "google_cloud_run_service_iam_member" "public_access" {
  for_each = toset(var.regions)
  
  location = each.value
  project  = var.project_id
  service  = google_cloud_run_v2_service.aislemarts_api[each.key].name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# GKE Autopilot cluster for WebSocket services
resource "google_container_cluster" "aislemarts_realtime" {
  name     = "aislemarts-realtime"
  location = "us-central1"
  
  # Enable Autopilot
  enable_autopilot = true
  
  # Network configuration
  network    = "default"
  subnetwork = "default"
  
  # Enable workload identity
  workload_identity_config {
    workload_pool = "${var.project_id}.svc.id.goog"
  }
  
  depends_on = [google_project_service.apis]
}

# Outputs
output "global_ip" {
  description = "Global IP address for AisleMarts"
  value       = google_compute_global_address.aislemarts_ip.address
}

output "spanner_instance" {
  description = "Spanner instance name"
  value       = google_spanner_instance.aislemarts.name
}

output "cloudrun_urls" {
  description = "Cloud Run service URLs by region"
  value = {
    for region in var.regions : region => google_cloud_run_v2_service.aislemarts_api[region].uri
  }
}

output "artifact_registry" {
  description = "Artifact Registry repository URL"
  value       = "${google_artifact_registry_repository.aislemarts.location}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.aislemarts.repository_id}"
}