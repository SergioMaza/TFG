from my_libs.rep_tracker import RepTracker
from my_libs.biomechanics import calculate_angle
from ejercicios.exercise_interface import BaseExercise
from ejercicios.registry import register


@register
class LateralRises(BaseExercise):
    name = "lateral_rises"
    inverted = True
    angle_extended = 30
    angle_flexed = 80

    # Perfil izq
    landmarks_left = [23, 11, 13, 15]
    connections_left = [(23, 11), (11, 13), (13, 15)]

    # Perfil der
    landmarks_right = [24, 12, 14, 16]
    connections_right = [(24, 12), (12, 14), (14, 16)]

    def __init__(self):
        super().__init__()
        self.tracker = RepTracker(
            angle_extended=self.normalize_angle(self.angle_extended),
            angle_flexed=self.normalize_angle(self.angle_flexed),
        )
        self._wrist_exceeded = False

    def compute_metrics(self, lm, w, h):
        lm1 = self.get_xy(lm, w, h, self.landmarks[0])
        lm2 = self.get_xy(lm, w, h, self.landmarks[1])
        lm3 = self.get_xy(lm, w, h, self.landmarks[2])
        angle = calculate_angle(lm1, lm2, lm3)

        # Calcular wrist_above_elbow
        elbow_y = lm[self.landmarks[2]].y
        wrist_y = lm[self.landmarks[3]].y
        margin = 0.08

        if wrist_y < (elbow_y - margin):
            self._wrist_exceeded = True

        return {
            "main_angle": self.normalize_angle(angle),
            "wrist_exceeded": self._wrist_exceeded,
        }

    def generate_rep_feedback(self, rep, metrics: dict):
        if metrics.get("wrist_exceeded", False):
            self._rep_feedback.append(
                {
                    "rep_number": rep.rep_number,
                    "text": "La muñeca está subiendo demasiado por encima del codo",
                    "error": True,
                }
            )
        self._wrist_exceeded = False

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
                    "text": "Tendencia a elevar excesivamente la muñeca en varias repeticiones",
                    "error": True,
                }
            )

        return feedback
