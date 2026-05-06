// Panel lateral que cambia entre Metrics | Feedback

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import MetricsPanel from "./MetricsPanel";
import FeedbackPanel from "./Feedback";

export default function SidePanel({ exercise, session }) {
  const [mode, setMode] = useState("metrics");

  return (
    <div className="bg-(--bg-light) rounded-2xl border border-(--bg-extra-light) p-5 h-full flex flex-col">

      {/* HEADER + TOGGLE */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold tracking-[0.3em] uppercase text-white border-l-4 border-(--primary) pl-3">
          {mode === "metrics" ? "Métricas" : "Feedback"}
        </h2>

        {/* TOGGLE */}
        <div className="flex bg-(--bg-extra-light) rounded-lg p-1">
          {["metrics", "feedback"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`
                px-3 py-1 text-[10px] uppercase tracking-widest rounded-md transition-all
                ${mode === m
                  ? "border border-(--primary) text-white"
                  : "text-(--gray) hover:text-white"}
              `}
            >
              {m === "metrics" ? "Stats" : "Feedback"}
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-(--bg-extra-light) mb-4" />

      {/* CONTENT ANIMADO */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {mode === "metrics" ? (
            <motion.div
              key="metrics"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
            >
              <MetricsPanel exercise={exercise} session={session} />
            </motion.div>
          ) : (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <FeedbackPanel session={session} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}