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
      .catch((err) => console.error('Failed to load impact stats', err))
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

export interface ImpactTrend {
  month: string
  totalDonations: number
  avgHealthScore: number
  avgEducationProgress: number
}

export function useImpactTrends() {
  const [trends, setTrends] = useState<ImpactTrend[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    api
      .get<ImpactTrend[]>("/api/public/impact-trends")
      .then((response) => {
        if (isMounted) {
          setTrends(response)
        }
      })
      .catch((err) => console.error('Failed to load impact trends', err))
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  return { trends, isLoading }
}
