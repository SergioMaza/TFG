/*
 * Este componente actúa como proveedor global de contexto para la aplicación,
 * unificando la gestión de autenticación y la interacción con la base de datos.
 */

import { AppContext } from "./AppContext";
import { supabase } from "../../lib/supabaseClient";
import { useCallback, useEffect, useState } from "react";

const VITE_API_URL = import.meta.env.VITE_API_URL;

// 2. Provider
export const AppProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // -----------------------
  // AUTH FUNCTIONS
  // -----------------------

  const signUp = async (email, password, repeatPassword) => {
    return (email, password, repeatPassword);
  };

  const signIn = async (email, password) => {
    return (email, password);
  };

  const signInWithGoogle = async () => {
    return null;
  };

  const signOut = async () => {
    return null;
  };

  const deleteAccount = async () => {
    return null;
  };

  // Forgot password
  const forgotPassword = async (email) => {
    return email;
  };

  // Update password
  const updatePassword = async (newPassword) => {
    return newPassword;
  };

  // -----------------------
  // DB FUNCTIONS
  // -----------------------
  const fetchSessions = useCallback(async () => {
    // ! Quitar comentario cuando haya user_id if (!userId) return;

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
    fetchSessions();
  }, [fetchSessions]);

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
        forgotPassword,
        updatePassword,
        deleteAccount,
        fetchSessions,
        data,
        loading,
        error
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
