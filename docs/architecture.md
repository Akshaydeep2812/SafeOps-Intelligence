# SafeOps Intelligence: Architecture Specification

## 1. Executive Summary
SafeOps Intelligence is an end-to-end industrial safety monitoring and incident investigation platform. It models and analyzes relationships between machine states, safety zones, interlocks, alarm events, operator shifts, acknowledgements, incidents, and corrective actions.

## 2. Core Architecture Pipeline
The system operates on an auditable, deterministic data pipeline:
`Synthetic Data Generator → Data Validation Engine → Relational Database (SQLite / PostgreSQL) → Event Analysis Engine → Anomaly & Incident Detection → REST API → Enterprise React Dashboard`

## 3. Module Boundaries
1. **Data Generation & Deterministic Fixtures (`app/data_generation/`)**:
   - Seed: `20261022`
   - Profiles: `starter` (~1,200 events, 2 plants, 10 machines) and `full` (50,000 events, 4 plants, 60 machines, 30 days)
   - Strict dependency order generation: Plants → Zones → Machines → Interlocks → Alarm Definitions → State & Alarm Histories → Shifts → Acknowledgements → Incidents → Corrective Actions → Ground Truth.

2. **Rules & Decision Engine (`app/rules/engine.py`)**:
   - Explicit, functional implementation of Rules 1 through 8.
   - Preserves source evidence and distinguishes operational conclusions from computed heuristics.

3. **Validation & Reproducibility (`app/validation/`)**:
   - 15 integrity checks verifying primary-key uniqueness, relational foreign keys, timestamp chronology, interlock validity, and deterministic seed checksums.

4. **Evaluation Engine (`app/evaluation/`)**:
   - Evaluates predictions against isolated ground-truth fixtures without feature leakage.
   - Calculates Precision, Recall, F1 score, confusion matrix, and class breakdown.

5. **REST API & Web Service (`server.ts`)**:
   - Full-stack Express server mounting Vite in development on port 3000.
   - Exposes documented `/api/v1/*` endpoints for summaries, alarms, recurrence clusters, multi-track timelines, incidents, corrective action state transitions, and CSV exports.

6. **Frontend Experience (`src/`)**:
   - React 19, TypeScript, Tailwind CSS, Recharts, Lucide icons.
   - Conforms strictly to domain-native industrial design, zero-pill discipline, and high-density tabular typography.
