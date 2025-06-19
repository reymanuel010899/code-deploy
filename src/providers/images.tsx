import { apiClient } from "./api"
import type { ImagesRequest } from "@/types/api"
import type { DeploymentResponse } from "@/types/api"

export async function createDockerImages(ImageData: ImagesRequest): Promise<DeploymentResponse> {
    try {
      console.log("Creating deployment with data:", ImageData)

      const response = await apiClient.post<DeploymentResponse>("/images/create/", ImageData)

      console.log("Deployment created successfully:", response)
      return response
    } catch (error: unknown) {
      console.error("Error creating deployment:", error)
      throw new Error(`Failed to create deployment: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
}