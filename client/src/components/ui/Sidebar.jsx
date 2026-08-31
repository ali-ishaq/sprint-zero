import {
  GridIcon,
  PlusSquareIcon,
  LogoutIcon,
  PlusIcon,
} from "./Icons";
import logo from "../../../assets/logo.png";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", Icon: GridIcon },
  { id: "new-project", label: "New Project", Icon: PlusSquareIcon },
];

export default function Sidebar({
  active = "dashboard",
  onNavigate,
  onNewProject,
  onLogout,
}) {
  return (
    <aside className="w-[264px] shrink-0 bg-shell-sidebar border-r border-line flex flex-col">
      <div className="px-6 pt-6 pb-5">
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="SprintZero logo"
            className="w-10 h-10 rounded-[10px]"
          />
          <div className="leading-tight">
            <p className="font-display font-bold text-gray-900 leading-none">SprintZero</p>
            <p className="text-xs text-gray-500 mt-0.5">v2.4.0</p>
          </div>
        </div>

        <button
          onClick={onNewProject}
          className="mt-5 w-full flex items-center justify-center gap-2 bg-brand text-white font-semibold text-sm rounded-lg py-2.5 hover:bg-brand-dark transition-colors"
        >
          <PlusIcon className="w-4 h-4" strokeWidth={2.2} />
          New Sprint
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate && onNavigate(id)}
              className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${
                isActive
                  ? "bg-brand-light text-brand font-medium"
                  : "text-gray-700 hover:bg-gray-200/60"
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r bg-brand" />
              )}
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-brand" : "text-gray-600"}`} />
              {label}
            </button>
          );
        })}
      </nav>

      <div className="px-3 pb-5">
        <button
          onClick={onLogout ? onLogout : undefined}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-200/60 transition-colors text-left"
        >
          <LogoutIcon className="w-5 h-5 text-gray-600" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
