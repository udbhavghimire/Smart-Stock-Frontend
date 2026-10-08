"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  EmptyProducts,
  filterRows,
  ProductRow,
  ProductTableHead,
  ROW_HEIGHT,
  SearchBox,
  toRows,
} from "@/components/dashboard/ProductTable";
import { ProductsModal } from "@/components/dashboard/ProductsModal";

const MIN_ROWS = 3;

/** How many rows fit in the element's height, so the page size follows the screen. */
function useFittingRows(ref) {
  const [rows, setRows] = useState(7);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    const update = () => setRows(Math.max(MIN_ROWS, Math.floor(element.clientHeight / ROW_HEIGHT)));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return rows;
}

export function ProductList({ products, periodLabel, className = "" }) {
  const rows = useMemo(() => toRows(products), [products]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const bodyRef = useRef(null);
  const pageSize = useFittingRows(bodyRef);

  const filtered = useMemo(() => filterRows(rows, query), [rows, query]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pageCount - 1);
  const first = current * pageSize;
  const visible = filtered.slice(first, first + pageSize);

  const pageButton =
    "rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-background " +
    "focus-visible:outline-2 focus-visible:outline-focus-ring disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent";

  return (
    <section className={`flex min-h-0 flex-col rounded-2xl border border-border bg-surface ${className}`}>
      <div className="flex flex-wrap items-center gap-3 p-4 pb-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold">Products</h2>
          <p className="text-xs text-muted">Forecast for {periodLabel} · select a product for its details</p>
        </div>
        <SearchBox
          value={query}
          onChange={(value) => {
            setQuery(value);
            setPage(0);
          }}
          className="w-full sm:w-64"
        />
      </div>

      <div role="table" aria-label="Products" className="flex min-h-0 flex-1 flex-col">
        <ProductTableHead />
        {/* The page size is measured from this area, so it must not size itself from its rows. */}
        <div ref={bodyRef} role="rowgroup" className="min-h-0 flex-1 overflow-hidden">
          {filtered.length === 0 ? (
            <EmptyProducts
              query={query}
              onClear={() => {
                setQuery("");
                setPage(0);
              }}
            />
          ) : (
            visible.map((row) => <ProductRow key={row.item} row={row} />)
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm text-muted" aria-live="polite">
            {filtered.length === 0
              ? "0 products"
              : `${first + 1}–${first + visible.length} of ${filtered.length}`}
          </p>
          <button
            type="button"
            className={pageButton}
            onClick={() => setPage(current - 1)}
            disabled={current === 0}
            aria-label="Previous page"
          >
            Prev
          </button>
          <span className="text-sm tabular-nums text-muted">
            {current + 1} / {pageCount}
          </span>
          <button
            type="button"
            className={pageButton}
            onClick={() => setPage(current + 1)}
            disabled={current >= pageCount - 1}
            aria-label="Next page"
          >
            Next
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
        >
          View all
        </button>
      </div>

      {showAll && <ProductsModal rows={rows} periodLabel={periodLabel} onClose={() => setShowAll(false)} />}
    </section>
  );
}
