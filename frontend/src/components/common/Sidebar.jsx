import { Upload, Video, Settings, User, Plus, BarChart3 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { ROUTES } from "../../config/routes";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 border border-(--bg-extra-light) p-6 flex flex-col justify-between">
      <div>
        <h1 className="text-xl leading-none font-bold text-(--secondary) mb-10">
          Kinesis Lab
        </h1>

        <nav className="space-y-2">
          <NavItem
            icon={<BarChart3 />}
            label="Dashboard"
            active={location.pathname === ROUTES.dashboard}
            onClick={() => navigate(ROUTES.dashboard)}
          />

          <NavItem
            icon={<Upload />}
            label="Upload"
            active={location.pathname === ROUTES.uploadVideo}
            onClick={() => navigate(ROUTES.uploadVideo)}
          />

          <NavItem
            icon={<Video />}
            label="Library"
            active={location.pathname === ROUTES.library}
            onClick={() => navigate(ROUTES.library)}
          />

          <NavItem
            icon={<Settings />}
            label="Settings"
            active={location.pathname === ROUTES.settings}
            onClick={() => navigate(ROUTES.settings)}
          />
        </nav>
      </div>

      <div>
        <button
          onClick={() => navigate(ROUTES.uploadVideo)}
          className="w-full p-2 bg-(--secondary) text-white rounded-[10px] flex items-center gap-3
          text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
        >
          <Plus className="text-white size-6" />
          Analizar Ejercicio
        </button>
        <NavItem
          icon={<User />}
          label="Profile"
          active={location.pathname === ROUTES.profile}
          onClick={() => navigate(ROUTES.profile)}
        />
      </div>
    </aside>
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
