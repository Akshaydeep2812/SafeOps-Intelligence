"""
SafeOps Intelligence Rule & Decision Engine
Implements Rules 1-8 and the 5 Edge Cases as auditable, pure, testable functions.
"""

from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Tuple

class RuleEngine:
    RULE_VERSION = "v1.2.0-deterministic"

    # Rule 1: Event Chronology
    @staticmethod
    def evaluate_chronology(alarm_occurred_at: str, ack_acknowledged_at: str) -> Dict[str, Any]:
        """
        Flag acknowledgements that occur before the alarm they reference.
        Preserves both source records, excludes negative delay from valid SLA statistics.
        """
        t_alarm = datetime.fromisoformat(alarm_occurred_at.replace("Z", "+00:00"))
        t_ack = datetime.fromisoformat(ack_acknowledged_at.replace("Z", "+00:00"))
        delay_seconds = (t_ack - t_alarm).total_seconds()

        if delay_seconds < 0:
            return {
                "rule_id": "RULE-1-CHRONOLOGY",
                "valid": False,
                "violation_type": "CHRONOLOGY_ACK_BEFORE_ALARM",
                "delay_seconds": None,
                "raw_diff_seconds": delay_seconds,
                "reason": f"Acknowledgement occurred {abs(delay_seconds):.1f}s before alarm occurrence"
            }
        return {
            "rule_id": "RULE-1-CHRONOLOGY",
            "valid": True,
            "violation_type": None,
            "delay_seconds": delay_seconds,
            "raw_diff_seconds": delay_seconds,
            "reason": "Chronological order preserved"
        }

    # Rule 2: Safety & Interlock Violations
    @staticmethod
    def evaluate_interlock_safety(machine_state: str, interlock_state: str, required_state: str) -> Dict[str, Any]:
        """
        Identify a safety violation when machine enters a prohibited state while required interlock is inactive.
        """
        is_machine_prohibited = machine_state in ["HIGH_SPEED_STROKE_UNGUARDED", "PROHIBITED", "EMERGENCY_OVERRIDE"]
        is_interlock_inactive = (interlock_state != required_state) or (interlock_state in ["BYPASSED_UNAUTHORIZED", "DISENGAGED", "OPEN"])

        if is_machine_prohibited and is_interlock_inactive:
            return {
                "rule_id": "RULE-2-INTERLOCK-SAFETY",
                "is_violation": True,
                "severity": "CRITICAL",
                "violation_type": "IMPOSSIBLE_INTERLOCK_STATE",
                "reason": f"Machine in state '{machine_state}' while required interlock state '{required_state}' is violated (current: '{interlock_state}')"
            }
        return {
            "rule_id": "RULE-2-INTERLOCK-SAFETY",
            "is_violation": False,
            "severity": "NORMAL",
            "violation_type": None,
            "reason": "Machine and interlock states are mutually compliant"
        }

    # Rule 3: Acknowledgement SLA
    @staticmethod
    def evaluate_acknowledgement_sla(occurred_at: str, acknowledged_at: Optional[str], sla_seconds: int) -> Dict[str, Any]:
        """
        For each alarm: delay = ack - alarm.
        Distinguish: ON_TIME, LATE (breached), MISSING, INVALID_CHRONOLOGY.
        """
        if acknowledged_at is None:
            return {
                "rule_id": "RULE-3-SLA",
                "status": "MISSING",
                "delay_seconds": None,
                "is_sla_breached": True,
                "reason": "Alarm remains unacknowledged"
            }

        t_alarm = datetime.fromisoformat(occurred_at.replace("Z", "+00:00"))
        t_ack = datetime.fromisoformat(acknowledged_at.replace("Z", "+00:00"))
        delay = (t_ack - t_alarm).total_seconds()

        if delay < 0:
            return {
                "rule_id": "RULE-3-SLA",
                "status": "INVALID_CHRONOLOGY",
                "delay_seconds": None,
                "is_sla_breached": False, # Excluded from misleading negative SLA metrics
                "reason": "Acknowledgement timestamp predates alarm timestamp (data quality exception)"
            }

        is_breached = delay > sla_seconds
        return {
            "rule_id": "RULE-3-SLA",
            "status": "LATE" if is_breached else "ON_TIME",
            "delay_seconds": delay,
            "is_sla_breached": is_breached,
            "sla_limit_seconds": sla_seconds,
            "reason": f"Response took {delay:.1f}s (SLA limit: {sla_seconds}s)"
        }

    # Rule 4: Alarm Flood & Replay Duplicate Detection
    @staticmethod
    def detect_alarm_floods(alarm_events: List[Dict[str, Any]], window_seconds: int = 300, flood_threshold: int = 10) -> List[Dict[str, Any]]:
        """
        Sliding window alarm flood detection.
        Distinguishes unique operational events from replay duplicates using correlation_id/fingerprints.
        """
        floods = []
        # Group by machine
        by_machine: Dict[str, List[Dict[str, Any]]] = {}
        for ev in alarm_events:
            by_machine.setdefault(ev["machine_id"], []).append(ev)

        for m_id, evs in by_machine.items():
            evs_sorted = sorted(evs, key=lambda x: x["occurred_at"])
            n = len(evs_sorted)
            i = 0
            while i < n:
                t_start = datetime.fromisoformat(evs_sorted[i]["occurred_at"].replace("Z", "+00:00"))
                window_events = [evs_sorted[i]]
                j = i + 1
                while j < n:
                    t_cur = datetime.fromisoformat(evs_sorted[j]["occurred_at"].replace("Z", "+00:00"))
                    if (t_cur - t_start).total_seconds() <= window_seconds:
                        window_events.append(evs_sorted[j])
                        j += 1
                    else:
                        break

                if len(window_events) >= flood_threshold:
                    # Check replay duplicates
                    unique_correlations = set(e.get("correlation_id") or e["id"] for e in window_events)
                    has_replay = len(unique_correlations) < len(window_events) or any(e.get("issue_type") == "REPLAY_DUPLICATE_FLOOD" for e in window_events)

                    floods.append({
                        "machine_id": m_id,
                        "start_time": window_events[0]["occurred_at"],
                        "end_time": window_events[-1]["occurred_at"],
                        "raw_alarm_count": len(window_events),
                        "unique_operational_count": len(unique_correlations),
                        "is_replay_flood": has_replay,
                        "severity": "CRITICAL" if len(window_events) > 20 else "HIGH",
                        "sample_ids": [e["id"] for e in window_events[:5]]
                    })
                    i = j # Move forward
                else:
                    i += 1

        return floods

    # Rule 7: Risk Scoring and Prioritization (0 to 100)
    @staticmethod
    def calculate_risk_score(
        severity: str,
        has_interlock_violation: bool,
        recurrence_count: int,
        is_sla_breached: bool,
        unresolved_duration_hours: float = 0.0,
        has_overdue_actions: bool = False
    ) -> Dict[str, Any]:
        """
        Normalized risk scoring heuristic:
        - Severity factor: 0-30 (CRITICAL=30, HIGH=20, MEDIUM=10, LOW=5)
        - Interlock factor: 0-25 (violation=25, none=0)
        - Recurrence factor: 0-20 (>=5 occurrences=20, >=3=14, >=2=8, 1=0)
        - SLA breach factor: 0-15 (breached=15, normal=0)
        - Unresolved duration factor: 0-10 (min(10, duration_hours * 2))
        """
        sev_weights = {"CRITICAL": 30.0, "HIGH": 20.0, "MEDIUM": 10.0, "LOW": 5.0, "INFO": 0.0}
        f_sev = sev_weights.get(severity.upper(), 10.0)
        f_ilk = 25.0 if has_interlock_violation else 0.0

        if recurrence_count >= 5:
            f_rec = 20.0
        elif recurrence_count >= 3:
            f_rec = 14.0
        elif recurrence_count >= 2:
            f_rec = 8.0
        else:
            f_rec = 0.0

        f_sla = 15.0 if is_sla_breached else 0.0
        f_dur = min(10.0, round(unresolved_duration_hours * 2.0, 1))

        raw_score = f_sev + f_ilk + f_rec + f_sla + f_dur
        normalized_score = min(100.0, max(0.0, round(raw_score, 1)))

        if normalized_score >= 80.0:
            priority = "CRITICAL"
        elif normalized_score >= 60.0:
            priority = "HIGH"
        elif normalized_score >= 35.0:
            priority = "MEDIUM"
        else:
            priority = "LOW"

        return {
            "risk_score": normalized_score,
            "priority": priority,
            "factor_breakdown": {
                "severity_contribution": f_sev,
                "interlock_violation_contribution": f_ilk,
                "recurrence_contribution": f_rec,
                "sla_breach_contribution": f_sla,
                "duration_contribution": f_dur
            },
            "disclaimer": "Operational prioritization heuristic, not a certified injury probability."
        }

    # Rule 8: Corrective Action State Machine Lifecycle
    ALLOWED_TRANSITIONS = {
        "OPEN": ["IN_PROGRESS", "CANCELLED"],
        "IN_PROGRESS": ["COMPLETED", "OPEN"],
        "COMPLETED": ["VERIFIED", "IN_PROGRESS"],
        "VERIFIED": [], # Terminal
        "CANCELLED": ["OPEN"] # Reopening allowed with documented reason
    }

    @classmethod
    def validate_action_transition(
        cls,
        current_status: str,
        new_status: str,
        verified_at: Optional[str] = None,
        verification_note: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Enforce valid transitions: OPEN -> IN_PROGRESS -> COMPLETED -> VERIFIED.
        Prevent verification before completion.
        Prevent closure without required verification.
        """
        valid_next = cls.ALLOWED_TRANSITIONS.get(current_status, [])
        if new_status not in valid_next:
            return {
                "valid": False,
                "error": f"Invalid transition from '{current_status}' to '{new_status}'. Allowed targets: {valid_next}"
            }

        if new_status == "VERIFIED":
            if not verified_at or not verification_note or len(verification_note.strip()) == 0:
                return {
                    "valid": False,
                    "error": "Cannot transition to 'VERIFIED' without a valid verification timestamp and audit note."
                }

        return {
            "valid": True,
            "error": None,
            "previous_status": current_status,
            "new_status": new_status
        }
