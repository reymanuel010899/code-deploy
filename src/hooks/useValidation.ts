"use client"

import { useMemo } from "react"
import { useDeploymentStore } from "@/store/useDeploymentStore"

export const useValidation = () => {
  const { service, dockerImages, ec2Config, ecsConfig, lambdaConfig, regions } = useDeploymentStore()

  const validation = useMemo(() => {
    const errors: string[] = []
    const warnings: string[] = []

    // Common validations
    if (regions.length === 0) {
      errors.push("Debes seleccionar al menos una región")
    }

    // Service-specific validations
    switch (service) {
      case "ec2":
        if (!ec2Config.keyPair.trim()) {
          errors.push("El Key Pair es obligatorio para EC2")
        }
        if (!dockerImages.some((img) => img.name.trim())) {
          errors.push("Debes especificar al menos una imagen Docker")
        }
        if (ec2Config.storageSize < 8) {
          warnings.push("El almacenamiento mínimo recomendado es 8GB")
        }
        break

      case "ecs":
        if (!ecsConfig.clusterName.trim()) {
          errors.push("El nombre del cluster es obligatorio")
        }
        if (!ecsConfig.serviceName.trim()) {
          errors.push("El nombre del servicio es obligatorio")
        }
        if (!ecsConfig.taskDefinitionFamily.trim()) {
          errors.push("El nombre de la task definition es obligatorio")
        }
        if (!dockerImages.some((img) => img.name.trim())) {
          errors.push("Debes especificar al menos una imagen Docker")
        }
        if (ecsConfig.subnets.length === 0) {
          errors.push("Debes especificar al menos una subnet")
        }
        if (ecsConfig.securityGroups.length === 0) {
          errors.push("Debes especificar al menos un security group")
        }
        if (ecsConfig.taskMemory < 512) {
          warnings.push("Se recomienda al menos 512MB de memoria")
        }
        if (ecsConfig.containerPort <= 0 || ecsConfig.containerPort > 65535) {
          errors.push("El puerto del contenedor debe estar entre 1 y 65535")
        }
        break

      case "lambda":
        if (!lambdaConfig.handler.trim()) {
          errors.push("El handler es obligatorio para Lambda")
        }
        if (lambdaConfig.timeout > 900) {
          warnings.push("El timeout máximo para Lambda es 15 minutos")
        }
        if (lambdaConfig.memory < 128) {
          warnings.push("La memoria mínima para Lambda es 128MB")
        }
        break
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      canDeploy: errors.length === 0,
    }
  }, [service, dockerImages, ec2Config, ecsConfig, lambdaConfig, regions])

  return validation
}
