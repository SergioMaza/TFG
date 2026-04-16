import { PerformanceRadar, SessionGeneralChart } from "./charts/actual_session_charts";
import { FatigueEfficiencyChart, RomHistoryChart, ScoreHistoryChart } from "./charts/sessions_charts";

// Section header
function SectionHeader({ title }) {
  return (
    <div className="flex items-center gap-3 my-2">
      <div className="h-px flex-1 bg-white/5" />

      <span className="text-[10px] text-(--gray) tracking-[0.3em] uppercase">
        {title}
      </span>

      <div className="h-px flex-1 bg-white/5" />
    </div>
  );
}

export default function AnalyticsDashboard({ exercise, session, sessions }) {
  const reps = session.reps_detail || [];

  return (
    <div className="flex flex-col gap-6">
      {/* Análisis de la sesión actual */}
      <SectionHeader title="Análisis de esta sesión" />

      <div className="grid grid-cols-2 gap-4">
        <PerformanceRadar session={session} exercise={exercise}/>
        <SessionGeneralChart reps={reps} />
      </div>

      {/* Historial entre sesiones */}
      <SectionHeader title="Histórico entre sesiones" />

      <div className="grid grid-cols-2 gap-4">
        <RomHistoryChart sessions={sessions} />
        <ScoreHistoryChart sessions={sessions} />
        <FatigueEfficiencyChart sessions={sessions} />
      </div>
    </div>
  );
}