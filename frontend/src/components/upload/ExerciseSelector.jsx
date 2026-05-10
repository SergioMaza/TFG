import { useAppProvider } from "../../hooks/useAppProvider";
import { AppProvider } from "../app/AppProvider";

export default function ExerciseSelector({ value, onChange }) {
  const { exercisesCatalog, loading, error } = useAppProvider();
  
    if (loading) return <p>Cargando...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!exercisesCatalog) return null;

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-bold text-(--gray)">Ejercicio</label>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="bg-(--bg) border border-(--bg-extra-light) text-white px-3 py-2 rounded-md"
      >
        <option value="">Selecciona un ejercicio</option>
        {exercisesCatalog.map((ex) => (
          <option key={ex.title} value={ex.title}>
            {ex.commercial_name}
          </option>
        ))}
      </select>
    </div>
  );
}
