import { useCallback } from "react";

/**
 * usePdfReport
 *
 * Genera y descarga un PDF con el historial completo de un ejercicio.
 * Usa jsPDF directamente (sin html2canvas) para mayor control y velocidad.
 *
 * Uso:
 *   const { downloadReport } = usePdfReport();
 *   <button onClick={() => downloadReport(exercise)}>Descargar</button>
 *
 * Dependencia: npm install jspdf
 */

// ── Paleta ────────────────────────────────────────────────────────────────────
const C = {
  bg:        [13,  13,  18],   // --bg
  surface:   [22,  22,  30],   // --bg-light
  border:    [40,  40,  55],   // --bg-extra-light
  accent:    [99,  102, 241],  // --secondary (indigo)
  accentRGB: "#6366f1",
  white:     [255, 255, 255],
  gray:      [140, 140, 160],
  error:     [239, 68,  68],
  success:   [34,  197, 94],
  warn:      [234, 179, 8],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function setFill(doc, color)   { doc.setFillColor(...color); }
function setDraw(doc, color)   { doc.setDrawColor(...color); }
function setFont(doc, color, size, style = "normal") {
  doc.setTextColor(...color);
  doc.setFontSize(size);
  doc.setFont("helvetica", style);
}

/** Rectángulo redondeado relleno */
function roundRect(doc, x, y, w, h, r = 3) {
  doc.roundedRect(x, y, w, h, r, r, "F");
}

/** Línea horizontal */
function hLine(doc, x, y, w, color = C.border) {
  setDraw(doc, color);
  doc.setLineWidth(0.3);
  doc.line(x, y, x + w, y);
}

/** Texto truncado a maxW mm */
function truncText(doc, text, maxW) {
  const str = String(text ?? "—");
  return doc.splitTextToSize(str, maxW)[0];
}

/** Barra de progreso horizontal con zona ideal */
function drawRangeBar(doc, x, y, w, value, low, high, unit, label) {
  const BAR_H = 4;
  const max   = high * 1.4;
  const clamp = (v) => Math.min(Math.max(v, 0), max);

  // Label + valor
  setFont(doc, C.gray, 7);
  doc.text(label, x, y);
  setFont(doc, C.white, 7, "bold");
  doc.text(`${value} ${unit}`, x + w, y, { align: "right" });

  const barY = y + 2;

  // Fondo
  setFill(doc, C.border);
  roundRect(doc, x, barY, w, BAR_H, 2);

  // Zona ideal (verde translúcido → dibujamos con fill)
  const idealX = x + (clamp(low)  / max) * w;
  const idealW =     (clamp(high) / max) * w - (clamp(low) / max) * w;
  setFill(doc, [34, 197, 94]);
  doc.setGState(new doc.GState({ opacity: 0.25 }));
  roundRect(doc, idealX, barY, Math.max(idealW, 0), BAR_H, 2);
  doc.setGState(new doc.GState({ opacity: 1 }));

  // Fill del valor
  const valW = (clamp(value) / max) * w;
  const inRange = value >= low && value <= high;
  setFill(doc, inRange ? C.success : value < low ? C.warn : C.error);
  roundRect(doc, x, barY, Math.max(valW, 1), BAR_H, 2);

  return barY + BAR_H + 2;
}

/** Mini scoreRing como círculo + número */
function drawScoreBadge(doc, cx, cy, r, score) {
  // Fondo círculo
  setFill(doc, C.surface);
  doc.circle(cx, cy, r, "F");

  // Arco de score (aproximado con líneas dado que jsPDF no tiene arc fill nativo)
  // Usamos un texto grande centrado en su lugar
  const color = score >= 80 ? C.success : score >= 60 ? C.warn : C.error;
  setFont(doc, color, 14, "bold");
  doc.text(String(score), cx, cy + 1.5, { align: "center", baseline: "middle" });
  setFont(doc, C.gray, 6);
  doc.text("SCORE", cx, cy + 6, { align: "center" });
}

// ── Página de portada ─────────────────────────────────────────────────────────
function drawCover(doc, exercise) {
  const { width, height } = doc.internal.pageSize;

  // Fondo
  setFill(doc, C.bg);
  doc.rect(0, 0, width, height, "F");

  // Banda superior accent
  setFill(doc, C.accent);
  doc.rect(0, 0, width, 2, "F");

  // Título ejercicio
  setFont(doc, C.white, 22, "bold");
  doc.text(exercise.commercial_name, width / 2, 55, { align: "center" });

  // Subtítulo
  setFont(doc, C.gray, 9);
  doc.text("INFORME DE RENDIMIENTO", width / 2, 65, { align: "center" });

  // Fecha
  const now = new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });
  setFont(doc, C.gray, 8);
  doc.text(now, width / 2, 73, { align: "center" });

  // ── Métricas globales ──
  const sessions = exercise.sessions ?? [];
  const avgScore = exercise.avg_score ?? 0;
  const totalReps = sessions.reduce((s, se) => s + se.total_reps, 0);
  const avgROM    = sessions.length
    ? (sessions.reduce((s, se) => s + se.rom_avg_deg, 0) / sessions.length).toFixed(1)
    : 0;
  const avgFatigue = sessions.length
    ? (sessions.reduce((s, se) => s + se.fatigue, 0) / sessions.length).toFixed(1)
    : 0;

  const cards = [
    { label: "Sesiones",     value: sessions.length },
    { label: "Score medio",  value: avgScore },
    { label: "Reps totales", value: totalReps },
    { label: "ROM medio",    value: `${avgROM}°` },
    { label: "Fatiga media", value: `${avgFatigue}%` },
  ];

  const cardW = 32;
  const cardH = 22;
  const gap   = 4;
  const totalW = cards.length * cardW + (cards.length - 1) * gap;
  let cx = (width - totalW) / 2;
  const cardY = 90;

  cards.forEach(({ label, value }) => {
    setFill(doc, C.surface);
    roundRect(doc, cx, cardY, cardW, cardH, 4);

    setFont(doc, C.gray, 6.5);
    doc.text(label.toUpperCase(), cx + cardW / 2, cardY + 7, { align: "center" });

    setFont(doc, C.white, 11, "bold");
    doc.text(String(value), cx + cardW / 2, cardY + 16, { align: "center" });

    cx += cardW + gap;
  });

  // Línea separadora
  hLine(doc, 20, 130, width - 40, C.border);

  // Descripción pequeña
  setFont(doc, C.gray, 7.5);
  doc.text(
    "Este informe incluye el historial completo de sesiones, métricas por repetición y feedback de rendimiento.",
    width / 2, 140, { align: "center", maxWidth: width - 60 }
  );

  // Footer
  setFont(doc, C.border, 7);
  doc.text("Generado automáticamente · LiftApp", width / 2, height - 10, { align: "center" });
}

// ── Cabecera reutilizable ─────────────────────────────────────────────────────
function drawHeader(doc, exercise, pageNum) {
  const { width } = doc.internal.pageSize;

  setFill(doc, C.bg);
  doc.rect(0, 0, width, 14, "F");

  setFill(doc, C.accent);
  doc.rect(0, 0, width, 1.5, "F");

  setFont(doc, C.gray, 7);
  doc.text(exercise.commercial_name.toUpperCase(), 14, 9);

  setFont(doc, C.gray, 7);
  doc.text(`Pág. ${pageNum}`, width - 14, 9, { align: "right" });

  hLine(doc, 0, 14, width, C.border);
}

// ── Footer reutilizable ───────────────────────────────────────────────────────
function drawFooter(doc) {
  const { width, height } = doc.internal.pageSize;
  hLine(doc, 0, height - 12, width, C.border);
  setFont(doc, [60, 60, 80], 6.5);
  doc.text("LiftApp · Informe de rendimiento", width / 2, height - 6, { align: "center" });
}

// ── Página de sesión ──────────────────────────────────────────────────────────
function drawSessionPage(doc, exercise, session, idx, pageNum) {
  const { width, height } = doc.internal.pageSize;
  const M  = 14;   // margen
  const CW = width - M * 2;

  // Fondo
  setFill(doc, C.bg);
  doc.rect(0, 0, width, height, "F");

  drawHeader(doc, exercise, pageNum);

  let y = 20;

  // ── Título sesión ──
  setFont(doc, C.gray, 7);
  doc.text(`SESIÓN ${idx + 1}`, M, y);
  const dateStr = new Date(session.uploaded_at).toLocaleDateString("es-ES", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
  doc.text(dateStr, width - M, y, { align: "right" });
  y += 5;

  // ── Score badge + stats ──
  const BADGE_R = 14;
  drawScoreBadge(doc, M + BADGE_R, y + BADGE_R, BADGE_R, session.score);

  const statsX = M + BADGE_R * 2 + 6;
  const stats = [
    ["Reps",       session.total_reps],
    ["ROM medio",  `${session.rom_avg_deg}°`],
    ["Eficiencia", `${session.efficiency_avg}%`],
    ["Fatiga",     `${session.fatigue}%`],
    ["Vel. media", `${session.velocity_avg} °/s`],
    ["Dur. media", `${session.duration_avg} s`],
  ];

  const colW = (CW - BADGE_R * 2 - 6) / 3;
  stats.forEach(([label, value], i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const sx  = statsX + col * colW;
    const sy  = y + row * 12;

    setFill(doc, C.surface);
    roundRect(doc, sx, sy, colW - 2, 10, 2);

    setFont(doc, C.gray, 5.5);
    doc.text(label.toUpperCase(), sx + 3, sy + 4);

    const isFatigue = label === "Fatiga";
    const warn = isFatigue && Math.abs(session.fatigue) > 20;
    setFont(doc, warn ? C.error : C.white, 7.5, "bold");
    doc.text(String(value), sx + 3, sy + 8.5);
  });

  y += BADGE_R * 2 + 6;

  // ── Barras de rango ──
  hLine(doc, M, y, CW);
  y += 5;
  setFont(doc, C.white, 7, "bold");
  doc.text("MÉTRICAS VS RANGO IDEAL", M, y);
  y += 5;

  const { thresholds } = exercise;
  y = drawRangeBar(doc, M, y, CW, session.velocity_avg,
    thresholds.velocity.idealLow, thresholds.velocity.idealHigh, "°/s", "Velocidad media") + 4;
  y = drawRangeBar(doc, M, y, CW, session.rom_avg_deg,
    thresholds.rom.idealLow, thresholds.rom.idealHigh, "°", "ROM medio") + 4;
  y = drawRangeBar(doc, M, y, CW, session.duration_avg,
    thresholds.duration.idealLow, thresholds.duration.idealHigh, "s", "Duración media") + 6;

  // ── Tabla de reps ──
  hLine(doc, M, y, CW);
  y += 5;
  setFont(doc, C.white, 7, "bold");
  doc.text("DETALLE POR REPETICIÓN", M, y);
  y += 4;

  const cols = [
    { label: "Rep",        key: "rep_number",  w: 10 },
    { label: "ROM (°)",    key: "rom_deg",      w: 22 },
    { label: "Vel (°/s)",  key: "velocity",     w: 22 },
    { label: "Dur (s)",    key: "duration",     w: 20 },
    { label: "Efic. (%)",  key: "efficiency",   w: 22 },
    { label: "Full ROM",   key: "full_rom",     w: 20 },
  ];

  // Header tabla
  setFill(doc, C.surface);
  doc.rect(M, y, CW, 6, "F");
  setFont(doc, C.gray, 6);
  let cx2 = M + 2;
  cols.forEach(({ label, w }) => {
    doc.text(label, cx2, y + 4);
    cx2 += w;
  });
  y += 6;

  // Filas
  (session.reps_detail ?? []).forEach((rep, ri) => {
    if (ri % 2 === 0) {
      setFill(doc, [18, 18, 26]);
      doc.rect(M, y, CW, 5.5, "F");
    }
    setFont(doc, C.white, 6);
    let rx = M + 2;
    cols.forEach(({ key, w }) => {
      let val = rep[key];
      if (key === "full_rom") val = val ? "✓" : "✗";
      doc.text(truncText(doc, val, w - 2), rx, y + 3.8);
      rx += w;
    });
    y += 5.5;
  });

  y += 4;

  // ── Feedback ──
  const fb = session.feedback ?? [];
  if (fb.length > 0) {
    hLine(doc, M, y, CW);
    y += 5;
    setFont(doc, C.white, 7, "bold");
    doc.text("FEEDBACK", M, y);
    y += 4;

    fb.forEach((item) => {
      const color = item.error ? C.error : C.success;
      setFill(doc, color);
      doc.circle(M + 1.5, y - 0.5, 1.2, "F");

      setFont(doc, C.white, 6);
      const prefix = item.rep_number != null ? `Rep ${item.rep_number} · ` : "Sesión · ";
      const full   = prefix + item.text;
      doc.text(truncText(doc, full, CW - 8), M + 5, y);
      y += 4.5;

      if (y > height - 20) return; // evitar overflow
    });
  }

  drawFooter(doc);
}

// ── Hook principal ────────────────────────────────────────────────────────────
export function usePdfReport() {
  const downloadReport = useCallback(async (exercise) => {
    // Carga dinámica para no incluir jsPDF en el bundle principal
    const { jsPDF } = await import("jspdf");

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    // Portada
    drawCover(doc, exercise);

    // Una página por sesión
    const sessions = [...(exercise.sessions ?? [])].sort(
      (a, b) => new Date(a.uploaded_at) - new Date(b.uploaded_at)
    );

    sessions.forEach((session, idx) => {
      doc.addPage();
      drawSessionPage(doc, exercise, session, idx, idx + 2);
    });

    // Descarga
    const filename = `informe_${exercise.title}_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(filename);
  }, []);

  return { downloadReport };
}