// Cards donde van las graficas
export function Card({ title, subtitle, children, span = 1 }) {
  return (
    <div
      className="bg-(--bg-light) border border-white/5 rounded-xl p-5 flex flex-col gap-4"
      style={{ gridColumn: `span ${span}` }}
    >
      <div>
        <div className="text-[10px] font-bold tracking-[0.25em] uppercase text-white border-l-[3px] border-(--primary) pl-2.5">
          {title}
        </div>

        {subtitle && (
          <div className="text-[11px] text-(--gray) mt-1 pl-3.25">
            {subtitle}
          </div>
        )}
      </div>

      {children}
    </div>
  );
}

// Hover para ver los datos en las graficas
export function CustomTooltip({ active, payload, label, unit = "" }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-(--bg-light) border border-(--bg-extra-light) rounded-lg px-3 py-2 text-xs">
      <div className="text-(--gray) mb-1 text-[10px] tracking-widest">
        {label}
      </div>

      {payload.map((p, i) => {
        const value =
          typeof p.value === "number" ? p.value.toFixed(1) : p.value;

        return (
          <div key={i} className="font-bold" style={{ color: p.color }}>
            {p.name}: {value}
            {unit}
          </div>
        );
      })}
    </div>
  );
}