import { useEffect, useState } from "react";
import {
  Bell,
  AlertOctagon,
  ShieldAlert,
  ClipboardList,
  Clock,
  RotateCcw,
  FileCheck2,
  Cpu,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { api } from "../api/client";
export const DashboardPage = ({ onNavigateTab }) => {
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [severityDist, setSeverityDist] = useState([]);
  const [topMachines, setTopMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [sumRes, trRes, sevRes, machRes] = await Promise.all([
        api.getDashboardSummary(),
        api.getTrends(),
        api.getSeverityDistribution(),
        api.getTopRiskMachines(),
      ]);
      setSummary(sumRes);
      setTrends(trRes);
      setSeverityDist(sevRes);
      setTopMachines(machRes);
    } catch (err) {
      setError(err.message || "Failed to load executive dashboard telemetry");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadData();
  }, []);
  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-slate-900 border border-slate-800 rounded-lg animate-pulse"
            />
          ))}
        </div>
        <div className="h-72 bg-slate-900 border border-slate-800 rounded-lg animate-pulse" />
      </div>
    );
  }
  if (error || !summary) {
    return (
      <div className="p-8 flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
        <AlertOctagon className="w-10 h-10 text-red-400" />
        <h3 className="text-base font-semibold text-slate-200">
          Unable to load dashboard data
        </h3>
        <p className="text-xs text-slate-400 max-w-md">{error}</p>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-xs font-medium transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }
  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-100">
          Executive Safety Dashboard
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Real-time industrial telemetry, interlock integrity tracking, and
          explainable safety event analytics.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Ingested Alarms</span>
            <Bell className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-100">
            {summary.totalAlarms.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <span>Raw SCADA streams</span>
            <span aria-hidden="true">·</span>
            <span>All severities</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Unique Operational Events</span>
            <Cpu className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-blue-400">
            {summary.uniqueOperationalAlarms.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <span className="text-blue-400/90 font-mono">
              -{summary.replayDuplicateCount}
            </span>
            <span>Replay duplicates filtered</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Critical & High Severity</span>
            <AlertOctagon className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-red-400">
            {(summary.criticalAlarms + summary.highAlarms).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <span>{summary.criticalAlarms} Critical</span>
            <span aria-hidden="true">·</span>
            <span>{summary.highAlarms} High</span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab("incidents")}
          className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg space-y-2 cursor-pointer hover:border-slate-700 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Detected Incidents</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-400 flex items-center justify-between">
            <span>{summary.detectedIncidents}</span>
            <ArrowUpRight className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <span className="text-amber-400">
              {summary.openIncidents} active
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {summary.detectedIncidents - summary.openIncidents} resolved
            </span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab("actions")}
          className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg space-y-2 cursor-pointer hover:border-slate-700 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Unverified / Open Actions</span>
            <ClipboardList className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-200 flex items-center justify-between">
            <span>{summary.openCorrectiveActions}</span>
            <ArrowUpRight className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <span className="text-red-400 font-semibold">
              {summary.unverifiedCorrectiveActions} unverified
            </span>
            <span aria-hidden="true">·</span>
            <span>{summary.totalCorrectiveActions} total</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>SLA Breach Rate</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-400">
            {summary.slaBreachRate}%
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <span>Delay &gt; SLA threshold</span>
            <span aria-hidden="true">·</span>
            <span>Target &lt; 5%</span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab("recurrence")}
          className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg space-y-2 cursor-pointer hover:border-slate-700 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Repeated Condition Clusters</span>
            <RotateCcw className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-purple-400 flex items-center justify-between">
            <span>{summary.recurrenceClustersCount}</span>
            <ArrowUpRight className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <span>Recurrent violations</span>
            <span aria-hidden="true">·</span>
            <span>Cross-shift clusters</span>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab("data-quality")}
          className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg space-y-2 cursor-pointer hover:border-slate-700 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Data-Quality Exceptions</span>
            <FileCheck2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-cyan-400 flex items-center justify-between">
            <span>{summary.dataQualityExceptionsCount}</span>
            <ArrowUpRight className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <span>5 labelled scenarios</span>
            <span aria-hidden="true">·</span>
            <span>Isolated anomalies</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 bg-slate-900/80 border border-slate-800 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">
                Operational Event & Incident Trends
              </h3>
              <p className="text-[11px] text-slate-400">
                Daily alarm frequency, incident detections, and SLA response
                delays
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                Alarms
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                Incidents
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trends}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorAlarms" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="colorIncidents"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  tick={{ fontSize: 11 }}
                />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="alarms"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorAlarms)"
                />
                <Area
                  type="monotone"
                  dataKey="incidents"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorIncidents)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-lg space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">
              Severity Breakdown
            </h3>
            <p className="text-[11px] text-slate-400">
              Alarm volume stratified by severity class
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={severityDist}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="severity"
                  stroke="#64748b"
                  tick={{ fontSize: 10 }}
                />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {severityDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">
              Prioritized Investigation: Top-Risk Machines
            </h3>
            <p className="text-[11px] text-slate-400">
              Ranked by analytical composite risk score and unresolved safety
              incidents
            </p>
          </div>
          <button
            onClick={() => onNavigateTab("incidents")}
            className="text-xs text-red-400 hover:text-red-300 font-medium flex items-center gap-1"
          >
            <span>View All Incidents</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4 font-medium">Machine</th>
                <th className="py-2.5 px-4 font-medium">Plant Facility</th>
                <th className="py-2.5 px-4 font-medium text-right">
                  Total Alarms
                </th>
                <th className="py-2.5 px-4 font-medium text-right">
                  Incidents
                </th>
                <th className="py-2.5 px-4 font-medium text-right">
                  Risk Score
                </th>
                <th className="py-2.5 px-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {topMachines.map((m) => (
                <tr
                  key={m.machine_id}
                  className="hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3 px-4 font-medium text-slate-200 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    <span>{m.machine_name}</span>
                    <span className="text-[10px] font-mono text-slate-500">
                      ({m.machine_id})
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{m.plant_name}</td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-300">
                    {m.total_alarms}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-amber-400">
                    {m.incident_count}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-mono tabular-nums font-bold text-red-400">
                      {m.avg_risk_score}
                    </span>
                    <span className="text-[10px] text-slate-500 ml-1">
                      /100
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() =>
                        onNavigateTab("incidents", { machine_id: m.machine_id })
                      }
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium transition-colors"
                    >
                      Investigate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
