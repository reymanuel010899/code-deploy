import { apiClient } from "./api"

export interface AWSRegion {
  id: string
  name: string
  available: boolean
  services: string[]
}

export interface AWSResource {
  id: string
  name: string
  type: string
  region: string
  status: string
}

export class AWSProvider {
  /**
   * Obtener regiones disponibles
   */
  static async getAvailableRegions(): Promise<AWSRegion[]> {
    try {
      const response = await apiClient.get<AWSRegion[]>("/aws/regions")
      return response
    } catch (error) {
      console.error("Error getting AWS regions:", error)
      throw new Error(`Failed to get AWS regions: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  /**
   * Validar credenciales de AWS
   */
  static async validateCredentials(): Promise<{ valid: boolean; message: string }> {
    try {
      const response = await apiClient.get<{ valid: boolean; message: string }>("/aws/validate-credentials")
      return response
    } catch (error) {
      console.error("Error validating AWS credentials:", error)
      throw new Error(`Failed to validate AWS credentials: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  /**
   * Obtener recursos existentes
   */
  static async getResources(region: string, resourceType?: string): Promise<AWSResource[]> {
    try {
      const endpoint = resourceType
        ? `/aws/resources?region=${region}&type=${resourceType}`
        : `/aws/resources?region=${region}`

      const response = await apiClient.get<AWSResource[]>(endpoint)
      return response
    } catch (error) {
      console.error("Error getting AWS resources:", error)
      throw new Error(`Failed to get AWS resources: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  /**
   * Obtener subnets disponibles
   */
  static async getSubnets(
    region: string,
  ): Promise<{ id: string; name: string; availabilityZone: string; type: "public" | "private" }[]> {
    try {
      const response = await apiClient.get<
        { id: string; name: string; availabilityZone: string; type: "public" | "private" }[]
      >(`/aws/subnets?region=${region}`)
      return response
    } catch (error) {
      console.error("Error getting subnets:", error)
      throw new Error(`Failed to get subnets: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  /**
   * Obtener security groups disponibles
   */
  static async getSecurityGroups(region: string): Promise<{ id: string; name: string; description: string }[]> {
    try {
      const response = await apiClient.get<{ id: string; name: string; description: string }[]>(
        `/aws/security-groups?region=${region}`,
      )
      return response
    } catch (error) {
      console.error("Error getting security groups:", error)
      throw new Error(`Failed to get security groups: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }
}
