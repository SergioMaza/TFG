import { useState, useEffect } from "react";

const VITE_API_URL = import.meta.env.VITE_API_URL;

export function useUploadVideo() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exercises, setExercises] = useState([]);

  const analyze = async ({ file, exercise, userId }) => {
    setLoading(true);
    setError(null);

    try {
      // Pedir signed URL a la API
      const uploadRes = await fetch(`${VITE_API_URL}/api/get-storage-info`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
      if (!uploadRes.ok) throw new Error("Error obteniendo URL de subida");
      const { session_id, signed_url, upload_path } = await uploadRes.json();

      // Subir vídeo al Storage con la signed URL
      const putRes = await fetch(signed_url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": "video/mp4" },
      });
      if (!putRes.ok) throw new Error("Error subiendo el vídeo");

      // Llamar al análisis
      const analysisRes = await fetch(`${VITE_API_URL}/api/analysis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          session_id: session_id,
          upload_path: upload_path,
          exercise_name: exercise.name,
        }),
      });
      if (!analysisRes.ok) throw new Error("Error en el análisis");

      const data = await analysisRes.json();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${VITE_API_URL}/api/get-exercise-catalog`);
        if (!res.ok) throw new Error("Error obteniendo ejercicios");

        const data = await res.json();

        const formatted = data.titles.map((t) => ({ name: t }));
        setExercises(formatted);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, []);

  return { exercises, analyze, loading, error };
}
