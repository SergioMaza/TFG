import MetricsGrid from "../components/dashboard/MetricsGrid";
import ExerciseGrid from "../components/dashboard/ExerciseGrid";
import ScoreCard from "../components/dashboard/ScoreCard";
import { useAppProvider } from "../hooks/useAppProvider";

export default function Dashboard() {
  const { data, loading, error } = useAppProvider();

  if (loading) return <p>Cargando...</p>;
  if (error)   return <p>Error: {error}</p>;
  if (!data)   return null;

  return (
    <div className="flex-1 space-y-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-1">
        {/* Title */}
        <div className="space-y-4 max-w-2xl">
          <h2 className="text-5xl font-black tracking-tighter">
            Análisis de Rendimiento
          </h2>

          <p className="text-(--gray) text-lg leading-relaxed">
            Revisa tus ejercicios, analiza métricas clave y obten información
            detallada sobre tu rendimiento para mejorar sesión tras sesión.
          </p>
        </div>

        {/* ScoreCard */}
        <ScoreCard data={data}/>
      </div>

      <MetricsGrid data={data}/>
      <ExerciseGrid data={data}/>
    </div>
  );
}
