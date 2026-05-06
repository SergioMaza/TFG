import { PerformanceRadar, RepFeedbackChart, SessionGeneralChart } from "./charts/ActualSessionCharts";
import { FatigueEfficiencyChart, RomHistoryChart, ScoreHistoryChart } from "./charts/SessionsCharts";

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
    <div className="flex flex-col gap-15">

      {/* Análisis de la sesión actual */}
      <SectionHeader title="Análisis de esta sesión" />
      <div className="grid grid-cols-2 gap-10">
        <div className="col-span-2">
          <RepFeedbackChart reps={reps} feedback={session.feedback} thresholds={exercise.thresholds} />
        </div>
        <PerformanceRadar session={session} exercise={exercise}/>
        <SessionGeneralChart reps={reps} />
      </div>

      {/* Historial entre sesiones */}
      <SectionHeader title="Histórico entre sesiones" />
      <div className="grid grid-cols-2 gap-10">
        <RomHistoryChart sessions={sessions} />
        <ScoreHistoryChart sessions={sessions} />
        <FatigueEfficiencyChart sessions={sessions} />
      </div>
    </div>
  );
}