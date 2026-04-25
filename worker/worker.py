import cv2
import os
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

from ejercicios.registry import get_exercise
from my_libs.report import generate_session_summary

MODEL_PATH = os.environ.get("MODEL_PATH")


def process_video(video_path: str, exercise_name: str, rom_ideal_low: float, rom_ideal_high: float, video_url: str = "" ) -> dict:
    """
    Procesa un vídeo completo y devuelve un json con el resultado
    """

    # Obtener el objeto 'ejercicio' del registry
    exercise = get_exercise(exercise_name)

    # Cargar el modelo
    base_options = python.BaseOptions(model_asset_path=MODEL_PATH)
    options = vision.PoseLandmarkerOptions(
        base_options=base_options, running_mode=vision.RunningMode.VIDEO
    )

    # Config del input del video
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError(f"No se puede abrir el vídeo: {video_path}")

    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS)

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
                # draw omitido en producción — solo para debug local
    cap.release()

    # Resultado
    return generate_session_summary(
        exercise_name=exercise_name,
        reps=exercise.tracker.reps,
        rom_ideal_low = rom_ideal_low,
        rom_ideal_high = rom_ideal_high,
        video_url=video_url,
    )
