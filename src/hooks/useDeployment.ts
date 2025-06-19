"use client"

import { useState, useCallback } from "react"
import { toast } from "react-hot-toast"
import { DeploymentProvider } from "@/providers/deploymentProvider"
import { useDeploymentStore } from "@/store/useDeploymentStore"
import type {
  DeploymentRequest,
  DeploymentResponse,
  DeploymentStatus,
  DeploymentMetrics,
  ScaleDeploymentRequest,
  UpdateDeploymentRequest,
} from "@/types/api"

export const useDeployment = () => {
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStatus | null>(null)
  const [deploymentMetrics, setDeploymentMetrics] = useState<DeploymentMetrics[]>([])
  const { service, regions, dockerImages, ecsConfig, ec2Config, lambdaConfig } = useDeploymentStore()

  const createDeployment = useCallback(async (): Promise<DeploymentResponse | null> => {
    setIsDeploying(true)

    try {
      // Preparar los datos del deployment
      const deploymentData: DeploymentRequest = {
        service,
        regions,
        dockerImages: dockerImages.filter((img) => img.name.trim()),
      }

      // Agregar configuración específica del servicio
      switch (service) {
        case "ecs":
          deploymentData.ecsConfig = {
            clusterName: ecsConfig.clusterName,
            serviceName: ecsConfig.serviceName,
            taskDefinitionFamily: ecsConfig.taskDefinitionFamily,
            taskCpu: ecsConfig.taskCpu,
            taskMemory: ecsConfig.taskMemory,
            desiredCount: ecsConfig.desiredCount,
            loadBalancer: ecsConfig.loadBalancer,
            autoScaling: ecsConfig.autoScaling,
            minCapacity: ecsConfig.minCapacity,
            maxCapacity: ecsConfig.maxCapacity,
            networkMode: ecsConfig.networkMode,
            platformVersion: ecsConfig.platformVersion,
            assignPublicIp: ecsConfig.assignPublicIp,
            subnets: ecsConfig.subnets,
            securityGroups: ecsConfig.securityGroups,
            containerPort: ecsConfig.containerPort,
            hostPort: ecsConfig.hostPort,
            protocol: ecsConfig.protocol,
            essential: ecsConfig.essential,
            logGroup: ecsConfig.logGroup,
            logRegion: ecsConfig.logRegion,
            logStreamPrefix: ecsConfig.logStreamPrefix,
            environmentVariables: ecsConfig.environmentVariables,
            secrets: ecsConfig.secrets,
            healthCheckEnabled: ecsConfig.healthCheckEnabled,
            healthCheckPath: ecsConfig.healthCheckPath,
            healthCheckInterval: ecsConfig.healthCheckInterval,
            healthCheckTimeout: ecsConfig.healthCheckTimeout,
            healthCheckRetries: ecsConfig.healthCheckRetries,
            cpuReservation: ecsConfig.cpuReservation,
            memoryReservation: ecsConfig.memoryReservation,
            memoryHardLimit: ecsConfig.memoryHardLimit,
          }
          break

        case "ec2":
          deploymentData.ec2Config = {
            os: ec2Config.os,
            instanceType: ec2Config.instanceType,
            keyPair: ec2Config.keyPair,
            securityGroup: ec2Config.securityGroup,
            subnet: ec2Config.subnet,
            storageType: ec2Config.storageType,
            storageSize: ec2Config.storageSize,
            userData: ec2Config.userData,
            monitoring: ec2Config.monitoring,
          }
          break

        case "lambda":
          deploymentData.lambdaConfig = {
            runtime: lambdaConfig.runtime,
            handler: lambdaConfig.handler,
            timeout: lambdaConfig.timeout,
            memory: lambdaConfig.memory,
            environmentVars: lambdaConfig.environmentVars,
            trigger: lambdaConfig.trigger,
            deadLetterQueue: lambdaConfig.deadLetterQueue,
          }
          break
      }

      toast.loading("Iniciando deployment...", { id: "deployment" })

      const response = await DeploymentProvider.createDeployment(deploymentData)

      if (response.success) {
        toast.success(`Deployment iniciado exitosamente! ID: ${response.deploymentId}`, { id: "deployment" })

        // Iniciar polling del estado
        pollDeploymentStatus(Number.parseInt(response.deploymentId))

        return response
      } else {
        throw new Error(response.message || "Error desconocido")
      }
    } catch (error) {
      console.error("Deployment error:", error)
      toast.error(`Error en el deployment: ${error instanceof Error ? error.message : "Error desconocido"}`, {
        id: "deployment",
      })
      return null
    } finally {
      setIsDeploying(false)
    }
  }, [service, regions, dockerImages, ecsConfig, ec2Config, lambdaConfig])

  const pollDeploymentStatus = useCallback(async (deploymentId: number) => {
    const pollInterval = setInterval(async () => {
      try {
        const status = await DeploymentProvider.getDeploymentStatus(deploymentId)
        setDeploymentStatus(status)

        // Actualizar toast con el progreso
        toast.loading(`${status.currentStep} (${status.progress}%)`, { id: "deployment" })

        if (status.status === "completed") {
          clearInterval(pollInterval)
          toast.success("¡Deployment completado exitosamente!", { id: "deployment" })
        } else if (status.status === "failed") {
          clearInterval(pollInterval)
          toast.error("El deployment falló. Revisa los logs para más detalles.", { id: "deployment" })
        }
      } catch (error) {
        console.error("Error polling deployment status:", error)
        clearInterval(pollInterval)
        toast.error("Error obteniendo el estado del deployment", { id: "deployment" })
      }
    }, 3000) // Poll cada 3 segundos

    // Limpiar el interval después de 10 minutos
    setTimeout(() => {
      clearInterval(pollInterval)
    }, 600000)
  }, [])

  const scaleDeployment = useCallback(async (deploymentId: number, scaleData: ScaleDeploymentRequest) => {
    try {
      toast.loading("Escalando deployment...", { id: "scale" })

      const response = await DeploymentProvider.scaleDeployment(deploymentId, scaleData)

      if (response.success) {
        toast.success("Deployment escalado exitosamente", { id: "scale" })
        return response
      } else {
        throw new Error(response.message || "Error escalando deployment")
      }
    } catch (error) {
      console.error("Scale deployment error:", error)
      toast.error(`Error escalando deployment: ${error instanceof Error ? error.message : "Error desconocido"}`, {
        id: "scale",
      })
      return null
    }
  }, [])

  const updateDeployment = useCallback(async (deploymentId: number, updateData: UpdateDeploymentRequest) => {
    try {
      toast.loading("Actualizando deployment...", { id: "update" })

      const response = await DeploymentProvider.updateDeployment(deploymentId, updateData)

      if (response.success) {
        toast.success("Deployment actualizado exitosamente", { id: "update" })
        return response
      } else {
        throw new Error(response.message || "Error actualizando deployment")
      }
    } catch (error) {
      console.error("Update deployment error:", error)
      toast.error(`Error actualizando deployment: ${error instanceof Error ? error.message : "Error desconocido"}`, {
        id: "update",
      })
      return null
    }
  }, [])

  const stopDeployment = useCallback(async (deploymentId: number) => {
    try {
      toast.loading("Deteniendo deployment...", { id: "stop" })

      const response = await DeploymentProvider.stopDeployment(deploymentId)

      if (response.success) {
        toast.success("Deployment detenido exitosamente", { id: "stop" })
        return response
      } else {
        throw new Error(response.message || "Error deteniendo deployment")
      }
    } catch (error) {
      console.error("Stop deployment error:", error)
      toast.error(`Error deteniendo deployment: ${error instanceof Error ? error.message : "Error desconocido"}`, {
        id: "stop",
      })
      return null
    }
  }, [])

  const startDeployment = useCallback(async (deploymentId: number) => {
    try {
      toast.loading("Iniciando deployment...", { id: "start" })

      const response = await DeploymentProvider.startDeployment(deploymentId)

      if (response.success) {
        toast.success("Deployment iniciado exitosamente", { id: "start" })
        return response
      } else {
        throw new Error(response.message || "Error iniciando deployment")
      }
    } catch (error) {
      console.error("Start deployment error:", error)
      toast.error(`Error iniciando deployment: ${error instanceof Error ? error.message : "Error desconocido"}`, {
        id: "start",
      })
      return null
    }
  }, [])

  const getDeploymentLogs = useCallback(async (deploymentId: number, lines?: number) => {
    try {
      const response = await DeploymentProvider.getDeploymentLogs(deploymentId, lines)
      return response.logs
    } catch (error) {
      console.error("Error getting deployment logs:", error)
      toast.error("Error obteniendo los logs del deployment")
      return []
    }
  }, [])

  const getDeploymentMetrics = useCallback(async (deploymentId: number, startTime?: string, endTime?: string) => {
    try {
      const metrics = await DeploymentProvider.getDeploymentMetrics(deploymentId, startTime, endTime)
      setDeploymentMetrics(metrics)
      return metrics
    } catch (error) {
      console.error("Error getting deployment metrics:", error)
      toast.error("Error obteniendo las métricas del deployment")
      return []
    }
  }, [])

  return {
    isDeploying,
    deploymentStatus,
    deploymentMetrics,
    createDeployment,
    scaleDeployment,
    updateDeployment,
    stopDeployment,
    startDeployment,
    getDeploymentLogs,
    getDeploymentMetrics,
  }
}
