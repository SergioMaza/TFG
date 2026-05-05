# Funciones auxiliares de procesamiento para abstraer logica y no saturar app.py

from datetime import datetime, timezone, timedelta


def _calculate_exercise_avg_scores(exercises: list) -> list:
    """
    avg_score a cada ejercicio calculado en base a los scores de cada sesion.
    """
    for ex in exercises:
        scores = [s["score"] for s in ex["sessions"] if s["score"] is not None]
        ex["avg_score"] = round(sum(scores) / len(scores)) if scores else 0
    return exercises


def _calculate_global_metrics(exercises: list) -> dict:
    """
    Calcula las métricas globales del dashboard a partir de todos los ejercicios.
    """
    now = datetime.now(timezone.utc)
    week_start = now - timedelta(days=now.weekday())
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    all_sessions = [s for ex in exercises for s in ex["sessions"]]
    sessions_this_week = []
    sessions_last_week = []
    upper_count = 0
    lower_count = 0
    exercise_counts = {}

    for ex in exercises:
        exercise_counts[ex["title"]] = exercise_counts.get(ex["title"], 0) + len(
            ex["sessions"]
        )

        for s in ex["sessions"]:
            uploaded = s.get("uploaded_at")
            if not uploaded:
                continue

            uploaded_dt = datetime.fromisoformat(uploaded)
            if uploaded_dt.tzinfo is None:
                uploaded_dt = uploaded_dt.replace(tzinfo=timezone.utc)

            if uploaded_dt >= week_start:
                sessions_this_week.append(s)
            elif uploaded_dt >= week_start - timedelta(weeks=1):
                sessions_last_week.append(s)

            if ex.get("upper"):
                upper_count += 1
            else:
                lower_count += 1

    sessions_this_month = sum(
        1
        for ex in exercises
        for s in ex["sessions"]
        if s.get("uploaded_at")
        and datetime.fromisoformat(s["uploaded_at"]).replace(tzinfo=timezone.utc)
        >= month_start
    )

    total = upper_count + lower_count
    upper_pct = round(upper_count / total * 100) if total else 0
    lower_pct = 100 - upper_pct

    most_trained = (
        max(exercise_counts, key=exercise_counts.get) if exercise_counts else None
    )

    all_scores = [s["score"] for s in all_sessions if s["score"] is not None]
    avg_score = round(sum(all_scores) / len(all_scores)) if all_scores else 0

    week_scores = [s["score"] for s in sessions_this_week if s["score"] is not None]
    last_week_scores = [
        s["score"] for s in sessions_last_week if s["score"] is not None
    ]
    week_avg = round(sum(week_scores) / len(week_scores)) if week_scores else 0
    last_week_avg = (
        round(sum(last_week_scores) / len(last_week_scores)) if last_week_scores else 0
    )

    return {
        "sessions_this_month": sessions_this_month,
        "sessions_this_week": len(sessions_this_week),
        "most_trained_muscle": most_trained,
        "upper_percentage": upper_pct,
        "lower_percentage": lower_pct,
        "avg_score": avg_score,
        "score_change_weekly": week_avg - last_week_avg,
    }


def build_dashboard_response(exercises: list) -> dict:
    """
    Construye el JSON final del dashboard a partir de los datos crudos de get_all_sessions_full.
    """
    exercises = _calculate_exercise_avg_scores(exercises)
    metrics = _calculate_global_metrics(exercises)

    return {
        "metrics": metrics,
        "exercises": exercises,
    }
