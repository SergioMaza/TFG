from my_libs.rep_tracker import RepTracker
from ejercicios.registry import register
from my_libs.biomechanics import calculate_angle, calculate_torso_lean
from ejercicios.exercise_interface import BaseExercise


@register
class Squat(BaseExercise):
    name = "squat"
    landmarks = [23, 25, 27]
    connections = [(23, 25), (25, 27)]

    def __init__(self):
        super().__init__()
        self.tracker = RepTracker(angle_extended=170, angle_flexed=50)

    def compute_metrics(self, lm, w, h):
        hip = self.get_xy(lm, w, h, 23)
        knee = self.get_xy(lm, w, h, 25)
        ankle = self.get_xy(lm, w, h, 27)

        return {
            "main_angle": calculate_angle(hip, knee, ankle),
            "torso_lean": calculate_torso_lean(lm, w, h),
        }

    def generate_feedback(self, session: dict, reps: list) -> list[dict]:
        feedback = super().generate_feedback(session, reps)

        if session.get("avg_torso_lean", 0) > 20:
            feedback.append({
                "rep_number": None,
                "text": "Inclinas el torso hacia adelante — trabaja movilidad de tobillo",
                "error": True
            })

        return feedback
