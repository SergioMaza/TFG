/*
 * Este componente actúa como proveedor global de contexto para la aplicación,
 * unificando la gestión de autenticación y la interacción con la base de datos.
 */


import { useNavigate } from "react-router-dom";
import { AppContext } from "./AppContext";
import { supabase } from "../../lib/supabaseClient";

// TODO: TRADUCIR TODO; ERRORES Y DEMAS

// 2. Provider
export const AppProvider = ({ children }) => {
  const navigate = useNavigate();

  // -----------------------
  // AUTH FUNCTIONS
  // -----------------------

  const signUp = async (email, password, repeatPassword) => {
    return email, password, repeatPassword
  };

  const signIn = async (email, password) => {
    return email, password
  };

  const signInWithGoogle = async () => {
    return null
  };

  const signOut = async () => {
   return null
  };

  const deleteAccount = async () => {
    return null
  };

  // Forgot password
  const forgotPassword = async (email) => {
    return email
  };

  // Update password
  const updatePassword = async (newPassword) => {
    return newPassword
  };

  // -----------------------
  // DB FUNCTIONS
  // -----------------------
  const insertUserInDB = async ({ marketingOptIn }) => {
    return marketingOptIn
  };

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
        insertUserInDB,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
