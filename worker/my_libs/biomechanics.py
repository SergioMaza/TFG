import numpy as np


def calculate_angle(a, b, c):

    a = np.array(a)
    b = np.array(b)
    c = np.array(c)

    ba = a - b
    bc = c - b

    cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc))

    angle = np.degrees(np.arccos(cosine_angle))

    return angle


def calculate_velocity(angle_history: list[float], fps: float) -> float:
    """Velocidad angular en °/s entre los últimos 2 frames."""
    if len(angle_history) < 2:
        return 0.0
    return abs(angle_history[-1] - angle_history[-2]) * fps


def calculate_rom(angle_history: list[float]) -> float:
    """Rango de movimiento = max - min del ciclo."""
    if not angle_history:
        return 0.0
    return max(angle_history) - min(angle_history)


def calculate_torso_lean(landmarks, width, height) -> float:
    """
    Ángulo del torso respecto a la vertical.
    Usa hombro (11) y cadera (23) del lado izquierdo.
    0° = perfectamente vertical, >15° = inclinado.
    """
    shoulder = landmarks[11]
    hip = landmarks[23]
    dx = (hip.x - shoulder.x) * width
    dy = (hip.y - shoulder.y) * height
    angle = abs(np.degrees(np.arctan2(dx, dy)))
    return angle
