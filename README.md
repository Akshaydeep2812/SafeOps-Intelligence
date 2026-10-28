# SafeOps Intelligence
### Industrial Safety Intelligence & Incident Analytics Platform

SafeOps Intelligence is a full-stack platform for investigating industrial safety events, identifying recurring unsafe conditions, and managing corrective actions with an auditable lifecycle.

It helps plant operators, maintenance engineers, and safety auditors connect alarms to machine states, detect interlock violations, distinguish replay floods from unique operational alarms, measure acknowledgement delays, and track corrective actions through verification.

> **Project status:** The repository documents a synthetic-data workflow, automated unit tests, and a labelled benchmark evaluation. The reported metrics apply to that benchmark—not to live industrial deployments.

---

## Contents

- [Why SafeOps?](#why-safeops)
- [Core Capabilities](#core-capabilities)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Generate a Dataset](#generate-a-dataset)
- [Safety Rules and Edge Cases](#safety-rules-and-edge-cases)
- [Evaluation Results](#evaluation-results)
- [Automated Tests](#automated-tests)
- [Application Screens](#application-screens)
- [Project Outputs](#project-outputs)
- [Documentation](#documentation)
- [Implementation Notes](#implementation-notes)

---

## Why SafeOps?

Industrial facilities can generate large volumes of SCADA telemetry. Critical safety signals may be obscured by nuisance alarms, replayed messages, inconsistent event chronology, or gaps in shift-to-shift communication.

SafeOps brings event evidence and corrective-action tracking into one workflow so users can investigate what happened, understand why an incident was flagged, and verify that follow-up actions were completed properly.

## Core Capabilities

- **Machine and interlock correlation** — identify hazardous machine states that occur while required safety interlocks are bypassed, disengaged, or open.
- **Alarm flood and replay deduplication** — separate raw alarm volume from unique operational events.
- **Acknowledgement SLA tracking** — measure operator acknowledgement delays and flag impossible event chronology.
- **Recurring-condition analysis** — group repeated breaches by machine, category, zone, and shift to highlight chronic risks.
- **Incident investigation** — connect incidents to primary alarms, machine-state transitions, and risk-score factors.
- **Corrective-action lifecycle** — track actions from `OPEN` to `VERIFIED`, requiring an audit verification note before closure.
- **Data-quality monitoring** — expose missing context and chronology exceptions without inventing missing evidence.
- **Evaluation and reproducibility** — report benchmark metrics, validation checks, dataset seed, and SHA-256 checksum.

---

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, Vite, JavaScript (JSX), Tailwind CSS, Recharts, Lucide Icons |
| REST API | Node.js 22, Express, TypeScript via `tsx` |
| Data storage | SQLite |
| Dataset generation and validation | Python 3 standard library: `sqlite3`, `csv`, `json`, `hashlib`, `unittest` |
| Testing | Python `unittest` and project validation checks |

### Architecture

```text
Deterministic Python Generator
             |
             v
  SQLite Database + CSV/JSON Exports
             |
             v
      Express REST API <------> SQLite
             |
             v
 React 19 Dashboard (Vite, Tailwind, Recharts)

 Ground-truth benchmark labels are stored separately
 to help avoid feature leakage during evaluation.
```

---

## Quick Start

### Prerequisites

- Node.js 20+ (Node.js 22 is documented for the backend)
- Python 3.10+
- npm

### 1. Clone the repository

```bash
git clone https://github.com/Akshaydeep2812/SafeOps-Intelligence.git
cd SafeOps-Intelligence
```

### 2. Configure environment variables

On macOS/Linux/Git Bash:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Review `.env.example` and update values if your local environment requires it.

### 3. Generate the starter dataset

```bash
python -m app.data_generation.generate --profile starter --seed 20261022
```

If your system uses `python3` to invoke Python, use `python3` instead.

### 4. Run the automated tests

```bash
python -m unittest discover tests -v
```

### 5. Start the application

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

> If startup fails, confirm that dependencies are installed and check the scripts and environment variables in `package.json` and `.env.example`.

---

## Generate a Dataset

The generator is deterministic when run with the same profile, seed, and code version.

### Starter profile

Designed for faster local development and testing.

```bash
python -m app.data_generation.generate --profile starter --seed 20261022
```

- 2 plants
- 10 machines
- 30 alarm definitions
- Approximately 1,200 events

### Full profile

Designed for broader evaluation and demonstration.

```bash
python -m app.data_generation.generate --profile full --seed 20261022
```

- 4 plants
- 60 machines
- 200 alarm definitions
- 50,000 alarm events over 30 days

Generated artifacts are written to `data/`. See [Project Outputs](#project-outputs).

---

## Safety Rules and Edge Cases

The implementation documents five mandatory edge cases:

| Case | Condition | Expected handling |
|---|---|---|
| A | `CHRONOLOGY_ACK_BEFORE_ALARM` — acknowledgement occurs 45 seconds before the alarm | Flag as a data-quality exception and exclude from SLA statistics |
| B | `IMPOSSIBLE_INTERLOCK_STATE` — high-speed spindle stroke while the safety curtain is bypassed | Escalate to a critical-priority safety incident |
| C | `INCIDENT_MISSING_CONTEXT` — incident has `primary_alarm_event_id: null` | Flag missing context without inventing an alarm |
| D | `REPLAY_DUPLICATE_FLOOD` — 25 alarms replay the same correlation packet | Preserve raw volume (25) separately from unique operational volume (1) |
| E | `ACTION_CLOSED_WITHOUT_VERIFICATION` — action is completed without a verification audit note | Require verification and prevent final closure |

These cases are useful for demonstrating how the platform handles chronology, interlock safety, missing evidence, duplicate floods, and audit controls.

---

## Evaluation Results

Run the labelled synthetic benchmark evaluator:

```bash
python -m app.evaluation.evaluator
```

### Reported benchmark metrics

| Metric | Result |
|---|---:|
| True positives (TP) | 5 |
| False positives (FP) | 0 |
| False negatives (FN) | 0 |
| True negatives (TN) | 1,221 |
| Precision | 100.0% |
| Recall / sensitivity | 100.0% |
| F1 score | 1.000 |
| Detection coverage | 100.0% |

**Interpretation:** These are the repository's reported results on labelled synthetic benchmark fixtures. They should not be interpreted as evidence of equivalent accuracy on real plant data without independent validation.

---

## Automated Tests

Run the full Python test suite:

```bash
python -m unittest discover tests -v
```

The documented tests cover:

- Alarm acknowledgement chronology and valid ordering
- Interlock violations and normal operation
- Acknowledgement SLA compliance, breaches, and missing acknowledgements
- Alarm flood and replay detection
- Risk-score factors and 0–100 bounds
- Valid and invalid corrective-action state transitions

The README documents 11 unit tests. See the test output from your local checkout for the current pass/fail status.

---

## Application Screens

The platform is organized around eight workflows:

1. **Executive Safety Dashboard** — KPIs, trends, severity distribution, and highest-risk machines.
2. **Alarm Explorer** — searchable event log with SCADA timing, machine-state history, and acknowledgement delay.
3. **Recurrence Analysis** — repeated unsafe-condition clusters by machine, category, and shift.
4. **Incident Investigation** — incident queue, chronological evidence timeline, and risk-score breakdown.
5. **Corrective Actions** — lifecycle stepper from `OPEN` → `IN_PROGRESS` → `COMPLETED` → `VERIFIED`, with verification-note enforcement.
6. **Data Quality & Exceptions** — evidence and audit trail for the five benchmark edge cases.
7. **Evaluation & Reproducibility** — precision, recall, confusion matrix, validation checklist, seed, and checksum.
8. **Rules & Configuration** — configurable flood windows, recurrence periods, SLA limits, and active rule specifications.

---

## Project Outputs

The dataset generator writes these artifacts to `data/`:

| File | Purpose |
|---|---|
| `safeops.db` | SQLite relational database |
| `safeops_dataset.json` | Canonical dataset export |
| `ground_truth.csv` | Separate benchmark labels |
| `validation_report.json` | 15-point data-integrity report |
| `reproducibility_report.json` | SHA-256 canonical checksum |
| `source_manifest.json` | Provenance information and entity counts |

---

## Documentation

Detailed project documentation:

- [Architecture Specification](docs/architecture.md)
- [Data Model & ERD](docs/data-model.md)
- [Data Dictionary](docs/data-dictionary.md)
- [Business Rules & Logic](docs/business-rules.md)
- [API Reference](docs/api.md)
- [Evaluation Methodology](docs/evaluation.md)
- [Deployment Guide](docs/deployment.md)
- [Assumptions & Boundaries](docs/assumptions.md)

---

## Implementation Notes

### React JavaScript conversion

The React components, browser entry point, and frontend API client in `src/` use `.jsx` and `.js`. The Express server and Vite configuration remain TypeScript.

The conversion preserved the existing component structure, JSX, hooks, API endpoints, and request payloads while removing compile-time type annotations. JavaScript does not provide the same compile-time model and prop checks that TypeScript did.

### Validation status documented by the project

The repository notes that:

- `npm run lint` passed in the validation environment.
- The converted JavaScript passed the Prettier check.
- `npm run build` produced the frontend bundle.
- A dedicated browser or end-to-end regression suite was not run.

The documented validation environment also encountered a Vite/esbuild peer-version conflict during dependency installation and a missing `react-is` dependency used by Recharts. The build succeeded after legacy peer resolution and a local installation of `react-is`, without updating the dependency manifest. A clean install may therefore still need dependency-manifest fixes. The build also emitted a Vite configuration warning and a large JavaScript chunk warning.

These notes describe the reported validation environment; rerun the checks against your current checkout before relying on them.

---

## Important Scope Boundary

SafeOps Intelligence is documented as an industrial safety analytics and investigation aid. Synthetic benchmark performance and passing software tests do not replace site-specific hazard analysis, safety-system certification, operational procedures, or validation by qualified industrial safety personnel.
