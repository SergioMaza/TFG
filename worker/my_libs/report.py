import json
from datetime import datetime, timezone


def calculate_fatigue(reps: list) -> float:
    """
    % de Fatiga: (first_rep_velocity - last_3reps_avg_velocity) / first_rep_velocity * 100
    0  = sin fatiga
    100 = fatiga máxima
    """

    if len(reps) < 2:
        return 0.0

    first = reps[0].velocity
    last_window = reps[-3:] if len(reps) >= 3 else reps[-1:]
    avg_last = sum(r.velocity for r in last_window) / len(last_window)

    if first <= 0:
        return 0.0

    fatigue = (first - avg_last) / first * 100
    return round(fatigue, 2)


def calculate_score(
    rom_avg_deg: float,
    fatigue: float,
    efficiency_avg: float,
    rom_ideal_low: float,
    rom_ideal_high: float,
) -> int:
    """
    Score 0-100 basado en:
        ROM real vs ROM ideal (50%)
        Efficiency (30%)
        Fatiga (20%)
    """

    rom_ideal = (rom_ideal_low + rom_ideal_high) / 2
    rom_score = min(rom_avg_deg / rom_ideal, 1.0) * 100

    EFFICIENCY_CAP = 80.0  # TODO Analizar variable
    efficiency_score = min(efficiency_avg / EFFICIENCY_CAP, 1.0) * 100

    fatigue_score = 100.0 - fatigue

    score = (rom_score * 0.50) + (efficiency_score * 0.30) + (fatigue_score * 0.20)
    return int(round(min(score, 100.0)))


def generate_session_summary(
    exercise_name: str,
    reps: list,
    rom_ideal_low: float,
    rom_ideal_high: float,
    processed_path: str = "",
    uploaded_at: str = None,
) -> dict:
    """
    Genera el objeto de una sesión, que es lo que se inserta en la DB
    """
    if not reps:
        return {
            "exercise_name": exercise_name,
            "processed_path": processed_path,
            "uploaded_at": uploaded_at or datetime.now(timezone.utc).isoformat(),
            "score": 0,
            "fatigue": 0.0,
            "efficiency_avg": 0.0,
            "total_reps": 0,
            "full_rom_reps": 0,
            "rom_avg_deg": 0.0,
            "rom_min_deg": 0.0,
            "rom_max_deg": 0.0,
            "duration_avg": 0.0,
            "velocity_avg": 0.0,
            "reps_detail": [],
        }

    # Calcular datos de cada repe
    roms = []
    durations = []
    velocities = []
    efficiencies = []
    reps_detail = []
    for r in reps:
        rom_deg = r.peak_angle - r.min_angle
        roms.append(rom_deg)
        
        duration = r.duration
        durations.append(duration)
        
        velocity = r.velocity
        velocities.append(velocity)

        efficiency = (rom_deg / duration) if duration > 0 else 0.0
        efficiencies.append(efficiency)

        reps_detail.append(
            {
                "rep_number": r.rep_number,
                "full_rom": r.full_rom,
                "rom_deg": round(rom_deg, 1),
                "duration": round(duration, 2),
                "velocity": round(velocity, 1),
                "efficiency": round(efficiency, 2),
            }
        )

    # Formatear contenido y devolver resultado (json)
    fatigue = calculate_fatigue(reps)
    rom_avg_deg = round(sum(roms) / len(roms), 1)
    efficiency_avg = (
        round(sum(efficiencies) / len(efficiencies), 2) if efficiencies else 0.0
    )

    return {
        "exercise_name": exercise_name,
        "processed_path": processed_path,
        "uploaded_at": uploaded_at or datetime.now(timezone.utc).isoformat(),
        "score": calculate_score(
            rom_avg_deg, fatigue, efficiency_avg, rom_ideal_low, rom_ideal_high
        ),
        "fatigue": fatigue,
        "efficiency_avg": efficiency_avg,
        "total_reps": len(reps),
        "full_rom_reps": sum(1 for r in reps if r.full_rom),
        "rom_avg_deg": rom_avg_deg,
        "rom_min_deg": round(min(roms), 1),
        "rom_max_deg": round(max(roms), 1),
        "duration_avg": round(sum(durations) / len(durations), 2),
        "velocity_avg": round(sum(velocities) / len(velocities), 1),
        "reps_detail": reps_detail,
    }
