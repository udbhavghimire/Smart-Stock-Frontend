import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductForecast } from "@/components/product/ProductForecast";
import { DataAgeBanner } from "@/components/ui/DataAgeBanner";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { StatCard } from "@/components/ui/StatCard";
import { pagePaths } from "@/config/paths";
import { DEMO_META, getProduct } from "@/lib/demo-data";
import { formatMoney, formatUnits, formatWhole } from "@/lib/format";

function decodeItem(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export async function generateMetadata({ params }) {
  const { item } = await params;
  return { title: `${decodeItem(item)} · SmartStock` };
}

export default async function ProductPage({ params }) {
  const { item } = await params;
  const product = getProduct(decodeItem(item));
  if (!product) notFound();

  const week = product.weekly[0];

  return (
    <main className="mx-auto w-full max-w-[1200px] space-y-4 p-4">
      <Link
        href={pagePaths.warehouse}
        className="inline-flex items-center gap-1 rounded text-sm text-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-focus-ring"
      >
        <span aria-hidden="true">←</span> Warehouse
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">{product.item}</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
            <span>{product.ptype}</span>
            <span aria-hidden="true">·</span>
            <PriorityBadge priority={product.priority} cls={product.class} />
            <span aria-hidden="true">·</span>
            <span>Recent price {formatMoney(product.price_recent)}</span>
          </div>
        </div>
        <DataAgeBanner meta={DEMO_META} />
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Expected units" value={formatUnits(week.p50)} caption={week.period_label} tone="violet" />
        <StatCard
          label="Likely range"
          value={`${formatUnits(week.p10)} – ${formatUnits(week.p90)}`}
          caption="8 times out of 10"
          tone="blue"
        />
        <StatCard
          label="Safe stock"
          value={formatWhole(week.safe_qty)}
          caption={`Enough in ${Math.round(week.service_level * 100)}% of weeks`}
          tone="green"
        />
        <StatCard label="Expected sales" value={formatMoney(week.revenue_p50)} caption="This week" tone="sky" />
      </div>

      <ProductForecast history={product.history} weekly={product.weekly} monthly={product.monthly} />

      <p className="text-xs text-muted">{DEMO_META.revenue_note}.</p>
    </main>
  );
}
