import { type ReactNode, useCallback, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ArrowUpDown, ArrowUp, ArrowDown, Pencil, Trash2 } from 'lucide-react'
import type { SortState } from '@/hooks/useServerTable'

// ---------------------------------------------------------------------------
// Column definition
// ---------------------------------------------------------------------------

export interface ColumnDef<T> {
  /** Unique key — used as the sort param sent to the API */
  key: string
  /** Display header label */
  header: string
  /** Whether this column is sortable */
  sortable?: boolean
  /** Custom cell renderer — defaults to `String(row[key])` */
  render?: (row: T) => ReactNode
  /** Optional className for the cell */
  className?: string
}

// ---------------------------------------------------------------------------
// Cascade info for delete warnings
// ---------------------------------------------------------------------------

export interface CascadeInfo {
  label: string
  count: number
}

// ---------------------------------------------------------------------------
// Component props
// ---------------------------------------------------------------------------

export interface DataTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  /** Get a unique key for each row */
  rowKey: (row: T) => string | number
  /** Current sort state (from useServerTable) */
  sort?: SortState | null
  /** Called when a sortable header is clicked */
  onSort?: (column: string) => void

  // Pagination
  page: number
  totalPages: number
  totalCount: number
  onPageChange: (page: number) => void

  // Loading
  loading?: boolean

  // Row actions
  onEdit?: (row: T) => void
  onDelete?: (row: T) => void
  /** Async function to fetch cascade info before delete confirmation */
  getCascadeInfo?: (row: T) => Promise<CascadeInfo[]>
  /** Label to describe the entity being deleted, e.g. "resident" */
  deleteEntityLabel?: string
  /** Get display name for a row in the delete dialog */
  getDeleteName?: (row: T) => string
  /** Extra row actions (rendered before edit/delete) */
  rowActions?: (row: T) => ReactNode

  /** Custom row className */
  rowClassName?: (row: T) => string | undefined

  /** Message shown when there are no items */
  emptyMessage?: string
}

// ---------------------------------------------------------------------------
// DataTable
// ---------------------------------------------------------------------------

export function DataTable<T>({
  columns,
  data,
  rowKey,
  sort,
  onSort,
  page,
  totalPages,
  totalCount,
  onPageChange,
  loading,
  onEdit,
  onDelete,
  getCascadeInfo,
  deleteEntityLabel = 'record',
  getDeleteName,
  rowActions,
  rowClassName,
  emptyMessage = 'No records found.',
}: DataTableProps<T>) {
  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null)
  const [cascadeItems, setCascadeItems] = useState<CascadeInfo[]>([])
  const [cascadeLoading, setCascadeLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const hasActions = !!(onEdit || onDelete || rowActions)

  const handleDeleteClick = useCallback(
    async (row: T) => {
      setDeleteTarget(row)
      if (getCascadeInfo) {
        setCascadeLoading(true)
        try {
          const info = await getCascadeInfo(row)
          setCascadeItems(info)
        } catch {
          setCascadeItems([])
        } finally {
          setCascadeLoading(false)
        }
      }
    },
    [getCascadeInfo],
  )

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget || !onDelete) return
    setDeleting(true)
    try {
      await onDelete(deleteTarget)
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
      setCascadeItems([])
    }
  }, [deleteTarget, onDelete])

  const handleDeleteCancel = useCallback(() => {
    setDeleteTarget(null)
    setCascadeItems([])
  }, [])

  // Sort icon helper
  const sortIcon = (col: ColumnDef<T>) => {
    if (!col.sortable) return null
    if (sort?.column !== col.key) {
      return <ArrowUpDown data-icon="inline-end" className="text-muted-foreground/50" />
    }
    return sort.direction === 'asc' ? (
      <ArrowUp data-icon="inline-end" />
    ) : (
      <ArrowDown data-icon="inline-end" />
    )
  }

  if (loading) {
    return <p className="text-muted-foreground animate-pulse py-8 text-center">Loading...</p>
  }

  const cascadeTotal = cascadeItems.reduce((s, c) => s + c.count, 0)

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={col.sortable ? 'cursor-pointer select-none' : undefined}
                onClick={col.sortable && onSort ? () => onSort(col.key) : undefined}
              >
                <span className="inline-flex items-center gap-1">
                  {col.header}
                  {sortIcon(col)}
                </span>
              </TableHead>
            ))}
            {hasActions && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + (hasActions ? 1 : 0)} className="text-muted-foreground py-8 text-center">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => (
              <TableRow key={rowKey(row)} className={rowClassName?.(row)}>
                {columns.map((col) => (
                  <TableCell key={col.key} className={col.className}>
                    {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '-')}
                  </TableCell>
                ))}
                {hasActions && (
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1">
                      {rowActions?.(row)}
                      {onEdit && (
                        <Button variant="ghost" size="icon-sm" onClick={() => onEdit(row)}>
                          <Pencil data-icon="inline-start" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      )}
                      {onDelete && (
                        <Button variant="ghost" size="icon-sm" onClick={() => handleDeleteClick(row)}>
                          <Trash2 data-icon="inline-start" className="text-destructive" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            Page {page} of {totalPages} ({totalCount} records)
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) handleDeleteCancel() }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteEntityLabel}?</AlertDialogTitle>
            <AlertDialogDescription>
              {getDeleteName && deleteTarget ? (
                <>Are you sure you want to delete <strong>{getDeleteName(deleteTarget)}</strong>?</>
              ) : (
                <>Are you sure you want to delete this {deleteEntityLabel}?</>
              )}
              {cascadeLoading && (
                <span className="text-muted-foreground mt-2 block animate-pulse text-sm">
                  Checking related records...
                </span>
              )}
              {!cascadeLoading && cascadeTotal > 0 && (
                <span className="mt-3 block text-sm">
                  <strong className="text-destructive">This will also permanently delete:</strong>
                  <ul className="mt-1 list-inside list-disc">
                    {cascadeItems
                      .filter((c) => c.count > 0)
                      .map((c) => (
                        <li key={c.label}>
                          {c.count} {c.label}
                        </li>
                      ))}
                  </ul>
                </span>
              )}
              <span className="mt-2 block text-sm">This action cannot be undone.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting || cascadeLoading}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
