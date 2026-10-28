import { useEffect, useState } from "react";
import { Save, CheckCircle2, FileText } from "lucide-react";
import { api } from "../api/client";
export const ConfigPage = () => {
  const [config, setConfig] = useState(null);
  const [floodWindow, setFloodWindow] = useState(300);
  const [floodThreshold, setFloodThreshold] = useState(10);
  const [recurrenceWindow, setRecurrenceWindow] = useState(24);
  const [slaCritical, setSlaCritical] = useState(60);
  const [slaHigh, setSlaHigh] = useState(180);
  const [slaMedium, setSlaMedium] = useState(300);
  const [slaLow, setSlaLow] = useState(600);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const cfg = await api.getSystemConfig();
        setConfig(cfg);
        setFloodWindow(cfg.alarmFloodWindowSeconds);
        setFloodThreshold(cfg.alarmFloodThreshold);
        setRecurrenceWindow(cfg.recurrenceWindowHours);
        if (cfg.slaLimits) {
          setSlaCritical(cfg.slaLimits.CRITICAL || 60);
          setSlaHigh(cfg.slaLimits.HIGH || 180);
          setSlaMedium(cfg.slaLimits.MEDIUM || 300);
          setSlaLow(cfg.slaLimits.LOW || 600);
        }
      } catch (err) {
        console.error("Failed to load system configuration:", err);
      }
    };
    fetchConfig();
  }, []);
  const handleSaveConfig = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.updateSystemConfig({
        alarmFloodWindowSeconds: floodWindow,
        alarmFloodThreshold: floodThreshold,
        recurrenceWindowHours: recurrenceWindow,
        slaLimits: {
          CRITICAL: slaCritical,
          HIGH: slaHigh,
          MEDIUM: slaMedium,
          LOW: slaLow,
        },
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3e3);
    } catch (err) {
      console.error("Failed to save config:", err);
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-100">
          Safety Rules & Configuration
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Auditable parameter tuning for alarm flood windows, recurrence
          grouping, SLA deadlines, and rule specifications.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-lg p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">
                Operational Rule Parameters
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                Rule Set Version: {config?.version || "v1.2.0-deterministic"}
              </span>
            </div>
            {savedSuccess && (
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Updated & Versioned
              </span>
            )}
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-5 text-xs">
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
                Rule 4: Alarm Flood Sliding Window
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 block mb-1">
                    Sliding Window (seconds):
                  </label>
                  <input
                    type="number"
                    value={floodWindow}
                    onChange={(e) => setFloodWindow(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200 font-mono"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Default: 300s (5 min)
                  </span>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">
                    Burst Threshold (events):
                  </label>
                  <input
                    type="number"
                    value={floodThreshold}
                    onChange={(e) => setFloodThreshold(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200 font-mono"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Trigger alarm flood
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-800">
              <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
                Rule 5: Recurrence Grouping Window
              </h4>
              <div>
                <label className="text-slate-400 block mb-1">
                  Recurrence Cluster Window (hours):
                </label>
                <input
                  type="number"
                  value={recurrenceWindow}
                  onChange={(e) => setRecurrenceWindow(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200 font-mono"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Time boundary for grouping repeated breaches on identical
                  workcells
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-800">
              <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
                Rule 3: Acknowledgement SLA Limits (seconds)
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 block mb-1">
                    CRITICAL SLA (s):
                  </label>
                  <input
                    type="number"
                    value={slaCritical}
                    onChange={(e) => setSlaCritical(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">
                    HIGH SLA (s):
                  </label>
                  <input
                    type="number"
                    value={slaHigh}
                    onChange={(e) => setSlaHigh(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">
                    MEDIUM SLA (s):
                  </label>
                  <input
                    type="number"
                    value={slaMedium}
                    onChange={(e) => setSlaMedium(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">
                    LOW SLA (s):
                  </label>
                  <input
                    type="number"
                    value={slaLow}
                    onChange={(e) => setSlaLow(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 disabled:bg-slate-800 text-white font-semibold rounded text-xs transition-colors shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>
                  {saving ? "Auditing & Saving..." : "Save Configuration"}
                </span>
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <FileText className="w-4 h-4 text-red-400" />
            <h3 className="text-sm font-semibold text-slate-200">
              System Rule Specifications
            </h3>
          </div>

          <div className="space-y-4 text-xs text-slate-300">
            <div className="bg-slate-950/60 p-3.5 rounded border border-slate-800/80 space-y-1">
              <h5 className="font-semibold text-slate-200">
                Rule 1 — Event Chronology & Sequence
              </h5>
              <p className="text-[11px] text-slate-400">
                Preserves event occurrence time separately from ingestion time.
                Acknowledgements occurring prior to alarms are flagged as data
                quality violations and excluded from response delay statistics.
              </p>
            </div>

            <div className="bg-slate-950/60 p-3.5 rounded border border-slate-800/80 space-y-1">
              <h5 className="font-semibold text-slate-200">
                Rule 2 — Safety and Interlock Compliance
              </h5>
              <p className="text-[11px] text-slate-400">
                Evaluates machine operational state against required interlocks.
                Prohibited transitions (such as unguarded high-speed strokes
                with bypassed optical curtains) trigger immediate critical
                incident escalation.
              </p>
            </div>

            <div className="bg-slate-950/60 p-3.5 rounded border border-slate-800/80 space-y-1">
              <h5 className="font-semibold text-slate-200">
                Rule 3 — Acknowledgement SLA Accountability
              </h5>
              <p className="text-[11px] text-slate-400">
                Measures true operator response latency against definition
                thresholds. Explicitly differentiates on-time responses, late
                acknowledgements, and missing acknowledgements.
              </p>
            </div>

            <div className="bg-slate-950/60 p-3.5 rounded border border-slate-800/80 space-y-1">
              <h5 className="font-semibold text-slate-200">
                Rule 4 & 5 — Alarm Flood & Recurrence Grouping
              </h5>
              <p className="text-[11px] text-slate-400">
                Uses fingerprint correlation to isolate network replay packet
                floods. Groups repeated unsafe workcell breaches across
                operating shifts to highlight chronic mechanical wear.
              </p>
            </div>

            <div className="bg-slate-950/60 p-3.5 rounded border border-slate-800/80 space-y-1">
              <h5 className="font-semibold text-slate-200">
                Rule 7 & 8 — Risk Scoring & Action Lifecycle
              </h5>
              <p className="text-[11px] text-slate-400">
                Calculates transparent 0–100 risk score breakdown based on
                condition severity, interlock status, recurrence, and SLA
                lateness. Mandates engineering verification sign-off before
                closing actions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
