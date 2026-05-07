export default function SideSelector({ value, onChange }) {
  return (
    <div className="flex items-center gap-5">
      <label className="text-sm font-bold text-(--gray) whitespace-nowrap">
        Perfil de análisis
      </label>

      <div className="flex items-center gap-2">
        {["left", "right"].map((side) => {
          const active = value === side;

          return (
            <button
              key={side}
              type="button"
              onClick={() => onChange(side)}
              className={`
                px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200
                ${
                  active
                    ? "border-(--primary) text-white"
                    : "bg-(--bg) border-(--bg-extra-light) text-(--gray) hover:text-white"
                }
              `}
            >
              {side === "left" ? "Izquierdo" : "Derecho"}
            </button>
          );
        })}
      </div>
    </div>
  );
}