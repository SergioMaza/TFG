# Funciones auxiliares relacionadas con la DB

def upload_session_to_db(
    supabase, session_id: str, user_id: str, exercise_name: str, result: dict
) -> None:
    """
    Persiste en DB una sesión completa con sus reps y feedback.
    Recibe el JSON tal como lo devuelve el worker.
    """

    # Obtener exercise_id desde el catálogo
    exercise_res = (
        supabase.table("exercises_catalog")
        .select("id")
        .eq("title", exercise_name)
        .single()
        .execute()
    )
    exercise_id = exercise_res.data["id"]

    # INSERT session
    supabase.table("sessions").insert(
        {
            "id": session_id,
            "user_id": user_id,
            "exercise_id": exercise_id,
            "video_url": result.get("processed_path"),
            "uploaded_at": result.get("uploaded_at"),
            "score": result.get("score"),
            "fatigue": result.get("fatigue"),
            "efficiency_avg": result.get("efficiency_avg"),
            "total_reps": result.get("total_reps"),
            "full_rom_reps": result.get("full_rom_reps"),
            "rom_avg_deg": result.get("rom_avg_deg"),
            "rom_min_deg": result.get("rom_min_deg"),
            "rom_max_deg": result.get("rom_max_deg"),
            "duration_avg": result.get("duration_avg"),
            "velocity_avg": result.get("velocity_avg"),
        }
    ).execute()

    # INSERT reps
    reps_rows = [
        {
            "session_id": session_id,
            "rep_number": r["rep_number"],
            "full_rom": r["full_rom"],
            "rom_deg": r["rom_deg"],
            "duration": r["duration"],
            "velocity": r["velocity"],
            "efficiency": r.get("efficiency"),
        }
        for r in result.get("reps_detail", [])
    ]
    if reps_rows:
        supabase.table("reps").insert(reps_rows).execute()

    # INSERT feedback
    feedback_rows = [
        {
            "session_id": session_id,
            "text": f["text"],
            "rep_number": f.get("rep_number"),
            "error": f["error"],
        }
        for f in result.get("feedback", [])
    ]
    if feedback_rows:
        supabase.table("feedback").insert(feedback_rows).execute()


def get_all_sessions_full(supabase, user_id: str) -> list:
    """
    Devuelve todas las sesiones del usuario con sus reps y feedback,
    agrupadas por ejercicio — listas para montar el JSON objetivo del frontend.
    """

    # SELECT Sesiones
    sessions_res = supabase.table("sessions").select("""
            id, video_url, uploaded_at, score, fatigue, efficiency_avg,
            total_reps, full_rom_reps, rom_avg_deg, rom_min_deg, rom_max_deg,
            duration_avg, velocity_avg,
            exercises_catalog (
                id, title, img, upper,
                velocity_ideal_low, velocity_ideal_high,
                rom_ideal_low, rom_ideal_high,
                duration_ideal_low, duration_ideal_high
            )
        """).eq("user_id", user_id).order("uploaded_at", desc=False).execute()

    sessions = sessions_res.data
    if not sessions:
        return []

    # SELECT reps y feedback
    session_ids = [s["id"] for s in sessions]

    reps_res = (
        supabase.table("reps")
        .select("*")
        .in_("session_id", session_ids)
        .order("rep_number")
        .execute()
    )
    feedback_res = (
        supabase.table("feedback").select("*").in_("session_id", session_ids).execute()
    )

    reps_by_session = {}
    feedback_by_session = {}

    for r in reps_res.data:
        reps_by_session.setdefault(r["session_id"], []).append(r)

    for f in feedback_res.data:
        feedback_by_session.setdefault(f["session_id"], []).append(f)

    # Agrupar sesiones por ejercicio
    exercises_map = {}

    for s in sessions:
        catalog = s["exercises_catalog"]
        ex_id = catalog["id"]

        if ex_id not in exercises_map:
            exercises_map[ex_id] = {
                "title": catalog["title"],
                "img": catalog["img"],
                "upper": catalog["upper"],
                "thresholds": {
                    "velocity": {
                        "idealLow": catalog["velocity_ideal_low"],
                        "idealHigh": catalog["velocity_ideal_high"],
                    },
                    "rom": {
                        "idealLow": catalog["rom_ideal_low"],
                        "idealHigh": catalog["rom_ideal_high"],
                    },
                    "duration": {
                        "idealLow": catalog["duration_ideal_low"],
                        "idealHigh": catalog["duration_ideal_high"],
                    },
                },
                "sessions": [],
            }

        exercises_map[ex_id]["sessions"].append(
            {
                "session_id": s["id"],
                "video_url": s["video_url"],
                "uploaded_at": s["uploaded_at"],
                "score": s["score"],
                "fatigue": s["fatigue"],
                "efficiency_avg": s["efficiency_avg"],
                "total_reps": s["total_reps"],
                "full_rom_reps": s["full_rom_reps"],
                "rom_avg_deg": s["rom_avg_deg"],
                "rom_min_deg": s["rom_min_deg"],
                "rom_max_deg": s["rom_max_deg"],
                "duration_avg": s["duration_avg"],
                "velocity_avg": s["velocity_avg"],
                "reps_detail": [
                    {
                        "id": r["id"],
                        "rep_number": r["rep_number"],
                        "full_rom": r["full_rom"],
                        "rom_deg": r["rom_deg"],
                        "duration": r["duration"],
                        "velocity": r["velocity"],
                        "efficiency": r["efficiency"],
                    }
                    for r in reps_by_session.get(s["id"], [])
                ],
                "feedback": [
                    {
                        "rep_number": f["rep_number"],
                        "text": f["text"],
                        "error": f["error"],
                    }
                    for f in feedback_by_session.get(s["id"], [])
                ],
            }
        )

    return list(exercises_map.values())
