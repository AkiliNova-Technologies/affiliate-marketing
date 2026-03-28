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
  type Row,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconEye,
  IconFilter,
  IconSearch,
  IconSortDescending,
} from "@tabler/icons-react";
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

// ─── Re-exported helpers (same as data-table) ─────────────────────────────────

export function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();

  const styles: Record<string, string> = {
    active: "border border-green-500 text-green-700 bg-transparent",
    deleted: "border border-red-400 text-red-500 bg-transparent",
    suspended: "border border-gray-800 text-gray-800 bg-transparent font-semibold",
    deactivated: "border border-gray-300 text-gray-400 bg-transparent",
    "pending approval": "border border-amber-400 text-amber-600 bg-transparent",
    "pending re-approval": "border border-orange-400 text-orange-500 bg-transparent",
  };

  const matched = Object.keys(styles).find((key) => s.includes(key));
  const cls = matched
    ? styles[matched]
    : "border border-gray-300 text-gray-500 bg-transparent";

  return (
    <span className={cn("inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium", cls)}>
      {status}
    </span>
  );
}

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

interface TablePaginationProps {
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
}: TablePaginationProps) {
  const getPageNumbers = (): (number | "ellipsis")[] => {
    const pages: (number | "ellipsis")[] = [];

    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    pages.push(1, 2, 3);

    if (currentPage > 4) pages.push("ellipsis");

    if (currentPage > 3 && currentPage < totalPages - 1) {
      if (!pages.includes(currentPage - 1)) pages.push(currentPage - 1);
      if (!pages.includes(currentPage)) pages.push(currentPage);
      if (!pages.includes(currentPage + 1)) pages.push(currentPage + 1);
      pages.push("ellipsis");
    } else if (currentPage <= 3) {
      pages.push("ellipsis");
    }

    if (!pages.includes(totalPages)) pages.push(totalPages);

    return pages;
  };

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  return (
    <div className="flex items-center justify-between border-t px-0 pt-4">
      <div className="flex items-center gap-8">
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

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1.5 text-sm text-foreground disabled:text-muted-foreground disabled:cursor-not-allowed hover:text-[#F97316] transition-colors disabled:hover:text-muted-foreground"
        >
          Next
          <IconChevronRight className="size-4" />
        </button>
      </div>

      <span className="text-sm text-muted-foreground whitespace-nowrap">
        Showing {startItem} - {endItem} of {total}
      </span>
    </div>
  );
}

// ─── ExpandableDataTable Props ────────────────────────────────────────────────

export interface ExpandableDataTableProps<TData, TValue> {
  // ── Data ──
  /** Column definitions */
  columns: ColumnDef<TData, TValue>[];
  /** Row data */
  data: TData[];

  // ── Expandable row ──
  /**
   * Render function for the expanded panel content beneath a row.
   * Receives the full row object. The panel is shown below the row
   * inside a `<tr><td colSpan={…}>` wrapper.
   * If omitted, no expand toggle is shown.
   */
  renderExpandedRow?: (row: Row<TData>) => React.ReactNode;
  /**
   * Controls which row is expanded (by row id). Use with `onExpandedChange`
   * for controlled mode. Leave undefined for uncontrolled (internal state).
   */
  expandedRowId?: string | null;
  /** Called when a row's expand toggle is clicked. */
  onExpandedChange?: (rowId: string | null) => void;
  /**
   * Extra CSS classes applied to the expanded panel wrapper `<div>`.
   * Default: `"mx-4 mb-4 rounded-xl border border-gray-100 bg-gray-50/60 px-8 py-5"`
   */
  expandedPanelClassName?: string;

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

// ─── ExpandableDataTable ──────────────────────────────────────────────────────

export function ExpandableDataTable<TData, TValue>({
  columns: columnsProp,
  data,

  // expandable
  renderExpandedRow,
  expandedRowId: controlledExpandedRowId,
  onExpandedChange,
  expandedPanelClassName,

  // toolbar
  title,
  description,
  headerAction,

  // search
  searchColumn,
  searchPlaceholder = "Search",

  // filters / sort
  showFilters = true,
  showSort = true,
  sortLabel = "Ascending",

  // selection
  showSelection = true,

  // pagination
  showPagination = true,
  pageSize = 10,
  total,
  page: controlledPage,
  onPageChange: controlledOnPageChange,

  // loading
  loading = false,
  skeletonRows = 8,

  // misc
  className,
  emptyMessage = "No results.",
  emptyState,
}: ExpandableDataTableProps<TData, TValue>) {
  // ── Internal expanded state (uncontrolled) ───────────────────────────────
  const [internalExpandedRowId, setInternalExpandedRowId] = React.useState<string | null>(null);

  const isControlledExpand = controlledExpandedRowId !== undefined;
  const expandedRowId = isControlledExpand ? controlledExpandedRowId : internalExpandedRowId;

  const toggleExpand = React.useCallback(
    (rowId: string) => {
      const next = expandedRowId === rowId ? null : rowId;
      if (isControlledExpand) {
        onExpandedChange?.(next);
      } else {
        setInternalExpandedRowId(next);
        onExpandedChange?.(next);
      }
    },
    [expandedRowId, isControlledExpand, onExpandedChange],
  );

  // ── Pagination state ─────────────────────────────────────────────────────
  const isServerPaginated =
    controlledPage !== undefined && controlledOnPageChange !== undefined;

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize });

  // ── Build columns — prepend checkbox, append expand chevron ─────────────
  const hasExpand = !!renderExpandedRow;

  const columns = React.useMemo<ColumnDef<TData, TValue>[]>(() => {
    const cols: ColumnDef<TData, TValue>[] = [];

    // Leading checkbox
    if (showSelection) {
      cols.push({
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
      } as ColumnDef<TData, TValue>);
    }

    // Data columns
    cols.push(...columnsProp);

    // Trailing expand chevron column
    if (hasExpand) {
      cols.push({
        id: "__expand__",
        header: () => (
          <span className="text-xs font-semibold text-muted-foreground"></span>
        ),
        cell: ({ row }) => (
          <button
            onClick={() => toggleExpand(row.id)}
            className="flex items-center justify-center size-7 rounded-lg hover:bg-gray-100 transition-colors text-muted-foreground"
            aria-label={expandedRowId === row.id ? "Collapse row" : "Expand row"}
          >
            {expandedRowId === row.id ? (
              <IconChevronUp className="size-4" />
            ) : (
              <IconChevronDown className="size-4" />
            )}
          </button>
        ),
        enableSorting: false,
        enableHiding: false,
      } as ColumnDef<TData, TValue>);
    }

    return cols;
  }, [columnsProp, showSelection, hasExpand, toggleExpand, expandedRowId]);

  // ── TanStack table instance ───────────────────────────────────────────────
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

  // ── Pagination derived values ─────────────────────────────────────────────
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

  // Total visible columns (for colSpan)
  const colCount = columns.length;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Empty state — replaces entire table */}
      {!loading && data.length === 0 && emptyState ? (
        <div className="flex items-center justify-center w-full py-6">
          {emptyState}
        </div>
      ) : (
        <div
          className={cn(
            "flex flex-col gap-4 border bg-card px-6 py-5 rounded-xl",
            className,
          )}
        >
          {/* ── Toolbar ── */}
          {(title || description || searchColumn || showFilters || showSort || headerAction) && (
            <div className="flex flex-col gap-4">
              {/* Title + header action row */}
              {(title || description || headerAction) && (
                <div className="flex items-start justify-between gap-4">
                  <div>
                    {title && (
                      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                    )}
                    {description && (
                      <p className="text-xs text-muted-foreground">{description}</p>
                    )}
                  </div>
                  {headerAction && <div>{headerAction}</div>}
                </div>
              )}

              {/* Search + Filters + Sort row */}
              {(searchColumn || showFilters || showSort) && (
                <div className="flex items-center justify-between gap-3">
                  {/* Search input */}
                  {searchColumn ? (
                    <div className="relative w-full max-w-xs">
                      <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder={searchPlaceholder}
                        value={
                          (table.getColumn(searchColumn)?.getFilterValue() as string) ?? ""
                        }
                        onChange={(e) =>
                          table.getColumn(searchColumn)?.setFilterValue(e.target.value)
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
                        <span className="font-medium text-[#F97316]">{sortLabel}</span>
                        <span className="mx-1 text-gray-300">|</span>
                        <IconSortDescending className="size-4 text-[#F97316]" />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Table ── */}
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
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>

              <TableBody>
                {loading ? (
                  // ── Skeleton rows ──────────────────────────────────────────
                  Array.from({ length: skeletonRows }).map((_, rowIdx) => (
                    <TableRow key={`skeleton-${rowIdx}`} className="border-b border-gray-100">
                      {columns.map((col, colIdx) => {
                        const id = (col as { id?: string }).id;
                        const isCheckbox = id === "__select__";
                        const isExpand = id === "__expand__";
                        const isNameCol = showSelection ? colIdx === 1 : colIdx === 0;
                        const isLast = !hasExpand && colIdx === columns.length - 1;

                        return (
                          <TableCell key={colIdx} className="py-3.5">
                            {isCheckbox ? (
                              <div className="size-4 rounded bg-gray-200 animate-pulse" />
                            ) : isExpand ? (
                              <div className="size-7 rounded bg-gray-100 animate-pulse" />
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
                  // ── Data rows ──────────────────────────────────────────────
                  table.getRowModel().rows.map((row) => {
                    const isExpanded = expandedRowId === row.id;

                    return (
                      <React.Fragment key={row.id}>
                        {/* Main data row */}
                        <TableRow
                          data-state={row.getIsSelected() && "selected"}
                          className={cn(
                            "border-b border-gray-100 transition-colors data-[state=selected]:bg-orange-50/40",
                            isExpanded ? "bg-white" : "hover:bg-gray-50/60",
                          )}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell
                              key={cell.id}
                              className="py-3.5 text-sm text-foreground"
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>

                        {isExpanded && renderExpandedRow && (
                          <TableRow className="border-0 hover:bg-transparent">
                            <TableCell
                              colSpan={colCount}
                              className="p-0 border-b border-gray-100"
                            >
                              <div
                                className={cn(
                                  " border border-gray-100 bg-[#F7F7F7] px-8 py-5",
                                  expandedPanelClassName,
                                )}
                              >
                                {renderExpandedRow(row)}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })
                ) : (
                  // ── Empty message (inline, not full empty state) ───────────
                  <TableRow>
                    <TableCell
                      colSpan={colCount}
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