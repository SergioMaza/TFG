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

# ── Configurar MediaPipe ───────────────────────────────────────────────────────
base_options = python.BaseOptions(model_asset_path=MODEL_PATH)
options = vision.PoseLandmarkerOptions(
    base_options=base_options,
    running_mode=vision.RunningMode.VIDEO
)
landmarker = vision.PoseLandmarker.create_from_options(options)
timestamp_ms = 0

@app.route("/ping", methods=["GET"])
def ping():
    return jsonify({"message": "pong"}), 200
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