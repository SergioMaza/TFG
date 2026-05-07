from my_libs.rep_tracker import RepTracker
from my_libs.biomechanics import calculate_angle, calculate_torso_lean
from ejercicios.exercise_interface import BaseExercise
from ejercicios.registry import register


@register
class BicepsCurl(BaseExercise):
    name = "biceps_curl"
    
    # Perfil izq
    landmarks_left = [11, 13, 15]
    connections_left = [(11, 13), (13, 15)]
    
    # Perfil der
    landmarks_right = [12, 14, 16]
    connections_right = [(12, 14), (14, 16)]

    def __init__(self):
        super().__init__()
        self.tracker = RepTracker(angle_extended=160, angle_flexed=50)

    def compute_metrics(self, lm, w, h):
        shoulder = self.get_xy(lm, w, h, self.landmarks[0])
        elbow = self.get_xy(lm, w, h, self.landmarks[1])
        wrist = self.get_xy(lm, w, h, self.landmarks[2])

        return {
            "main_angle": calculate_angle(shoulder, elbow, wrist),
            # "torso_lean": calculate_torso_lean(lm, w, h),
        }

    def generate_feedback(
        self,
        session: dict,
        rom_ideal_low: float,
        rom_ideal_high: float,
    ) -> list[dict]:
        feedback = super().generate_feedback(session, rom_ideal_low, rom_ideal_high)
        return feedback
