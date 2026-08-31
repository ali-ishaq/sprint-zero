import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function Shell({
  active,
  search,
  onNavigate,
  onNewProject,
  onLogout,
  children,
}) {
  return (
    <div className="min-h-screen flex bg-shell-content">
      <Sidebar
        active={active}
        onNavigate={onNavigate}
        onNewProject={onNewProject}
        onLogout={onLogout}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar search={search} />
        <main className="flex-1 px-8 py-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
