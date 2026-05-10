from flask import Flask, jsonify, request
import os, requests
from supabase import create_client
from flask_cors import CORS
from db import upload_session_to_db, get_all_sessions_full
from auxiliar import build_dashboard_response

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

# Supabase keys
STORAGE_BUCKET_NAME = os.environ.get("STORAGE_BUCKET_NAME")
SUPABASE_PUBLIC_URL = os.getenv("SUPABASE_PUBLIC_URL")
SUPABASE_SECRET_KEY = os.getenv("SUPABASE_SECRET_KEY")
supabase = create_client(SUPABASE_PUBLIC_URL, SUPABASE_SECRET_KEY)

WORKER_URL = os.environ.get("WORKER_URL")


@app.route("/ping", methods=["GET"])
def ping():
    return jsonify({"message": "pong"}), 200


@app.route("/api/get-storage-info", methods=["POST"])
def get_storage_info():
    data = request.json
    user_id = data.get("user_id")
    session_id = str(__import__("uuid").uuid4())

    upload_path = f"upload/user_{user_id}/session_{session_id}.mp4"

    # Generar signed URL para que el frontend suba el video al Storage
    response = supabase.storage.from_(STORAGE_BUCKET_NAME).create_signed_upload_url(
        upload_path
    )

    return (
        jsonify(
            {
                "session_id": session_id,
                "signed_url": response["signed_url"],
                "upload_path": upload_path,
            }
        ),
        200,
    )


@app.route("/api/analysis", methods=["POST"])
def analysis():
    data = request.json
    user_id = data.get("user_id")
    session_id = data.get("session_id")
    upload_path = data.get("upload_path")
    exercise_name = data.get("exercise_name")
    side = data.get("side")

    if not all([user_id, session_id, exercise_name, upload_path, side]):
        return jsonify({"error": "Faltan campos obligatorios"}), 400

    # Obtener configuración del ejercicio desde DB
    response = (
        supabase.table("exercises_catalog")
        .select("rom_ideal_low, rom_ideal_high")
        .eq("title", exercise_name)
        .single()
        .execute()
    )

    if not response.data:
        return jsonify({"error": f"Ejercicio '{exercise_name}' no encontrado"}), 404

    config = response.data

    # Llamar al worker
    try:
        worker_response = requests.post(
            f"{WORKER_URL}/analysis",
            json={
                "user_id": user_id,
                "session_id": session_id,
                "exercise_name": exercise_name,
                "upload_path": upload_path,
                "side": side,
                "rom_ideal_low": config["rom_ideal_low"],
                "rom_ideal_high": config["rom_ideal_high"],
            },
            timeout=3000,
        )
        
        # Lanza excepcion si hay codigo de error HTTP
        worker_response.raise_for_status() 
        
    except requests.exceptions.Timeout:
        return jsonify({"error": "El worker tardó demasiado"}), 504
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Error llamando al worker: {str(e)}"}), 502

    result = worker_response.json()
    
    # Guardar resultado en DB
    upload_session_to_db(supabase, session_id, user_id, exercise_name, result)
    print("Session guardada en DB")
    return jsonify({"session_id": session_id}), 201

@app.route("/api/get-sessions", methods=["GET"])
def get_sessions():
    user_id = request.args.get("user_id")

    if not user_id:
        return jsonify({"error": "user_id requerido"}), 400

    exercises = get_all_sessions_full(supabase, user_id)
    return jsonify(build_dashboard_response(exercises)), 200

@app.route("/api/get-signed-url-video", methods=["GET"])
def get_video_url():
    video_path = request.args.get("path")
    if not video_path:
        return jsonify({"error": "path requerido"}), 400
    
    response = supabase.storage.from_(STORAGE_BUCKET_NAME).create_signed_url(
        video_path, 3600
    )
    return jsonify({"url": response["signedURL"]}), 200

@app.route("/api/get-exercise-catalog", methods=["GET"])
def get_exercise_titles():
    try:
        response = (
            supabase.table("exercises_catalog")
            .select("title, img, guide_url, commercial_name")
            .execute()
        )

        exercises = [
            {
                "title": item["title"],
                "commercial_name": item["commercial_name"],
                "img": item["img"],
                "guide_url": item["guide_url"]
            }
            for item in response.data
        ]

        return jsonify({"exercises": exercises}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
