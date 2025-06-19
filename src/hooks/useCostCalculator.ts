"use client"

import { useMemo } from "react"
import { useDeploymentStore } from "@/store/useDeploymentStore"
import { AWS_REGIONS, INSTANCE_COSTS } from "@/constants"

export const useCostCalculator = () => {
  const { service, regions, ec2Config, ecsConfig, lambdaConfig } = useDeploymentStore()

  const totalCost = useMemo(() => {
    let baseCost = 0

    // Calculate regional multiplier
    const regionMultiplier = regions.reduce((acc, regionId) => {
      const region = AWS_REGIONS.find((r) => r.id === regionId)
      return acc + (region?.priceMultiplier || 1)
    }, 0)

    switch (service) {
      case "ec2":
        const instanceCost = INSTANCE_COSTS[ec2Config.instanceType as keyof typeof INSTANCE_COSTS] || 0.0416
        baseCost = instanceCost * 24 * 30 + ec2Config.storageSize * 0.1
        if (ec2Config.monitoring) baseCost += 2.1
        break

      case "ecs":
        baseCost = (ecsConfig.taskCpu / 1024) * 0.04048 + (ecsConfig.taskMemory / 1024) * 0.004445
        baseCost = baseCost * 24 * 30 * ecsConfig.desiredCount
        if (ecsConfig.loadBalancer) baseCost += 16.2
        break

      case "lambda":
        const requestCost = 1000000 * 0.0000002
        const computeCost = (lambdaConfig.memory / 1024) * (lambdaConfig.timeout / 1000) * 0.0000166667 * 1000000
        baseCost = requestCost + computeCost
        break
    }

    return (baseCost * regionMultiplier).toFixed(2)
  }, [service, regions, ec2Config, ecsConfig, lambdaConfig])

  const costBreakdown = useMemo(() => {
    const breakdown = regions
      .map((regionId) => {
        const region = AWS_REGIONS.find((r) => r.id === regionId)
        if (!region) return null

        let regionCost = 0
        switch (service) {
          case "ec2":
            const instanceCost = INSTANCE_COSTS[ec2Config.instanceType as keyof typeof INSTANCE_COSTS] || 0.0416
            regionCost = (instanceCost * 24 * 30 + ec2Config.storageSize * 0.1) * region.priceMultiplier
            break
          case "ecs":
            regionCost =
              ((ecsConfig.taskCpu / 1024) * 0.04048 + (ecsConfig.taskMemory / 1024) * 0.004445) *
              24 *
              30 *
              ecsConfig.desiredCount *
              region.priceMultiplier
            break
          case "lambda":
            const requestCost = 1000000 * 0.0000002
            const computeCost = (lambdaConfig.memory / 1024) * (lambdaConfig.timeout / 1000) * 0.0000166667 * 1000000
            regionCost = (requestCost + computeCost) * region.priceMultiplier
            break
        }

        return {
          region: region.name,
          cost: regionCost.toFixed(2),
          flag: region.flag,
        }
      })
      .filter(Boolean)

    return breakdown
  }, [service, regions, ec2Config, ecsConfig, lambdaConfig])

  return { totalCost, costBreakdown }
}
