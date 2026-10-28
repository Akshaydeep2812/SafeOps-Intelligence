# SafeOps Intelligence: Evaluation Methodology & Benchmark Results

## 1. Ground Truth Separation
Ground truth is persisted independently in `data/ground_truth.csv` and is strictly excluded from analytical features and decision engines to avoid data leakage.

## 2. Benchmark Scenarios (5 Mandatory Edge Cases)
1. **Case A (Chronology Violation)**:
   - Scenario: Operator acknowledgement timestamp is 45s earlier than the alarm occurrence timestamp.
   - Expected Decision: `FLAG_CHRONOLOGY_VIOLATION`, exclude negative delay from SLA statistics.
2. **Case B (Impossible Interlock State)**:
   - Scenario: Spindle/machine enters high-speed prohibited stroke while interlock is unauthorized bypass.
   - Expected Decision: `FLAG_SAFETY_INTERLOCK_VIOLATION`, escalate to critical priority.
3. **Case C (Incident Missing Triggering Context)**:
   - Scenario: Orphan incident record imported with `primary_alarm_event_id: null`.
   - Expected Decision: `FLAG_DATA_QUALITY_EXCEPTION`, do not fabricate context.
4. **Case D (Replay Duplicate Flood)**:
   - Scenario: Burst of 25 alarms generated within 40 seconds sharing identical network packet correlation.
   - Expected Decision: `DEDUPLICATE_REPLAY_FLOOD`, separate raw volume (25) from unique operational volume (1).
5. **Case E (Action Closed Without Verification)**:
   - Scenario: Corrective action marked completed without verification audit timestamp or signature.
   - Expected Decision: `FLAG_LIFECYCLE_VIOLATION`, mark as verification required.

## 3. Actual Evaluation Metrics
- **Scope**: Labelled synthetic benchmark test fixtures
- **True Positives (TP)**: 5
- **False Positives (FP)**: 0
- **False Negatives (FN)**: 0
- **True Negatives (TN)**: 1,221
- **Precision**: 1.000 (100.0%)
- **Recall / Sensitivity**: 1.000 (100.0%)
- **F1 Score**: 1.000
- **Detection Coverage**: 100.0%

*Disclaimer: Performance is benchmarked against deterministic synthetic test fixtures. It validates logic correctness and does not establish unvalidated real-world performance.*
