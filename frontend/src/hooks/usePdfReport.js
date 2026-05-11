import { useCallback } from "react";

/**
 * Genera y descarga un PDF con el historial completo de un ejercicio.
 */

// ── Paleta ────────────────────────────────────────────────────────────────────
const C = {
  bg: [13, 13, 18], // --bg
  surface: [22, 22, 30], // --bg-light
  border: [40, 40, 55], // --bg-extra-light
  accent: [99, 102, 241], // --secondary (indigo)
  primary: [139, 92, 246], // --primary (purple, barrita KINESIS LAB)
  white: [255, 255, 255],
  gray: [140, 140, 160],
  error: [239, 68, 68],
  success: [34, 197, 94],
  warn: [234, 179, 8],
};

function setFill(doc, color) {
  doc.setFillColor(...color);
}
function setDraw(doc, color) {
  doc.setDrawColor(...color);
}
function setFont(doc, color, size, style = "normal") {
  doc.setTextColor(...color);
  doc.setFontSize(size);
  doc.setFont("helvetica", style);
}

// Rectángulo redondeado relleno
function roundRect(doc, x, y, w, h, r = 3) {
  doc.roundedRect(x, y, w, h, r, r, "F");
}

// Línea horizontal
function hLine(doc, x, y, w, color = C.border) {
  setDraw(doc, color);
  doc.setLineWidth(0.3);
  doc.line(x, y, x + w, y);
}

// Texto truncado a maxW mm
function truncText(doc, text, maxW) {
  const str = String(text ?? "—");
  return doc.splitTextToSize(str, maxW)[0];
}

// Barra de metricas
function drawRangeBar(doc, x, y, w, value, low, high, unit, label) {
  const BAR_H = 3; // altura del track
  const IND_H = 7; // altura del indicador vertical (pill)
  const IND_W = 1.8;

  // Escala igual que el componente React
  const range = high - low || Math.abs(value) * 0.2 || 1;
  const padding = range * 0.5;
  const min = low - padding;
  const max = high + padding;
  const toPct = (v) =>
    Math.max(0, Math.min(100, ((v - min) / (max - min)) * 100));

  const inRange = value >= low && value <= high;
  const indColor = inRange ? C.success : C.error;

  // Label
  setFont(doc, C.gray, 6.5);
  doc.text(label.toUpperCase(), x, y);
  y += 3.5;

  // Track fondo
  setFill(doc, C.border);
  roundRect(doc, x, y, w, BAR_H, 1.5);

  // Zona ideal verde
  const idealLowPct = toPct(low);
  const idealHighPct = toPct(high);
  const idealX = x + (idealLowPct / 100) * w;
  const idealW = (idealHighPct / 100) * w - (idealLowPct / 100) * w;
  setFill(doc, [23, 137, 65]);
  roundRect(doc, idealX, y, Math.max(idealW, 0), BAR_H, 1.5);

  // Indicador vertical centrado en el valor
  const valPct = toPct(value);
  const indX = x + (valPct / 100) * w - IND_W / 2;
  const indY = y - (IND_H - BAR_H) / 2;
  setFill(doc, indColor);
  roundRect(doc, indX, indY, IND_W, IND_H, 1);

  // Min / Max debajo
  const labY = y + BAR_H + 4;
  setFont(doc, C.gray, 5.5);
  doc.text(`${min.toFixed(1)}${unit}`, x, labY);
  doc.text(`${max.toFixed(1)}${unit}`, x + w, labY, { align: "right" });

  return labY + 3;
}

// ScoreRing
function drawScoreRing(doc, cx, cy, r, score) {
  const STROKE = 3;
  const steps = 120;
  const startAngle = -Math.PI / 2;
  const endAngle = startAngle + (2 * Math.PI * score) / 100;

  const color = score >= 80 ? C.success : score >= 60 ? C.warn : C.error;

  // Circulo completo gris
  setDraw(doc, [35, 34, 34]);
  doc.setLineWidth(STROKE);
  doc.circle(cx, cy, r, "S");

  // Arco de progreso
  setDraw(doc, color);
  doc.setLineWidth(STROKE);
  for (let i = 0; i < steps; i++) {
    const t0 = startAngle + (endAngle - startAngle) * (i / steps);
    const t1 = startAngle + (endAngle - startAngle) * ((i + 1) / steps);
    if (t1 > endAngle) break;
    const x0 = cx + r * Math.cos(t0);
    const y0 = cy + r * Math.sin(t0);
    const x1 = cx + r * Math.cos(t1);
    const y1 = cy + r * Math.sin(t1);
    doc.line(x0, y0, x1, y1);
  }

  // Score número
  setFont(doc, color, 13, "bold");
  doc.text(String(score), cx, cy - 1.5, { align: "center" });

  // Etiqueta "SCORE"
  setFont(doc, C.gray, 5.5);
  doc.text("SCORE", cx, cy + 3.5, { align: "center" });
}

// Página de portada
function drawCover(doc, exercise) {
  const { width, height } = doc.internal.pageSize;

  // Fondo
  setFill(doc, C.bg);
  doc.rect(0, 0, width, height, "F");

  // ── Branding KINESIS LAB ──
  const brandY = 20;
  setFill(doc, C.primary);
  doc.rect(14, brandY - 4, 1.5, 10, "F");
  setFont(doc, C.white, 11, "bold");
  doc.text("KINESIS LAB", 18, brandY + 3);

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
  const now = new Date().toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  setFont(doc, C.gray, 8);
  doc.text(now, width / 2, 73, { align: "center" });

  // Métricas globales
  const sessions = exercise.sessions ?? [];
  const avgScore = exercise.avg_score ?? 0;
  const totalReps = sessions.reduce((s, se) => s + se.total_reps, 0);
  const avgROM = sessions.length
    ? (
        sessions.reduce((s, se) => s + se.rom_avg_deg, 0) / sessions.length
      ).toFixed(1)
    : 0;
  const avgFatigue = sessions.length
    ? (sessions.reduce((s, se) => s + se.fatigue, 0) / sessions.length).toFixed(
        1,
      )
    : 0;

  const cards = [
    { label: "Sesiones", value: sessions.length },
    { label: "Score medio", value: avgScore },
    { label: "Reps totales", value: totalReps },
    { label: "ROM medio", value: `${avgROM}°` },
    { label: "Fatiga media", value: `${avgFatigue}%` },
  ];

  const cardW = 32;
  const cardH = 22;
  const gap = 4;
  const totalW = cards.length * cardW + (cards.length - 1) * gap;
  let cx = (width - totalW) / 2;
  const cardY = 90;

  cards.forEach(({ label, value }) => {
    setFill(doc, C.surface);
    roundRect(doc, cx, cardY, cardW, cardH, 4);

    setFont(doc, C.gray, 6.5);
    doc.text(label.toUpperCase(), cx + cardW / 2, cardY + 7, {
      align: "center",
    });

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
    width / 2,
    140,
    { align: "center", maxWidth: width - 60 },
  );

  // Footer
  setFont(doc, C.border, 7);
  doc.text("Generado automáticamente · KINESIS LAB", width / 2, height - 10, {
    align: "center",
  });
}

// Cabecera reutilizable
function drawHeader(doc, exercise, pageNum) {
  const { width } = doc.internal.pageSize;

  setFill(doc, C.bg);
  doc.rect(0, 0, width, 14, "F");

  setFill(doc, C.accent);
  doc.rect(0, 0, width, 1.5, "F");

  // KINESIS LAB con barrita morada
  setFill(doc, C.primary);
  doc.rect(8, 4, 1.2, 7, "F");
  setFont(doc, C.white, 6.5, "bold");
  doc.text("KINESIS LAB", 11.5, 9);

  // Nombre ejercicio (centro)
  setFont(doc, C.gray, 6.5);
  doc.text(exercise.commercial_name.toUpperCase(), width / 2, 9, {
    align: "center",
  });

  setFont(doc, C.gray, 7);
  doc.text(`Pág. ${pageNum}`, width - 14, 9, { align: "right" });

  hLine(doc, 0, 14, width, C.border);
}

// Footer reutilizable
function drawFooter(doc) {
  const { width, height } = doc.internal.pageSize;
  hLine(doc, 0, height - 12, width, C.border);
  setFont(doc, [60, 60, 80], 6.5);
  doc.text("KINESIS LAB · Informe de rendimiento", width / 2, height - 6, {
    align: "center",
  });
}

// Pagina de sesión
function drawSessionPage(doc, exercise, session, idx, pageNum) {
  const { width, height } = doc.internal.pageSize;
  const M = 14; // margen
  const CW = width - M * 2;

  // Fondo
  setFill(doc, C.bg);
  doc.rect(0, 0, width, height, "F");

  drawHeader(doc, exercise, pageNum);

  let y = 20;

  // Titulo
  setFont(doc, C.gray, 7);
  doc.text(`SESIÓN ${idx + 1}`, M, y);
  const dateStr = new Date(session.uploaded_at).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  doc.text(dateStr, width - M, y, { align: "right" });
  y += 5;

  // Tabla de datos
  const BADGE_R = 12;
  drawScoreRing(doc, M + BADGE_R, y + BADGE_R, BADGE_R, session.score);

  const statsX = M + BADGE_R * 2 + 6;
  const stats = [
    ["Reps", session.total_reps],
    ["ROM medio", `${session.rom_avg_deg}°`],
    ["Eficiencia", `${session.efficiency_avg}%`],
    ["Fatiga", `${session.fatigue}%`],
    ["Vel. media", `${session.velocity_avg} °/s`],
    ["Dur. media", `${session.duration_avg} s`],
  ];

  const colW = (CW - BADGE_R * 2 - 6) / 3;
  stats.forEach(([label, value], i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const sx = statsX + col * colW;
    const sy = y + row * 12;

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

  // Barras de rango
  hLine(doc, M, y, CW);
  y += 5;
  setFont(doc, C.white, 7, "bold");
  doc.text("MÉTRICAS VS RANGO IDEAL", M, y);
  y += 5;

  const { thresholds } = exercise;
  y =
    drawRangeBar(
      doc,
      M,
      y,
      CW,
      session.velocity_avg,
      thresholds.velocity.idealLow,
      thresholds.velocity.idealHigh,
      "°/s",
      "Velocidad media",
    ) + 4;
  y =
    drawRangeBar(
      doc,
      M,
      y,
      CW,
      session.rom_avg_deg,
      thresholds.rom.idealLow,
      thresholds.rom.idealHigh,
      "°",
      "ROM medio",
    ) + 4;
  y =
    drawRangeBar(
      doc,
      M,
      y,
      CW,
      session.duration_avg,
      thresholds.duration.idealLow,
      thresholds.duration.idealHigh,
      "s",
      "Duración media",
    ) + 6;

  // Tabla + feedback por rep
  hLine(doc, M, y, CW);
  y += 5;

  // Anchos: tabla 55% | gap 3% | feedback 42%
  const TABLE_W = CW * 0.55;
  const FB_X = M + TABLE_W + CW * 0.03;
  const FB_W = CW - TABLE_W - CW * 0.03;

  // Cabeceras de ambas columnas
  setFont(doc, C.white, 7, "bold");
  doc.text("DETALLE POR REPETICIÓN", M, y);
  doc.text("FEEDBACK POR REP", FB_X, y);
  y += 4;

  const tableStartY = y;

  const cols = [
    { label: "Rep", key: "rep_number", w: 9 },
    { label: "ROM (°)", key: "rom_deg", w: 18 },
    { label: "Vel (°/s)", key: "velocity", w: 18 },
    { label: "Dur (s)", key: "duration", w: 16 },
    { label: "Efic.(%)", key: "efficiency", w: 16 },
  ];

  // Header tabla
  setFill(doc, C.surface);
  doc.rect(M, y, TABLE_W, 6, "F");
  setFont(doc, C.gray, 5.5);
  let cx2 = M + 2;
  cols.forEach(({ label, w }) => {
    doc.text(label, cx2, y + 4);
    cx2 += w;
  });
  y += 6;

  // Filas tabla
  (session.reps_detail ?? []).forEach((rep, ri) => {
    if (ri % 2 === 0) {
      setFill(doc, [18, 18, 26]);
      doc.rect(M, y, TABLE_W, 5.5, "F");
    }
    setFont(doc, C.white, 5.5);
    let rx = M + 2;
    cols.forEach(({ key, w }) => {
      doc.text(truncText(doc, rep[key], w - 2), rx, y + 3.8);
      rx += w;
    });
    y += 5.5;
  });

  const tableEndY = y;

  // Columna derecha: feedback por rep
  const repFeedback = (session.feedback ?? []).filter(
    (f) => f.rep_number !== null,
  );
  const sessionFeedback = (session.feedback ?? []).filter(
    (f) => f.rep_number === null,
  );

  let fy = tableStartY + 6;
  if (repFeedback.length === 0) {
    setFont(doc, C.gray, 5.5);
    doc.text("Sin observaciones por rep", FB_X + 2, fy);
  } else {
    repFeedback.forEach((item) => {
      if (fy > tableEndY + 10) return;
      const color = item.error ? C.error : C.success;
      setFill(doc, color);
      doc.circle(FB_X + 1.5, fy - 0.5, 1.2, "F");
      setFont(doc, C.white, 5.5);
      const lines = doc.splitTextToSize(
        `Rep ${item.rep_number} · ${item.text}`,
        FB_W - 5,
      );
      doc.text(lines[0], FB_X + 4, fy);
      fy += 5;
    });
  }

  y = Math.max(tableEndY, fy) + 4;

  // Feedback de sesión
  if (sessionFeedback.length > 0) {
    hLine(doc, M, y, CW);
    y += 5;
    setFont(doc, C.white, 7, "bold");
    doc.text("FEEDBACK DE SESIÓN", M, y);
    y += 4;

    sessionFeedback.forEach((item) => {
      if (y > height - 20) return;
      const color = item.error ? C.error : C.success;
      setFill(doc, color);
      doc.circle(M + 1.5, y - 0.5, 1.2, "F");
      setFont(doc, C.white, 6);
      doc.text(truncText(doc, item.text, CW - 8), M + 5, y);
      y += 4.5;
    });
  }

  drawFooter(doc);
}

export function usePdfReport() {
  const downloadReport = useCallback(async (exercise) => {
    const { jsPDF } = await import("jspdf");

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Portada
    drawCover(doc, exercise);

    // Una pagina por sesión
    const sessions = [...(exercise.sessions ?? [])].sort(
      (a, b) => new Date(a.uploaded_at) - new Date(b.uploaded_at),
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