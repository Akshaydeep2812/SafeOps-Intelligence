import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { api } from "../api/client";
export const RecurrencePage = ({ onNavigateTab }) => {
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchClusters = async () => {
      try {
        setLoading(true);
        const res = await api.getRecurrenceClusters();
        setClusters(res);
      } catch (err) {
        console.error("Failed to load recurrence clusters:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClusters();
  }, []);
  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-100">
          Recurrence Analysis
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Repeated unsafe conditions clustered across machines, safety zones,
          and multiple operating shifts (Rule 5).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg space-y-1">
          <span className="text-xs text-slate-400">
            Total Recurrent Clusters
          </span>
          <div className="text-2xl font-bold font-mono text-purple-400">
            {clusters.length}
          </div>
          <p className="text-[11px] text-slate-500">
            Clusters with &ge; 3 qualifying breaches
          </p>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg space-y-1">
          <span className="text-xs text-slate-400">
            Critical Priority Clusters
          </span>
          <div className="text-2xl font-bold font-mono text-red-400">
            {clusters.filter((c) => c.risk_level === "CRITICAL").length}
          </div>
          <p className="text-[11px] text-slate-500">
            Involves safety interlock or E-stop trips
          </p>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg space-y-1">
          <span className="text-xs text-slate-400">Multi-Shift Recurrence</span>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {clusters.filter((c) => c.affected_shifts_count >= 2).length}
          </div>
          <p className="text-[11px] text-slate-500">
            Persists across shift handovers
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-44 bg-slate-900 border border-slate-800 rounded-lg animate-pulse"
            />
          ))
        ) : clusters.length === 0 ? (
          <div className="col-span-2 py-16 text-center text-slate-500 text-xs">
            No repeated unsafe condition clusters detected.
          </div>
        ) : (
          clusters.map((cluster) => (
            <div
              key={cluster.id}
              className="p-5 bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-lg space-y-4 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-slate-200">
                      {cluster.machine_id}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-xs text-purple-400 font-semibold">
                      {cluster.category}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-100 mt-1">
                    {cluster.violation_type.replace(/_/g, " ")}
                  </h3>
                </div>

                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${cluster.risk_level === "CRITICAL" ? "bg-red-500/20 text-red-300 border border-red-500/40" : cluster.risk_level === "HIGH" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "bg-blue-500/20 text-blue-300 border border-blue-500/40"}`}
                >
                  {cluster.risk_level}
                </span>
              </div>

              <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded border border-slate-800/80">
                {cluster.evidence_summary}
              </p>

              <div className="grid grid-cols-3 gap-2 text-xs font-mono text-slate-400 bg-slate-950/40 p-3 rounded">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">
                    Breach Count
                  </span>
                  <span className="text-sm font-bold text-slate-200 tabular-nums">
                    {cluster.occurrence_count}x
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">
                    Avg Interval
                  </span>
                  <span className="text-sm font-bold text-amber-400 tabular-nums">
                    {cluster.mean_hours_between}h
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">
                    Affected Shifts
                  </span>
                  <span className="text-sm font-bold text-slate-200 tabular-nums">
                    {cluster.affected_shifts_count} shifts
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                <div className="text-[11px] text-slate-500 truncate max-w-[280px]">
                  <span>Sample IDs: </span>
                  <span className="font-mono text-slate-400">
                    {cluster.sample_alarm_ids.slice(0, 3).join(", ")}...
                  </span>
                </div>

                <button
                  onClick={() =>
                    onNavigateTab("incidents", {
                      machine_id: cluster.machine_id,
                    })
                  }
                  className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-medium"
                >
                  <span>Investigate Machine</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
