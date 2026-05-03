from flask import Flask, jsonify, request
from worker import process_video

app = Flask(__name__)


@app.route("/ping", methods=["GET"])
def ping():
    return jsonify({"message": "pong"}), 200


@app.route("/analysis", methods=["POST"])
def process():
    data = request.json
    user_id = data["user_id"]
    session_id = data["session_id"]
    upload_path = data["upload_path"]
    exercise_name = data["exercise_name"]
    rom_ideal_low = data["rom_ideal_low"]
    rom_ideal_high = data["rom_ideal_high"]

    result = process_video(
        user_id, session_id, upload_path, exercise_name, rom_ideal_low, rom_ideal_high
    )

    return jsonify(result)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
