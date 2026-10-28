# SafeOps Intelligence: Data Model Specification

## 1. Entity-Relationship Overview
The data model encompasses master entities, transactional events, historical states, and incident resolution tracking.

### Master Entities
- **Plant**: `id (PK)`, `name`, `location_code`, `timezone`, `status`, `created_at`
- **Machine**: `id (PK)`, `plant_id (FK)`, `machine_code`, `name`, `machine_type`, `status`, `commissioned_at`
- **SafetyZone**: `id (PK)`, `plant_id (FK)`, `zone_code`, `name`, `description`, `risk_level`, `status`
- **Interlock**: `id (PK)`, `machine_id (FK)`, `interlock_code`, `name`, `required_state`, `current_state`, `last_changed_at`, `status`
- **AlarmDefinition**: `id (PK)`, `machine_id (FK)`, `alarm_code`, `name`, `description`, `severity`, `category`, `acknowledgement_sla_seconds`, `requires_interlock`, `enabled`, `effective_from`, `effective_to`

### Transactional & Event Entities
- **MachineStateEvent**: `id (PK)`, `machine_id (FK)`, `occurred_at`, `state_type`, `previous_value`, `new_value`, `source_sequence`, `correlation_id`
- **InterlockStateEvent**: `id (PK)`, `interlock_id (FK)`, `occurred_at`, `previous_state`, `new_state`, `source_sequence`, `correlation_id`
- **OperatorShift**: `id (PK)`, `plant_id (FK)`, `operator_code`, `shift_name`, `start_at`, `end_at`, `status`
- **AlarmEvent**: `id (PK)`, `machine_id (FK)`, `alarm_definition_id (FK)`, `event_code`, `event_type`, `severity`, `occurred_at`, `ingested_at`, `source_sequence`, `correlation_id`, `issue_type`, `source_metadata`
- **Acknowledgement**: `id (PK)`, `alarm_event_id (FK)`, `operator_shift_id (FK)`, `acknowledged_at`, `acknowledgement_status`, `response_note`, `issue_type`

### Resolution & Investigation Entities
- **Incident**: `id (PK)`, `incident_code`, `machine_id (FK)`, `safety_zone_id (FK)`, `primary_alarm_event_id (FK, nullable)`, `detected_at`, `incident_type`, `severity`, `status`, `risk_score`, `summary`, `ground_truth_reference`
- **CorrectiveAction**: `id (PK)`, `action_code`, `incident_id (FK)`, `assigned_to`, `action_type`, `description`, `created_at`, `due_at`, `started_at`, `completed_at`, `verified_at`, `status`, `verification_note`, `issue_type`
- **IncidentEvidence**: `incident_id (FK)`, `evidence_type`, `evidence_id`, `relationship`, `recorded_at`

### Bridge Tables
- **MachineSafetyZone**: `machine_id (FK)`, `safety_zone_id (FK)`, `effective_from`, `effective_to`
- **InterlockSafetyZone**: `interlock_id (FK)`, `safety_zone_id (FK)`, `effective_from`, `effective_to`
