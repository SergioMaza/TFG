import { useEffect, useRef, useState, useCallback } from "react";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:5000/ws/pose"; // Protocolo de comunicacion de websockets
const FPS = 15;

export default function RealTime() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const wsRef = useRef(null);
  const intervalRef = useRef(null);
  const waitingRef = useRef(false);
  const fpsCountRef = useRef(0);
  const fpsTimerRef = useRef(null);

  const [status, setStatus] = useState("idle"); // idle | connecting | active | error
  const [fps, setFps] = useState(0);

  const stopCamera = useCallback(() => {
    clearInterval(intervalRef.current);
    clearInterval(fpsTimerRef.current);
    wsRef.current?.close();
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setStatus("idle");
    setFps(0);
  }, []);

  const startCamera = useCallback(async () => {
    setStatus("connecting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus("active");

        fpsTimerRef.current = setInterval(() => {
          setFps(fpsCountRef.current);
          fpsCountRef.current = 0;
        }, 1000);

        intervalRef.current = setInterval(() => {
          if (ws.readyState !== WebSocket.OPEN || waitingRef.current) return;
          const video = videoRef.current;
          if (!video || !video.videoWidth) return;

          const tmp = document.createElement("canvas");
          tmp.width = video.videoWidth;
          tmp.height = video.videoHeight;
          tmp.getContext("2d").drawImage(video, 0, 0);
          ws.send(tmp.toDataURL("image/jpeg", 0.7));
          waitingRef.current = true;
        }, 1000 / FPS);
      };

      ws.onmessage = (e) => {
        waitingRef.current = false;
        fpsCountRef.current++;
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          canvas.width = img.width;
          canvas.height = img.height;
          canvas.getContext("2d").drawImage(img, 0, 0);
        };
        img.src = e.data;
      };

      ws.onerror = () => setStatus("error");
      ws.onclose = () => setStatus((s) => (s === "active" ? "idle" : s));
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const statusMap = {
    idle:       { label: "Cámara apagada",    dotClass: "bg-slate-500" },
    connecting: { label: "Conectando...",      dotClass: "bg-amber-400 animate-pulse" },
    active:     { label: "En vivo",            dotClass: "bg-emerald-400 animate-pulse" },
    error:      { label: "Error de conexión",  dotClass: "bg-red-500" },
  };
  const { label, dotClass } = statusMap[status];

  return (
    <div className="min-h-screen bg-[#030712] flex flex-col items-center px-4 py-8 gap-5">

      {/* Header */}
      <div className="w-full max-w-4xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 text-2xl">◈</span>
            <span className="text-white text-xl font-mono font-bold tracking-widest">PoseAI</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-md px-3 py-1">
            <span className={`w-2 h-2 rounded-full ${dotClass}`} />
            <span className="text-slate-300 text-xs font-mono">{label}</span>
          </div>
        </div>

        {status === "active" && (
          <div className="text-emerald-400 text-xs font-mono bg-emerald-950 border border-emerald-900 rounded-md px-3 py-1">
            {fps} FPS
          </div>
        )}
      </div>

      {/* Viewport */}
      <div className="w-full max-w-4xl aspect-video bg-slate-950 border border-slate-800 rounded-xl relative overflow-hidden flex items-center justify-center">
        <video ref={videoRef} className="hidden" playsInline muted />
        <canvas ref={canvasRef} className="w-full h-full object-contain" />

        {status === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <span className="text-slate-800 text-6xl">◈</span>
            <p className="text-slate-500 text-sm">Activa la cámara para comenzar</p>
          </div>
        )}

        {status === "connecting" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-slate-700 border-t-emerald-400 animate-spin" />
            <p className="text-slate-500 text-sm">Iniciando...</p>
          </div>
        )}

        {status === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <span className="text-4xl">⚠️</span>
            <p className="text-slate-400 text-sm">No se pudo conectar al servidor</p>
            <p className="text-slate-600 text-xs">Asegúrate de que el backend está corriendo</p>
          </div>
        )}

        {/* Esquinas decorativas */}
        <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-emerald-500 rounded-tl pointer-events-none" />
        <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-emerald-500 rounded-tr pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-emerald-500 rounded-bl pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-emerald-500 rounded-br pointer-events-none" />
      </div>

      {/* Controles */}
      <div className="flex gap-3">
        {status === "idle" || status === "error" ? (
          <button
            onClick={startCamera}
            className="bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-white font-mono text-sm tracking-widest px-8 py-3 rounded-lg transition-colors cursor-pointer"
          >
            ▶ ACTIVAR CÁMARA
          </button>
        ) : (
          <button
            onClick={stopCamera}
            className="bg-transparent hover:bg-red-950 text-red-500 font-mono text-sm tracking-widest px-8 py-3 rounded-lg border border-red-500 transition-colors cursor-pointer"
          >
            ■ DETENER
          </button>
        )}
      </div>

      {/* Info tags */}
      <div className="flex gap-2 flex-wrap justify-center">
        {["MediaPipe 0.10.32", "Pose Landmarker Lite", "33 landmarks"].map((tag) => (
          <span key={tag} className="text-slate-500 text-xs font-mono bg-slate-900 border border-slate-800 rounded px-2 py-1">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}