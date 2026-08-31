import { useState, useEffect } from "react";
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
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("sidebar-collapsed") === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("sidebar-collapsed", String(collapsed));
    } catch {}
  }, [collapsed]);

  return (
    <div className="min-h-screen flex bg-shell-content">
      <Sidebar
        active={active}
        onNavigate={onNavigate}
        onNewProject={onNewProject}
        onLogout={onLogout}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar search={search} />
        <main className="flex-1 px-8 py-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
