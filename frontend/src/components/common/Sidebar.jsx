import { Upload, Video, Settings, User, Plus, BarChart3, LogOut, Menu, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { ROUTES } from "../../config/routes";
import { useAppProvider } from "../../hooks/useAppProvider";

export default function Sidebar({ isOpen, onToggle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAppProvider();

  return (
    <>
      {/* Botón hamburguesa flotante */}
      <button
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-(--bg-extra-light) text-white
          hover:bg-(--secondary)/20 hover:text-(--secondary) transition-all duration-200"
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
      >
        {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {/* Overlay para móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 border border-(--bg-extra-light) p-6 flex flex-col justify-between
          z-40 transition-transform duration-300 ease-in-out bg-(--bg)
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div>
          {/* Espacio para no solapar con el botón hamburguesa */}
          <h1 className="text-xl leading-none font-bold text-(--secondary) mb-10 mt-10">
            Kinesis Lab
          </h1>

          <nav className="space-y-2">
            <NavItem
              icon={<BarChart3 />}
              label="Dashboard"
              active={location.pathname === ROUTES.dashboard}
              onClick={() => { navigate(ROUTES.dashboard); }}
            />
            <NavItem
              icon={<Upload />}
              label="Upload"
              active={location.pathname === ROUTES.uploadVideo}
              onClick={() => { navigate(ROUTES.uploadVideo); }}
            />
            <NavItem
              icon={<Video />}
              label="Guías"
              active={location.pathname === ROUTES.guides}
              onClick={() => { navigate(ROUTES.guides); }}
            />
            <NavItem
              icon={<Settings />}
              label="Settings"
              active={location.pathname === ROUTES.settings}
              onClick={() => { navigate(ROUTES.settings); }}
            />
          </nav>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => navigate(ROUTES.uploadVideo)}
            className="w-full p-2 bg-(--secondary) text-white rounded-[10px] flex items-center gap-3
              text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
          >
            <Plus className="text-white size-6" />
            Analizar Ejercicio
          </button>

          <button
            onClick={signOut}
            className="w-full p-2 bg-(--error)/70 text-white rounded-[10px] flex items-center gap-3
              text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
          >
            <LogOut className="text-white size-6" />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition ${
        active
          ? "bg-(--secondary)/20 text-(--secondary) font-bold"
          : "text-(--gray) hover:bg-(--bg-extra-light) hover:text-white"
      }`}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
}