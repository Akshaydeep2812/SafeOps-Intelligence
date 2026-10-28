# SafeOps Intelligence: Data Dictionary

| Entity | Field | Type | Required | Allowed Values / Format | Description |
|---|---|---|---|---|---|
| Plant | id | TEXT | YES | `PLANT-XXX` | Unique immutable plant code |
| Plant | name | TEXT | YES | String | Plant facility display name |
| Plant | location_code | TEXT | YES | String (e.g. `US-DET`) | Geopolitical facility code |
| Plant | timezone | TEXT | YES | IANA timezone string | Facility timezone |
| Machine | id | TEXT | YES | `MACH-XXX` | Unique machine identifier |
| Machine | plant_id | TEXT | YES | FK to plants.id | Associated plant |
| Machine | machine_code | TEXT | YES | Unique string | Unique machine code |
| Machine | machine_type | TEXT | YES | Enum string | Tool type (e.g. CNC Milling Center) |
| SafetyZone | id | TEXT | YES | `SAFE-PLANT-XXX-XXX` | Unique safety zone ID |
| SafetyZone | risk_level | TEXT | YES | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` | Zone danger level |
| Interlock | id | TEXT | YES | `INT-MACH-XXX-XX` | Physical lockout relay/sensor ID |
| Interlock | required_state | TEXT | YES | `ENGAGED`, `CLOSED` | Target safe operating state |
| Interlock | current_state | TEXT | YES | `ENGAGED`, `CLOSED`, `OPEN`, `BYPASSED_UNAUTHORIZED` | Instantaneous relay state |
| AlarmDefinition | id | TEXT | YES | `ALMDEF-MACH-XXX-XX` | Alarm definition ID |
| AlarmDefinition | severity | TEXT | YES | `INFO`, `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` | Severity rating |
| AlarmDefinition | acknowledgement_sla_seconds | INT | YES | Positive integer (e.g. 60, 180, 300) | Maximum SLA response window |
| AlarmEvent | id | TEXT | YES | `ALM-MACH-XXX-XXXXXX` | Unique SCADA alarm event ID |
| AlarmEvent | occurred_at | TEXT | YES | ISO-8601 UTC | Physical sensor trip timestamp |
| AlarmEvent | ingested_at | TEXT | YES | ISO-8601 UTC | Backend ingestion timestamp |
| AlarmEvent | issue_type | TEXT | NO | Enum / null | Deliberate exception indicator |
| Acknowledgement | id | TEXT | YES | `ACK-ALM-XXX-XX` | Acknowledgment record ID |
| Acknowledgement | acknowledgement_status | TEXT | YES | `ON_TIME`, `LATE`, `MISSING`, `INVALID_CHRONOLOGY` | SLA status classification |
| Incident | id | TEXT | YES | `INC-2026-XXXXXX` | Unique incident identifier |
| Incident | risk_score | REAL | YES | 0.0 to 100.0 | Normalized heuristic risk score |
| CorrectiveAction | id | TEXT | YES | `ACT-INC-XXXXXX-XX` | Corrective action identifier |
| CorrectiveAction | status | TEXT | YES | `OPEN`, `IN_PROGRESS`, `COMPLETED`, `VERIFIED`, `CANCELLED` | Lifecycle state machine status |
