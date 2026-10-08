"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  EmptyProducts,
  filterRows,
  ProductRow,
  ProductTableHead,
  SearchBox,
} from "@/components/dashboard/ProductTable";

/** "View all" popup: every product in one scrollable list, with its own search. */
export function ProductsModal({ rows, periodLabel, onClose }) {
  const dialogRef = useRef(null);
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => filterRows(rows, query), [rows, query]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="all-products-title"
      onClose={onClose}
      // Clicking the dimmed backdrop (the dialog element itself) closes it.
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      className="m-auto h-[min(85dvh,760px)] w-[min(980px,calc(100vw-1.5rem))] flex-col rounded-2xl border border-border bg-surface p-0 text-foreground shadow-xl open:flex backdrop:bg-black/50"
    >
      <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
        <div className="min-w-0 flex-1">
          <h2 id="all-products-title" className="text-lg font-semibold">
            All products
          </h2>
          <p className="text-xs text-muted">
            {filtered.length} of {rows.length} · Forecast for {periodLabel}
          </p>
        </div>
        <SearchBox value={query} onChange={setQuery} className="order-last w-full sm:order-none sm:w-64" />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="rounded-lg p-2 text-muted hover:bg-background hover:text-foreground focus-visible:outline-2 focus-visible:outline-focus-ring"
        >
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
            <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div role="table" aria-label="All products" className="flex min-h-0 flex-1 flex-col">
        <ProductTableHead />
        <div role="rowgroup" className="min-h-0 flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <EmptyProducts query={query} onClear={() => setQuery("")} />
          ) : (
            filtered.map((row) => <ProductRow key={row.item} row={row} />)
          )}
        </div>
      </div>
    </dialog>
  );
}
