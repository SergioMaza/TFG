from my_libs.rep_tracker import RepTracker
from ejercicios.registry import register
from my_libs.biomechanics import calculate_angle, calculate_torso_lean
from ejercicios.exercise_interface import BaseExercise


@register
class Squat(BaseExercise):
    name = "squat"
    landmarks = [23, 25, 27, 11]
    connections = [(23, 25), (25, 27), (11, 23)]

    def __init__(self):
        super().__init__()
        self.tracker = RepTracker(angle_extended=170, angle_flexed=100)

        # Guarda los angulos del torso, para no tener que persistirlos en bbdd, solo hacen falta para calcular el feedback.
        self._torso_leans = []

    def compute_metrics(self, lm, w, h):
        hip = self.get_xy(lm, w, h, 23)
        knee = self.get_xy(lm, w, h, 25)
        ankle = self.get_xy(lm, w, h, 27)

        torso = calculate_torso_lean(lm, w, h)
        self._torso_leans.append(torso)

        return {
            "main_angle": calculate_angle(hip, knee, ankle),
            "torso_lean": torso,
        }

    def generate_feedback(
        self,
        session: dict,
        rom_ideal_low: float,
        rom_ideal_high: float,
    ) -> list[dict]:
        print("generate_feedback - Funcion llamada")
        feedback = super().generate_feedback(session, rom_ideal_low, rom_ideal_high)
        if self._torso_leans:
            peak_torso = max(self._torso_leans)
            print("generate_feedback - peak_torso: ", peak_torso)
            if peak_torso > 40:
                feedback.append(
                    {
                        "rep_number": None,
                        "text": "Inclinas el torso demasiado hacia adelante",
                        "error": True,
                    }
                )
        print("generate_feedback - feedback final: ", feedback)
        return feedback
