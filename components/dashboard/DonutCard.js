"use client";

import dynamic from "next/dynamic";
import { DONUT_COLORS } from "@/components/charts/colors";
import { formatPercent, formatWhole } from "@/lib/format";

const DonutChart = dynamic(() => import("@/components/charts/DonutChart"), {
  ssr: false,
  loading: () => <div className="size-full animate-pulse rounded-full bg-border/50" role="status" aria-label="Loading chart" />,
});

export function DonutCard({ title, subtitle, data, className = "" }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const summary = `${title}: ${data.map((d) => `${d.name} ${formatWhole(d.value)} units`).join(", ")}.`;

  return (
    <section className={`flex min-h-0 flex-col rounded-2xl border border-border bg-surface p-4 ${className}`}>
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="text-xs text-muted">{subtitle}</p>

      <div className="mt-3 flex min-h-0 flex-1 items-center gap-4">
        <div role="img" aria-label={summary} className="relative size-32 shrink-0 sm:size-36">
          <DonutChart data={data} />
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-semibold tabular-nums">{formatWhole(total)}</span>
            <span className="text-[11px] text-muted">units</span>
          </div>
        </div>

        <ol className="min-w-0 flex-1 space-y-1.5 text-xs">
          {data.map((d, index) => (
            <li key={d.name} className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="size-2.5 shrink-0 rounded-full"
                style={{ background: DONUT_COLORS[index % DONUT_COLORS.length] }}
              />
              <span className="min-w-0 flex-1 truncate" title={d.name}>
                {d.name}
              </span>
              <span className="shrink-0 tabular-nums text-muted">
                {formatWhole(d.value)} · {formatPercent(d.value / total)}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
