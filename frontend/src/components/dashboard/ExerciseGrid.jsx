import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../config/routes";
import { getScoreColorValue } from "../common/getScoreColorValue";

export default function ExerciseGrid({ data, title = "Ejercicios" }) {
  return (
    <section>
      <h2 className="text-3xl font-bold mb-8">{title}</h2>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {data.exercises.map((ex, i) => (
          <ExerciseCard key={i} {...ex} />
        ))}
      </div>
    </section>
  );
}

function ExerciseCard({ title, img, avg_score, sessions }) {
  const navigate = useNavigate();

  const color = getScoreColorValue(avg_score);

  function handleClick() {
    if (sessions.length > 0) {
      navigate(
        ROUTES.results.replace(":id", sessions[sessions.length - 1].sessionId),
      );
    }
  }

  return (
    <div
      onClick={handleClick}
      className="rounded-xl overflow-hidden flex flex-col group border border-(--bg-extra-light) hover:border-(--primary)/30 transition-all"
    >
      {/* IMAGE HEADER */}
      <div className="h-32 w-full relative">
        <img
          src={img}
          alt={title}
          className="w-full h-full object-cover grayscale brightness-50 group-hover:grayscale-0 transition-all duration-500"
        />

        <div className="absolute inset-0 bg-linear-to-t from-(--bg-light) to-transparent" />

        <div className="absolute bottom-4 left-6">
          <h4 className="text-xl font-black">{title}</h4>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-6 space-y-6">
        {/* STATS */}
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[10px] text-(--gray) font-bold uppercase tracking-widest">
              Training Volume
            </p>

            <p className="text-2xl font-bold">
              {sessions.length}
              <span className="text-xs font-normal text-(--gray) ml-1">
                sessions
              </span>
            </p>
          </div>

          <div className="text-right">
            <p className="text-[10px] text-(--gray) font-bold uppercase tracking-widest">
              Avg Technique
            </p>

            <p
              style={{ color }}
              className={`text-2xl font-bold transition-colors`}
            >
              {avg_score}%
            </p>
          </div>
        </div>

        {/* SPARKLINE */}
        <div className="h-12 w-full flex items-end gap-1 px-1">
          {sessions.map((s, i) => {
            const score = s.score;
            const height = `${score}%`;
            const color = getScoreColorValue(score);

            return (
              <div
                key={i}
                style={{ height, backgroundColor: color }}
                className={`w-full rounded-t-sm transition-all duration-300`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
