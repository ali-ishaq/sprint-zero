import { SpinnerIcon } from "./Icons";

const PREFIX = {
  success: { sym: "✓", class: "text-emerald-400" },
  info: { sym: "→", class: "text-gray-300" },
  warning: { sym: "⚠", class: "text-amber-400" },
  active: { sym: "●", class: "text-white", spinner: true },
  dimmed: { sym: "✓", class: "text-gray-600" },
};

export default function LogLine({ variant = "info", tag, message, className = "" }) {
  const config = PREFIX[variant] || PREFIX.info;
  const textClass =
    variant === "warning"
      ? "text-amber-300"
      : variant === "dimmed"
        ? "text-gray-500"
        : variant === "active"
          ? "text-gray-100"
          : variant === "success"
            ? "text-gray-200"
            : "text-gray-300";

  return (
    <div className={`flex items-start gap-2 font-mono text-[13px] leading-relaxed ${textClass} ${className}`}>
      <span className={`shrink-0 w-4 text-center ${config.class}`}>
        {config.spinner ? <SpinnerIcon className="w-3.5 h-3.5" /> : config.sym}
      </span>
      <span className="min-w-0 break-words">
        <span className="text-cyan-400">{tag}</span>
        {message}
      </span>
    </div>
  );
}
