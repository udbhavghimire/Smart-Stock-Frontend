import Link from "next/link";
import { productPath } from "@/config/paths";
import { formatMoney, formatUnits, formatWhole } from "@/lib/format";
import { PriorityBadge } from "@/components/ui/PriorityBadge";

export const ROW_HEIGHT = 48;

const GRID =
  "grid grid-cols-[minmax(0,1fr)_4.5rem_4.5rem] items-center gap-3 px-4 " +
  "sm:grid-cols-[minmax(0,1fr)_6rem_5.5rem_4.5rem_4.5rem_5.5rem]";

/** Rows for the list: the first forecast period of each product, sorted by sales value. */
export function toRows(products) {
  return products
    .map((p) => ({
      item: p.item,
      ptype: p.ptype,
      priority: p.priority,
      cls: p.class,
      expected: p.w.units[0],
      safe: p.w.safe[0],
      sales: p.w.rev[0],
    }))
    .sort((a, b) => b.sales - a.sales);
}

export function filterRows(rows, query) {
  const q = query.trim().toLowerCase();
  return q ? rows.filter((row) => row.item.toLowerCase().includes(q)) : rows;
}

export function ProductTableHead() {
  return (
    <div
      role="row"
      className={`${GRID} h-9 border-b border-border text-xs font-medium uppercase tracking-wide text-muted`}
    >
      <span role="columnheader">Product</span>
      <span role="columnheader" className="hidden sm:block">
        Type
      </span>
      <span role="columnheader">Priority</span>
      <span role="columnheader" className="text-right">
        Expected
      </span>
      <span role="columnheader" className="hidden text-right sm:block">
        Safe stock
      </span>
      <span role="columnheader" className="hidden text-right sm:block">
        Sales
      </span>
    </div>
  );
}

export function ProductRow({ row }) {
  return (
    <Link
      href={productPath(row.item)}
      role="row"
      style={{ height: ROW_HEIGHT }}
      className={`${GRID} border-b border-border text-sm transition-colors last:border-b-0 hover:bg-background focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring`}
    >
      <span role="cell" className="truncate font-medium" title={row.item}>
        {row.item}
      </span>
      <span role="cell" className="hidden truncate text-muted sm:block">
        {row.ptype}
      </span>
      <span role="cell">
        <PriorityBadge priority={row.priority} cls={row.cls} />
      </span>
      <span role="cell" className="text-right tabular-nums">
        {formatUnits(row.expected)}
      </span>
      <span role="cell" className="hidden text-right tabular-nums text-muted sm:block">
        {formatWhole(row.safe)}
      </span>
      <span role="cell" className="hidden text-right tabular-nums sm:block">
        {formatMoney(row.sales)}
      </span>
    </Link>
  );
}

export function SearchBox({ value, onChange, className = "" }) {
  return (
    <label className={`relative block ${className}`}>
      <span className="sr-only">Search products</span>
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
      >
        <circle cx="9" cy="9" r="6" />
        <path d="m14 14 4 4" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search products"
        autoComplete="off"
        className="w-full rounded-lg border border-border bg-background py-2 pr-3 pl-9 text-sm placeholder:text-muted focus:outline-2 focus:outline-focus-ring"
      />
    </label>
  );
}

export function EmptyProducts({ query, onClear }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-sm">
      <p className="text-muted">No products match “{query.trim()}”.</p>
      <button
        type="button"
        onClick={onClear}
        className="rounded-lg px-3 py-1.5 font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-focus-ring"
      >
        Clear search
      </button>
    </div>
  );
}
