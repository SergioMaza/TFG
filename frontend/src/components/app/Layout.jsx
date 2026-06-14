/*
Este componente se encarga de darle el estilo general a la pagina:
2. Contenido
4. Márgenes
*/

import { useState, useEffect } from "react";
import Footer from "../common/Footer";
import Sidebar from "../common/Sidebar";

// childen: Cuerpo de la web
export default function Layout({ children }) {
  const [isOpen, setIsOpen] = useState(() => window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex bg-(--bg) text-white">
      {/* Sidebar */}
      <Sidebar isOpen={isOpen} onToggle={() => setIsOpen((v) => !v)} />

      {/* Main content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out
          ${isOpen ? "lg:ml-64" : "ml-0"}`}
      >
        <main className="flex-1 px-10 py-20">{children}</main>

        <div className="pt-70">
          <Footer />
        </div>
      </div>
    </div>
  );
}
