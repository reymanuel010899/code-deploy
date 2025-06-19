"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Loader2, ExternalLink } from "lucide-react"
import { SERVICES } from "@/constants"
import { useDeploymentStore } from "@/store/useDeploymentStore"
import { useValidation } from "@/hooks/useValidation"
import { useDeployment } from "@/hooks/useDeployment"

export function DeployButton() {
  const { service } = useDeploymentStore()
  const { isValid, errors } = useValidation()
  const { isDeploying, deploymentStatus, createDeployment } = useDeployment()

  const currentService = SERVICES.find((s) => s.id === service)

  const handleDeploy = async () => {
    if (!isValid) {
      return
    }

    await createDeployment()
  }

  return (
    <Card className="animate-fade-in">
      <CardContent className="pt-6">
        <Button
          className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
          disabled={!isValid || isDeploying}
          onClick={handleDeploy}
        >
          {isDeploying ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Desplegando...
            </>
          ) : (
            <>
              <Play className="h-5 w-5 mr-2" />
              Desplegar {currentService?.name}
            </>
          )}
        </Button>

        {/* Mostrar estado del deployment */}
        {deploymentStatus && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Estado: {deploymentStatus.status}</span>
              <span className="text-sm text-muted-foreground">{deploymentStatus.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${deploymentStatus.progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">{deploymentStatus.currentStep}</p>

            {deploymentStatus.status === "completed" && deploymentStatus.resources.serviceArn && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full"
                onClick={() =>
                  window.open(
                    `https://console.aws.amazon.com/ecs/home#/services/${deploymentStatus.resources.serviceArn}`,
                    "_blank",
                  )
                }
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver en AWS Console
              </Button>
            )}
          </div>
        )}

        {errors.length > 0 && (
          <div className="mt-3 text-xs text-red-600 space-y-1">
            {errors.map((error, index) => (
              <p key={index}>• {error}</p>
            ))}
          </div>
        )}

        <p className="text-xs text-center text-muted-foreground mt-3">
          El despliegue tomará aproximadamente {service === "lambda" ? "1-2" : "3-8"} minutos
        </p>
      </CardContent>
    </Card>
  )
}
