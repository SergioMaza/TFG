import {
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PolarRadiusAxis,
  ReferenceLine,
} from "recharts";
import { Card, CustomTooltip } from "./ChartsAux";

// Grafica de ROM, Velocidad y Duracion - Reps
export function SessionGeneralChart({ reps }) {
  const data = reps.map((r) => ({
    name: `Rep ${r.rep_number}`,
    rom: parseFloat(r.rom_deg.toFixed(1)),
    velocidad: parseFloat(r.velocity.toFixed(1)),
    duracion: parseFloat(r.duration.toFixed(2)),
  }));

  return (
    <Card
      title="Análisis por Repetición"
      subtitle="ROM, velocidad y duración por rep"
    >
      <ResponsiveContainer width="100%" height={220}>
        <LineChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.04)"
          />

          <XAxis
            dataKey="name"
            tick={{ fill: "var(--gray)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            tick={{ fill: "var(--gray)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            domain={["auto", "auto"]}
          />

          <Tooltip content={<CustomTooltip />} />

          {/* ROM */}
          <Line
            type="monotone"
            dataKey="rom"
            name="ROM (°)"
            stroke="var(--chart-color1)"
            strokeWidth={2}
            dot={{ r: 4, fill: "var(--chart-color1)" }}
          />

          {/* Velocidad */}
          <Line
            type="monotone"
            dataKey="velocidad"
            name="Velocidad (°/s)"
            stroke="var(--chart-color2)"
            strokeWidth={2}
            dot={{ r: 4, fill: "var(--chart-color2)" }}
          />

          {/* Duración */}
          <Line
            type="monotone"
            dataKey="duracion"
            name="Duración (s)"
            stroke="var(--chart-color3)"
            strokeWidth={2}
            dot={{ r: 4, fill: "var(--chart-color3)" }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Legend con Tailwind + variables */}
      <div className="flex justify-center gap-4 mt-2 text-[10px]">
        <div className="flex items-center gap-1 text-(--gray)">
          <div className="w-4 h-0.5 bg-(--chart-color1) rounded" />
          ROM
        </div>
        <div className="flex items-center gap-1 text-(--gray)">
          <div className="w-4 h-0.5 bg-(--chart-color2) rounded" />
          Velocidad
        </div>
        <div className="flex items-center gap-1 text-(--gray)">
          <div className="w-4 h-0.5 bg-(--chart-color3) rounded" />
          Duración
        </div>
      </div>
    </Card>
  );
}

// Radar de rendimiento global
export function PerformanceRadar({ exercise, session }) {
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  const norm = (v, min, max) =>
    ((clamp(v, min, max) - min) / (max - min)) * 100;

  const data = [
    {
      metric: "ROM",
      value: norm(
        session.rom_avg_deg,
        exercise.thresholds.rom.idealLow,
        exercise.thresholds.rom.idealHigh,
      ),
    },
    { metric: "Recuperación", value: 100 - norm(session.fatigue, 0, 100) },
    { metric: "Eficiencia", value: norm(session.efficiency_avg, 0, 100) },
    {
      metric: "Velocidad",
      value: norm(
        session.velocity_avg,
        exercise.thresholds.velocity.idealLow,
        exercise.thresholds.velocity.idealHigh,
      ),
    },
    {
      metric: "Duración",
      value: norm(
        session.duration_avg,
        exercise.thresholds.duration.idealLow,
        exercise.thresholds.duration.idealHigh,
      ),
    },
  ];

  return (
    <Card
      title="Perfil de Rendimiento"
      subtitle="Visión global de las métricas clave"
    >
      <ResponsiveContainer width="100%" height={220}>
        <RadarChart data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.06)" />
          <Tooltip content={<CustomTooltip />} />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ fill: "var(--gray)", fontSize: 10, dy: -10 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: "var(--gray)", fontSize: 9 }}
            tickCount={3}
          />
          <Radar
            name="Sesión"
            dataKey="value"
            stroke="var(--primary)"
            fill="var(--primary)"
            fillOpacity={0.15}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </Card>
  );
}

// Grafica de ROM x Feedback por Repetición
// Aux para mostrar info al poner el raton encima
const RepTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="bg-(--bg-light) border border-(--bg-extra-light) rounded-lg px-3 py-2 text-xs">
      <div className="text-(--gray) mb-1 text-[10px] tracking-widest">
        {label}
      </div>
      <div className="font-bold" style={{ color: payload[0].color }}>
        ROM: {point.rom}°
      </div>
      {point.feedback.length > 0 ? (
        point.feedback.map((f, i) => (
          <div
            key={i}
            className="mt-1"
            style={{ color: f.error ? "var(--error)" : "var(--success)" }}
          >
            {f.text}
          </div>
        ))
      ) : (
        <div className="mt-1" style={{ color: "var(--success)" }}>
          Sin observaciones
        </div>
      )}
    </div>
  );
};

export function RepFeedbackChart({ reps, feedback, thresholds }) {
  const feedbackByRep = {};
  (feedback || []).forEach((f) => {
    if (f.rep_number == null) return;
    if (!feedbackByRep[f.rep_number]) feedbackByRep[f.rep_number] = [];
    feedbackByRep[f.rep_number].push(f);
  });

  const data = reps.map((r) => ({
    name: `Rep ${r.rep_number}`,
    rom: parseFloat(r.rom_deg.toFixed(1)),
    hasError: !!feedbackByRep[r.rep_number]?.some((f) => f.error),
    feedback: feedbackByRep[r.rep_number] || [],
  }));

  return (
    <Card
      title="Feedback por repetición"
      subtitle="ROM media con indicadores de error por rep"
    >
      <ResponsiveContainer width="100%" height={220}>
        <LineChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.04)"
          />
          <XAxis
            dataKey="name"
            tick={{ fill: "var(--gray)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "var(--gray)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            domain={["auto", "auto"]}
          />
          <Tooltip content={<RepTooltip />} />

          {thresholds?.rom && (
            <>
              <ReferenceLine
                y={thresholds.rom.idealHigh}
                stroke="var(--primary)"
                strokeDasharray="4 2"
                strokeOpacity={0.4}
                label={{
                  value: `Hight ROM: ${thresholds.rom.idealHigh}°`,
                  fill: "var(--primary)",
                  fontSize: 9,
                  position: "insideTopRight",
                }}
              />
              <ReferenceLine
                y={thresholds.rom.idealLow}
                stroke="var(--primary)"
                strokeDasharray="4 2"
                strokeOpacity={0.4}
                label={{
                  value: `Low ROM: ${thresholds.rom.idealLow}°`,
                  fill: "var(--primary)",
                  fontSize: 9,
                  position: "insideBottomRight",
                }}
              />
            </>
          )}

          <Line
            type="monotone"
            dataKey="rom"
            name="ROM (°)"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth={2}
            dot={(props) => {
              const { cx, cy, payload } = props;
              return (
                <circle
                  key={payload.name}
                  cx={cx}
                  cy={cy}
                  r={6}
                  fill={payload.hasError ? "var(--error)" : "var(--success)"}
                  stroke="none"
                />
              );
            }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="flex justify-center gap-4 mt-2 text-[10px]">
        <div className="flex items-center gap-1 text-(--gray)">
          <div className="w-3 h-3 rounded-full bg-(--success)" />
          Sin observaciones
        </div>
        <div className="flex items-center gap-1 text-(--gray)">
          <div className="w-3 h-3 rounded-full bg-(--error)" />
          Con feedback
        </div>
      </div>
    </Card>
  );
}
