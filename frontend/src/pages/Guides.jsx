import React from "react";
import { GuideCard } from "../components/tutorials/GuideCard";
import { useAppProvider } from "../hooks/useAppProvider";

export default function Guides() {
  const { exercisesCatalog, loading, error } = useAppProvider();

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!exercisesCatalog) return null;

  return (
    <div className="flex-1 space-y-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-1">
        <div className="space-y-4 max-w-2xl">
          <h2 className="text-5xl font-black tracking-tighter">
            Guías de ejercicios
          </h2>

          <p className="text-(--gray) text-lg leading-relaxed">
            Explora guías detalladas de cada ejercicio, 
            incluyendo técnica correcta, músculos implicados, 
            beneficios biomecánicos y errores comunes.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {exercisesCatalog.map((exercise, i) => (
          <GuideCard key={i} {...exercise} />
        ))}
      </div>
    </div>
  );
}
