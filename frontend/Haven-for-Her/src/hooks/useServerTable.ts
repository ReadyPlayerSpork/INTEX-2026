import { useCallback, useEffect, useState } from 'react'
import { api } from '@/api/client'
import type { PaginatedResponse } from '@/api/types'

export interface SortState {
  column: string
  direction: 'asc' | 'desc'
}

export interface UseServerTableOptions {
  /** Base API endpoint, e.g. "/api/caseload" */
  endpoint: string
  /** Number of items per page (default 20) */
  pageSize?: number
  /** Default sort column */
  defaultSort?: string
  /** Default sort direction */
  defaultDirection?: 'asc' | 'desc'
  /** Extra query params (filters) — changing these resets to page 1 */
  filters?: Record<string, string>
}

export interface UseServerTableReturn<T> {
  items: T[]
  page: number
  totalCount: number
  totalPages: number
  loading: boolean
  sort: SortState | null
  setPage: (p: number) => void
  setSort: (column: string) => void
  refresh: () => void
}

export function useServerTable<T>(opts: UseServerTableOptions): UseServerTableReturn<T> {
  const pageSize = opts.pageSize ?? 20
  const [items, setItems] = useState<T[]>([])
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [sort, setSortState] = useState<SortState | null>(
    opts.defaultSort
      ? { column: opts.defaultSort, direction: opts.defaultDirection ?? 'asc' }
      : null,
  )

  // Serialize filters to detect changes
  const filterKey = JSON.stringify(opts.filters ?? {})

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1)
  }, [filterKey])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const qs = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      })
      if (sort) {
        qs.set('sort', sort.column)
        qs.set('direction', sort.direction)
      }
      const filters = opts.filters ?? {}
      for (const [k, v] of Object.entries(filters)) {
        if (v) qs.set(k, v)
      }
      const res = await api.get<PaginatedResponse<T>>(`${opts.endpoint}?${qs}`)
      setItems(res.items)
      setTotalCount(res.totalCount)
    } catch {
      // keep current state on error
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.endpoint, page, pageSize, sort?.column, sort?.direction, filterKey])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  const setSort = useCallback((column: string) => {
    setSortState((prev) => {
      if (prev?.column === column) {
        return prev.direction === 'asc'
          ? { column, direction: 'desc' }
          : null // third click clears sort
      }
      return { column, direction: 'asc' }
    })
    setPage(1)
  }, [])

  const totalPages = Math.ceil(totalCount / pageSize)

  return {
    items,
    page,
    totalCount,
    totalPages,
    loading,
    sort,
    setPage,
    setSort,
    refresh: fetchData,
  }
}
