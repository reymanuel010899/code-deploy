"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Database } from "lucide-react"
import { SERVICES, OPERATING_SYSTEMS, RUNTIMES } from "@/constants"
import { useDeploymentStore } from "@/store/useDeploymentStore"

export function ConfigurationSummary() {
  const { service, regions, dockerImages, ec2Config, ecsConfig, lambdaConfig } = useDeploymentStore()

  const currentService = SERVICES.find((s) => s.id === service)

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Resumen de Configuración
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Servicio:</span>
            <Badge>{currentService?.name}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Regiones:</span>
            <Badge variant="outline">{regions.length}</Badge>
          </div>

          {service === "ec2" && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">OS:</span>
                <Badge variant="secondary">{OPERATING_SYSTEMS.find((os) => os.value === ec2Config.os)?.label}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Instancia:</span>
                <Badge variant="secondary">{ec2Config.instanceType}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Storage:</span>
                <Badge variant="secondary">
                  {ec2Config.storageSize} GB {ec2Config.storageType}
                </Badge>
              </div>
            </>
          )}

          {service === "ecs" && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Servicio:</span>
                <Badge variant="secondary">{ecsConfig.serviceName || "Sin nombre"}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">CPU:</span>
                <Badge variant="secondary">{ecsConfig.taskCpu / 1024} vCPU</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Memoria:</span>
                <Badge variant="secondary">{ecsConfig.taskMemory} MB</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Tareas:</span>
                <Badge variant="secondary">{ecsConfig.desiredCount}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Puerto:</span>
                <Badge variant="secondary">{ecsConfig.containerPort}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Plataforma:</span>
                <Badge variant="secondary">Fargate {ecsConfig.platformVersion}</Badge>
              </div>
            </>
          )}

          {service === "lambda" && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Runtime:</span>
                <Badge variant="secondary">{RUNTIMES.find((r) => r.value === lambdaConfig.runtime)?.label}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Memoria:</span>
                <Badge variant="secondary">{lambdaConfig.memory} MB</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Timeout:</span>
                <Badge variant="secondary">{lambdaConfig.timeout}s</Badge>
              </div>
            </>
          )}

          {(service === "ec2" || service === "ecs") && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Imágenes:</span>
              <Badge variant="secondary">{dockerImages.filter((img) => img.name).length}</Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
