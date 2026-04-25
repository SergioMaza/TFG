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
} from "recharts";
import { Card, CustomTooltip } from "./ChartsAux";

export function SessionGeneralChart({ reps }) {
  const data = reps.map((r) => ({
    name: `Rep ${r.rep}`,
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
    { metric: "ROM", value: norm(session.rom_avg_deg, exercise.thresholds.rom.idealLow, exercise.thresholds.rom.idealHigh) },
    { metric: "Fatiga", value: norm(session.fatigue, 0, 100) },
    { metric: "Eficiencia", value: norm(session.efficiency, 0, 100) },
    {
      metric: "Velocidad",
      value: norm(session.avg_velocity, exercise.thresholds.velocity.idealLow, exercise.thresholds.velocity.idealHigh),
    },
    {
      metric: "Duración",
      value: norm(session.duration_avg, exercise.thresholds.duration.idealLow, exercise.thresholds.duration.idealHigh),
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
