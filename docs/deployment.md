# SafeOps Intelligence: Deployment & Operations Guide

## 1. Quickstart (Development Mode)
```bash
# 1. Copy environment template
cp .env.example .env

# 2. Generate starter dataset (fixed seed 20261022)
python3 -m app.data_generation.generate --profile starter --seed 20261022

# 3. Run unit tests
python3 -m unittest discover tests

# 4. Start the full-stack server
npm run dev
# The dashboard is now accessible at http://localhost:3000
```

## 2. Docker & Containerized Deployment
```bash
# Build and run containers
docker-compose up --build -d

# Verify container health
docker-compose ps
```

## 3. Full Production Dataset Generation (50,000 Alarms)
```bash
python3 -m app.data_generation.generate --profile full --seed 20261022 --output-dir data
```

## 4. Verification & Testing Commands
```bash
# Run unit & rule engine tests
python3 -m unittest discover tests

# Run benchmark evaluation against ground truth
python3 -m app.evaluation.evaluator

# Build frontend production bundle
npm run build
```
