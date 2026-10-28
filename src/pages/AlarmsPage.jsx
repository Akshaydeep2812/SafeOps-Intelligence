import { useEffect, useState } from "react";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { api } from "../api/client";
export const AlarmsPage = () => {
  const [alarms, setAlarms] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 25,
    total_pages: 1,
  });
  const [severityFilter, setSeverityFilter] = useState("");
  const [issueTypeFilter, setIssueTypeFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedAlarmId, setSelectedAlarmId] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const fetchAlarms = async (page = 1) => {
    try {
      setLoading(true);
      const res = await api.getAlarms({
        page,
        limit: 25,
        severity: severityFilter || void 0,
        issue_type: issueTypeFilter || void 0,
        search: searchQuery || void 0,
      });
      setAlarms(res.data);
      setPagination(res.pagination);
    } catch (err) {
      console.error("Failed to fetch alarms:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAlarms(1);
  }, [severityFilter, issueTypeFilter]);
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAlarms(1);
  };
  const handleSelectAlarm = async (alarmId) => {
    setSelectedAlarmId(alarmId);
    try {
      setDetailLoading(true);
      const res = await api.getAlarmDetail(alarmId);
      setDetailData(res);
    } catch (err) {
      console.error("Failed to load alarm detail:", err);
    } finally {
      setDetailLoading(false);
    }
  };
  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100">
            Alarm Explorer
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Searchable, audit-grade event stream with SLA latency tracking and
            replay duplicate detection.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search ID, machine, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-md text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500 w-48 sm:w-60"
            />
          </form>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-md text-xs text-slate-200 focus:outline-none focus:border-red-500"
          >
            <option value="">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={issueTypeFilter}
            onChange={(e) => setIssueTypeFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-md text-xs text-slate-200 focus:outline-none focus:border-red-500"
          >
            <option value="">All Statuses</option>
            <option value="REPLAY_DUPLICATE_FLOOD">Replay Duplicates</option>
            <option value="CHRONOLOGY_ACK_BEFORE_ALARM">
              Pre-Alarm Ack Exception
            </option>
          </select>
        </div>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-medium">Event Code / ID</th>
                <th className="py-3 px-4 font-medium">Timestamp (UTC)</th>
                <th className="py-3 px-4 font-medium">Machine & Facility</th>
                <th className="py-3 px-4 font-medium">Alarm Name</th>
                <th className="py-3 px-4 font-medium">Severity</th>
                <th className="py-3 px-4 font-medium">SLA Limit</th>
                <th className="py-3 px-4 font-medium">Acknowledgement</th>
                <th className="py-3 px-4 font-medium text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    Loading alarm records from data store...
                  </td>
                </tr>
              ) : alarms.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No matching alarm events found for this filter.
                  </td>
                </tr>
              ) : (
                alarms.map((ev) => {
                  const ack = ev.acknowledgement;
                  const isChronologyViolation =
                    ev.issue_type === "CHRONOLOGY_ACK_BEFORE_ALARM" ||
                    ack?.acknowledgement_status === "INVALID_CHRONOLOGY";
                  const isReplay = ev.issue_type === "REPLAY_DUPLICATE_FLOOD";
                  return (
                    <tr
                      key={ev.id}
                      onClick={() => handleSelectAlarm(ev.id)}
                      className={`hover:bg-slate-800/50 cursor-pointer transition-colors ${selectedAlarmId === ev.id ? "bg-slate-800/80" : ""}`}
                    >
                      <td className="py-3 px-4 font-mono">
                        <div className="font-semibold text-slate-200">
                          {ev.event_code}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {ev.id}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums text-slate-400">
                        {ev.occurred_at.replace("T", " ").replace("Z", "")}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-200">
                          {ev.machine_name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {ev.plant_name}
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-slate-300">
                        {ev.alarm_name}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-mono text-[11px] font-semibold ${ev.severity === "CRITICAL" ? "text-red-400" : ev.severity === "HIGH" ? "text-orange-400" : ev.severity === "MEDIUM" ? "text-amber-400" : "text-blue-400"}`}
                        >
                          {ev.severity}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums text-slate-400">
                        {ev.sla_seconds}s
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px]">
                        {isChronologyViolation ? (
                          <span className="text-red-400 font-semibold">
                            PRE-ALARM ACK VIOLATION
                          </span>
                        ) : !ack ? (
                          <span className="text-slate-500">UNACKNOWLEDGED</span>
                        ) : ack.acknowledgement_status === "LATE" ? (
                          <span className="text-amber-400">
                            BREACHED (LATE)
                          </span>
                        ) : (
                          <span className="text-emerald-400">ON TIME</span>
                        )}
                        {isReplay && (
                          <span className="ml-2 text-cyan-400 text-[10px] block">
                            REPLAY DUPLICATE
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-slate-500 hover:text-slate-200 text-xs font-mono">
                          Inspect &rarr;
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing <strong className="text-slate-200">{alarms.length}</strong>{" "}
            of{" "}
            <strong className="text-slate-200 font-mono">
              {pagination.total}
            </strong>{" "}
            alarms
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchAlarms(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-xs">
              Page {pagination.page} / {pagination.total_pages || 1}
            </span>
            <button
              onClick={() => fetchAlarms(pagination.page + 1)}
              disabled={pagination.page >= pagination.total_pages}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {selectedAlarmId && (
        <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-slate-950 border-l border-slate-800 shadow-2xl z-50 overflow-y-auto p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                Event Detail Inspection
              </span>
              <h3 className="text-base font-bold text-slate-100 font-mono">
                {detailData?.alarm?.event_code || selectedAlarmId}
              </h3>
            </div>
            <button
              onClick={() => setSelectedAlarmId(null)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {detailLoading || !detailData ? (
            <div className="py-20 text-center text-slate-500 text-xs">
              Loading event lineage...
            </div>
          ) : (
            <div className="space-y-6 text-xs">
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-2">
                <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
                  Timing & SCADA Telemetry
                </h4>
                <div className="grid grid-cols-2 gap-2 text-slate-400">
                  <div>
                    <span className="text-slate-500 block">Occurred At:</span>
                    <span className="font-mono tabular-nums text-slate-200">
                      {detailData.alarm.occurred_at}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Ingested At:</span>
                    <span className="font-mono tabular-nums text-slate-200">
                      {detailData.alarm.ingested_at}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">
                      Correlation Packet:
                    </span>
                    <span className="font-mono text-slate-300">
                      {detailData.alarm.correlation_id || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">
                      Source Sequence:
                    </span>
                    <span className="font-mono text-slate-300">
                      #{detailData.alarm.source_sequence}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-2">
                <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
                  Acknowledgement Record
                </h4>
                {detailData.acknowledgement ? (
                  <div className="space-y-2 text-slate-400">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Status:</span>
                      <span className="font-mono font-semibold text-slate-200">
                        {detailData.acknowledgement.acknowledgement_status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Acknowledged At:</span>
                      <span className="font-mono tabular-nums text-slate-200">
                        {detailData.acknowledgement.acknowledged_at}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">
                        Response Note:
                      </span>
                      <p className="text-slate-300 italic mt-0.5">
                        "{detailData.acknowledgement.response_note}"
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500">
                    No acknowledgement record found in operational log.
                  </p>
                )}
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-2">
                <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
                  Machine State History
                </h4>
                {detailData.machine_state_history?.length > 0 ? (
                  <div className="space-y-1.5 font-mono text-[11px]">
                    {detailData.machine_state_history.map((s) => (
                      <div
                        key={s.id}
                        className="p-2 bg-slate-950/60 rounded flex justify-between items-center"
                      >
                        <span className="text-slate-400">
                          {s.previous_value} &rarr;{" "}
                          <strong className="text-slate-200">
                            {s.new_value}
                          </strong>
                        </span>
                        <span className="text-slate-500">
                          {s.occurred_at.slice(11, 19)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500">
                    No state transitions recorded in this timeframe.
                  </p>
                )}
              </div>

              {detailData.linked_incidents?.length > 0 && (
                <div className="bg-red-950/20 border border-red-900/40 rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-red-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Linked Incident Trigger</span>
                  </h4>
                  {detailData.linked_incidents.map((inc) => (
                    <div key={inc.id} className="text-slate-300 space-y-1">
                      <div className="flex justify-between font-mono">
                        <span className="font-semibold text-red-300">
                          {inc.incident_code}
                        </span>
                        <span className="text-amber-400">
                          Risk: {inc.risk_score}/100
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px]">
                        {inc.summary}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
