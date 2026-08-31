import { CheckCircleIcon, SpinnerIcon } from "./Icons";

export default function StepperNode({ state = "pending", icon, label, isParallel = false }) {
  const iconSize = "w-5 h-5";

  let node;
  if (state === "completed") {
    node = (
      <span className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center">
        <svg className={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </span>
    );
  } else if (state === "active") {
    node = (
      <span className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center">
        <SpinnerIcon className={`${iconSize} animate-spin`} />
      </span>
    );
  } else {
    node = (
      <span className="w-10 h-10 rounded-full border-2 border-gray-300 bg-white text-gray-400 flex items-center justify-center">
        {icon}
      </span>
    );
  }

  const labelClass =
    state === "pending" ? "text-gray-400" : state === "active" ? "text-brand font-semibold" : "text-gray-900 font-semibold";

  return (
    <div className="flex flex-col items-center relative">
      {isParallel && (
        <span className="mb-2 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-brand bg-brand-light border border-brand/30 rounded-pill">
          PARALLEL OPS
        </span>
      )}
      {node}
      <span className={`mt-2 text-sm ${labelClass}`}>{label}</span>
    </div>
  );
}
