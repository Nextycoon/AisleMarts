terraform {
  required_version = ">= 1.6.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}

# Artifact Registry for container images
resource "google_artifact_registry_repository" "aislemarts_repo" {
  location      = var.region
  repository_id = "aislemarts"
  description   = "AisleMarts container repository"
  format        = "DOCKER"

  cleanup_policies {
    id     = "keep-minimum-versions"
    action = "KEEP"
    most_recent_versions {
      keep_count = 10
    }
  }
}

# Storage bucket for backups
resource "google_storage_bucket" "backups" {
  name          = var.backup_bucket_name
  location      = "US"
  force_destroy = false

  versioning {
    enabled = true
  }

  lifecycle_rule {
    condition {
      age = 90
    }
    action {
      type = "Delete"
    }
  }

  lifecycle_rule {
    condition {
      age = 30
    }
    action {
      type = "SetStorageClass"
      storage_class = "NEARLINE"
    }
  }
}

# Staging backup bucket
resource "google_storage_bucket" "backups_staging" {
  name          = "${var.backup_bucket_name}-staging"
  location      = "US"
  force_destroy = true

  lifecycle_rule {
    condition {
      age = 30
    }
    action {
      type = "Delete"
    }
  }
}

# VPC for GKE cluster
resource "google_compute_network" "aislemarts_vpc" {
  name                    = "aislemarts-vpc"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "aislemarts_subnet" {
  name          = "aislemarts-subnet"
  ip_cidr_range = "10.1.0.0/16"
  region        = var.region
  network       = google_compute_network.aislemarts_vpc.id

  secondary_ip_range {
    range_name    = "pods"
    ip_cidr_range = "10.2.0.0/16"
  }

  secondary_ip_range {
    range_name    = "services"
    ip_cidr_range = "10.3.0.0/16"
  }
}

# GKE cluster
resource "google_container_cluster" "aislemarts_cluster" {
  name     = var.cluster_name
  location = var.region

  network    = google_compute_network.aislemarts_vpc.name
  subnetwork = google_compute_subnetwork.aislemarts_subnet.name

  # We can't create a cluster with no node pool defined, but we want to only use
  # separately managed node pools. So we create the smallest possible default
  # node pool and immediately delete it.
  remove_default_node_pool = true
  initial_node_count       = 1

  # Networking configuration
  ip_allocation_policy {
    cluster_secondary_range_name  = "pods"
    services_secondary_range_name = "services"
  }

  # Enable network policy
  network_policy {
    enabled = true
  }

  # Enable Workload Identity
  workload_identity_config {
    workload_pool = "${var.project_id}.svc.id.goog"
  }

  # Enable monitoring and logging
  monitoring_config {
    enable_components = [
      "SYSTEM_COMPONENTS",
      "WORKLOADS"
    ]
    managed_prometheus {
      enabled = true
    }
  }

  logging_config {
    enable_components = [
      "SYSTEM_COMPONENTS",
      "WORKLOADS"
    ]
  }

  # Master authorized networks (restrict access)
  master_authorized_networks_config {
    cidr_blocks {
      cidr_block   = "0.0.0.0/0"
      display_name = "All"
    }
  }

  # Private cluster configuration
  private_cluster_config {
    enable_private_nodes    = true
    enable_private_endpoint = false
    master_ipv4_cidr_block  = "172.16.0.0/28"
  }

  # Release channel for automatic updates
  release_channel {
    channel = "REGULAR"
  }

  # Enable vertical pod autoscaling
  vertical_pod_autoscaling {
    enabled = true
  }

  # Maintenance policy
  maintenance_policy {
    recurring_window {
      start_time = "2023-01-01T02:00:00Z"
      end_time   = "2023-01-01T06:00:00Z"
      recurrence = "FREQ=WEEKLY;BYDAY=SA"
    }
  }
}

# Node pool for general workloads
resource "google_container_node_pool" "general_pool" {
  name       = "general-pool"
  location   = var.region
  cluster    = google_container_cluster.aislemarts_cluster.name
  node_count = 2

  # Auto-scaling configuration
  autoscaling {
    min_node_count = 2
    max_node_count = 10
  }

  # Auto-upgrade and auto-repair
  management {
    auto_repair  = true
    auto_upgrade = true
  }

  node_config {
    preemptible  = false
    machine_type = "e2-standard-4"
    disk_size_gb = 100
    disk_type    = "pd-ssd"

    # Google recommends custom service accounts that have cloud-platform scope and permissions granted via IAM Roles.
    service_account = google_service_account.gke_nodes.email
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]

    labels = {
      environment = "production"
      workload    = "general"
    }

    # Enable workload identity
    workload_metadata_config {
      mode = "GKE_METADATA"
    }

    shielded_instance_config {
      enable_secure_boot          = true
      enable_integrity_monitoring = true
    }
  }
}

# Service account for GKE nodes
resource "google_service_account" "gke_nodes" {
  account_id   = "gke-nodes"
  display_name = "GKE Nodes Service Account"
}

# IAM bindings for GKE nodes
resource "google_project_iam_member" "gke_nodes_worker" {
  project = var.project_id
  role    = "roles/container.nodeServiceAccount"
  member  = "serviceAccount:${google_service_account.gke_nodes.email}"
}

resource "google_project_iam_member" "gke_nodes_registry" {
  project = var.project_id
  role    = "roles/storage.objectViewer"
  member  = "serviceAccount:${google_service_account.gke_nodes.email}"
}

resource "google_project_iam_member" "gke_nodes_monitoring" {
  project = var.project_id
  role    = "roles/monitoring.metricWriter"
  member  = "serviceAccount:${google_service_account.gke_nodes.email}"
}

resource "google_project_iam_member" "gke_nodes_logging" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.gke_nodes.email}"
}

# Service account for MongoDB backups
resource "google_service_account" "mongo_backup" {
  account_id   = "mongo-backup"
  display_name = "MongoDB Backup Service Account"
}

# IAM binding for backup service account
resource "google_storage_bucket_iam_member" "backup_writer" {
  bucket = google_storage_bucket.backups.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.mongo_backup.email}"
}

resource "google_storage_bucket_iam_member" "backup_writer_staging" {
  bucket = google_storage_bucket.backups_staging.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.mongo_backup.email}"
}

# Enable Workload Identity binding
resource "google_service_account_iam_member" "workload_identity_backup" {
  service_account_id = google_service_account.mongo_backup.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "serviceAccount:${var.project_id}.svc.id.goog[prod/mongo-backup-sa]"
}

resource "google_service_account_iam_member" "workload_identity_backup_staging" {
  service_account_id = google_service_account.mongo_backup.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "serviceAccount:${var.project_id}.svc.id.goog[staging/mongo-backup-sa]"
}

# Global static IP for ingress
resource "google_compute_global_address" "aislemarts_ip" {
  name = "aislemarts-ip"
}

resource "google_compute_global_address" "aislemarts_staging_ip" {
  name = "aislemarts-staging-ip"
}

# Cloud DNS zone (optional - you may manage DNS externally)
resource "google_dns_managed_zone" "aislemarts_zone" {
  count       = var.create_dns_zone ? 1 : 0
  name        = "aislemarts-zone"
  dns_name    = "AisleMarts.com."
  description = "DNS zone for AisleMarts"
}

# A record for production
resource "google_dns_record_set" "aislemarts_a" {
  count        = var.create_dns_zone ? 1 : 0
  name         = google_dns_managed_zone.aislemarts_zone[0].dns_name
  managed_zone = google_dns_managed_zone.aislemarts_zone[0].name
  type         = "A"
  ttl          = 300

  rrdatas = [google_compute_global_address.aislemarts_ip.address]
}

# A record for staging
resource "google_dns_record_set" "aislemarts_staging_a" {
  count        = var.create_dns_zone ? 1 : 0
  name         = "staging.${google_dns_managed_zone.aislemarts_zone[0].dns_name}"
  managed_zone = google_dns_managed_zone.aislemarts_zone[0].name
  type         = "A"
  ttl          = 300

  rrdatas = [google_compute_global_address.aislemarts_staging_ip.address]
}