"use client"

import { useDeploymentStore } from "@/store/useDeploymentStore"
import { EC2Configuration } from "./EC2Configuration"
import { ECSConfiguration } from "./ECSConfiguration"
import { LambdaConfiguration } from "./LambdaConfiguration"

export function ServiceConfiguration() {
  const { service } = useDeploymentStore()

  switch (service) {
    case "ec2":
      return <EC2Configuration />
    case "ecs":
      return <ECSConfiguration />
    case "lambda":
      return <LambdaConfiguration />
    default:
      return null
  }
}
