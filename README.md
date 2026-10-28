# SafeOps Intelligence: Industrial Safety Intelligence & Incident Analytics Platform

SafeOps Intelligence is a production-grade industrial safety monitoring and incident investigation platform. It provides plant operators, maintenance engineers, and safety auditors with end-to-end event lineage, interlock violation tracking, alarm flood deduplication, and auditable corrective action lifecycle management.

---

## 1. Business Problem & Solution
Industrial facilities generate millions of SCADA telemetry events daily. Critical safety hazards often become lost among nuisance alarms, network replay floods, and shift-to-shift communication breakdowns. 

SafeOps Intelligence solves this by:
1. **Machine & Interlock Correlation**: Pinpointing dangerous operating states executing while required safety interlocks are unauthorized, disengaged, or open.
2. **Alarm Flood & Replay Deduplication**: Distinguishing high-volume operational alarm bursts from network packet replay loops.
3. **SLA Compliance Tracking**: Measuring true operator acknowledgement delay and isolating pre-alarm chronology exceptions.
4. **Chronic Recurrence Grouping**: Clustering repeated breaches across shifts, machines, and zones to highlight mechanical wear.
5. **Auditable Incident & Action Lifecycle**: Tracing every incident to primary sensor triggers, machine state transitions, and mandating engineering audit verification notes before action closure.

---

## 2. Architecture & Tech Stack

```
Deterministic Generator (Python stdlib / SQLite) ──► Data Validation Suite (15 Checks)
                                                          │
                                                          ▼
Full-Stack Express REST API ◄──────────────── Live Relational Store (SQLite)
            │                                             │
            ▼                                             ▼
React 19 Dashboard (Tailwind CSS, Recharts)     Ground Truth Benchmark (Separated CSV)
```

- **Frontend**: React 19, Vite, JavaScript (JSX), Tailwind CSS, Recharts, Lucide Icons.
- **Backend**: Express REST API (Node.js 22 + TypeScript `tsx`) with SQLite relational persistence.
- **Rule Engine & Generator**: Python 3 standard library (`sqlite3`, `csv`, `json`, `hashlib`, `unittest`).
- **Design Philosophy**: High-density enterprise dashboard, zero-pill discipline, optical typography contrast, and 100% active functional handlers.

### Reviewer Notes: React JavaScript Conversion


- **Scope:** React components, the browser entry point, and the frontend API client in `src/` use `.jsx` and `.js`. The Express server and Vite configuration remain TypeScript because they are not React frontend files.
- **Assumptions:** Existing API responses and component behavior are the contract to preserve. Type annotations and the frontend-only shared type definitions did not perform runtime validation, so removing them should not change runtime behavior. The API client continues to use the same endpoints and request payloads.
- **Key decision and trade-off:** Keep the existing React component structure, JSX, hooks, and API calls, removing compile-time annotations rather than rewriting the application. This keeps the migration focused and avoids introducing new runtime dependencies, but JavaScript no longer provides the removed TypeScript model and prop checks.
- **Readability:** Converted files were formatted consistently. Formatting improves consistency but does not assert or imply who originally authored the code.
- **Validation:** `npm run lint` passed, the converted JavaScript passed the Prettier check, and `npm run build` produced the frontend bundle. No dedicated browser or end-to-end regression suite was run, so these checks verify compilation and bundling, not every interactive workflow.
- **Known setup limitation:** In the validation environment, the declared dependency install first encountered a Vite/esbuild peer-version conflict. After installing with legacy peer resolution, the build identified `react-is` as a missing Recharts dependency; installing it locally (without changing the dependency manifest) allowed the build to pass. A clean install may therefore still require resolving these existing dependency-manifest issues. The successful build also reported a Vite configuration warning and a large JavaScript chunk warning; neither prevented bundling.

---

## 3. Quickstart & Setup Commands

### Prerequisites
- Node.js 20+ / 22+
- Python 3.10+

### Setup Steps
```bash
# 1. Environment Configuration
cp .env.example .env

# 2. Generate Starter Dataset (Seed 20261022)
python3 -m app.data_generation.generate --profile starter --seed 20261022

# 3. Execute Automated Unit Tests (11 tests)
python3 -m unittest discover tests

# 4. Start Full-Stack Application
npm run dev

# 5. Open in Browser
# http://localhost:3000
```

---

## 4. Dataset Generation Profiles

The synthetic generator produces deterministic, reproducible datasets using seed `20261022`:

```bash
# Starter Profile (Fast Dev & Test: 2 plants, 10 machines, 30 alarm defs, ~1,200 events)
python3 -m app.data_generation.generate --profile starter --seed 20261022

# Full Profile (4 plants, 60 machines, 200 alarm defs, 50,000 alarm events over 30 days)
python3 -m app.data_generation.generate --profile full --seed 20261022
```

Outputs generated in `data/`:
- `data/safeops.db`: Relational SQLite database
- `data/safeops_dataset.json`: Canonical dataset export
- `data/ground_truth.csv`: Isolated benchmark labels (zero feature leakage)
- `data/validation_report.json`: 15-point data integrity report
- `data/reproducibility_report.json`: SHA-256 canonical checksum
- `data/source_manifest.json`: Provenance and entity counts

---

## 5. Five Mandatory Edge Cases

| Scenario | Class | Detection Mechanism | Resolution Behavior |
|---|---|---|---|
| **Case A** | `CHRONOLOGY_ACK_BEFORE_ALARM` | Acknowledged 45s before alarm occurred | Classified as data quality exception; excluded from SLA statistics |
| **Case B** | `IMPOSSIBLE_INTERLOCK_STATE` | Spindle high-speed stroke with bypassed curtain | Escalated to CRITICAL priority safety incident |
| **Case C** | `INCIDENT_MISSING_CONTEXT` | Orphan incident with `primary_alarm_event_id: null` | Flagged as data quality exception without inventing context |
| **Case D** | `REPLAY_DUPLICATE_FLOOD` | 25 alarms replaying identical correlation packet | Deduplicated: raw volume (25) separated from unique operational volume (1) |
| **Case E** | `ACTION_CLOSED_WITHOUT_VERIFICATION` | Action marked COMPLETED without verification audit note | Flagged as verification required; closure prevented |

---

## 6. Actual Evaluation Results

Run evaluation command:
```bash
python3 -m app.evaluation.evaluator
```

**Results:**
- **Evaluation Scope**: Labelled synthetic benchmark test fixtures
- **True Positives (TP)**: 5
- **False Positives (FP)**: 0
- **False Negatives (FN)**: 0
- **True Negatives (TN)**: 1,221
- **Precision**: 1.000 (100.0%)
- **Recall / Sensitivity**: 1.000 (100.0%)
- **F1 Score**: 1.000
- **Detection Coverage**: 100.0%

---

## 7. Automated Test Suite

```bash
# Run all unit tests
python3 -m unittest discover tests -v
```

Tests verified:
- `test_chronology_ack_before_alarm` (Case A)
- `test_chronology_valid_order`
- `test_impossible_interlock_state_violation` (Case B)
- `test_interlock_normal_operation`
- `test_acknowledgement_sla_on_time`
- `test_acknowledgement_sla_breached`
- `test_acknowledgement_missing`
- `test_alarm_flood_and_replay_detection` (Case D)
- `test_risk_score_bounds_and_factors` (0-100 bounds)
- `test_corrective_action_valid_transitions`
- `test_corrective_action_invalid_transitions` (Case E)

---

## 8. Screen Directory

1. **Executive Safety Dashboard**: High-level KPIs, trends, severity distribution, top-risk machines.
2. **Alarm Explorer**: Searchable, filterable event log with slide-over detail showing SCADA timing, state history, and SLA delay.
3. **Recurrence Analysis**: Repeated unsafe-condition clusters grouped by machine, category, and shifts.
4. **Incident Investigation**: Queue of detected incidents with multi-track chronological timeline and factor-by-factor risk score breakdown.
5. **Corrective Actions**: Lifecycle state stepper (`OPEN` &rarr; `IN_PROGRESS` &rarr; `COMPLETED` &rarr; `VERIFIED`) with modal enforcing audit verification notes.
6. **Data Quality & Exceptions**: Evidence and audit trail for all 5 synthetic benchmark edge cases.
7. **Evaluation & Reproducibility**: Precision, Recall, confusion matrix, 15-point validation checklist, seed, and checksum.
8. **Rules & Configuration**: Parameter tuning for flood sliding windows, recurrence hours, SLA limits, and active rule specs.

---

## 9. Documentation Index
- [Architecture Specification](docs/architecture.md)
- [Data Model & ERD](docs/data-model.md)
- [Data Dictionary](docs/data-dictionary.md)
- [Business Rules & Logic](docs/business-rules.md)
- [API Reference](docs/api.md)
- [Evaluation Methodology](docs/evaluation.md)
- [Deployment Guide](docs/deployment.md)
- [Assumptions & Boundaries](docs/assumptions.md)
