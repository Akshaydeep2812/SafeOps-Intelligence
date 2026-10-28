import {
  LayoutDashboard,
  BellRing,
  RotateCcw,
  ShieldAlert,
  ClipboardCheck,
  AlertTriangle,
  BarChart3,
  Sliders,
  ShieldCheck,
} from "lucide-react";
export const Sidebar = ({
  currentTab,
  onSelectTab,
  openIncidentsCount = 0,
  exceptionsCount = 0,
}) => {
  const navItems = [
    { id: "dashboard", label: "Executive Dashboard", icon: LayoutDashboard },
    { id: "alarms", label: "Alarm Explorer", icon: BellRing },
    { id: "recurrence", label: "Recurrence Analysis", icon: RotateCcw },
    {
      id: "incidents",
      label: "Incident Investigation",
      icon: ShieldAlert,
      badge: openIncidentsCount,
    },
    { id: "actions", label: "Corrective Actions", icon: ClipboardCheck },
    {
      id: "data-quality",
      label: "Data Quality & Exceptions",
      icon: AlertTriangle,
      badge: exceptionsCount,
      badgeAlert: true,
    },
    { id: "evaluation", label: "Evaluation & Benchmarks", icon: BarChart3 },
    { id: "config", label: "Rules & Configuration", icon: Sliders },
  ];
  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0 h-screen sticky top-0 select-none">
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="overflow-hidden">
          <h1 className="text-sm font-semibold tracking-wide text-slate-100 whitespace-nowrap truncate">
            SafeOps Intelligence
          </h1>
          <p className="text-[11px] text-slate-400 font-mono tracking-tight truncate">
            Industrial Safety Analytics
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left ${isActive ? "bg-slate-800/90 text-slate-100 shadow-sm border border-slate-700/60" : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"}`}
            >
              <div className="flex items-center gap-3 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 ${isActive ? "text-red-400" : "text-slate-500"}`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== void 0 && item.badge > 0 && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-medium ${item.badgeAlert ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-red-500/20 text-red-300 border border-red-500/30"}`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Engine & Provenance Status */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 text-[11px] font-mono text-slate-400 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Rule Engine:</span>
          <span className="text-slate-300 font-semibold">v1.2.0-det</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Random Seed:</span>
          <span className="text-slate-300 font-semibold">20261022</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Mode:</span>
          <span className="text-emerald-400 font-medium">Deterministic</span>
        </div>
      </div>
    </aside>
  );
};
