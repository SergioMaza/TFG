import { useParams } from "react-router-dom";
import SessionHistory from "../components/results/SessionHistory";
import AnalyticsDashboard from "../components/results/Analyticsdashboard";
import ExerciseGrid from "../components/dashboard/ExerciseGrid";
import { useAppProvider } from "../hooks/useAppProvider";
import { useEffect, useState } from "react";
import SidePanel from "../components/results/SidePanel";

const VITE_API_URL = import.meta.env.VITE_API_URL;

export default function Results() {
  const { id } = useParams();
  const { data, loading, error } = useAppProvider();
  const [videoUrl, setVideoUrl] = useState(null);

  // Obtener el ejercicio y la sesion en base al id
  const exercise = data?.exercises?.find((ex) =>
    ex.sessions.some((s) => s.session_id === id),
  );
  const session = exercise?.sessions?.find((s) => s.session_id === id);

  // Obtener el resto de sesiones
  const sessions = exercise?.sessions;

  // Componente para seccion de "Otros Ejercicios"
  const otherExercises = data?.exercises?.filter((ex) => ex !== exercise);

  // Construir SignedURL para mostrar el video
  useEffect(() => {
    if (!session?.video_url) return;

    const getVideoUrl = async () => {
      const res = await fetch(
        `${VITE_API_URL}/api/get-signed-url-video?path=${encodeURIComponent(session.video_url)}`,
      );
      const json = await res.json();
      setVideoUrl(json.url);
    };

    getVideoUrl();
  }, [session?.video_url]);

  // Validacion de campos
  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!data) return null;
  if (!exercise) return <p>Sesión no encontrada</p>;

  return (
    <div className="flex-1 space-y-20">
      <div className="flex-1 space-y-10">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-1">
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-5xl font-black tracking-tighter">
              Análisis de {exercise.commercial_name}
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
                src={videoUrl}
                controls
                className="w-full h-full object-contain rounded-xl"
              />
            </div>

            {/* HISTORY */}
            <SessionHistory sessions={sessions} activeId={id} />
          </div>

          {/* RIGHT - 30% */}
          <div className="lg:col-span-3 h-full">
            <SidePanel exercise={exercise} session={session} />
          </div>
        </div>

        {/* ANALYTICS */}
        <AnalyticsDashboard
          exercise={exercise}
          session={session}
          sessions={sessions}
        />
      </div>

      {otherExercises?.length > 0 && (
        <ExerciseGrid
          data={{ ...data, exercises: otherExercises }}
          title={"Otros Ejercicios"}
        />
      )}
    </div>
  );
}
