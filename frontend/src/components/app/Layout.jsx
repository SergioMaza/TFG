/*
Este componente se encarga de darle el estilo general a la pagina:
2. Contenido
4. Márgenes
*/

import Footer from "../common/Footer";
import Sidebar from "../common/Sidebar";

// childen: Cuerpo de la web
export default function Layout({ children }) {
  return (
    <div className="flex bg-(--bg) text-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 ml-64 flex flex-col">
        <main className="flex-1 px-10 py-20">{children}</main>

        <Footer />
      </div>
    </div>
  );
}
