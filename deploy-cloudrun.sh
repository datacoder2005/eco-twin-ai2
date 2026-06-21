#!/bin/bash

# Configuration Variables
PROJECT_ID="ecotwin-ai-hackathon"
SERVICE_NAME="ecotwin-backend-api"
REGION="asia-south1" # Mumbai/India region for low latency

echo "🚀 Starting EcoTwin AI Cloud Run Deployment Workflow..."

# 1. Enable Google Cloud APIs
echo "🔑 Enabling necessary Google Cloud Service APIs..."
gcloud services enable run.googleapis.com \
  containerregistry.googleapis.com \
  aiplatform.googleapis.com \
  firestore.googleapis.com

# 2. Build Container Image using Cloud Builds
echo "📦 Compiling and building docker container image via Cloud Build..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME

# 3. Deploy to Cloud Run
echo "⚡ Deploying backend APIs to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars="GEMINI_API_KEY=your_gemini_key,PROJECT_ID=$PROJECT_ID"

echo "✅ Cloud Run deployment complete!"
echo "🔗 Backend Service URL: https://$SERVICE_NAME-your-hash-url.run.app"
