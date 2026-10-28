import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { DashboardPage } from "./pages/DashboardPage";
import { AlarmsPage } from "./pages/AlarmsPage";
import { RecurrencePage } from "./pages/RecurrencePage";
import { IncidentsPage } from "./pages/IncidentsPage";
import { CorrectiveActionsPage } from "./pages/CorrectiveActionsPage";
import { DataQualityPage } from "./pages/DataQualityPage";
import { EvaluationPage } from "./pages/EvaluationPage";
import { ConfigPage } from "./pages/ConfigPage";
import { api } from "./api/client";
export function App() {
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [tabMeta, setTabMeta] = useState(null);
  const [summary, setSummary] = useState(null);
  const fetchGlobalStats = async () => {
    try {
      const res = await api.getDashboardSummary();
      setSummary(res);
    } catch (err) {
      console.error("Failed to fetch summary stats:", err);
    }
  };
  useEffect(() => {
    fetchGlobalStats();
  }, []);
  const handleNavigate = (tab, meta) => {
    setCurrentTab(tab);
    setTabMeta(meta || null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const getTabLabel = (id) => {
    switch (id) {
      case "dashboard":
        return "Executive Safety Dashboard";
      case "alarms":
        return "Alarm Explorer";
      case "recurrence":
        return "Recurrence Analysis";
      case "incidents":
        return "Incident Investigation";
      case "actions":
        return "Corrective Action Lifecycle";
      case "data-quality":
        return "Data Quality & Exceptions";
      case "evaluation":
        return "Evaluation & Benchmarks";
      case "config":
        return "Rules & Configuration";
      default:
        return "SafeOps Intelligence";
    }
  };
  return <div className="flex min-h-screen bg-[#0b0f17] text-slate-100">
      {
    /* Fixed Left Sidebar */
  }
      <Sidebar
    currentTab={currentTab}
    onSelectTab={(tab) => handleNavigate(tab)}
    openIncidentsCount={summary?.openIncidents}
    exceptionsCount={summary?.dataQualityExceptionsCount}
  />

      {
    /* Main Content Area */
  }
      <div className="flex-1 flex flex-col min-w-0">
        <Header
    currentTabName={getTabLabel(currentTab)}
    onRefresh={fetchGlobalStats}
    slaBreachRate={summary?.slaBreachRate}
    unverifiedCount={summary?.unverifiedCorrectiveActions}
    replayCount={summary?.replayDuplicateCount}
  />

        <main className="flex-1 overflow-y-auto">
          {currentTab === "dashboard" && <DashboardPage onNavigateTab={handleNavigate} />}
          {currentTab === "alarms" && <AlarmsPage />}
          {currentTab === "recurrence" && <RecurrencePage onNavigateTab={handleNavigate} />}
          {currentTab === "incidents" && <IncidentsPage initialMachineFilter={tabMeta?.machine_id} onNavigateTab={handleNavigate} />}
          {currentTab === "actions" && <CorrectiveActionsPage />}
          {currentTab === "data-quality" && <DataQualityPage />}
          {currentTab === "evaluation" && <EvaluationPage />}
          {currentTab === "config" && <ConfigPage />}
        </main>
      </div>
    </div>;
}
export default App;
