import { useEffect, useState } from "react";
import { ShieldAlert, Info } from "lucide-react";
import { api } from "../api/client";
export const IncidentsPage = ({ initialMachineFilter, onNavigateTab }) => {
  const [incidents, setIncidents] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 15,
    total_pages: 1,
  });
  const [severityFilter, setSeverityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [machineFilter, setMachineFilter] = useState(
    initialMachineFilter || "",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [incidentDetail, setIncidentDetail] = useState(null);
  const [evidenceData, setEvidenceData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const fetchIncidents = async (page = 1) => {
    try {
      setLoading(true);
      const res = await api.getIncidents({
        page,
        limit: 15,
        severity: severityFilter || void 0,
        status: statusFilter || void 0,
        machine_id: machineFilter || void 0,
        search: searchQuery || void 0,
      });
      setIncidents(res.data);
      setPagination(res.pagination);
    } catch (err) {
      console.error("Failed to load incidents:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchIncidents(1);
  }, [severityFilter, statusFilter, machineFilter]);
  const loadIncidentDeepDive = async (incident) => {
    setSelectedIncident(incident);
    try {
      setDetailLoading(true);
      const [detailRes, evidenceRes] = await Promise.all([
        api.getIncidentDetail(incident.id),
        api.getIncidentEvidence(incident.id),
      ]);
      setIncidentDetail(detailRes);
      setEvidenceData(evidenceRes);
    } catch (err) {
      console.error("Failed to load incident deep dive:", err);
    } finally {
      setDetailLoading(false);
    }
  };
  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100">
            Incident Investigation
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Deterministic incident creation with multi-track evidence timelines
            and explainable risk factor scoring (Rules 6 & 7).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {machineFilter && (
            <button
              onClick={() => setMachineFilter("")}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded flex items-center gap-1"
            >
              <span>Machine: {machineFilter} &times;</span>
            </button>
          )}

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-md text-xs text-slate-200 focus:outline-none focus:border-red-500"
          >
            <option value="">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-md text-xs text-slate-200 focus:outline-none focus:border-red-500"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_INVESTIGATION">In Investigation</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-lg overflow-hidden flex flex-col h-[750px]">
          <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200">
              Incident Queue
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {pagination.total} records
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80">
            {loading ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                Loading incidents...
              </div>
            ) : incidents.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No incidents matching filter.
              </div>
            ) : (
              incidents.map((inc) => {
                const isSelected = selectedIncident?.id === inc.id;
                return (
                  <div
                    key={inc.id}
                    onClick={() => loadIncidentDeepDive(inc)}
                    className={`p-4 cursor-pointer transition-colors ${isSelected ? "bg-slate-800/90 border-l-2 border-red-500" : "hover:bg-slate-800/40"}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-xs text-slate-100">
                          {inc.incident_code}
                        </span>
                        <span className="text-slate-600">·</span>
                        <span className="font-mono text-xs text-slate-400">
                          {inc.machine_id}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono font-bold ${inc.risk_score >= 80 ? "text-red-400" : inc.risk_score >= 60 ? "text-amber-400" : "text-blue-400"}`}
                        >
                          Risk {inc.risk_score}
                        </span>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold ${inc.status === "OPEN" ? "bg-red-500/20 text-red-300" : "bg-slate-800 text-slate-400"}`}
                        >
                          {inc.status}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 mt-2 line-clamp-2">
                      {inc.summary}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mt-3">
                      <span>
                        {inc.detected_at.replace("T", " ").replace("Z", "")}
                      </span>
                      <span className="text-slate-400">
                        {inc.incident_type.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-2.5 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-[11px]">
              Pg {pagination.page} / {pagination.total_pages || 1}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => fetchIncidents(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300"
              >
                &larr; Prev
              </button>
              <button
                onClick={() => fetchIncidents(pagination.page + 1)}
                disabled={pagination.page >= pagination.total_pages}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300"
              >
                Next &rarr;
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-lg p-6 h-[750px] overflow-y-auto space-y-6">
          {!selectedIncident ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-2">
              <ShieldAlert className="w-8 h-8 text-slate-600" />
              <p className="text-sm">
                Select an incident from the queue to view chronological
                multi-track timeline and risk factors.
              </p>
            </div>
          ) : detailLoading ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs">
              Reconstructing multi-track evidence chain...
            </div>
          ) : (
            <>
              <div className="border-b border-slate-800 pb-4 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                    <span className="text-red-400 font-bold">
                      {selectedIncident.severity}
                    </span>
                    <span>·</span>
                    <span>
                      {selectedIncident.machine_name ||
                        selectedIncident.machine_id}
                    </span>
                    <span>·</span>
                    <span>
                      {incidentDetail?.safety_zone?.name || "Primary Zone"}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-100 mt-1">
                    {selectedIncident.incident_code}:{" "}
                    {selectedIncident.incident_type.replace(/_/g, " ")}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    {selectedIncident.summary}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-2xl font-bold font-mono tabular-nums text-red-400">
                    {selectedIncident.risk_score}
                    <span className="text-xs text-slate-500 font-normal">
                      {" "}
                      / 100
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Composite Risk
                  </span>
                </div>
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-slate-200">
                    Rule 7 Explainable Risk Factor Contributions
                  </h4>
                  <span className="text-[10px] font-mono text-slate-500">
                    Heuristic Model v1.2
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">
                        1. Condition Severity Weight (max 30)
                      </span>
                      <span className="font-mono text-slate-200 font-semibold">
                        {incidentDetail?.risk_factors?.severity_score || 25} pts
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500 rounded-full"
                        style={{
                          width: `${((incidentDetail?.risk_factors?.severity_score || 25) / 30) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">
                        2. Safety Interlock Trip Factor (max 25)
                      </span>
                      <span className="font-mono text-slate-200 font-semibold">
                        {incidentDetail?.risk_factors?.interlock_score || 20}{" "}
                        pts
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full"
                        style={{
                          width: `${((incidentDetail?.risk_factors?.interlock_score || 20) / 25) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">
                        3. Recurrence Frequency (max 20)
                      </span>
                      <span className="font-mono text-slate-200 font-semibold">
                        {incidentDetail?.risk_factors?.recurrence_score || 18}{" "}
                        pts
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{
                          width: `${((incidentDetail?.risk_factors?.recurrence_score || 18) / 20) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">
                        4. Acknowledgement SLA Breach Factor (max 15)
                      </span>
                      <span className="font-mono text-slate-200 font-semibold">
                        {incidentDetail?.risk_factors?.sla_score || 12} pts
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{
                          width: `${((incidentDetail?.risk_factors?.sla_score || 12) / 15) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 italic flex items-center gap-1.5 pt-1">
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    Transparent operational heuristic for floor triage; does not
                    claim an unvalidated injury probability.
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-200">
                  Chronological Multi-Track Timeline
                </h4>

                <div className="space-y-2 border-l border-slate-700 ml-3 pl-4 text-xs font-mono">
                  <div className="relative">
                    <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-slate-950" />
                    <div className="bg-slate-950/80 p-2.5 rounded border border-slate-800">
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span className="text-red-400 font-semibold">
                          TRACK 1: PRIMARY ALARM EVENT
                        </span>
                        <span>
                          {selectedIncident.detected_at.slice(11, 19)}
                        </span>
                      </div>
                      <p className="text-slate-200 mt-1">
                        Trigger:{" "}
                        {incidentDetail?.primary_alarm?.event_code ||
                          "SCADA Boundary Alert"}{" "}
                        (
                        {incidentDetail?.primary_alarm?.id ||
                          "Direct Ingestion"}
                        )
                      </p>
                    </div>
                  </div>

                  {evidenceData?.evidence_chain?.interlock_states?.map(
                    (ilk) => (
                      <div key={ilk.id} className="relative">
                        <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-amber-500 border-2 border-slate-950" />
                        <div className="bg-slate-950/80 p-2.5 rounded border border-slate-800">
                          <div className="flex justify-between text-[11px] text-slate-400">
                            <span className="text-amber-400 font-semibold">
                              TRACK 2: INTERLOCK STATE TRANSITION
                            </span>
                            <span>{ilk.occurred_at.slice(11, 19)}</span>
                          </div>
                          <p className="text-slate-200 mt-1">
                            {ilk.previous_state} &rarr;{" "}
                            <strong className="text-amber-300">
                              {ilk.new_state}
                            </strong>{" "}
                            on {ilk.interlock_id}
                          </p>
                        </div>
                      </div>
                    ),
                  )}

                  {evidenceData?.evidence_chain?.machine_states?.map((ms) => (
                    <div key={ms.id} className="relative">
                      <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-slate-950" />
                      <div className="bg-slate-950/80 p-2.5 rounded border border-slate-800">
                        <div className="flex justify-between text-[11px] text-slate-400">
                          <span className="text-blue-400 font-semibold">
                            TRACK 3: MACHINE OPERATIONAL STATE
                          </span>
                          <span>{ms.occurred_at.slice(11, 19)}</span>
                        </div>
                        <p className="text-slate-200 mt-1">
                          Machine transitioned to {ms.new_value} (
                          {ms.state_type})
                        </p>
                      </div>
                    </div>
                  ))}

                  {incidentDetail?.corrective_actions?.map((act) => (
                    <div key={act.id} className="relative">
                      <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-950" />
                      <div className="bg-slate-950/80 p-2.5 rounded border border-slate-800">
                        <div className="flex justify-between text-[11px] text-slate-400">
                          <span className="text-emerald-400 font-semibold">
                            TRACK 4: CORRECTIVE ACTION
                          </span>
                          <span>{act.status}</span>
                        </div>
                        <p className="text-slate-200 mt-1">{act.description}</p>
                        <div className="mt-2 text-right">
                          <button
                            onClick={() => onNavigateTab("actions")}
                            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                          >
                            Manage Action Lifecycle &rarr;
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
