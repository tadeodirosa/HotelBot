import { useState, useEffect, useCallback } from 'react'
import { handleApiError } from '../services/api'

// Hook genérico para llamadas de API
export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiCall()
      setData(result)
    } catch (err) {
      const errorMessage = handleApiError(err)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, dependencies)

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refetch
  }
}

// Hook para operaciones de API (POST, PUT, DELETE)
export function useApiMutation<T, P = any>() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = useCallback(async (
    apiCall: (params: P) => Promise<T>
  ) => {
    return async (params: P): Promise<T | null> => {
      try {
        setLoading(true)
        setError(null)
        const result = await apiCall(params)
        return result
      } catch (err) {
        const errorMessage = handleApiError(err)
        setError(errorMessage)
        return null
      } finally {
        setLoading(false)
      }
    }
  }, [])

  const reset = useCallback(() => {
    setError(null)
    setLoading(false)
  }, [])

  return {
    mutate,
    loading,
    error,
    reset
  }
}

// Hook para paginación
export function usePagination(initialPage = 1, initialPageSize = 10) {
  const [page, setPage] = useState(initialPage)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [total, setTotal] = useState(0)

  const totalPages = Math.ceil(total / pageSize)

  const goToPage = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
    }
  }, [totalPages])

  const goToNextPage = useCallback(() => {
    if (page < totalPages) {
      setPage(page + 1)
    }
  }, [page, totalPages])

  const goToPreviousPage = useCallback(() => {
    if (page > 1) {
      setPage(page - 1)
    }
  }, [page])

  const goToFirstPage = useCallback(() => {
    setPage(1)
  }, [])

  const goToLastPage = useCallback(() => {
    setPage(totalPages)
  }, [totalPages])

  const updateTotal = useCallback((newTotal: number) => {
    setTotal(newTotal)
    // Si la página actual es mayor que el nuevo total de páginas, ir a la última página
    const newTotalPages = Math.ceil(newTotal / pageSize)
    if (page > newTotalPages && newTotalPages > 0) {
      setPage(newTotalPages)
    }
  }, [page, pageSize])

  const updatePageSize = useCallback((newPageSize: number) => {
    setPageSize(newPageSize)
    setPage(1) // Reset a la primera página cuando cambia el tamaño
  }, [])

  return {
    page,
    pageSize,
    total,
    totalPages,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    updateTotal,
    updatePageSize,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1
  }
}

// Hook para filtros de búsqueda
export function useFilters<T extends Record<string, any>>(initialFilters: T) {
  const [filters, setFilters] = useState<T>(initialFilters)

  const updateFilter = useCallback((key: keyof T, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }, [])

  const updateFilters = useCallback((newFilters: Partial<T>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(initialFilters)
  }, [initialFilters])

  const clearFilter = useCallback((key: keyof T) => {
    setFilters(prev => ({
      ...prev,
      [key]: initialFilters[key]
    }))
  }, [initialFilters])

  return {
    filters,
    updateFilter,
    updateFilters,
    resetFilters,
    clearFilter
  }
}

// Hook para debounce (útil para búsquedas)
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Hook para localStorage
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key)
      setStoredValue(initialValue)
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue] as const
}
