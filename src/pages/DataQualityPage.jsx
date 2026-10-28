import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Clock,
  Lock,
  Layers,
  Copy,
  FileCheck,
  CheckCircle,
} from "lucide-react";
import { api } from "../api/client";
export const DataQualityPage = () => {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchAnomalies = async () => {
      try {
        setLoading(true);
        const res = await api.getAnomalies();
        setAnomalies(res);
      } catch (err) {
        console.error("Failed to load anomalies:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnomalies();
  }, []);
  const getCaseIcon = (scenario) => {
    switch (scenario) {
      case "Case A":
        return <Clock className="w-5 h-5 text-amber-400" />;
      case "Case B":
        return <Lock className="w-5 h-5 text-red-400" />;
      case "Case C":
        return <Layers className="w-5 h-5 text-purple-400" />;
      case "Case D":
        return <Copy className="w-5 h-5 text-blue-400" />;
      case "Case E":
        return <FileCheck className="w-5 h-5 text-cyan-400" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-slate-400" />;
    }
  };
  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-100">
          Data Quality & Exceptions
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Preserved evidence and audit trail for all 5 mandatory synthetic
          benchmark edge cases (Section 8).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-44 bg-slate-900 border border-slate-800 rounded-lg animate-pulse"
            />
          ))
        ) : anomalies.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            No exceptions recorded.
          </div>
        ) : (
          anomalies.map((item) => (
            <div
              key={item.id}
              className="p-6 bg-slate-900/80 border border-slate-800 rounded-lg space-y-4 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-950 rounded border border-slate-800">
                    {getCaseIcon(item.scenario)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-red-400">
                        {item.scenario}
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="font-mono text-xs text-slate-300 font-semibold">
                        {item.exception_type}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Rule Reference: {item.validation_rule}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${item.severity === "CRITICAL" ? "bg-red-500/20 text-red-300 border border-red-500/30" : item.severity === "HIGH" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-blue-500/20 text-blue-300 border border-blue-500/30"}`}
                  >
                    {item.severity}
                  </span>
                  <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                    {item.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="bg-slate-950/70 p-3 rounded border border-slate-800/80 space-y-1">
                  <span className="text-[10px] uppercase text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Expected Canonical Behavior
                  </span>
                  <p className="text-slate-300 text-[11px] font-sans">
                    {item.expected_behavior}
                  </p>
                </div>

                <div className="bg-slate-950/70 p-3 rounded border border-slate-800/80 space-y-1">
                  <span className="text-[10px] uppercase text-amber-400 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Observed Anomaly Behavior
                  </span>
                  <p className="text-slate-300 text-[11px] font-sans">
                    {item.observed_behavior}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                <div>
                  <span className="text-slate-500 text-[11px] block">
                    Affected Primary Identifier:
                  </span>
                  <span className="font-mono text-slate-200 text-xs font-semibold">
                    {item.affected_id}
                  </span>
                  {item.related_id && (
                    <span className="text-slate-400 text-[11px] font-mono block mt-0.5">
                      Related: {item.related_id}
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-slate-500 text-[11px] block">
                    Recommended Investigation:
                  </span>
                  <p className="text-slate-300 text-[11px] mt-0.5">
                    {item.recommended_investigation}
                  </p>
                </div>
              </div>

              <div className="bg-slate-950/90 p-3 rounded border border-slate-800 text-[11px] font-mono overflow-x-auto text-slate-400">
                <span className="text-[10px] text-slate-500 uppercase block mb-1">
                  Raw Evidence Lineage:
                </span>
                <pre className="text-slate-300 whitespace-pre-wrap">
                  {JSON.stringify(item.evidence, null, 2)}
                </pre>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
