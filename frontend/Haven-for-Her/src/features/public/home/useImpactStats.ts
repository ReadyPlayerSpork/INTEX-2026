import { useEffect, useState } from "react"

import { api } from "@/api/client"
import type { ImpactStats } from "@/features/public/home/types"

export function useImpactStats() {
  const [stats, setStats] = useState<ImpactStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    api
      .get<ImpactStats>("/api/public/impact")
      .then((response) => {
        if (isMounted) {
          setStats(response)
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  return { stats, isLoading }
}
