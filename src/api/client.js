const BASE_URL = "/api/v1";
async function fetchJson(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) {
    let errorDetail = `Request failed: ${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (body.error) errorDetail = body.error;
    } catch {}
    throw new Error(errorDetail);
  }
  return res.json();
}
export const api = {
  getDashboardSummary: () => fetchJson(`${BASE_URL}/dashboard/summary`),
  getTrends: () => fetchJson(`${BASE_URL}/dashboard/trends`),
  getSeverityDistribution: () =>
    fetchJson(`${BASE_URL}/dashboard/severity-distribution`),
  getTopRiskMachines: () =>
    fetchJson(`${BASE_URL}/dashboard/top-risk-machines`),
  getAlarms: (params) => {
    const q = new URLSearchParams();
    if (params?.machine_id) q.set("machine_id", params.machine_id);
    if (params?.severity) q.set("severity", params.severity);
    if (params?.issue_type) q.set("issue_type", params.issue_type);
    if (params?.search) q.set("search", params.search);
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    return fetchJson(`${BASE_URL}/alarms?${q.toString()}`);
  },
  getAlarmDetail: (alarmId) => fetchJson(`${BASE_URL}/alarms/${alarmId}`),
  getIncidents: (params) => {
    const q = new URLSearchParams();
    if (params?.machine_id) q.set("machine_id", params.machine_id);
    if (params?.severity) q.set("severity", params.severity);
    if (params?.status) q.set("status", params.status);
    if (params?.search) q.set("search", params.search);
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    return fetchJson(`${BASE_URL}/incidents?${q.toString()}`);
  },
  getIncidentDetail: (incidentId) =>
    fetchJson(`${BASE_URL}/incidents/${incidentId}`),
  getIncidentEvidence: (incidentId) =>
    fetchJson(`${BASE_URL}/incidents/${incidentId}/evidence`),
  getRecurrenceClusters: () => fetchJson(`${BASE_URL}/recurrence-clusters`),
  getMachineTimeline: (machineId) =>
    fetchJson(`${BASE_URL}/machines/${machineId}/timeline`),
  getCorrectiveActions: (status) => {
    const url = status
      ? `${BASE_URL}/corrective-actions?status=${status}`
      : `${BASE_URL}/corrective-actions`;
    return fetchJson(url);
  },
  transitionAction: (actionId, payload) => {
    return fetchJson(`${BASE_URL}/corrective-actions/${actionId}/transitions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },
  getAnomalies: () => fetchJson(`${BASE_URL}/anomalies`),
  getEvaluationSummary: () => fetchJson(`${BASE_URL}/evaluation/summary`),
  getValidationReport: () => fetchJson(`${BASE_URL}/validation/report`),
  runAnalysis: () => fetchJson(`${BASE_URL}/analysis/run`, { method: "POST" }),
  getSystemConfig: () => fetchJson(`${BASE_URL}/system/config`),
  updateSystemConfig: (cfg) =>
    fetchJson(`${BASE_URL}/system/config`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cfg),
    }),
  getMachines: () => fetchJson(`${BASE_URL}/machines`),
  getPlants: () => fetchJson(`${BASE_URL}/plants`),
};
