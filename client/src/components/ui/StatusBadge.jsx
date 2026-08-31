import { CheckCircleIcon, WarningIcon, SpinnerIcon, CloseIcon } from "./Icons";

const CONFIG = {
  running: {
    label: "Running",
    badge: "bg-sky-100 text-sky-800",
    Icon: SpinnerIcon,
    iconClass: "text-sky-700",
  },
  complete: {
    label: "Complete",
    badge: "bg-green-100 text-green-800",
    Icon: CheckCircleIcon,
    iconClass: "text-green-700",
  },
  "at-risk": {
    label: "At Risk",
    badge: "bg-amber-100 text-amber-800",
    Icon: WarningIcon,
    iconClass: "text-amber-700",
  },
  blocked: {
    label: "Blocked",
    badge: "bg-red-100 text-red-800",
    Icon: CloseIcon,
    iconClass: "text-red-700",
  },
  error: {
    label: "Error",
    badge: "bg-red-100 text-red-800",
    Icon: CloseIcon,
    iconClass: "text-red-700",
  },
};

const FALLBACK = {
  label: "Unknown",
  badge: "bg-gray-100 text-gray-700",
  Icon: null,
  iconClass: "",
};

export default function StatusBadge({ status, className = "" }) {
  const config = CONFIG[status] || FALLBACK;
  const { label, badge, Icon: BadgeIcon, iconClass } = config;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill text-xs font-semibold ${badge} ${className}`}
    >
      {BadgeIcon ? <BadgeIcon className={`w-3.5 h-3.5 ${iconClass}`} /> : null}
      {label}
    </span>
  );
}
