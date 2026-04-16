import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../config/routes";

export default function SessionHistory({ sessions, activeId }) {
  const navigate = useNavigate();

  const handleSessionClick = (id) => {
    navigate(ROUTES.results.replace(":id", id));
  };

  return (
    <div className="space-y-3">
      <h3 className="text-[10px] uppercase tracking-[0.3em] text-(--gray)">
        Historial de Sesiones
      </h3>

      {/* CONTENEDOR con separador */}
      <div className="border-b border-white/10">
        <div className="flex gap-6 overflow-x-auto pb-2 scroll-smooth snap-x">
          {sessions.map((s) => {
            const isActive = s.sessionId === parseInt(activeId);

            return (
              <button
                key={s.sessionId}
                onClick={() => handleSessionClick(s.sessionId)}
                className={`group flex flex-col items-center px-3 py-2 rounded-md snap-end
                transition-all duration-200 cursor-pointer
                ${
                  isActive
                    ? "text-(--primary)"
                    : "text-(--gray) hover:text-white"
                }
                hover:bg-white/5`}
              >
                {/* SCORE */}
                <span className="text-lg font-semibold">
                  {s.score}%
                </span>

                {/* FECHA */}
                <span className="text-[10px] opacity-60">
                  {new Date(s.uploadedAt).toLocaleDateString()}
                </span>

                {/* INDICADOR ACTIVO */}
                <div
                  className={`mt-1 h-0.5 w-full rounded-full transition-all
                  ${
                    isActive
                      ? "bg-(--primary)"
                      : "bg-transparent group-hover:bg-white/20"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}