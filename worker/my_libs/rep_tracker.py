# my_libs/rep_tracker.py
from dataclasses import dataclass


@dataclass
class RepQuality:
    rep_number: int
    full_rom: bool
    peak_angle: float
    min_angle: float
    duration: float
    velocity: float

class RepTracker:
    """
    Tracker genérico de repeticiones basado en un ángulo principal.
    Funciona para cualquier ejercicio que tenga una fase de flexión y extensión.
    """

    def __init__(self, angle_extended: float, angle_flexed: float):
        self.angle_extended = angle_extended
        self.angle_flexed = angle_flexed

        self._history: list[float] = []
        self._velocities: list[float] = []
        self._frame_count = 0
        self.rep_count = 0
        self._state = "extended"
        self.reps: list[RepQuality] = []

    def update(self, angle: float, fps: float):
        self._history.append(angle)
        if len(self._history) > int(fps * 2):
            self._history.pop(0)
        if len(self._history) >= 2:
            self._velocities.append(abs(self._history[-1] - self._history[-2]) * fps)
        self._frame_count += 1
        self._detect_rep(angle, fps)

    def _detect_rep(self, angle: float, fps: float):
        if self._state == "extended" and angle < self.angle_flexed + 10:
            self._state = "flexed"
        elif self._state == "flexed" and angle > self.angle_extended - 10:
            self._finish_rep(fps)
            self._state = "extended"
            self._frame_count = 0
            self._velocities = []

    def velocity(self) -> float:
        return self._velocities[-1] if self._velocities else 0.0

    def rom_current(self) -> float:
        if len(self._history) < 2:
            return 0.0
        return max(self._history) - min(self._history)

    def rom_avg(self) -> float:
        if not self.reps:
            return 0.0
        return sum(r.peak_angle - r.min_angle for r in self.reps) / len(self.reps)

    def reset(self):
        self._history.clear()
        self._velocities.clear()
        self._frame_count = 0
        self.rep_count = 0
        self.reps.clear()
        self._state = "extended"

    def _finish_rep(self, fps: float):
        if not self._history:
            return
        window = self._history[-int(fps * 2) :]
        rep = RepQuality(
            rep_number=self.rep_count + 1,
            full_rom=bool(min(window) < self.angle_flexed + 15),
            peak_angle=float(max(window)),
            min_angle=float(min(window)),
            duration=float(self._frame_count / fps),
            velocity=(
                float(sum(self._velocities) / len(self._velocities))
                if self._velocities
                else 0.0
            ),
        )
        self.reps.append(rep)
        self.rep_count += 1
