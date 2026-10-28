"""
Automated Unit Tests for SafeOps Intelligence Rules Engine and Edge Cases.
"""

import unittest
from datetime import datetime, timezone, timedelta
from app.rules.engine import RuleEngine

class TestSafeOpsRules(unittest.TestCase):
    # Rule 1 / Case A: Acknowledgement Before Alarm
    def test_chronology_ack_before_alarm(self):
        t_alarm = "2026-09-28T10:00:00Z"
        t_ack_early = "2026-09-28T09:59:30Z" # 30s before alarm
        res = RuleEngine.evaluate_chronology(t_alarm, t_ack_early)

        self.assertFalse(res["valid"])
        self.assertEqual(res["violation_type"], "CHRONOLOGY_ACK_BEFORE_ALARM")
        self.assertIsNone(res["delay_seconds"])
        self.assertEqual(res["raw_diff_seconds"], -30.0)

    def test_chronology_valid_order(self):
        t_alarm = "2026-09-28T10:00:00Z"
        t_ack = "2026-09-28T10:02:15Z" # 135s after
        res = RuleEngine.evaluate_chronology(t_alarm, t_ack)

        self.assertTrue(res["valid"])
        self.assertIsNone(res["violation_type"])
        self.assertEqual(res["delay_seconds"], 135.0)

    # Rule 2 / Case B: Safety & Interlock Violations
    def test_impossible_interlock_state_violation(self):
        machine_state = "HIGH_SPEED_STROKE_UNGUARDED"
        interlock_state = "BYPASSED_UNAUTHORIZED"
        required_state = "ENGAGED"

        res = RuleEngine.evaluate_interlock_safety(machine_state, interlock_state, required_state)
        self.assertTrue(res["is_violation"])
        self.assertEqual(res["violation_type"], "IMPOSSIBLE_INTERLOCK_STATE")
        self.assertEqual(res["severity"], "CRITICAL")

    def test_interlock_normal_operation(self):
        res = RuleEngine.evaluate_interlock_safety("RUNNING", "ENGAGED", "ENGAGED")
        self.assertFalse(res["is_violation"])
        self.assertEqual(res["severity"], "NORMAL")

    # Rule 3: SLA Calculations
    def test_acknowledgement_sla_on_time(self):
        t_alarm = "2026-09-28T10:00:00Z"
        t_ack = "2026-09-28T10:01:30Z" # 90s delay
        res = RuleEngine.evaluate_acknowledgement_sla(t_alarm, t_ack, sla_seconds=180)

        self.assertEqual(res["status"], "ON_TIME")
        self.assertFalse(res["is_sla_breached"])
        self.assertEqual(res["delay_seconds"], 90.0)

    def test_acknowledgement_sla_breached(self):
        t_alarm = "2026-09-28T10:00:00Z"
        t_ack = "2026-09-28T10:08:00Z" # 480s delay
        res = RuleEngine.evaluate_acknowledgement_sla(t_alarm, t_ack, sla_seconds=300)

        self.assertEqual(res["status"], "LATE")
        self.assertTrue(res["is_sla_breached"])
        self.assertEqual(res["delay_seconds"], 480.0)

    def test_acknowledgement_missing(self):
        res = RuleEngine.evaluate_acknowledgement_sla("2026-09-28T10:00:00Z", None, sla_seconds=300)
        self.assertEqual(res["status"], "MISSING")
        self.assertTrue(res["is_sla_breached"])
        self.assertIsNone(res["delay_seconds"])

    # Rule 4 / Case D: Alarm Flood & Replay Detection
    def test_alarm_flood_and_replay_detection(self):
        events = []
        base = datetime(2026, 9, 28, 12, 0, 0, tzinfo=timezone.utc)
        # 15 events in 2 minutes for MACH-001 with replay fingerprint
        for i in range(15):
            t = base + timedelta(seconds=i * 5)
            events.append({
                "id": f"ALM-001-{i}",
                "machine_id": "MACH-001",
                "occurred_at": t.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "correlation_id": "REPLAY-NET-PACKET-99",
                "issue_type": "REPLAY_DUPLICATE_FLOOD" if i > 0 else None
            })

        floods = RuleEngine.detect_alarm_floods(events, window_seconds=300, flood_threshold=10)
        self.assertEqual(len(floods), 1)
        flood = floods[0]
        self.assertEqual(flood["machine_id"], "MACH-001")
        self.assertEqual(flood["raw_alarm_count"], 15)
        self.assertEqual(flood["unique_operational_count"], 1) # Replay collapsed to 1 unique correlation
        self.assertTrue(flood["is_replay_flood"])

    # Rule 7: Risk Scoring Boundaries & Heuristics
    def test_risk_score_bounds_and_factors(self):
        # Maximum risk condition
        max_risk = RuleEngine.calculate_risk_score(
            severity="CRITICAL",
            has_interlock_violation=True,
            recurrence_count=6,
            is_sla_breached=True,
            unresolved_duration_hours=24.0,
            has_overdue_actions=True
        )
        self.assertLessEqual(max_risk["risk_score"], 100.0)
        self.assertGreaterEqual(max_risk["risk_score"], 80.0)
        self.assertEqual(max_risk["priority"], "CRITICAL")
        self.assertEqual(max_risk["factor_breakdown"]["severity_contribution"], 30.0)
        self.assertEqual(max_risk["factor_breakdown"]["interlock_violation_contribution"], 25.0)

        # Minimum risk condition
        min_risk = RuleEngine.calculate_risk_score(
            severity="LOW",
            has_interlock_violation=False,
            recurrence_count=1,
            is_sla_breached=False,
            unresolved_duration_hours=0.0
        )
        self.assertGreaterEqual(min_risk["risk_score"], 0.0)
        self.assertLess(min_risk["risk_score"], 35.0)
        self.assertEqual(min_risk["priority"], "LOW")

    # Rule 8 / Case E: Corrective Action Lifecycle Transitions
    def test_corrective_action_valid_transitions(self):
        # Valid: OPEN -> IN_PROGRESS
        res1 = RuleEngine.validate_action_transition("OPEN", "IN_PROGRESS")
        self.assertTrue(res1["valid"])

        # Valid: IN_PROGRESS -> COMPLETED
        res2 = RuleEngine.validate_action_transition("IN_PROGRESS", "COMPLETED")
        self.assertTrue(res2["valid"])

        # Valid: COMPLETED -> VERIFIED (with note and timestamp)
        res3 = RuleEngine.validate_action_transition(
            "COMPLETED",
            "VERIFIED",
            verified_at="2026-09-29T10:00:00Z",
            verification_note="Signed off by safety auditor"
        )
        self.assertTrue(res3["valid"])

    def test_corrective_action_invalid_transitions(self):
        # Invalid: OPEN directly to VERIFIED (skipping steps)
        res1 = RuleEngine.validate_action_transition("OPEN", "VERIFIED")
        self.assertFalse(res1["valid"])

        # Invalid: COMPLETED to VERIFIED without verification note
        res2 = RuleEngine.validate_action_transition("COMPLETED", "VERIFIED", verified_at="2026-09-29T10:00:00Z", verification_note=None)
        self.assertFalse(res2["valid"])
        self.assertIn("verification", res2["error"].lower())

if __name__ == "__main__":
    unittest.main()
