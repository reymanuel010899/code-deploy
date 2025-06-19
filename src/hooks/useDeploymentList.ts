"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "react-hot-toast"
import { DeploymentProvider } from "@/providers/deploymentProvider"
import type { DeploymentStatus, DeploymentListResponse } from "@/types/api"

export const useDeploymentList = () => {
  const [deployments, setDeployments] = useState<DeploymentStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    hasNext: false,
    hasPrevious: false,
  })
  const [filters, setFilters] = useState({
    status: "",
    service: "",
  })

  const loadDeployments = useCallback(
    async (page = 1, newFilters?: typeof filters) => {
      try {
        setLoading(true)
        const currentFilters = newFilters || filters

        const response: DeploymentListResponse = await DeploymentProvider.listDeployments(
          page,
          pagination.pageSize,
          currentFilters.status || undefined,
          currentFilters.service || undefined,
        )

        setDeployments(response.deployments)
        setPagination({
          page: response.page,
          pageSize: response.pageSize,
          total: response.total,
          hasNext: response.hasNext,
          hasPrevious: response.hasPrevious,
        })
      } catch (error) {
        console.error("Error loading deployments:", error)
        toast.error("Error cargando el listado de deployments")
      } finally {
        setLoading(false)
      }
    },
    [filters, pagination.pageSize],
  )

  const refreshDeployments = useCallback(() => {
    loadDeployments(pagination.page)
  }, [loadDeployments, pagination.page])

  const goToPage = useCallback(
    (page: number) => {
      loadDeployments(page)
    },
    [loadDeployments],
  )

  const updateFilters = useCallback(
    (newFilters: Partial<typeof filters>) => {
      const updatedFilters = { ...filters, ...newFilters }
      setFilters(updatedFilters)
      loadDeployments(1, updatedFilters) // Reset to page 1 when filtering
    },
    [filters, loadDeployments],
  )

  const deleteDeployment = useCallback(
    async (deploymentId: number) => {
      try {
        await DeploymentProvider.deleteDeployment(deploymentId)
        toast.success("Deployment eliminado exitosamente")
        refreshDeployments()
      } catch (error) {
        console.error("Error deleting deployment:", error)
        toast.error("Error eliminando el deployment")
      }
    },
    [refreshDeployments],
  )

  useEffect(() => {
    loadDeployments()
  }, []) // Solo cargar al montar el componente

  return {
    deployments,
    loading,
    pagination,
    filters,
    loadDeployments,
    refreshDeployments,
    goToPage,
    updateFilters,
    deleteDeployment,
  }
}
