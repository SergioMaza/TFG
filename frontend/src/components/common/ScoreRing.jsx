import { useEffect, useState } from "react";
import { getScoreColorValue } from "./getScoreColorValue";

export function ScoreRing({ score }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(t);
  }, []);

  const r = 38;
  const circ = 2 * Math.PI * r;
  const dash = animated ? circ * (score / 100) : 0;

  const color = getScoreColorValue(score);

  return (
    <div className="relative w-24 h-24">
      <svg width="96" height="96" className="-rotate-90">
        {/* BACK CIRCLE */}
        <circle
          cx="48"
          cy="48"
          r={r}
          fill="none"
          stroke="#232222"
          strokeWidth="6"
        />

        {/* PROGRESS CIRCLE */}
        <circle
          cx="48"
          cy="48"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{
            transition: "stroke-dasharray 1s cubic-bezier(0.34,1.56,0.64,1)",
            filter: `drop-shadow(0 0 6px ${color})`,
          }}
        />
      </svg>

      {/* CENTER CONTENT */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[22px] font-black leading-none" style={{ color }}>
          {score}
        </span>

        <span className="text-[8px] text-(--gray) tracking-widest uppercase">
          score
        </span>
      </div>
    </div>
  );
}
