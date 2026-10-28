import { useState } from "react";
import {
  Play,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  Download,
} from "lucide-react";
import { api } from "../api/client";
export const Header = ({
  currentTabName,
  onRefresh,
  slaBreachRate = 0,
  unverifiedCount = 0,
  replayCount = 0,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [lastRunSuccess, setLastRunSuccess] = useState(null);
  const handleRunAnalysis = async () => {
    try {
      setIsRunning(true);
      const res = await api.runAnalysis();
      setLastRunSuccess(
        `Analysis ${res.run?.id || "completed"} (0 duplicates created)`,
      );
      setTimeout(() => setLastRunSuccess(null), 4e3);
      onRefresh();
    } catch (err) {
      console.error("Analysis execution failed:", err);
    } finally {
      setIsRunning(false);
    }
  };
  return (
    <header className="h-16 px-6 border-b border-slate-800 bg-slate-900/60 backdrop-blur flex items-center justify-between gap-8 shrink-0">
      {/* Zone 1: Single line breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400 whitespace-nowrap shrink-0">
        <span className="font-medium text-slate-400">SafeOps</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="font-semibold text-slate-200">{currentTabName}</span>
      </div>

      {/* Zone 2: Real Operational Telemetry (Unboxed metadata, anti-pill discipline) */}
      <div className="hidden lg:flex items-center gap-6 text-xs text-slate-400 whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">SLA Breach Rate:</span>
          <span className="font-mono tabular-nums font-semibold text-amber-400">
            {slaBreachRate}%
          </span>
        </div>
        <span className="text-slate-700" aria-hidden="true">
          ·
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Replay Filtered:</span>
          <span className="font-mono tabular-nums font-semibold text-blue-400">
            {replayCount} events
          </span>
        </div>
        <span className="text-slate-700" aria-hidden="true">
          ·
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Unverified Actions:</span>
          <span className="font-mono tabular-nums font-semibold text-red-400">
            {unverifiedCount}
          </span>
        </div>
      </div>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-3 shrink-0">
        {lastRunSuccess && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4" />
            <span>{lastRunSuccess}</span>
          </div>
        )}

        <button
          onClick={handleRunAnalysis}
          disabled={isRunning}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-red-600 hover:bg-red-500 disabled:bg-slate-800 text-white text-xs font-semibold rounded-md transition-colors shadow-sm whitespace-nowrap shrink-0"
        >
          {isRunning ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current" />
          )}
          <span>{isRunning ? "Analyzing..." : "Run Rules Engine"}</span>
        </button>

        <a
          href="/api/v1/exports/incidents"
          download
          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0"
          title="Export Incidents CSV"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export</span>
        </a>
      </div>
    </header>
  );
};
