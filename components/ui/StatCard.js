export function StatCard({ label, value, caption, tone = "violet", className = "" }) {
  return (
    <div className={`stat-${tone} min-w-0 rounded-2xl p-4 text-white shadow-sm ${className}`}>
      <p className="text-sm opacity-90">{label}</p>
      <p
        className={`mt-1 truncate font-semibold tabular-nums ${
          typeof value === "string" && value.length > 16 ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl"
        }`}
        title={typeof value === "string" ? value : undefined}
      >
        {value}
      </p>
      {caption && <p className="mt-1 truncate text-xs opacity-90">{caption}</p>}
    </div>
  );
}
