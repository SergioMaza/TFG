import { Activity, CalendarDays, Dumbbell, Scale } from "lucide-react";

export default function MetricsGrid({ data }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
      {/* Media del score del */}
      <Metric
        title="Volumen mensual"
        value={data.metrics.sessions_this_month}
        subtitle="Sesiones completadas"
        icon={<CalendarDays size={20} />}
      />

      {/* Calcualda en base a rom duration y velocity */}
      <Metric
        title="Volumen semanal"
        value={data.metrics.sessions_this_week}
        subtitle="Días activos"
        icon={<Activity size={20} />}
      />

      {/* (first_rep_velocity - last_rep_velocity) / first_rep_velocity */}
      <Metric
        title="Más entrenado"
        value={data.metrics.most_trained_muscle}
        icon={<Dumbbell size={20} />}
      />

      {/* efficiency = rom_avg / avg_duration */}
      <DistributionMetric
        title="Distribución"
        icon={<Scale size={20} />}
        upper={data.metrics.upper_percentage}
        lower={data.metrics.lower_percentage}
      />
    </div>
  );
}

function Metric({ title, value, subtitle="", icon }) {
  return (
    <div className="p-6 rounded-2xl border border-(--bg-extra-light) hover:bg-(--bg-extra-light) transition group">
      {/* Top */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-xs uppercase tracking-widest text-(--gray) font-semibold">
          {title}
        </span>

        <div className="text-(--primary) opacity-70 group-hover:opacity-100 transition">
          {icon}
        </div>
      </div>

      {/* Main content */}
      <div className="flex items-baseline gap-2">
        {/* Value */}
        <span className="text-3xl font-bold tracking-tight">{value}</span>

        {/* Subtitle */}
        <span className="text-sm text-(--gray)">{subtitle}</span>
      </div>
    </div>
  );
}

function DistributionMetric({ title, icon, upper, lower }) {
  return (
    <div className="p-6 rounded-2xl border border-(--bg-extra-light) hover:bg-(--bg-extra-light) transition">
      {/* Top (igual que los demás) */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-xs uppercase tracking-widest text-(--gray) font-semibold">
          {title}
        </span>

        <div className="text-(--primary) opacity-70 group-hover:opacity-100 transition">
          {icon}
        </div>
      </div>

      {/* Distribution */}
      <div className="space-y-3">
        {/* Labels */}
        <div className="flex justify-between items-center text-xs font-bold text-(--gray)">
          <div className="flex items-center gap-2">
            <img src="/chest_icon.png" className="size-6 invert" />
            <span>{upper}%</span>
          </div>

          <div className="flex items-center">
            <img src="/leg_icon.png" className="size-8 invert" />
            <span>{lower}%</span>
          </div>
        </div>

        {/* Bar */}
        <div className="h-1.5 w-full bg-(--bg-extra-light) rounded-full overflow-hidden flex">
          <div
            className="h-full bg-(--primary)"
            style={{ width: `${upper}%` }}
          />

          <div
            className="h-full bg-(--chart-color2)"
            style={{ width: `${lower}%` }}
          />
        </div>
      </div>
    </div>
  );
}
