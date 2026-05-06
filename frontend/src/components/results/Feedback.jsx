export default function FeedbackPanel({ session }) {
  const feedback = session.feedback || [];

  const globalFeedback = feedback.filter((f) => f.rep_number == null);
  const repFeedback = feedback.filter((f) => f.rep_number != null);

  const reps = session.reps_detail || [];

  const errorsCount = repFeedback.filter((f) => f.error).length;
  const okCount = repFeedback.filter((f) => !f.error).length;

  return (
    <div className="flex flex-col gap-5">
      {/* RESUMEN */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg p-2 border border-(--error) bg-(--error)/5">
          <div className="text-[10px] text-(--gray) uppercase">Errores</div>
          <div className="text-white font-bold">{errorsCount}</div>
        </div>

        <div className="rounded-lg p-2 border border-(--success) bg-(--success)/5">
          <div className="text-[10px] text-(--gray) uppercase">Correctos</div>
          <div className="text-white font-bold">{okCount}</div>
        </div>

        <div className="rounded-lg p-2 border border-(--bg-extra-light)">
          <div className="text-[10px] text-(--gray) uppercase">Reps</div>
          <div className="text-white font-bold">{reps.length}</div>
        </div>
      </div>

      {/* FEEDBACK GLOBAL */}
      {globalFeedback.length > 0 && (
        <div className="flex flex-col gap-2 pt-6">

          {globalFeedback.map((f, i) => (
            <div
              key={i}
              className={`rounded-xl p-3 border ${
                f.error
                  ? "border-(--error) bg-(--error)/5"
                  : "border-(--success) bg-(--success)/5"
              }`}
            >
              <div
                className={`text-[10px] uppercase tracking-widest mb-1 ${
                  f.error ? "text-(--error)" : "text-(--success)"
                }`}
              >
                {f.error ? "Mejora global" : "Insight"}
              </div>

              <div className="text-sm text-white">{f.text}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
