export default function StatCard({ icon, value, label, compact = false, className = "", tone = "brand" }) {
  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-gray-500">
          {icon}
        </span>
        <span className="text-sm">
          <span className="font-semibold text-gray-900">{value}</span>{" "}
          <span className="text-gray-500">{label}</span>
        </span>
      </div>
    );
  }

  const toneClass = tone === "green" ? "text-green-600" : tone === "purple" ? "text-purple-600" : "text-brand";

  return (
    <div className={`bg-white border border-line rounded-card shadow-card p-6 flex flex-col items-center text-center ${className}`}>
      <span className={`mb-3 ${toneClass}`}>{icon}</span>
      <span className="text-3xl font-bold text-gray-900 font-display">{value}</span>
      <span className="mt-1 text-xs font-medium uppercase tracking-wider text-gray-500">
        {label}
      </span>
    </div>
  );
}
