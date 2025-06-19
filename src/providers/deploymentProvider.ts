import { apiClient } from "./api"
import type { DeploymentRequest, DeploymentResponse, DeploymentStatus, ImagesRequest } from "@/types/api"

export interface DeploymentListResponse {
  deployments: DeploymentStatus[]
  total: number
  page: number
  pageSize: number
}

export interface DeploymentMetrics {
  deploymentId: string
  cpuUtilization: number
  memoryUtilization: number
  networkIn: number
  networkOut: number
  taskCount: number
  runningTasks: number
  pendingTasks: number
  timestamp: string
}

export interface ScaleDeploymentRequest {
  desiredCount: number
  minCapacity?: number
  maxCapacity?: number
}

export interface UpdateDeploymentRequest {
  serviceName?: string
  taskCpu?: number
  taskMemory?: number
  environmentVariables?: { name: string; value: string }[]
  secrets?: { name: string; valueFrom: string }[]
  healthCheckEnabled?: boolean
  healthCheckPath?: string
  autoScaling?: boolean
  loadBalancer?: boolean
}

export class DeploymentProvider {
  /**
   * GET /deployments/ - Listar todos los deployments
   */
  static async listDeployments(
    page = 1,
    pageSize = 10,
    status?: string,
    service?: string,
  ): Promise<DeploymentListResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      })

      if (status) params.append("status", status)
      if (service) params.append("service", service)

      const response = await apiClient.get<DeploymentListResponse>(`/deployments/?${params.toString()}`)
      return response
    } catch (error) {
      console.error("Error listing deployments:", error)
      throw new Error(`Failed to list deployments: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  /**
   * POST /deployments/create/ - Crear un nuevo deployment
   */
  static async createDeployment(deploymentData: DeploymentRequest): Promise<DeploymentResponse> {
    try {
      console.log("Creating deployment with data:", deploymentData)

      const response = await apiClient.post<DeploymentResponse>("/deployments/create/", deploymentData)

      console.log("Deployment created successfully:", response)
      return response
    } catch (error) {
      console.error("Error creating deployment:", error)
      throw new Error(`Failed to create deployment: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  /**
   * GET /deployments/{id}/ - Obtener un deployment específico
   */
  static async getDeployment(deploymentId: number): Promise<DeploymentStatus> {
    try {
      const response = await apiClient.get<DeploymentStatus>(`/deployments/${deploymentId}/`)
      return response
    } catch (error) {
      console.error("Error getting deployment:", error)
      throw new Error(`Failed to get deployment: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  /**
   * PUT /deployments/{id}/update/ - Actualizar un deployment
   */
  static async updateDeployment(
    deploymentId: number,
    updateData: UpdateDeploymentRequest,
  ): Promise<DeploymentResponse> {
    try {
      console.log("Updating deployment:", deploymentId, updateData)

      const response = await apiClient.put<DeploymentResponse>(`/deployments/${deploymentId}/update/`, updateData)

      console.log("Deployment updated successfully:", response)
      return response
    } catch (error) {
      console.error("Error updating deployment:", error)
      throw new Error(`Failed to update deployment: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  /**
   * DELETE /deployments/{id}/delete/ - Eliminar un deployment
   */
  static async deleteDeployment(deploymentId: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete<{ success: boolean; message: string }>(
        `/deployments/${deploymentId}/delete/`,
      )
      return response
    } catch (error) {
      console.error("Error deleting deployment:", error)
      throw new Error(`Failed to delete deployment: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  /**
   * POST /deployments/{id}/scale/ - Escalar un deployment
   */
  static async scaleDeployment(deploymentId: number, scaleData: ScaleDeploymentRequest): Promise<DeploymentResponse> {
    try {
      console.log("Scaling deployment:", deploymentId, scaleData)

      const response = await apiClient.post<DeploymentResponse>(`/deployments/${deploymentId}/scale/`, scaleData)

      console.log("Deployment scaled successfully:", response)
      return response
    } catch (error) {
      console.error("Error scaling deployment:", error)
      throw new Error(`Failed to scale deployment: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  /**
   * POST /deployments/{id}/stop/ - Detener un deployment
   */
  static async stopDeployment(deploymentId: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post<{ success: boolean; message: string }>(
        `/deployments/${deploymentId}/stop/`,
        {},
      )
      return response
    } catch (error) {
      console.error("Error stopping deployment:", error)
      throw new Error(`Failed to stop deployment: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  /**
   * POST /deployments/{id}/start/ - Iniciar un deployment
   */
  static async startDeployment(deploymentId: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post<{ success: boolean; message: string }>(
        `/deployments/${deploymentId}/start/`,
        {},
      )
      return response
    } catch (error) {
      console.error("Error starting deployment:", error)
      throw new Error(`Failed to start deployment: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  /**
   * GET /deployments/{id}/logs/ - Obtener logs de un deployment
   */
  static async getDeploymentLogs(
    deploymentId: number,
    lines?: number,
    since?: string,
    follow?: boolean,
  ): Promise<{ logs: string[]; hasMore: boolean }> {
    try {
      const params = new URLSearchParams()
      if (lines) params.append("lines", lines.toString())
      if (since) params.append("since", since)
      if (follow) params.append("follow", follow.toString())

      const endpoint = `/deployments/${deploymentId}/logs/${params.toString() ? `?${params.toString()}` : ""}`
      const response = await apiClient.get<{ logs: string[]; hasMore: boolean }>(endpoint)
      return response
    } catch (error) {
      console.error("Error getting deployment logs:", error)
      throw new Error(`Failed to get deployment logs: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  /**
   * GET /deployments/{id}/metrics/ - Obtener métricas de un deployment
   */
  static async getDeploymentMetrics(
    deploymentId: number,
    startTime?: string,
    endTime?: string,
    period?: number,
  ): Promise<DeploymentMetrics[]> {
    try {
      const params = new URLSearchParams()
      if (startTime) params.append("start_time", startTime)
      if (endTime) params.append("end_time", endTime)
      if (period) params.append("period", period.toString())

      const endpoint = `/deployments/${deploymentId}/metrics/${params.toString() ? `?${params.toString()}` : ""}`
      const response = await apiClient.get<DeploymentMetrics[]>(endpoint)
      return response
    } catch (error) {
      console.error("Error getting deployment metrics:", error)
      throw new Error(`Failed to get deployment metrics: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  /**
   * GET /deployments/{id}/status/ - Obtener estado de un deployment
   */
  static async getDeploymentStatus(deploymentId: number): Promise<DeploymentStatus> {
    try {
      const response = await apiClient.get<DeploymentStatus>(`/deployments/${deploymentId}/status/`)
      return response
    } catch (error) {
      console.error("Error getting deployment status:", error)
      throw new Error(`Failed to get deployment status: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }
  

  // Métodos de conveniencia para compatibilidad con versiones anteriores

  /**
   * @deprecated Use listDeployments() instead
   */
  static async getDeployments(): Promise<DeploymentStatus[]> {
    const response = await this.listDeployments()
    return response.deployments
  }

  /**
   * @deprecated Use deleteDeployment() instead
   */
  static async cancelDeployment(deploymentId: number): Promise<{ success: boolean; message: string }> {
    return this.deleteDeployment(deploymentId)
  }
}
