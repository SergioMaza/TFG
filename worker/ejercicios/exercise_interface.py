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

@dataclass
class ExerciseResult:
    rep_count: int = 0
    reps: list = field(default_factory=list)
    #rom_current: float = 0.0 #TODO CREO QUE SE PUEDEN BORRAR
    #rom_avg: float = 0.0 #TODO CREO QUE SE PUEDEN BORRAR
    metrics: dict = field(default_factory=dict)

class BaseExercise(ABC):

    name: str
    landmarks: list[int]
    connections: list[tuple]

    def __init__(self):
        self.tracker = None

    @abstractmethod
    def compute_metrics(self, lm, w, h) -> dict:
        pass

    @abstractmethod
    def generate_feedback(self, session: dict, reps: list) -> list[dict]:
        feedback = []
        
        # Feedback por repe
        for r in reps:
            if not r.full_rom:
                feedback.append({
                    "rep_number": r.rep_number,
                    "text": "Rango de movimiento incompleto",
                    "error": True
                })

        # Feedback por session
        if len(reps) >= 2:
            if session["fatigue"] > 40:
                feedback.append({
                    "rep_number": None,
                    "text": "Caída de velocidad notable hacia el final de la serie",
                    "error": True
                })
            elif session["fatigue"] < 15:
                feedback.append({
                    "rep_number": None,
                    "text": "Velocidad consistente a lo largo de toda la serie",
                    "error": False
                })

        return feedback

    # Pipeline de procesamiento de cada ejercicio
    def analyze(self, lm, w: int, h: int, fps: float) -> ExerciseResult:
        metrics = self.compute_metrics(lm, w, h)
        self.update_tracker(metrics, fps)
        return self.build_result(metrics)

    # Helper para recoger posiciones de los landmarks
    def get_xy(self, lm, w, h, idx):
        return [lm[idx].x * w, lm[idx].y * h]

    # Actualizar tracker (Por defecto: primer angulo como referencia)
    def update_tracker(self, metrics, fps):
        main_angle = metrics["main_angle"]
        self.tracker.update(main_angle, fps)

    def draw(self, cv2, frame, result_data: ExerciseResult, landmarks, w, h):
        """
        Dibuja la visualización por defecto.
        Cada ejercicio puede sobreescribir este método para personalizar.
        """
        from my_libs.draw import draw_connections, draw_keypoints, draw_angle, draw_reps
        draw_connections(cv2, frame, self.connections, landmarks, w, h)
        draw_keypoints(cv2, frame, landmarks, self.landmarks, w, h)
        draw_angle(
            cv2, frame, landmarks, w, h,
            (self.landmarks[0], self.landmarks[1], self.landmarks[2]),
            result_data.metrics.get("main_angle")
        )
        draw_reps(cv2, frame, result_data)
    
    # Crear el componente ExerciseResult para el return
    def build_result(self, metrics):
        return ExerciseResult(
            rep_count=self.tracker.rep_count,
            reps=self.tracker.reps.copy(),
            #rom_current=self.tracker.rom_current(),
            #rom_avg=self.tracker.rom_avg(),
            metrics=metrics,
        )

    def reset(self):
        if self.tracker:
            self.tracker.reset()
