export default function Card({ className = "", children, ...props }) {
  return (
    <div
      className={`bg-white border border-line rounded-card shadow-card ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
