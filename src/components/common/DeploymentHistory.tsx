"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  History,
  ExternalLink,
  Trash2,
  RefreshCw,
  Play,
  Square,
  BarChart3,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useDeploymentList } from "@/hooks/useDeploymentList"
import { useDeployment } from "@/hooks/useDeployment"
import type { DeploymentStatus } from "@/types/api"

export function DeploymentHistory() {
  const { deployments, loading, pagination, filters, refreshDeployments, goToPage, updateFilters, deleteDeployment } =
    useDeploymentList()

  const { stopDeployment, startDeployment } = useDeployment()

  const [selectedDeployment, setSelectedDeployment] = useState<DeploymentStatus | null>(null)

  const handleStopDeployment = async (deploymentId: string) => {
    await stopDeployment(Number.parseInt(deploymentId))
    refreshDeployments()
  }

  const handleStartDeployment = async (deploymentId: string) => {
    await startDeployment(Number.parseInt(deploymentId))
    refreshDeployments()
  }

  const handleDeleteDeployment = async (deploymentId: string) => {
    await deleteDeployment(Number.parseInt(deploymentId))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "stopped":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getServiceIcon = (service: string) => {
    switch (service) {
      case "ecs":
        return "🐳"
      case "ec2":
        return "🖥️"
      case "lambda":
        return "⚡"
      default:
        return "📦"
    }
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Historial de Deployments
            </CardTitle>
            <CardDescription>Gestiona y monitorea todos tus deployments ({pagination.total} total)</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={refreshDeployments} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Filtros */}
        <div className="flex gap-4 mt-4">
          <Select value={filters.status} onValueChange={(value) => updateFilters({ status: value })}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="in_progress">En progreso</SelectItem>
              <SelectItem value="completed">Completado</SelectItem>
              <SelectItem value="failed">Fallido</SelectItem>
              <SelectItem value="stopped">Detenido</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.service} onValueChange={(value) => updateFilters({ service: value })}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Servicio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="ecs">ECS</SelectItem>
              <SelectItem value="ec2">EC2</SelectItem>
              <SelectItem value="lambda">Lambda</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-96">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : deployments.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No hay deployments que coincidan con los filtros
            </div>
          ) : (
            <div className="space-y-4">
              {deployments.map((deployment) => (
                <div key={deployment.deploymentId} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{getServiceIcon(deployment.service)}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(deployment.status)}>{deployment.status}</Badge>
                          <span className="text-sm font-medium">
                            {deployment.name ||
                              `${deployment.service.toUpperCase()}-${deployment.deploymentId.slice(0, 8)}`}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          ID: {deployment.deploymentId} • Regiones: {deployment.regions.join(", ")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Botones de acción */}
                      {deployment.status === "in_progress" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStopDeployment(deployment.deploymentId)}
                          title="Detener"
                        >
                          <Square className="h-4 w-4" />
                        </Button>
                      )}

                      {deployment.status === "stopped" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStartDeployment(deployment.deploymentId)}
                          title="Iniciar"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedDeployment(deployment)}
                        title="Ver métricas"
                      >
                        <BarChart3 className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteDeployment(deployment.deploymentId)}
                        title="Eliminar"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>

                      {deployment.resources.serviceArn && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.open(
                              `https://console.aws.amazon.com/ecs/home#/services/${deployment.resources.serviceArn}`,
                              "_blank",
                            )
                          }
                          title="Ver en AWS Console"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground grid grid-cols-2 gap-4">
                    <div>
                      <p>Paso actual: {deployment.currentStep}</p>
                      <p>Progreso: {deployment.progress}%</p>
                    </div>
                    <div>
                      <p>Creado: {new Date(deployment.createdAt).toLocaleString()}</p>
                      <p>Actualizado: {new Date(deployment.updatedAt).toLocaleString()}</p>
                    </div>
                  </div>

                  {deployment.status === "in_progress" && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${deployment.progress}%` }}
                      />
                    </div>
                  )}

                  {deployment.logs.length > 0 && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground flex items-center gap-2">
                        <FileText className="h-3 w-3" />
                        Ver logs recientes ({deployment.logs.length})
                      </summary>
                      <div className="mt-2 p-2 bg-muted rounded text-xs font-mono max-h-32 overflow-y-auto">
                        {deployment.logs.slice(-10).map((log, index) => (
                          <div key={index}>{log}</div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Paginación */}
        {pagination.total > pagination.pageSize && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Página {pagination.page} de {Math.ceil(pagination.total / pagination.pageSize)}({pagination.total}{" "}
              deployments total)
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(pagination.page - 1)}
                disabled={!pagination.hasPrevious}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <span className="text-sm px-2">{pagination.page}</span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(pagination.page + 1)}
                disabled={!pagination.hasNext}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
