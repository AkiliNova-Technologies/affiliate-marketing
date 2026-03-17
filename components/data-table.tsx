// components/data-table.tsx
"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  IconChevronLeft,
  IconChevronRight,
  IconEye,
  IconFilter,
  IconSearch,
  IconSortDescending,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

// ─── Status Badge ─────────────────────────────────────────────────────────────

export function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();

  const styles: Record<string, string> = {
    active: "border border-green-500 text-green-700 bg-transparent",
    deleted: "border border-red-400 text-red-500 bg-transparent",
    suspended:
      "border-2 border-gray-800 text-gray-800 bg-transparent font-semibold",
    deactivated: "border border-gray-300 text-gray-400 bg-transparent",
    "pending approval": "border border-amber-400 text-amber-600 bg-transparent",
    "pending re-approval":
      "border border-orange-400 text-orange-500 bg-transparent",
  };

  const matched = Object.keys(styles).find((key) => s.includes(key));
  const cls = matched
    ? styles[matched]
    : "border border-gray-300 text-gray-500 bg-transparent";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium",
        cls,
      )}
    >
      {status}
    </span>
  );
}

// ─── View Action ──────────────────────────────────────────────────────────────

export function ViewAction({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      <IconEye className="size-4" />
      <span>View</span>
    </button>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

function TablePagination({
  currentPage,
  totalPages,
  total,
  pageSize,
  onPageChange,
}: PaginationProps) {
  // Build page numbers to show: always show 1, 2, 3, ellipsis, last
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];

    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Always show first 3
    pages.push(1, 2, 3);

    if (currentPage > 4) {
      pages.push("ellipsis");
    }

    // Show current page area if beyond first 3
    if (currentPage > 3 && currentPage < totalPages - 1) {
      if (!pages.includes(currentPage - 1)) pages.push(currentPage - 1);
      if (!pages.includes(currentPage)) pages.push(currentPage);
      if (!pages.includes(currentPage + 1)) pages.push(currentPage + 1);
      pages.push("ellipsis");
    } else if (currentPage <= 3) {
      pages.push("ellipsis");
    }

    // Always show last page
    if (!pages.includes(totalPages)) pages.push(totalPages);

    return pages;
  };

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  return (
    <div className="flex items-center justify-between border-t px-0 pt-4">
      <div className="flex items-center justify-between gap-8">
        {/* Previous */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1.5 text-sm text-foreground disabled:text-muted-foreground disabled:cursor-not-allowed hover:text-[#F97316] transition-colors disabled:hover:text-muted-foreground"
        >
          <IconChevronLeft className="size-4" />
          Previous
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, idx) =>
            page === "ellipsis" ? (
              <span
                key={`ellipsis-${idx}`}
                className="flex size-8 items-center justify-center text-sm text-muted-foreground"
              >
                …
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page as number)}
                className={cn(
                  "flex size-8 items-center justify-center rounded text-sm font-medium transition-colors",
                  page === currentPage
                    ? "border border-gray-300 text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {page}
              </button>
            ),
          )}
        </div>
        {/* Next + showing count */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1.5 text-sm text-foreground disabled:text-muted-foreground disabled:cursor-not-allowed hover:text-[#F97316] transition-colors disabled:hover:text-muted-foreground"
        >
          Next
          <IconChevronRight className="size-4" />
        </button>
      </div>

      <div className="flex items-center gap-6">
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          Showing {startItem} - {endItem} of {total}
        </span>
      </div>
    </div>
  );
}

// ─── DataTable Props ──────────────────────────────────────────────────────────

interface DataTableProps<TData, TValue> {
  /** Column definitions */
  columns: ColumnDef<TData, TValue>[];
  /** Row data */
  data: TData[];

  // ── Table header / toolbar ──
  /** Title shown above the table */
  title?: string;
  /** Subtitle/description below the title */
  description?: string;
  /** Extra element rendered on the right of the toolbar (e.g. a Create button) */
  headerAction?: React.ReactNode;

  // ── Search ──
  /** Column accessor key to filter on. Omit to hide the search bar. */
  searchColumn?: string;
  /** Placeholder text for the search input */
  searchPlaceholder?: string;

  // ── Filters / sort ──
  /** Show the Filters button */
  showFilters?: boolean;
  /** Show the Sort by control */
  showSort?: boolean;
  /** Label text next to the sort icon (default: "Ascending") */
  sortLabel?: string;

  // ── Selection ──
  /** Show the leading checkbox column */
  showSelection?: boolean;

  // ── Pagination ──
  /** Whether to show the pagination row. Default: true */
  showPagination?: boolean;
  /** Rows per page (default: 10) */
  pageSize?: number;
  /**
   * Total record count when using server-side pagination.
   * If omitted, falls back to data.length.
   */
  total?: number;
  /**
   * Controlled current page (1-based) for server-side pagination.
   * When provided, `onPageChange` must also be provided.
   */
  page?: number;
  /** Called with the new 1-based page index on pagination clicks */
  onPageChange?: (page: number) => void;

  // ── Loading ──
  /** Show skeleton rows instead of data while fetching. Default: false */
  loading?: boolean;
  /** Number of skeleton rows to render while loading. Default: 8 */
  skeletonRows?: number;

  // ── Misc ──
  className?: string;
  /** Message shown when there are no rows (used inside the table) */
  emptyMessage?: string;
  /**
   * Custom React node rendered in place of the ENTIRE table when there
   * are no rows and loading is false. Overrides emptyMessage.
   */
  emptyState?: React.ReactNode;
}

// ─── DataTable ────────────────────────────────────────────────────────────────

export function DataTable<TData, TValue>({
  columns: columnsProp,
  data,
  title,
  description,
  headerAction,
  searchColumn,
  searchPlaceholder = "Search",
  showFilters = true,
  showSort = true,
  sortLabel = "Ascending",
  showSelection = true,
  showPagination = true,
  pageSize = 10,
  total,
  page: controlledPage,
  onPageChange: controlledOnPageChange,
  loading = false,
  skeletonRows = 8,
  className,
  emptyMessage = "No results.",
  emptyState,
}: DataTableProps<TData, TValue>) {
  const isServerPaginated =
    controlledPage !== undefined && controlledOnPageChange !== undefined;

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize,
  });

  // Build columns — prepend checkbox column if showSelection
  const columns = React.useMemo<ColumnDef<TData, TValue>[]>(() => {
    if (!showSelection) return columnsProp;

    const selectionCol: ColumnDef<TData, TValue> = {
      id: "__select__",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all"
          className="border-gray-300"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label="Select row"
          className="border-gray-300"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    };

    return [selectionCol, ...columnsProp];
  }, [columnsProp, showSelection]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: isServerPaginated
        ? { pageIndex: (controlledPage ?? 1) - 1, pageSize }
        : pagination,
    },
    manualPagination: isServerPaginated,
    pageCount: isServerPaginated
      ? Math.ceil((total ?? data.length) / pageSize)
      : undefined,
    enableRowSelection: showSelection,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: isServerPaginated ? undefined : setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // Pagination derived values
  const effectiveTotal = total ?? data.length;
  const effectivePage = isServerPaginated
    ? (controlledPage ?? 1)
    : pagination.pageIndex + 1;
  const effectiveTotalPages = Math.max(1, Math.ceil(effectiveTotal / pageSize));

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > effectiveTotalPages) return;
    if (isServerPaginated && controlledOnPageChange) {
      controlledOnPageChange(newPage);
    } else {
      setPagination((p) => ({ ...p, pageIndex: newPage - 1 }));
    }
  };

  return (
    <>
      {/* ── Table or empty state ── */}
      {!loading && data.length === 0 && emptyState ? (
        <div className="flex items-center justify-center w-full py-6">
          {emptyState}
        </div>
      ) : (
        <div
          className={cn(
            "flex flex-col gap-4 border bg-card px-5 py-4 rounded-xl",
            className,
          )}
        >
          {/* ── Toolbar ── */}
          {(title ||
            description ||
            searchColumn ||
            showFilters ||
            showSort ||
            headerAction) && (
            <div className="flex flex-col gap-4">
              {/* Title row */}
              {(title || description || headerAction) && (
                <div className="flex items-start justify-between gap-4">
                  <div>
                    {title && (
                      <h3 className="text-lg font-semibold text-foreground">
                        {title}
                      </h3>
                    )}
                    {description && (
                      <p className="text-sm text-muted-foreground">
                        {description}
                      </p>
                    )}
                  </div>
                  {headerAction && <div>{headerAction}</div>}
                </div>
              )}

              {/* Search + Filters + Sort row */}
              {(searchColumn || showFilters || showSort) && (
                <div className="flex items-center justify-between gap-3">
                  {/* Search */}
                  {searchColumn ? (
                    <div className="relative w-full max-w-xs">
                      <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder={searchPlaceholder}
                        value={
                          (table
                            .getColumn(searchColumn)
                            ?.getFilterValue() as string) ?? ""
                        }
                        onChange={(e) =>
                          table
                            .getColumn(searchColumn)
                            ?.setFilterValue(e.target.value)
                        }
                        className="h-10 pl-9 text-sm border-gray-200 focus-visible:ring-[#F97316] rounded-lg"
                      />
                    </div>
                  ) : (
                    <div />
                  )}

                  {/* Filters + Sort */}
                  <div className="flex items-center gap-4">
                    {showFilters && (
                      <button className="flex items-center gap-2 text-sm text-foreground hover:text-[#F97316] transition-colors">
                        <IconFilter className="size-4" />
                        Filters
                      </button>
                    )}
                    {showSort && (
                      <div className="flex items-center gap-1.5 text-sm text-foreground">
                        Sort by:{" "}
                        <span className="font-medium text-[#F97316]">
                          {sortLabel}
                        </span>
                        <span className="mx-1 text-gray-300">|</span>
                        <IconSortDescending className="size-4 text-[#F97316]" />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="border-b border-t border-gray-100 hover:bg-transparent"
                  >
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="py-3 text-sm font-semibold text-foreground bg-gray-100/60"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {loading ? (
                  // ── Skeleton rows ──
                  Array.from({ length: skeletonRows }).map((_, rowIdx) => (
                    <TableRow
                      key={`skeleton-${rowIdx}`}
                      className="border-b border-gray-100"
                    >
                      {columns.map((col, colIdx) => {
                        const isCheckbox =
                          (col as { id?: string }).id === "__select__";
                        const isLast = colIdx === columns.length - 1;
                        const isNameCol = showSelection
                          ? colIdx === 1
                          : colIdx === 0;
                        return (
                          <TableCell key={colIdx} className="py-3.5">
                            {isCheckbox ? (
                              <div className="size-4 rounded bg-gray-200 animate-pulse" />
                            ) : isNameCol ? (
                              <div className="animate-pulse space-y-2">
                                <div className="h-3 w-32 rounded bg-gray-200" />
                                <div className="h-2.5 w-44 rounded bg-gray-100" />
                              </div>
                            ) : isLast ? (
                              <div className="h-3 w-10 rounded bg-gray-200 animate-pulse" />
                            ) : (
                              <div className="h-3 w-24 rounded bg-gray-200 animate-pulse" />
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="border-b border-gray-100 hover:bg-gray-50/60 transition-colors data-[state=selected]:bg-orange-50/40"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className="py-3.5 text-sm text-foreground"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center text-sm text-muted-foreground"
                    >
                      {emptyMessage}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* ── Pagination ── */}
          {showPagination && !loading && effectiveTotalPages >= 1 && (
            <TablePagination
              currentPage={effectivePage}
              totalPages={effectiveTotalPages}
              total={effectiveTotal}
              pageSize={pageSize}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      )}
    </>
  );
}
