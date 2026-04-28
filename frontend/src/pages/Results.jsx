import { useParams } from "react-router-dom";
import data from "../config/data_backend_response.json";
import SessionHistory from "../components/results/SessionHistory";
import MetricsPanel from "../components/results/MetricsPanel";
import AnalyticsDashboard from "../components/results/Analyticsdashboard";
import ExerciseGrid from "../components/dashboard/ExerciseGrid";

export default function Results() {
  const { id } = useParams();

  // TODO: Que data fetch_user_sessions o algo asi que sea el que de toda la info
  const exercise = data.exercises.find((ex) =>
    ex.sessions.some((s) => s.sessionId === parseInt(id)),
  );

  const sessions = exercise.sessions;

  const session = exercise.sessions.find((s) => s.sessionId === parseInt(id));

  const filteredData = {
    ...data,
    exercises: data.exercises.filter((ex) => ex !== exercise),
  };

  return (
    <div className="flex-1 space-y-20">
      <div className="flex-1 space-y-10">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-1">
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-5xl font-black tracking-tighter">
              Análisis de {exercise.title}
            </h2>

            <p className="text-(--gray) text-lg leading-relaxed">
              Explora tu análisis biométrico y descubre cómo optimizar tu
              rendimiento.
            </p>
          </div>
        </div>

        {/* MAIN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-stretch">
          {/* LEFT - 70% */}
          <div className="lg:col-span-7 flex flex-col gap-6 h-full">
            {/* VIDEO */}
            <div className="relative aspect-video rounded-xl overflow-hidden">
              <video
                src="/squad_example.mp4"
                controls
                className="w-full h-full object-cover rounded-xl"
              />
            </div>

            {/* HISTORY */}
            <SessionHistory sessions={sessions} activeId={id} />
          </div>

          {/* RIGHT - 30% */}
          <div className="lg:col-span-3 h-full">
            <MetricsPanel exercise={exercise} session={session} />
          </div>
        </div>

        {/* ANALYTICS */}
        <AnalyticsDashboard
          exercise={exercise}
          session={session}
          sessions={sessions}
        />
      </div>

      {/* OTROS EJERCICIOS */}
      <ExerciseGrid data={filteredData} title={"Otros Ejercicios"} />
    </div>
  );
}
