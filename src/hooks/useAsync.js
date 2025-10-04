import { useEffect, useState, useCallback, useRef } from 'react'

// Generic async hook with cancellation & stale guard
export function useAsync(asyncFn, deps = [], { immediate = true, initialData = null } = {}) {
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState(null)
  const runIdRef = useRef(0)

  const execute = useCallback(async (...args) => {
    const runId = ++runIdRef.current
    setLoading(true)
    setError(null)
    try {
      const result = await asyncFn(...args)
      if (runId === runIdRef.current) setData(result)
      return result
    } catch (e) {
      if (runId === runIdRef.current) setError(e)
      return null
    } finally {
      if (runId === runIdRef.current) setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => { if (immediate) execute() }, [execute, immediate])

  return { data, loading, error, execute, setData, setError }
}

export default useAsync
