from flask import Flask, jsonify, request
from worker import process_video

app = Flask(__name__)


@app.route("/ping", methods=["GET"])
def ping():
    return jsonify({"message": "pong"}), 200


@app.route("/analysis", methods=["POST"])
def process():
    data = request.json
    video_path = data["video_path"]
    exercise_name = data["exercise_name"]
    rom_ideal_low = data["rom_ideal_low"]
    rom_ideal_high = data["rom_ideal_high"]
    

    session = process_video(video_path, exercise_name, rom_ideal_low, rom_ideal_high)

    return jsonify({"session": session})

#! DEGUB EXAMPLE 
@app.route("/analysis_test")
def process_test():
    video_path = "./videos/Squad_1.mp4"
    exercise_name = "squat"
    rom_ideal_low = 60
    rom_ideal_high = 150

    session = process_video(video_path, exercise_name, rom_ideal_low, rom_ideal_high)

    return jsonify({"session": session})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
