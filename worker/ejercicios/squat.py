from my_libs.rep_tracker import RepTracker
from ejercicios.registry import register
from my_libs.biomechanics import calculate_angle, calculate_torso_lean
from ejercicios.exercise_interface import BaseExercise


@register
class Squat(BaseExercise):
    name = "squat"
    inverted = False
    angle_extended = 170
    angle_flexed = 120

    # Perfil izq
    landmarks_left = [24, 26, 28, 12]
    connections_left = [(24, 26), (26, 28), (12, 24)]

    # Perfil der
    landmarks_right = [23, 25, 27, 11]
    connections_right = [(23, 25), (25, 27), (11, 23)]

    def __init__(self):
        super().__init__()
        self.tracker = RepTracker(
            angle_extended=self.normalize_angle(self.angle_extended),
            angle_flexed=self.normalize_angle(self.angle_flexed),
        )
        self._peak_torso = 0.0

    def compute_metrics(self, lm, w, h):
        lm1 = self.get_xy(lm, w, h, self.landmarks[0])
        lm2 = self.get_xy(lm, w, h, self.landmarks[1])
        lm3 = self.get_xy(lm, w, h, self.landmarks[2])
        angle = calculate_angle(lm1, lm2, lm3)
        
        torso = calculate_torso_lean(lm, w, h)
        if torso > self._peak_torso:
            self._peak_torso = torso

        return {
            "main_angle": self.normalize_angle(angle),
            "peak_torso": self._peak_torso,
        }

    def generate_rep_feedback(self, rep, metrics: dict):
        if metrics.get("peak_torso", 0) > 40:
            self._rep_feedback.append({
                "rep_number": rep.rep_number,
                "text": "Inclinas el torso demasiado hacia adelante",
                "error": True,
            })
        self._peak_torso = 0.0
        
    def generate_feedback(
        self,
        session: dict,
        rom_ideal_low: float,
        rom_ideal_high: float,
    ) -> list[dict]:
        # Feedback del padre
        feedback = super().generate_feedback(session, rom_ideal_low, rom_ideal_high)

        if len(self._rep_feedback) > 0:
            feedback.append(
                {
                    "rep_number": None,
                    "text": "Tendencia recurrente a inclinar excesivamente el torso",
                    "error": True,
                }
            )

        return feedback
