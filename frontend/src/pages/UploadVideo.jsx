import { useState } from "react";
import VideoUpload from "../components/upload/VideoUpload";
import RomControl from "../components/upload/RomControl";
import TargetInputs from "../components/upload/TargetInputs";
import ExerciseSelector from "../components/upload/ExerciseSelector";

export default function UploadVideo() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [videoDuration, setVideoDuration] = useState({ h: 0, m: 0, s: 0 });
  const [endTime, setEndTime] = useState({ h: 0, m: 0, s: 0 });

  const [exercise, setExercise] = useState(null);
  const [romMargin, setRomMargin] = useState(0);
  const [targetReps, setTargetReps] = useState(10);
  const [targetSets, setTargetSets] = useState(3);

  const handleAnalyze = () => {
    console.log({
      uploadedFile,
      exercise,
      romMargin,
      targetReps,
      targetSets,
      endTime,
      videoDuration,
    });
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
          setEndTime={setEndTime}
          setVideoDuration={setVideoDuration}
        />

        {/* Exercise Select */}
        <ExerciseSelector value={exercise} onChange={setExercise} />

        {/* Rom Control */}
        <RomControl value={romMargin} onChange={setRomMargin} max={180} />

        {/* Targets */}
        <TargetInputs
          reps={targetReps}
          sets={targetSets}
          setReps={setTargetReps}
          setSets={setTargetSets}
        />

        {/* Botón analizar */}
        <button
          onClick={handleAnalyze}
          className="w-full bg-(--secondary) text-white py-4 rounded-xl
          text-[12px] font-bold tracking-[0.2em] uppercase transition-all duration-200 hover:opacity-90 active:scale-[0.98]
          "
        >
          Analizar Ejercicio
        </button>
      </div>
    </div>
  );
}
