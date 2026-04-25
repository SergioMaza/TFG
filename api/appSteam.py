import cv2
import numpy as np
import base64
import urllib.request
import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_sock import Sock
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

app = Flask(__name__)
CORS(app)
sock = Sock(app)

# ── Descargar modelo si no existe ──────────────────────────────────────────────
MODEL_PATH = "pose_landmarker.task"
MODEL_URL = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task"

if not os.path.exists(MODEL_PATH):
    print("Descargando modelo MediaPipe...")
    urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)
    print("Modelo descargado.")

# ── Conexiones del esqueleto (33 landmarks) ────────────────────────────────────
POSE_CONNECTIONS = [
    (0, 1), (1, 2), (2, 3), (3, 7),
    (0, 4), (4, 5), (5, 6), (6, 8),
    (9, 10),
    (11, 12),
    (11, 13), (13, 15), (15, 17), (15, 19), (15, 21), (17, 19),
    (12, 14), (14, 16), (16, 18), (16, 20), (16, 22), (18, 20),
    (11, 23), (12, 24), (23, 24),
    (23, 25), (25, 27), (27, 29), (27, 31), (29, 31),
    (24, 26), (26, 28), (28, 30), (28, 32), (30, 32),
]

# ── Configurar MediaPipe ───────────────────────────────────────────────────────
base_options = python.BaseOptions(model_asset_path=MODEL_PATH)
options = vision.PoseLandmarkerOptions(
    base_options=base_options,
    running_mode=vision.RunningMode.VIDEO
)
landmarker = vision.PoseLandmarker.create_from_options(options)
timestamp_ms = 0


def draw_pose(frame, result):
    if not result.pose_landmarks:
        return frame

    h, w, _ = frame.shape
    landmarks = result.pose_landmarks[0]
    points = [(int(lm.x * w), int(lm.y * h)) for lm in landmarks]

    # Líneas del esqueleto
    for start_idx, end_idx in POSE_CONNECTIONS:
        cv2.line(frame, points[start_idx], points[end_idx], (255, 255, 255), 2)

    # Puntos de los landmarks
    for pt in points:
        cv2.circle(frame, pt, 5, (0, 255, 128), -1)

    return frame


@app.route("/ping", methods=["GET"])
def ping():
    return jsonify({"message": "pong"}), 200

# ! ENDPOINT DE TIEMPO REAL
@sock.route("/ws/pose")
def pose_ws(ws):
    global timestamp_ms
    print("Cliente conectado al WebSocket")

    while True:
        try:
            data = ws.receive()
            if data is None:
                break

            # Decodificar imagen base64 enviada desde el frontend
            header, encoded = data.split(",", 1)
            img_bytes = base64.b64decode(encoded)
            np_arr = np.frombuffer(img_bytes, np.uint8)
            frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

            if frame is None:
                continue

            # Procesar con MediaPipe
            timestamp_ms += 33
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
            result = landmarker.detect_for_video(mp_image, timestamp_ms)

            # Dibujar pose sobre el frame
            frame = draw_pose(frame, result)

            # Devolver frame anotado como base64
            _, buffer = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
            encoded_result = base64.b64encode(buffer).decode("utf-8")
            ws.send(f"data:image/jpeg;base64,{encoded_result}")

        except Exception as e:
            print(f"Error en WebSocket: {e}")
            break

    print("Cliente desconectado")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)