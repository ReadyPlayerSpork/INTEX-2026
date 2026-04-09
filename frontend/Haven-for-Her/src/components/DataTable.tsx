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
import type { CascadeImpact } from '@/types/cascade'

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

export type { CascadeImpact } from '@/types/cascade'

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
  getCascadeInfo?: (row: T) => Promise<CascadeImpact[]>
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
  const [cascadeItems, setCascadeItems] = useState<CascadeImpact[]>([])
  const [cascadeLoading, setCascadeLoading] = useState(false)
  const [cascadeError, setCascadeError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const hasActions = !!(onEdit || onDelete || rowActions)

  const handleDeleteClick = useCallback(
    async (row: T) => {
      setDeleteTarget(row)
      setCascadeItems([])
      setCascadeError(null)
      if (getCascadeInfo) {
        setCascadeLoading(true)
        try {
          const info = await getCascadeInfo(row)
          setCascadeItems(info)
        } catch {
          setCascadeItems([])
          setCascadeError('Unable to load related record details.')
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
      setCascadeError(null)
    }
  }, [deleteTarget, onDelete])

  const handleDeleteCancel = useCallback(() => {
    setDeleteTarget(null)
    setCascadeItems([])
    setCascadeError(null)
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

  const blockingCascadeItems = cascadeItems.filter(
    (c) => c.action === 'block' && c.count > 0,
  )
  const deletingCascadeItems = cascadeItems.filter(
    (c) => c.action === 'delete' && c.count > 0,
  )
  const detachingCascadeItems = cascadeItems.filter(
    (c) => c.action === 'detach' && c.count > 0,
  )
  const cascadeTotal = cascadeItems.reduce((s, c) => s + c.count, 0)
  const hasBlockingCascadeItems = blockingCascadeItems.length > 0

  const renderCascadeSection = (
    title: string,
    description: string,
    items: CascadeImpact[],
    titleClassName?: string,
  ) => {
    if (items.length === 0) return null

    return (
      <div className="rounded-xl border border-border/60 bg-card/70 p-3">
        <p className={titleClassName ?? 'font-semibold'}>{title}</p>
        <p className="text-muted-foreground mt-1 text-xs leading-5">
          {description}
        </p>
        <div className="mt-3 space-y-3">
          {items.map((item) => {
            const remainingCount = item.count - item.records.length
            return (
              <div key={`${item.action}-${item.label}`}>
                <p className="font-medium">
                  {item.count} {item.label}
                </p>
                {item.records.length > 0 && (
                  <ul className="text-muted-foreground mt-1 space-y-1 pl-4 text-xs leading-5">
                    {item.records.map((record) => (
                      <li key={record} className="list-disc">
                        {record}
                      </li>
                    ))}
                    {remainingCount > 0 && (
                      <li className="list-disc">+{remainingCount} more</li>
                    )}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

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
              {!cascadeLoading && cascadeError && (
                <span className="text-destructive mt-2 block text-sm">
                  {cascadeError}
                </span>
              )}
              {!cascadeLoading && !cascadeError && cascadeTotal > 0 && (
                <div className="mt-3 space-y-3 text-sm">
                  {renderCascadeSection(
                    'Delete blocked by related records',
                    `Resolve these records before deleting this ${deleteEntityLabel}.`,
                    blockingCascadeItems,
                    'font-semibold text-destructive',
                  )}
                  {renderCascadeSection(
                    'These records will be permanently deleted',
                    'Review the records that will be removed along with this item.',
                    deletingCascadeItems,
                  )}
                  {renderCascadeSection(
                    'These records will be unlinked',
                    'These records will remain, but they will lose their connection to this item.',
                    detachingCascadeItems,
                  )}
                </div>
              )}
              <span className="mt-2 block text-sm">
                {hasBlockingCascadeItems
                  ? `This ${deleteEntityLabel} cannot be deleted until the blocking records are resolved.`
                  : 'This action cannot be undone.'}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting || cascadeLoading || hasBlockingCascadeItems}
            >
              {deleting
                ? 'Deleting...'
                : hasBlockingCascadeItems
                  ? 'Delete unavailable'
                  : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
