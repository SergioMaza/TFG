export default function TargetInputs({ reps, sets, setReps, setSets }) {
  return (
    <div className="flex items-center space-x-10">
      {/* Repeticiones */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-bold text-(--gray)">
          Repeticiones Objetivo
        </label>
        <input
          type="number"
          value={reps}
          min={1}
          onChange={(e) => setReps(Number(e.target.value))}
          className="w-20 px-2 py-1 rounded-md border border-(--bg-extra-light) text-white text-center bg-(--bg-light)"
        />
      </div>

      {/* Series */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-bold text-(--gray)">
          Series Objetivo
        </label>
        <input
          type="number"
          value={sets}
          min={1}
          onChange={(e) => setSets(Number(e.target.value))}
          className="w-20 px-2 py-1 rounded-md border border-(--bg-extra-light) text-white text-center bg-(--bg-light)"
        />
      </div>
    </div>
  );
}