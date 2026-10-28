# SafeOps Intelligence: Business Rules & Decision Logic

## Rule 1: Event Chronology & Sequence
- Preserves both `occurred_at` (event occurrence timestamp in SCADA/PLC) and `ingested_at` (server ingestion timestamp).
- Tiebreaker: deterministic order using `source_sequence` and stable IDs.
- Acknowledgements occurring before alarm occurrence (`delay < 0`) are classified as `INVALID_CHRONOLOGY` (Case A). Negative values are excluded from SLA delay averages.

## Rule 2: Safety & Interlock Violations
- Prohibits machine operating in dangerous states (e.g. `HIGH_SPEED_STROKE_UNGUARDED`, `PROHIBITED`) while a required interlock is inactive (`BYPASSED_UNAUTHORIZED`, `OPEN`, `DISENGAGED`).
- Triggers critical severity safety violation and incident escalation.

## Rule 3: Acknowledgement SLA Compliance
- Evaluates: `acknowledgement_delay = acknowledged_at - occurred_at`.
- Statuses: `ON_TIME` (delay <= SLA), `LATE` (delay > SLA), `MISSING` (no acknowledgement received), `INVALID_CHRONOLOGY` (delay < 0).

## Rule 4: Alarm Flood & Replay Detection
- Sliding window: 300 seconds (5 minutes) with configurable threshold (default: 10 alarms).
- Differentiates unique operational bursts from packet replay attacks/broadcast loops by grouping by `correlation_id` and raw event fingerprints.

## Rule 5: Repeated Unsafe Conditions (Recurrence)
- Groups events by `machine_id`, `category`, and `violation_type` over a 24-hour window.
- Clusters calculate breach counts, mean hours between recurrences, and count of affected operator shifts.

## Rule 6: Deterministic Incident Creation
- Generates idempotent incident codes (`INC-2026-XXXXXX`).
- Links primary triggering alarm, machine states, interlocks, and creates an associated corrective action.

## Rule 7: Heuristic Risk Scoring (0–100)
Composite score factors:
1. Condition Severity: up to 30 pts (CRITICAL: 30, HIGH: 20, MEDIUM: 10)
2. Safety Interlock Violation: up to 25 pts
3. Recurrence Frequency: up to 20 pts (>=5: 20, >=3: 14, >=2: 8)
4. SLA Breach: up to 15 pts
5. Unresolved Duration: up to 10 pts

Priority thresholds: CRITICAL (>=80), HIGH (>=60), MEDIUM (>=35), LOW (<35).
*Explicit disclaimer: Operational prioritization heuristic, not a certified injury probability.*

## Rule 8: Corrective Action State Machine
- Allowed transitions: `OPEN → IN_PROGRESS → COMPLETED → VERIFIED`.
- Premature verification before completion is rejected.
- Closure (`VERIFIED`) requires a mandatory engineering audit verification note and timestamp.
