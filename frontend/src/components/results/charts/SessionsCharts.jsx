import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card, CustomTooltip } from "./ChartsAux";

// Aux: Score Color
function CustomBar(props) {
  function getScoreColor(score) {
    if (score > 75) return "var(--success)";
    if (score > 50) return "var(--warning)";
    return "var(--error)";
  }

  const { x, y, width, height, payload } = props;

  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      rx={4}
      fill={getScoreColor(payload.score)}
    />
  );
}

// Histórico de ROM entre sesiones
export function RomHistoryChart({ sessions }) {
  const areas = [
    {
      key: "max",
      color: "var(--chart-color1)",
      fill: "url(#max)",
      name: "ROM Max",
    },
    { key: "avg", color: "var(--chart-color3)", dash: "4 2", name: "ROM Avg" },
    {
      key: "min",
      color: "var(--chart-color2)",
      fill: "url(#min)",
      name: "ROM Min",
    },
  ];

  const data = sessions.map((s, i) => ({
    i,
    name: `S${i + 1}`,
    max: s.rom_max_deg,
    avg: s.rom_avg_deg,
    min: s.rom_min_deg,
  }));

  const allValues = sessions.flatMap((s) => [
    s.rom_max_deg,
    s.rom_avg_deg,
    s.rom_min_deg,
  ]);

  const minY = Math.min(...allValues);
  const maxY = Math.max(...allValues);
  const paddingY = Math.max(2, (maxY - minY) * 0.1);

  return (
    <Card
      title="Histórico de ROM"
      subtitle="Rango de movimiento entre sesiones"
      span={2}
    >
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20 }}>
          <defs>
            <linearGradient id="max" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--chart-color1)"
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor="var(--chart-color1)"
                stopOpacity={0}
              />
            </linearGradient>

            <linearGradient id="min" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--chart-color2)"
                stopOpacity={0.2}
              />
              <stop
                offset="95%"
                stopColor="var(--chart-color2)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.04)"
          />

          <XAxis
            dataKey="name"
            tick={{ fill: "var(--gray)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            domain={[minY - paddingY, maxY + paddingY]}
            tick={{ fill: "var(--gray)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip content={<CustomTooltip unit="°" />} />

          {areas.map((a) => (
            <Area
              key={a.key}
              type="monotone"
              dataKey={a.key}
              stroke={a.color}
              strokeWidth={2}
              fill={a.fill || "none"}
              strokeDasharray={a.dash || undefined}
              name={a.name}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>

      <div className="flex justify-center gap-4 mt-2 text-[10px]">
        {areas.map((a) => (
          <div key={a.key} className="flex items-center gap-1 text-(--gray)">
            <div
              className="w-4 h-0.5 rounded"
              style={{ background: a.color }}
            />
            {a.name}
          </div>
        ))}
      </div>
    </Card>
  );
}

// Histórico de Score
export function ScoreHistoryChart({ sessions }) {
  const data = sessions.map((s, i) => ({
    name: `S${i + 1}`,
    score: s.score,
    date: new Date(s.uploadedAt).toLocaleDateString(),
  }));

  return (
    <Card title="Evolución del Score" subtitle="Puntuación técnica por sesión">
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.04)"
            vertical={false}
          />

          <XAxis
            dataKey="name"
            tick={{ fill: "var(--gray)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            tick={{ fill: "var(--gray)", fontSize: 11 }}
            domain={[0, 100]}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip content={<CustomTooltip />} />

          <Bar dataKey="score" name="Score" shape={<CustomBar />} />

          <ReferenceLine
            y={85}
            stroke="var(--primary)"
            strokeDasharray="4 2"
            label={{
              value: "Target",
              fill: "var(--primary)",
              fontSize: 10,
              dy: -10,
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

// Histórico de Fatiga y Eficiencia
export function FatigueEfficiencyChart({ sessions }) {
  const data = sessions.map((s, i) => ({
    name: `S${i + 1}`,
    fatiga: s.fatigue,
    eficiencia: s.efficiency_avg,
  }));

  return (
    <Card
      title="Fatiga & Eficiencia"
      subtitle="Degradación de velocidad y ROM/tiempo"
    >
      <ResponsiveContainer width="100%" height={180}>
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <XAxis
            dataKey="name"
            tick={{ fill: "var(--gray)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "var(--gray)", fontSize: 11 }}
            domain={[0, 100]}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="fatiga"
            name="Fatiga"
            fill="var(--chart-color1)"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="eficiencia"
            name="Eficiencia"
            fill="var(--chart-color2)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
      <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
        {[
          ["Fatiga %", "var(--chart-color1)"],
          ["Eficiencia %", "var(--chart-color2)"],
        ].map(([label, color]) => (
          <div
            key={label}
            style={{ display: "flex", alignItems: "center", gap: 5 }}
          >
            <div
              style={{
                width: 20,
                height: 2,
                background: color,
                borderRadius: 1,
              }}
            />
            <span style={{ fontSize: 10, color: "var(--gray)" }}>{label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
