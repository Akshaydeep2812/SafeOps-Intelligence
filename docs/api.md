# SafeOps Intelligence: API Reference

All endpoints return JSON and use standard HTTP response codes.

## Dashboard Endpoints
- `GET /api/v1/dashboard/summary`: Overall telemetry metrics, total vs unique alarms, incident counts, SLA breach rates.
- `GET /api/v1/dashboard/trends`: Chronological day-by-day counts for alarms, incidents, and SLA breaches.
- `GET /api/v1/dashboard/severity-distribution`: Count of alarms per severity level.
- `GET /api/v1/dashboard/top-risk-machines`: Top 6 machines ranked by composite risk score.

## Master Data Endpoints
- `GET /api/v1/plants`: List of industrial plants.
- `GET /api/v1/machines`: List of machines with optional `plant_id` filtering.
- `GET /api/v1/safety-zones`: List of safety zones with optional `plant_id` filtering.
- `GET /api/v1/interlocks`: List of interlock sensors.
- `GET /api/v1/alarm-definitions`: Alarm threshold definitions.

## Alarms & Events Endpoints
- `GET /api/v1/alarms`: Paginated list of alarms with filters (`machine_id`, `severity`, `issue_type`, `search`, `page`, `limit`).
- `GET /api/v1/alarms/:alarm_id`: Deep alarm detail with linked machine-state history, interlock history, and acknowledgements.
- `GET /api/v1/anomalies`: List of 5 mandatory edge case instances and anomalies.
- `GET /api/v1/recurrence-clusters`: Repeated unsafe condition clusters.
- `GET /api/v1/machines/:machine_id/timeline`: Multi-track chronological event stream for a machine.

## Incidents & Corrective Actions
- `GET /api/v1/incidents`: Paginated list of detected safety incidents.
- `GET /api/v1/incidents/:incident_id`: Detailed incident record with risk score factor breakdown.
- `GET /api/v1/incidents/:incident_id/evidence`: Linked evidence registry.
- `GET /api/v1/corrective-actions`: List of corrective actions with overdue flags.
- `POST /api/v1/corrective-actions/:action_id/transitions`: Enforces state transitions; requires `verification_note` for `VERIFIED` status.

## Operations & Export Endpoints
- `POST /api/v1/analysis/run`: Idempotent execution of rules engine; produces audit run record.
- `GET /api/v1/evaluation/summary`: Precision, Recall, F1, and confusion matrix against ground truth.
- `GET /api/v1/validation/report`: 15-point data integrity report.
- `GET /api/v1/exports/incidents`: Downloadable CSV export of incidents.
- `GET /api/v1/exports/anomalies`: Downloadable CSV export of detected anomalies.
- `GET /api/v1/system/config`: Retrieve active configurable rule thresholds.
- `PUT /api/v1/system/config`: Update and version rule thresholds.
