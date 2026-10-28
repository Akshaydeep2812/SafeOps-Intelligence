# SafeOps Intelligence: Engineering Assumptions & Limitations

## 1. Safety Systems Boundaries
- SafeOps Intelligence is an analytical operational decision-support tool.
- It is NOT a replacement for SIL-3/4 certified safety PLCs, physical safety relays, hardwired emergency stops, or hardware interlock interrupters.
- The system does not directly issue actuation commands to physical operational machinery.

## 2. Ingestion & Chronology Assumptions
- The physical equipment clock (SCADA time) and ingestion server time are preserved independently.
- Deliberate network packet replays (Case D) and SCADA client clock desynchronization (Case A) are flagged as data quality issues and isolated from operational safety rates.

## 3. Risk Score Interpretation
- The 0 to 100 risk score is an operational heuristic for floor triage and prioritization.
- It is explicitly NOT a validated probability of human injury or mechanical catastrophic failure.

## 4. Evaluated Scope
- Precision, recall, and detection metrics are evaluated exclusively against the synthetic ground-truth fixtures defined in `data/ground_truth.csv`.
