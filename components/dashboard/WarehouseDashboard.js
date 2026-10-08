"use client";

import { useMemo, useState } from "react";
import { DonutCard } from "@/components/dashboard/DonutCard";
import { ProductList } from "@/components/dashboard/ProductList";
import { DataAgeBanner } from "@/components/ui/DataAgeBanner";
import { StatCard } from "@/components/ui/StatCard";
import { addDays, formatDate, formatMoney, formatWhole } from "@/lib/format";

// Horizon options (spec §7.2): weeks 1–4 shown here, months 1 / 3 / 6. Defaults are 4 weeks and 6 months.
const HORIZONS = { week: [1, 2, 3, 4], month: [1, 3, 6] };
const DEFAULT_HORIZON = { week: 4, month: 6 };

function unitName(granularity, count) {
  const base = granularity === "week" ? "week" : "month";
  return count === 1 ? base : `${base}s`;
}

function horizonCaption(granularity, count) {
  if (granularity === "week") return count === 1 ? "This week" : `Next ${count} weeks`;
  return count === 1 ? "Next month" : `Next ${count} months`;
}

const segmentBase =
  "px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring";

export function WarehouseDashboard({ data }) {
  const [granularity, setGranularity] = useState("week");
  const [horizon, setHorizon] = useState(DEFAULT_HORIZON.week);

  const periods = granularity === "week" ? data.weekPeriods : data.monthPeriods;
  const seriesKey = granularity === "week" ? "w" : "m";

  const totals = useMemo(() => {
    let units = 0;
    let sales = 0;
    let order = 0;
    let orderValue = 0;
    let top = { item: "—", units: 0 };

    for (const product of data.products) {
      const series = product[seriesKey];
      let productUnits = 0;
      for (let i = 0; i < horizon; i++) {
        productUnits += series.units[i];
        sales += series.rev[i];
        order += series.safe[i];
        orderValue += series.safeRev[i];
      }
      units += productUnits;
      if (productUnits > top.units) top = { item: product.item, units: productUnits };
    }

    const weeks = periods.slice(0, horizon).reduce((sum, p) => sum + p.weeks, 0);
    return { units, sales, order, orderValue, top, weeks };
  }, [data.products, seriesKey, horizon, periods]);

  const selectedPeriods = periods.slice(0, horizon);
  const periodText =
    granularity === "week"
      ? horizon === 1
        ? selectedPeriods[0].label
        : `${formatDate(selectedPeriods[0].start)} – ${formatDate(addDays(selectedPeriods[horizon - 1].start, 6))}`
      : horizon === 1
        ? selectedPeriods[0].label
        : `${selectedPeriods[0].label} – ${selectedPeriods[horizon - 1].label}`;

  const caption = horizonCaption(granularity, horizon);
  const firstWeek = data.weekPeriods[0];

  const changeGranularity = (next) => {
    if (next === granularity) return;
    setGranularity(next);
    setHorizon(DEFAULT_HORIZON[next]);
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:h-full lg:min-h-0 lg:grid-cols-3">
      <div className="flex min-w-0 flex-col gap-4 lg:col-span-2 lg:min-h-0">
        <section aria-label="Forecast summary" className="shrink-0 space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="space-y-1.5">
              <h1 className="text-xl font-semibold tracking-tight">Warehouse</h1>
              <DataAgeBanner meta={data.meta} />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div role="group" aria-label="Period type" className="flex overflow-hidden rounded-lg border border-border bg-surface">
                {[
                  { value: "week", label: "Weeks" },
                  { value: "month", label: "Months" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={granularity === option.value}
                    onClick={() => changeGranularity(option.value)}
                    className={`${segmentBase} ${
                      granularity === option.value
                        ? "bg-primary text-primary-foreground"
                        : "text-muted hover:bg-background hover:text-foreground"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div role="group" aria-label="How far ahead" className="flex overflow-hidden rounded-lg border border-border bg-surface">
                {HORIZONS[granularity].map((count) => (
                  <button
                    key={count}
                    type="button"
                    aria-pressed={horizon === count}
                    onClick={() => setHorizon(count)}
                    className={`${segmentBase} ${
                      horizon === count
                        ? "bg-foreground text-background"
                        : "text-muted hover:bg-background hover:text-foreground"
                    }`}
                  >
                    {count} {unitName(granularity, count)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div aria-live="polite" className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            <StatCard label="Total sales" value={formatMoney(totals.sales)} caption={`${caption} · ${periodText}`} tone="violet" />
            <StatCard label="Total units sold" value={formatWhole(totals.units)} caption={caption} tone="blue" />
            <StatCard
              label="Avg weekly sales"
              value={formatMoney(totals.sales / totals.weeks)}
              caption={`Across ${caption.toLowerCase()}`}
              tone="sky"
              className="col-span-2 lg:col-span-1"
            />
            <StatCard label="Suggested order" value={`${formatWhole(totals.order)} units`} caption="Safe stock to avoid running out" tone="green" />
            <StatCard label="Order value" value={formatMoney(totals.orderValue)} caption="Suggested order at sale price" tone="violet" />
            <StatCard
              label="Top seller"
              value={totals.top.item}
              caption={`${formatWhole(totals.top.units)} units expected`}
              tone="blue"
              className="col-span-2 lg:col-span-1"
            />
          </div>
          <p className="text-xs text-muted">{data.meta.revenue_note}.</p>
        </section>

        <ProductList
          products={data.products}
          periodLabel={firstWeek.label}
          className="h-[32rem] lg:h-auto lg:min-h-[19rem] lg:flex-1"
        />
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:min-h-0 lg:grid-cols-1 lg:grid-rows-2">
        <DonutCard title="Top 5 best-selling products" subtitle="Expected units, next 4 weeks" data={data.bestSellers} />
        <DonutCard title="Top 5 least-selling products" subtitle="Expected units, next 4 weeks" data={data.leastSellers} />
      </div>
    </div>
  );
}
