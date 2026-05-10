/*
 * Este componente actúa como proveedor global de contexto para la aplicación,
 * unificando la gestión de autenticación y la interacción con la base de datos.
 */

import { AppContext } from "./AppContext";
import { supabase } from "../../lib/supabaseClient";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../config/routes";

const VITE_API_URL = import.meta.env.VITE_API_URL;
const VITE_FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;

// Provider
export const AppProvider = ({ children }) => {
  const navigate = useNavigate();

  const [userId, setUserId] = useState(null);
  const [data, setData] = useState(null); // Toda la info del usuario (ejercicios, sesiones, metrics, etc)
  const [exercisesCatalog, setExercisesCatalog] = useState([]); // Catalogo de ejercicios para upload y guides

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // -----------------------
  // AUTH FUNCTIONS
  // -----------------------

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (!error) navigate(ROUTES.dashboard);

    return { data, error };
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error) navigate(ROUTES.dashboard);

    return { data, error };
  };

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${VITE_FRONTEND_URL}/dashboard`,
      },
    });

    return { data, error };
  };

  const signOut = async () => {
    console.log("signOut de ", userId)
    const { error } = await supabase.auth.signOut();
    if (!error) navigate(ROUTES.auth);
    return { error };
  };

  useEffect(() => {
    const initUser = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data?.session?.user ?? null;
      setUserId(user?.id ?? null);
    };

    initUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUserId(session?.user?.id ?? null);
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // -----------------------
  // DB FUNCTIONS
  // -----------------------
  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${VITE_API_URL}/api/get-sessions?user_id=${userId}`,
      );
      if (!res.ok) throw new Error("Error obteniendo sesiones");

      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    fetchSessions();
  }, [fetchSessions, userId]);

  // Obtener el catalogo de ejercicios
  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${VITE_API_URL}/api/get-exercise-catalog`);
        if (!res.ok) throw new Error("Error obteniendo ejercicios");

        const data = await res.json();
        setExercisesCatalog(data.exercises);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, []);

  // -----------------------
  // PROVIDE ALL DATA
  // -----------------------
  return (
    <AppContext.Provider
      value={{
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        fetchSessions,
        userId,
        exercisesCatalog,
        data,
        loading,
        error,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
