import LeftPanel from "../components/auth/LeftPanel";
import Login from "../components/auth/Login";
import Register from "../components/auth/Register";
import { useState } from "react";

export default function AuthLayout() {
  const [mode, setMode] = useState("login");

  return (
    <main className="min-h-screen flex flex-col md:flex-row overflow-hidden bg-(--bg) text-white">
      
      {/* LEFT */}
      <LeftPanel />

      {/* RIGHT */}
      <section className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 lg:p-24 bg-(--bg) relative">
        
        <div className="w-full max-w-md">

          {/* HEADER */}
          <div className="mb-10 text-center md:text-left">
            <h3 className="text-3xl font-bold mb-3">
              {mode === "login" ? "Welcome back" : "Create account"}
            </h3>
            <p className="text-(--gray)">
              {mode === "login"
                ? "Enter your credentials to access the lab"
                : "Start tracking your performance"}
            </p>
          </div>

          {/* TOGGLE */}
          <div className="bg-(--bg-light) p-1 rounded-xl mb-8 flex">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${
                mode === "login"
                  ? "bg-(--bg-extra-light) text-white"
                  : "text-(--gray)"
              }`}
            >
              Login
            </button>

            <button
              onClick={() => setMode("register")}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${
                mode === "register"
                  ? "bg-(--bg-extra-light) text-white"
                  : "text-(--gray)"
              }`}
            >
              Register
            </button>
          </div>

          {/* FORM */}
          {mode === "login" ? <Login /> : <Register />}
        </div>
      </section>
    </main>
  );
}