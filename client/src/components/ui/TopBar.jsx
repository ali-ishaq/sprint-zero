export default function TopBar({ search }) {
  return (
    <header className="h-[68px] shrink-0 bg-shell-topbar border-b border-line flex items-center px-8 gap-4">
      <div className="flex-1">{search}</div>
    </header>
  );
}
