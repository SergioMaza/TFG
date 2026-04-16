import { TrendingUp, TrendingDown } from "lucide-react";
import { ScoreRing } from "../common/ScoreRing";

export default function ScoreCard({ data }) {
  const avgScore = data.metrics.avg_score;

  const change = data.metrics.score_change_weekly;
  const colorClass =
    change > 0
      ? "text-(--success)"
      : change < 0
        ? "text-(--error)"
        : "text-(--gray)";

  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl border border-(--bg-extra-light)">
      {/* Circular Progress */}
      <ScoreRing score={avgScore} />

      {/* Info */}
      <div className="text-center space-y-1">
        <p className="text-xs uppercase tracking-widest text-(--gray) font-bold">
          Technique Score
        </p>

        <div className="flex items-center justify-center gap-2">
          {change > 0 && <TrendingUp className="text-(--success)" />}
          {change < 0 && <TrendingDown className="text-(--error)" />}

          <span className={`${colorClass} text-lg font-bold`}>
            {change > 0 ? "+" : ""}
            {change}%
          </span>

          <span className="text-[10px] text-(--gray)">esta semana</span>
        </div>
      </div>
    </div>
  );
}
