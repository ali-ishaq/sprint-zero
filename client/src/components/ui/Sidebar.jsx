import {
  GridIcon,
  PlusSquareIcon,
  LogoutIcon,
  PlusIcon,
  ArrowLeftIcon,
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
  collapsed = false,
  onToggleCollapse,
}) {
  return (
    <aside
      className={`h-screen shrink-0 bg-shell-sidebar border-r border-line flex flex-col transition-all duration-300 ease-in-out ${
        collapsed ? "w-[72px]" : "w-[264px]"
      }`}
    >
      {/* Logo area — fixed at top */}
      <div className={`shrink-0 pt-6 pb-5 ${collapsed ? "px-3" : "px-6"}`}>
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
          <img
            src={logo}
            alt="SprintZero logo"
            className="w-10 h-10 rounded-[10px] shrink-0"
          />
          {!collapsed && (
            <div className="leading-tight overflow-hidden">
              <p className="font-display font-bold text-gray-900 leading-none whitespace-nowrap">
                SprintZero
              </p>
              <p className="text-xs text-gray-500 mt-0.5">v2.4.0</p>
            </div>
          )}
        </div>

        {collapsed ? (
          <button
            onClick={onNewProject}
            className="mt-5 w-10 h-10 mx-auto flex items-center justify-center bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors"
            title="New Sprint"
          >
            <PlusIcon className="w-5 h-5" strokeWidth={2.2} />
          </button>
        ) : (
          <button
            onClick={onNewProject}
            className="mt-5 w-full flex items-center justify-center gap-2 bg-brand text-white font-semibold text-sm rounded-lg py-2.5 hover:bg-brand-dark transition-colors"
          >
            <PlusIcon className="w-4 h-4" strokeWidth={2.2} />
            New Sprint
          </button>
        )}
      </div>

      {/* Nav items — scrollable if they overflow */}
      <nav
        className={`flex-1 min-h-0 overflow-y-auto space-y-1 ${
          collapsed ? "px-2" : "px-3"
        }`}
      >
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate && onNavigate(id)}
              title={collapsed ? label : undefined}
              className={`relative w-full flex items-center gap-3 rounded-lg text-sm transition-colors text-left ${
                collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5"
              } ${
                isActive
                  ? "bg-brand-light text-brand font-medium"
                  : "text-gray-700 hover:bg-gray-200/60"
              }`}
            >
              {isActive && !collapsed && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r bg-brand" />
              )}
              <Icon
                className={`w-5 h-5 shrink-0 ${
                  isActive ? "text-brand" : "text-gray-600"
                }`}
              />
              {!collapsed && label}
            </button>
          );
        })}
      </nav>

      {/* Bottom section — fixed at bottom */}
      <div className={`shrink-0 space-y-1 ${collapsed ? "px-2 pb-5" : "px-3 pb-5"}`}>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`w-full flex items-center gap-3 rounded-lg text-sm text-gray-500 hover:bg-gray-200/60 hover:text-gray-700 transition-colors text-left ${
              collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5"
            }`}
          >
            <ArrowLeftIcon
              className={`w-5 h-5 shrink-0 transition-transform duration-300 ${
                collapsed ? "rotate-180" : ""
              }`}
            />
            {!collapsed && <span>Collapse</span>}
          </button>
        )}

        <button
          onClick={onLogout ? onLogout : undefined}
          title={collapsed ? "Sign Out" : undefined}
          className={`w-full flex items-center gap-3 rounded-lg text-sm text-gray-700 hover:bg-gray-200/60 transition-colors text-left ${
            collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5"
          }`}
        >
          <LogoutIcon className="w-5 h-5 text-gray-600 shrink-0" />
          {!collapsed && "Sign Out"}
        </button>
      </div>
    </aside>
  );
}
