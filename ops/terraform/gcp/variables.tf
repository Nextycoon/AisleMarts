variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The GCP region for resources"
  type        = string
  default     = "us-central1"
}

variable "backup_bucket_name" {
  description = "Name of the GCS bucket for backups"
  type        = string
  default     = "aislemarts-backups"
}

variable "cluster_name" {
  description = "Name of the GKE cluster"
  type        = string
  default     = "gke-aislemarts-prod"
}

variable "create_dns_zone" {
  description = "Whether to create a Cloud DNS zone"
  type        = bool
  default     = false
}

variable "environment" {
  description = "Environment name (prod, staging, dev)"
  type        = string
  default     = "prod"
}

variable "node_pool_machine_type" {
  description = "Machine type for GKE node pool"
  type        = string
  default     = "e2-standard-4"
}

variable "node_pool_min_count" {
  description = "Minimum number of nodes in the node pool"
  type        = number
  default     = 2
}

variable "node_pool_max_count" {
  description = "Maximum number of nodes in the node pool"
  type        = number
  default     = 10
}

variable "node_pool_disk_size_gb" {
  description = "Disk size in GB for node pool"
  type        = number
  default     = 100
}

variable "backup_retention_days" {
  description = "Number of days to retain backups"
  type        = number
  default     = 90
}

variable "enable_network_policy" {
  description = "Enable network policy for the cluster"
  type        = bool
  default     = true
}

variable "enable_workload_identity" {
  description = "Enable Workload Identity for the cluster"
  type        = bool
  default     = true
}

variable "enable_private_cluster" {
  description = "Enable private cluster configuration"
  type        = bool
  default     = true
}

variable "authorized_networks" {
  description = "List of authorized networks for master access"
  type = list(object({
    cidr_block   = string
    display_name = string
  }))
  default = [
    {
      cidr_block   = "0.0.0.0/0"
      display_name = "All"
    }
  ]
}