export function MetricCard({
  label,
  value,
  detail
}: {
  label: string;
  value: string | number;
  detail: string;
}) {
  return (
    <div className="aethos-panel rounded-md p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink-soft)]">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-[var(--foreground)]">{value}</p>
      <p className="mt-2 text-sm leading-5 text-[var(--ink-soft)]">{detail}</p>
    </div>
  );
}
