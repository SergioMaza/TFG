"""
Libreria encargada de dibujar sobre el video original (conexiones, puntos, angulos, feedback, etc)
"""

import numpy as np


def draw_connections(cv2, frame, connections, landmarks, width, height):
    for start_idx, end_idx in connections:
        start = landmarks[start_idx]
        end = landmarks[end_idx]

        x1 = int(start.x * width)
        y1 = int(start.y * height)

        x2 = int(end.x * width)
        y2 = int(end.y * height)

        cv2.line(frame, (x1, y1), (x2, y2), (255, 255, 255), 2)


def draw_keypoints(
    cv2, frame, landmarks, landmark_idxs, width, height, color=(0, 255, 0), radius=4
):
    for idx in landmark_idxs:
        lm = landmarks[idx]
        cx, cy = int(lm.x * width), int(lm.y * height)
        cv2.circle(frame, (cx, cy), radius, color, -1)


def draw_angle(
    cv2,
    frame,
    landmarks,
    width,
    height,
    point_idxs,
    angle,
    color=(0, 255, 0),
    thickness=2,
    radius=40,
):
    if angle is None:
        return

    shoulder_idx, elbow_idx, wrist_idx = point_idxs
    shoulder = np.array(
        [landmarks[shoulder_idx].x * width, landmarks[shoulder_idx].y * height]
    )
    elbow = np.array([landmarks[elbow_idx].x * width, landmarks[elbow_idx].y * height])
    wrist = np.array([landmarks[wrist_idx].x * width, landmarks[wrist_idx].y * height])

    # Vectores
    ba = shoulder - elbow
    bc = wrist - elbow

    # Ángulo de inicio y fin del arco (en grados)
    start_angle = np.degrees(np.arctan2(ba[1], ba[0]))
    end_angle = np.degrees(np.arctan2(bc[1], bc[0]))

    # Ajustar para que siempre se dibuje hacia el “interior” del ángulo
    if end_angle < start_angle:
        start_angle, end_angle = end_angle, start_angle
    if end_angle - start_angle > 180:
        start_angle, end_angle = end_angle, start_angle + 360

    # Dibujar arco
    cv2.ellipse(
        frame,
        center=(int(elbow[0]), int(elbow[1])),
        axes=(radius, radius),
        angle=0,
        startAngle=start_angle,
        endAngle=end_angle,
        color=color,
        thickness=thickness,
    )

    # Calcular posición del texto
    text_pos = (int(elbow[0] + 20), int(elbow[1] - 40))

    # Dibujar valor numérico del ángulo
    cv2.putText(
        frame, f"{int(angle)}", text_pos, cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2
    )


def draw_reps(cv2, frame, result):
    """
    HUD principal: panel semitransparente en la esquina
    con contador de reps y ROM.
    """

    cv2.putText(
        frame,
        f"Reps: {result.rep_count}",
        (20, 45),
        cv2.FONT_HERSHEY_SIMPLEX,
        1.2,
        (255, 255, 255),
        2,
    )