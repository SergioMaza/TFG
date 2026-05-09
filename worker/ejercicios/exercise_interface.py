"""
Define la interfaz que los ejercicios implementan:

Atributos:
- name: Identificador del ejericio
- landmarks: Puntos clave del ejercicio
- connections: Conexiones entre los puntos clave

Metodos:
- analyze: Funcion que define cada ejercicio donde se establecen las metricas y el fedback

"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from my_libs.draw import draw_connections, draw_keypoints, draw_angle, draw_reps


@dataclass
class ExerciseResult:
    rep_count: int = 0
    reps: list = field(default_factory=list)
    metrics: dict = field(default_factory=dict)


class BaseExercise(ABC):

    name: str
    inverted: bool # pull=True | push=False
    angle_extended: int
    angle_flexed: int
    
    # Perfil izq
    landmarks_left: list[int] = []
    connections_left: list[tuple] = []
    
    # Perfil der
    landmarks_right: list[int] = []
    connections_right: list[tuple] = []

    # Resueltos dinámicamente por set_side()
    landmarks: list[int] = []
    connections: list[tuple] = []

    def __init__(self):
        self.tracker = None
        self._side: str | None = None  # "left" | "right" | None
        self._rep_feedback: list[dict] = [] # Guarda el feedback de cada rep

    @abstractmethod
    def compute_metrics(self, lm, w, h) -> dict:
        pass
    
    # Genera el feedback de la sesion
    def generate_feedback(
        self, session: dict, rom_ideal_low: float, rom_ideal_high: float
    ) -> list[dict]:
        feedback = list(self._rep_feedback)

        # Feedback por repe
        for rep in session["reps_detail"]:
            if rep["rom_deg"] < rom_ideal_low:
                feedback.append(
                    {
                        "rep_number": rep["rep_number"],
                        "text": "Rango de movimiento incompleto",
                        "error": True,
                    }
                )
            elif rep["rom_deg"] > rom_ideal_high:
                feedback.append(
                    {
                        "rep_number": rep["rep_number"],
                        "text": "Rango de movimiento excesivo",
                        "error": True,
                    }
                )

        # Feedback por session
        if session["fatigue"] > 40:
            feedback.append(
                {
                    "rep_number": None,
                    "text": "Caída de velocidad notable hacia el final de la serie",
                    "error": True,
                }
            )
        elif session["fatigue"] < 15:
            feedback.append(
                {
                    "rep_number": None,
                    "text": "Velocidad consistente a lo largo de toda la serie",
                    "error": False,
                }
            )

        if session["rom_avg_deg"] < rom_ideal_low:
            feedback.append(
                {
                    "rep_number": rep["rep_number"],
                    "text": "Rango de movimiento demasiado bajo",
                    "error": True,
                }
            )
        elif session["rom_avg_deg"] > rom_ideal_high:
            feedback.append(
                {
                    "rep_number": rep["rep_number"],
                    "text": "Rango de movimiento demasiado alto",
                    "error": True,
                }
            )

        return feedback

    # Genera el feedback de cada rep
    def generate_rep_feedback(self, rep, metrics: dict):
        pass

    # Resuelve landmarks y connections según el lado detectado
    def set_side(self, side: str):
        if side not in ("left", "right"):
            raise ValueError(f"side debe ser 'left' o 'right', recibido: {side!r}")

        self._side = side

        if side == "right":
            self.landmarks = list(self.landmarks_right)
            self.connections = list(self.connections_right)
        else:
            self.landmarks = list(self.landmarks_left)
            self.connections = list(self.connections_left)

    # Pipeline de procesamiento de cada ejercicio
    def analyze(self, lm, w: int, h: int, fps: float) -> ExerciseResult:
        metrics = self.compute_metrics(lm, w, h)
        
        rep_count_before = self.tracker.rep_count
        self.update_tracker(metrics, fps)
        
        # Detecta cuando se ha terminado una rep
        if self.tracker.rep_count > rep_count_before:
            last_rep = self.tracker.reps[-1]
            self.generate_rep_feedback(last_rep, metrics)
        
        return self.build_result(metrics)

    # Helper para recoger posiciones de los landmarks
    def get_xy(self, lm, w, h, idx):
        return [lm[idx].x * w, lm[idx].y * h]
    
    # Helper para calcular el angulo en funcion del ejercicio (pull/push)
    def normalize_angle(self, angle: float) -> float:
        return 180 - angle if self.inverted else angle

    # Actualizar tracker (Por defecto: primer angulo como referencia)
    def update_tracker(self, metrics, fps):
        main_angle = metrics["main_angle"]
        self.tracker.update(main_angle, fps)

    # Dibuja la visualización por defecto.
    def draw(self, cv2, frame, result_data: ExerciseResult, landmarks, w, h):
        draw_connections(cv2, frame, self.connections, landmarks, w, h)
        draw_keypoints(cv2, frame, landmarks, self.landmarks, w, h)
        draw_angle(
            cv2,
            frame,
            landmarks,
            w,
            h,
            (self.landmarks[0], self.landmarks[1], self.landmarks[2]),
            result_data.metrics.get("main_angle"),
        )
        draw_reps(cv2, frame, result_data)

    # Crear el componente ExerciseResult para el return
    def build_result(self, metrics):
        return ExerciseResult(
            rep_count=self.tracker.rep_count,
            reps=self.tracker.reps.copy(),
            metrics=metrics,
        )

    def reset(self):
        if self.tracker:
            self.tracker.reset()
        self._side = None
