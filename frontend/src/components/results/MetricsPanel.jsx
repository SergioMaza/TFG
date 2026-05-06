import { useState, useEffect } from "react";
import { ScoreRing } from "../common/ScoreRing";

function RangeBar({ label, value, idealLow, idealHigh, unit = "" }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  const range = idealHigh - idealLow || Math.abs(value) * 0.2 || 1;
  const padding = range * 0.5;
  const min = idealLow - padding;
  const max = idealHigh + padding;

  const pctRaw = ((value - min) / (max - min)) * 100;
  const pct = Math.max(0, Math.min(100, pctRaw))

  const inIdeal = value >= idealLow && value <= idealHigh;
  const indicatorColor = inIdeal ? "var(--primary)" : "var(--error)";

  const idealLowPct = ((idealLow - min) / (max - min)) * 100;
  const idealHighPct = ((idealHigh - min) / (max - min)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <span className="text-[10px] tracking-[0.15em] uppercase text-(--gray)">
          {label}
        </span>
      </div>

      {/* TRACK */}
      <div className="relative h-2 rounded-full bg-(--bg-extra-light)">

        {/* ZONA VERDE (IDEAL) */}
        <div
          className="absolute top-0 h-full rounded-full"
          style={{
            left: `${idealLowPct}%`,
            width: `${idealHighPct - idealLowPct}%`,
            background: "var(--success)",
            opacity: 0.7,
          }}
        />

        {/* INDICADOR VERTICAL (VALOR ACTUAL) */}
        <div
          className="absolute -top-1 w-1 h-4 transition-all duration-700 rounded-full"
          style={{
            left: animated ? `calc(${pct}% - 1px)` : "0%",
            background: indicatorColor,
            boxShadow: `0 0 8px ${indicatorColor}`,
            transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)",
          }}
        />

        <div className="relative h-4 text-[9px] pt-4">
          {/* MIN */}
          <span className="absolute left-0 text-(--gray)">
            {min.toFixed(2)}
            {unit}
          </span>

          {/* MAX */}
          <span className="absolute right-0 text-(--gray)">
            {max.toFixed(2)}
            {unit}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function MetricsPanel({ exercise, session }) {
  return (
    <div className="flex flex-col gap-10">

      {/* SCORE CENTRAL */}
      <div className="flex justify-center py-5">
        <div className="scale-130">
          <ScoreRing score={session.score} />
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Reps", value: session.total_reps },
          { label: "Avg ROM", value: `${session.rom_avg_deg}º` },
          {
            label: "Fatiga",
            value: `${session.fatigue}%`,
            warn: Math.abs(session.fatigue) > 20,
          },
          { label: "Eficiencia", value: `${session.efficiency_avg}%` },
        ].map(({ label, value, warn }) => (
          <div
            key={label}
            className={`
              rounded-lg p-2 border transition-all
              ${warn ? "border-(--error)" : "border-(--bg-extra-light)"}
            `}
          >
            <div className="text-[9px] uppercase tracking-[0.12em] text-(--gray) mb-1">
              {label}
            </div>

            <div
              className={`text-lg font-extrabold ${
                warn ? "text-(--error)" : "text-white"
              }`}
            >
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* BARS */}
      <div className="flex flex-col gap-8 p-2">
        <RangeBar
          label="Velocidad Media"
          value={session.velocity_avg}
          idealLow={exercise.thresholds.velocity.idealLow}
          idealHigh={exercise.thresholds.velocity.idealHigh}
          unit="°/s"
        />

        <RangeBar
          label="ROM Medio"
          value={session.rom_avg_deg}
          idealLow={exercise.thresholds.rom.idealLow}
          idealHigh={exercise.thresholds.rom.idealHigh}
          unit="°"
        />

        <RangeBar
          label="Duración Media"
          value={session.duration_avg}
          idealLow={exercise.thresholds.duration.idealLow}
          idealHigh={exercise.thresholds.duration.idealHigh}
          unit="s"
        />
      </div>

      {/* CTA */}
      <button className="mt-auto px-3.5 py-3.5 bg-(--secondary) text-white text-[10px] font-bold tracking-[0.2em] uppercase rounded-[10px] transition-all duration-200 hover:opacity-90 active:scale-[0.98]">
        Descargar informe completo
      </button>
    </div>
  );
}
