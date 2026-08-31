export default function Badge({ className = "", children, ...props }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-pill text-xs font-semibold ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
