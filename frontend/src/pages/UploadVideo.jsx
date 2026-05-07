import { useState } from "react";
import VideoUpload from "../components/upload/VideoUpload";
import TargetInputs from "../components/upload/TargetInputs";
import ExerciseSelector from "../components/upload/ExerciseSelector";
import { useUploadVideo } from "../hooks/useUploadVideo";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../config/routes";
import { useAppProvider } from "../hooks/useAppProvider";
import SideSelector from "../components/upload/SideSelector";

export default function UploadVideo() {
  const navigate = useNavigate();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [exercise, setExercise] = useState(null);
  const [side, setSide] = useState("right");

  const { analyze, loading, error } = useUploadVideo();
  const { userId, fetchSessions } = useAppProvider();

  const handleAnalyze = async () => {
    if (!uploadedFile || !exercise) return;

    try {
      const result = await analyze({
        file: uploadedFile,
        exercise: exercise,
        userId: userId,
        side: side,
      });
      await fetchSessions();
      navigate(ROUTES.results.replace(":id", result.session_id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 space-y-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-1">
        {/* Title */}
        <div className="space-y-4 max-w-2xl">
          <h2 className="text-5xl font-black tracking-tighter">
            Sube tu vídeo
          </h2>

          <p className="text-(--gray) text-lg leading-relaxed">
            Sube tu video de entrenamiento y configura los parámetros para tu
            evaluación biomecánica.
          </p>
        </div>
      </div>

      {/* Formulario de análisis */}
      <div className="flex flex-col justify-center w-full max-w-180 mx-auto space-y-6">
        {/* Video Upload */}
        <VideoUpload
          uploadedFile={uploadedFile}
          setUploadedFile={setUploadedFile}
        />

        {/* Exercise Select */}
        <ExerciseSelector value={exercise} onChange={setExercise} />

        {/* Side Selector */}
        <SideSelector value={side} onChange={setSide} />

        {error && <p className="text-(--error) text-sm text-center">{error}</p>}

        {/* Botón analizar */}
        <button
          onClick={handleAnalyze}
          disabled={!uploadedFile || !exercise || loading}
          className="w-full bg-(--secondary) text-white py-4 rounded-xl
          text-[12px] font-bold tracking-[0.2em] uppercase transition-all duration-200 hover:opacity-90 active:scale-[0.98]
          disabled:opacity-40 disabled:cursor-not-allowed
          "
        >
          {loading ? "Analizando..." : "Analizar Ejercicio"}
        </button>
      </div>
    </div>
  );
}
