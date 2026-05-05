import cv2
import os, tempfile, subprocess
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
from supabase import create_client

from ejercicios.registry import get_exercise
from my_libs.report import generate_session_summary

MODEL_PATH = os.environ.get("MODEL_PATH")

# Supabase Keys
STORAGE_BUCKET_NAME = os.environ.get("STORAGE_BUCKET_NAME")
SUPABASE_PUBLIC_URL = os.environ.get("SUPABASE_PUBLIC_URL")
SUPABASE_SECRET_KEY = os.environ.get("SUPABASE_SECRET_KEY")

supabase = create_client(SUPABASE_PUBLIC_URL, SUPABASE_SECRET_KEY)


# Funcion para recodificara de mp4v (Formato de OpenCV) a H.264 (Formato para poder mostrar el video)
def remux_to_h264(input_path: str, output_path: str):
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i",
            input_path,
            "-vcodec",
            "libx264",
            "-crf",
            "23",
            "-preset",
            "fast",
            "-movflags",
            "+faststart",
            output_path,
        ],
        check=True,
        capture_output=True,
    )


def process_video(
    user_id: str,
    session_id: str,
    upload_path: str,
    exercise_name: str,
    rom_ideal_low: float,
    rom_ideal_high: float,
) -> dict:
    """
    Descarga el video 'upload' desde Storage
    Procesa un vídeo completo
    Devuelve un json con el analisis y la url del video 'processed'
    """

    # Obtener la url de processed
    processed_path = f"processed/user_{user_id}/session_{session_id}.mp4"

    # Obtener el objeto 'ejercicio' del registry
    exercise = get_exercise(exercise_name)

    # Cargar el modelo
    base_options = python.BaseOptions(model_asset_path=MODEL_PATH)
    options = vision.PoseLandmarkerOptions(
        base_options=base_options, running_mode=vision.RunningMode.VIDEO
    )

    with tempfile.TemporaryDirectory() as tmp_dir:
        # TODO: Abstraer logica en congif_IO() -> cap, out
        input_path = os.path.join(tmp_dir, "input.mp4")
        raw_path = os.path.join(tmp_dir, "raw.mp4")  # mp4v de OpenCV
        output_path = os.path.join(tmp_dir, "processed.mp4")  # H.264 final

        # Descargar vídeo raw desde Storage
        video_bytes = supabase.storage.from_(STORAGE_BUCKET_NAME).download(upload_path)
        with open(input_path, "wb") as f:
            f.write(video_bytes)

        # Config del input del video
        cap = cv2.VideoCapture(input_path)
        if not cap.isOpened():
            raise ValueError(f"No se puede abrir el vídeo: {input_path}")

        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = cap.get(cv2.CAP_PROP_FPS)

        # Config del output del video
        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        out = cv2.VideoWriter(raw_path, fourcc, fps, (width, height))

        # Procesamiento del video
        with vision.PoseLandmarker.create_from_options(options) as landmarker:
            timestamp_ms = 0
            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break
                timestamp_ms += int(1000 / fps)
                rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
                result = landmarker.detect_for_video(mp_image, timestamp_ms)

                if result.pose_landmarks:
                    landmarks = result.pose_landmarks[0]
                    result_data = exercise.analyze(landmarks, width, height, fps)
                    exercise.draw(cv2, frame, result_data, landmarks, width, height)

                out.write(frame)
        cap.release()
        out.release()

        # Recodificar a H.264 con ffmpeg
        remux_to_h264(raw_path, output_path)

        # Subir vídeo a Storage
        with open(output_path, "rb") as f:
            supabase.storage.from_(STORAGE_BUCKET_NAME).upload(
                processed_path, f, {"content-type": "video/mp4"}
            )

    # Construir Resultado
    session = generate_session_summary(
        exercise_name=exercise_name,
        reps=exercise.tracker.reps,
        rom_ideal_low=rom_ideal_low,
        rom_ideal_high=rom_ideal_high,
        processed_path=processed_path,
    )

    feedback = exercise.generate_feedback(session, rom_ideal_low, rom_ideal_high)

    # Devuelve un json unificado con session y feedback
    return {**session, "feedback": feedback}
