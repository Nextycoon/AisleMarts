output "cluster_name" {
  description = "Name of the GKE cluster"
  value       = google_container_cluster.aislemarts_cluster.name
}

output "cluster_endpoint" {
  description = "Endpoint for the GKE cluster"
  value       = google_container_cluster.aislemarts_cluster.endpoint
  sensitive   = true
}

output "cluster_ca_certificate" {
  description = "CA certificate for the GKE cluster"
  value       = google_container_cluster.aislemarts_cluster.master_auth.0.cluster_ca_certificate
  sensitive   = true
}

output "artifact_registry_repository" {
  description = "Artifact Registry repository URL"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/aislemarts"
}

output "backup_bucket_name" {
  description = "Name of the backup storage bucket"
  value       = google_storage_bucket.backups.name
}

output "backup_bucket_url" {
  description = "URL of the backup storage bucket"
  value       = google_storage_bucket.backups.url
}

output "staging_backup_bucket_name" {
  description = "Name of the staging backup storage bucket"
  value       = google_storage_bucket.backups_staging.name
}

output "mongo_backup_service_account_email" {
  description = "Email of the MongoDB backup service account"
  value       = google_service_account.mongo_backup.email
}

output "gke_nodes_service_account_email" {
  description = "Email of the GKE nodes service account"
  value       = google_service_account.gke_nodes.email
}

output "vpc_network_name" {
  description = "Name of the VPC network"
  value       = google_compute_network.aislemarts_vpc.name
}

output "subnet_name" {
  description = "Name of the subnet"
  value       = google_compute_subnetwork.aislemarts_subnet.name
}

output "production_static_ip" {
  description = "Static IP address for production ingress"
  value       = google_compute_global_address.aislemarts_ip.address
}

output "staging_static_ip" {
  description = "Static IP address for staging ingress"
  value       = google_compute_global_address.aislemarts_staging_ip.address
}

output "dns_zone_name" {
  description = "Name of the DNS zone (if created)"
  value       = var.create_dns_zone ? google_dns_managed_zone.aislemarts_zone[0].name : null
}

output "dns_zone_name_servers" {
  description = "Name servers for the DNS zone (if created)"
  value       = var.create_dns_zone ? google_dns_managed_zone.aislemarts_zone[0].name_servers : null
}

output "region" {
  description = "GCP region used for resources"
  value       = var.region
}

output "project_id" {
  description = "GCP project ID"
  value       = var.project_id
}

# Useful for kubectl configuration
output "get_credentials_command" {
  description = "Command to configure kubectl"
  value       = "gcloud container clusters get-credentials ${google_container_cluster.aislemarts_cluster.name} --region ${var.region} --project ${var.project_id}"
}

# Useful for Docker configuration
output "configure_docker_command" {
  description = "Command to configure Docker for Artifact Registry"
  value       = "gcloud auth configure-docker ${var.region}-docker.pkg.dev"
}