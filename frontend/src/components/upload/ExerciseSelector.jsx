// TODO: DEBUG Simulando registro de ejercicios
const EXERCISES = {
  squat: { name: "squat" },
  bench: { name: "biceps_curl" },
};

export default function ExerciseSelect({ value, onChange }) {
  const exercises = Object.values(EXERCISES);

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-bold text-(--gray)">Ejercicio</label>
      <select
        value={value?.name || ""}
        onChange={(e) =>
          onChange(exercises.find((ex) => ex.name === e.target.value))
        }
        className="bg-(--bg) border border-(--bg-extra-light) text-white px-3 py-2 rounded-md"
      >
        <option value="">Selecciona un ejercicio</option>
        {exercises.map((ex) => (
          <option key={ex.name} value={ex.name}>
            {ex.name}
          </option>
        ))}
      </select>
    </div>
  );
}
