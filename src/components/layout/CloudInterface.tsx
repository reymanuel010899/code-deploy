import { useState } from "react"
import { Cloud } from "lucide-react"
import { ServiceSelector } from "@/components/services/ServiceSelector"
import { DockerImagesConfig } from "@/components/common/DockerImagesConfig"
import { ServiceConfiguration } from "@/components/services/ServiceConfiguration"
import { RegionCarousel } from "@/components/regions/RegionCarousel"
import { ConfigurationSummary } from "@/components/common/ConfigurationSummary"
import { CostEstimation } from "@/components/common/CostEstimation"
import { DeployButton } from "@/components/common/DeployButton"
import { DeploymentHistory } from "@/components/common/DeploymentHistory"
import { ThemeToggle } from "@/components/common/ThemeToggle"
import { TemplateManager } from "@/components/common/TemplateManager"
import { useDeploymentStore } from "@/store/useDeploymentStore"

export function CloudInterface() {
  const { service } = useDeploymentStore()
  const [showHistory, setShowHistory] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 relative">
          <div className="absolute top-0 right-0">
            <div className="flex items-center gap-2">
              <TemplateManager />
              <ThemeToggle />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-foreground flex items-center justify-center gap-3 animate-fade-in">
            <Cloud className="h-10 w-10 text-primary" />
            CloudDeploy Pro
          </h1>
          <p className="text-muted-foreground text-lg">
            Despliega tus aplicaciones Docker en la nube de forma sencilla
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Configuration */}
          <div className="lg:col-span-2 space-y-6">
            <ServiceSelector />

            {(service === "ec2" || service === "ecs") && <DockerImagesConfig />}

            <ServiceConfiguration />

            {/* Deployment History Toggle */}
            <div className="flex justify-center">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {showHistory ? "Ocultar historial" : "Ver historial de deployments"}
              </button>
            </div>

            {showHistory && <DeploymentHistory />}
          </div>

          {/* Summary Panel */}
          <div className="space-y-6">
            <RegionCarousel />
            <ConfigurationSummary />
            <CostEstimation />
            <DeployButton />
          </div>
        </div>
      </div>
    </div>
  )
}
