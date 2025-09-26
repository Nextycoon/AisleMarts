# AisleMarts - Full Application Codebase

## Overview
This document contains the complete codebase for AisleMarts, an AI-powered global marketplace and lifestyle ecosystem featuring 0% commission and TikTok-inspired social commerce.

## Architecture
- **Frontend**: Expo React Native with TypeScript
- **Backend**: FastAPI with Python
- **Database**: MongoDB
- **Infrastructure**: Docker, Kubernetes, Caddy

## Project Structure

```
/app
├── backend/                    # FastAPI Backend
├── frontend/                   # Expo React Native Frontend
├── legal/                      # Legal documents (Privacy Policy, Terms)
├── web/                        # Web assets and app linking
├── k6/                         # Load testing scripts
├── docs/                       # Documentation
├── infrastructure/             # Infrastructure setup
└── deployment/                 # Deployment configurations
```

## Core Features
1. **Vertical Stories Feed** - TikTok-style product discovery
2. **AI Recommendations** - UCB1 algorithm for personalized content
3. **Marketplace** - Amazon-style general and Alibaba-style B2B
4. **Shoppable Videos** - In-feed checkout experience
5. **RFQ System** - Request for Quotation for B2B
6. **Affiliate Program** - Multi-tier commission system
7. **Legal Compliance** - Privacy Policy and Terms of Service
8. **Production Ready** - Docker, EAS builds, CI/CD

---

## Backend Code Files (FastAPI + Python)

### Core Server Configuration