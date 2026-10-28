import { useEffect, useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  User,
  X,
  AlertCircle,
} from "lucide-react";
import { api } from "../api/client";
export const CorrectiveActionsPage = () => {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [activeModalAction, setActiveModalAction] = useState(null);
  const [targetStatus, setTargetStatus] = useState("");
  const [verificationNote, setVerificationNote] = useState("");
  const [actorName, setActorName] = useState("Quality Safety Engineer Vance");
  const [transitionError, setTransitionError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fetchActions = async () => {
    try {
      setLoading(true);
      const res = await api.getCorrectiveActions(statusFilter || void 0);
      setActions(res);
    } catch (err) {
      console.error("Failed to load corrective actions:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchActions();
  }, [statusFilter]);
  const handleOpenTransitionModal = (action, nextTarget) => {
    setActiveModalAction(action);
    setTargetStatus(nextTarget);
    setVerificationNote("");
    setTransitionError(null);
  };
  const handleSubmitTransition = async (e) => {
    e.preventDefault();
    if (!activeModalAction) return;
    try {
      setIsSubmitting(true);
      setTransitionError(null);
      await api.transitionAction(activeModalAction.id, {
        new_status: targetStatus,
        verification_note: verificationNote,
        actor: actorName,
      });
      setActiveModalAction(null);
      await fetchActions();
    } catch (err) {
      setTransitionError(
        err.message || "Transition rejected by safety business rules",
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100">
            Corrective Action Lifecycle
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Enforces state machine transitions (OPEN &rarr; IN_PROGRESS &rarr;
            COMPLETED &rarr; VERIFIED). Closure without verification is
            prevented (Rule 8).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-md text-xs text-slate-200 focus:outline-none focus:border-red-500"
          >
            <option value="">All Lifecycle States</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed (Pending Verification)</option>
            <option value="VERIFIED">Verified & Closed</option>
          </select>
        </div>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-medium">Action Code</th>
                <th className="py-3 px-4 font-medium">Incident Ref</th>
                <th className="py-3 px-4 font-medium">Description</th>
                <th className="py-3 px-4 font-medium">Assigned Engineer</th>
                <th className="py-3 px-4 font-medium">Due Date</th>
                <th className="py-3 px-4 font-medium">Lifecycle Status</th>
                <th className="py-3 px-4 font-medium text-right">
                  Advance State
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Loading corrective action records...
                  </td>
                </tr>
              ) : actions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No corrective actions match this filter.
                  </td>
                </tr>
              ) : (
                actions.map((act) => {
                  const isUnverifiedCase =
                    act.issue_type === "ACTION_CLOSED_WITHOUT_VERIFICATION" ||
                    (act.status === "COMPLETED" && !act.verified_at);
                  return (
                    <tr
                      key={act.id}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-semibold text-slate-200">
                        {act.action_code}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {act.incident_code || act.incident_id}
                      </td>
                      <td className="py-3 px-4 max-w-sm">
                        <div className="text-slate-200 font-medium truncate">
                          {act.description}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500">
                          {act.action_type}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-300 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{act.assigned_to}</span>
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums text-slate-400">
                        {act.due_at.slice(0, 10)}
                        {act.is_overdue && (
                          <span className="ml-2 text-red-400 text-[10px] font-bold">
                            OVERDUE
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px]">
                        {act.status === "VERIFIED" ? (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            VERIFIED
                          </span>
                        ) : isUnverifiedCase ? (
                          <span className="text-amber-400 font-semibold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            UNVERIFIED (AUDIT REQ)
                          </span>
                        ) : act.status === "IN_PROGRESS" ? (
                          <span className="text-blue-400 font-medium">
                            IN PROGRESS
                          </span>
                        ) : (
                          <span className="text-slate-400">OPEN</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {act.status === "OPEN" && (
                          <button
                            onClick={() =>
                              handleOpenTransitionModal(act, "IN_PROGRESS")
                            }
                            className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded text-[11px] font-medium"
                          >
                            Start Work &rarr;
                          </button>
                        )}
                        {act.status === "IN_PROGRESS" && (
                          <button
                            onClick={() =>
                              handleOpenTransitionModal(act, "COMPLETED")
                            }
                            className="px-2.5 py-1 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 rounded text-[11px] font-medium"
                          >
                            Complete Work &rarr;
                          </button>
                        )}
                        {act.status === "COMPLETED" && (
                          <button
                            onClick={() =>
                              handleOpenTransitionModal(act, "VERIFIED")
                            }
                            className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded text-[11px] font-semibold"
                          >
                            Audit Sign-Off &rarr;
                          </button>
                        )}
                        {act.status === "VERIFIED" && (
                          <span className="text-[11px] text-slate-500 font-mono">
                            Closed & Audited
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {activeModalAction && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  Lifecycle State Transition (Rule 8)
                </span>
                <h3 className="text-base font-bold text-slate-100">
                  {activeModalAction.action_code}: {activeModalAction.status}{" "}
                  &rarr; {targetStatus}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalAction(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {transitionError && (
              <div className="p-3 bg-red-950/40 border border-red-800 rounded-md text-red-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{transitionError}</span>
              </div>
            )}

            <form
              onSubmit={handleSubmitTransition}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="text-slate-400 block mb-1">
                  Acting Engineer / Inspector:
                </label>
                <input
                  type="text"
                  value={actorName}
                  onChange={(e) => setActorName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-red-500"
                />
              </div>

              {targetStatus === "VERIFIED" ? (
                <div>
                  <label className="text-slate-200 font-semibold block mb-1">
                    Engineering Audit Verification Sign-Off Note (Mandatory):
                  </label>
                  <textarea
                    rows={3}
                    value={verificationNote}
                    onChange={(e) => setVerificationNote(e.target.value)}
                    placeholder="Enter explicit verification findings, test stroke verification, or workcell relay sign-off..."
                    required
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Rule 8 prohibits closing without signed engineering audit
                    notes.
                  </span>
                </div>
              ) : (
                <p className="text-slate-300">
                  Confirm transition of action{" "}
                  <strong>{activeModalAction.action_code}</strong> to{" "}
                  <span className="font-semibold text-blue-400">
                    {targetStatus}
                  </span>
                  .
                </p>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveModalAction(null)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-500 disabled:bg-slate-800 text-white font-semibold rounded text-xs flex items-center gap-1.5"
                >
                  {isSubmitting ? "Recording Audit..." : "Confirm Transition"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
