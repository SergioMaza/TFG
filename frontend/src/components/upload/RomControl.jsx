export default function RomControl({ value, onChange, max = 180 }) {
  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-bold text-(--gray)">Margen de ROM</label>
      <div className="flex items-center gap-4">
        <input
          type="range"
          min={0}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-2 rounded-lg accent-(--primary)"
        />
        <input
          type="number"
          value={value}
          min={0}
          max={max}
          onChange={(e) =>
            onChange(Math.min(max, Math.max(0, Number(e.target.value))))
          }
          className="w-16 text-center border border-(--bg-extra-light) text-white rounded-md px-2 py-1"
        />
      </div>
    </div>
  );
}
