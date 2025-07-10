import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useDeploymentStore } from "@/store/useDeploymentStore"
import { DeploymentProvider } from "@/providers/deploymentProvider"
import { History, RefreshCw } from "lucide-react"

export function ServiceDeploymentHistory() {
  const { service, setService, setRegions, setDockerImages, setEC2Config, setECSConfig, setLambdaConfig } = useDeploymentStore()
  const [deployments, setDeployments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchDeployments = async () => {
    setLoading(true)
    try {
      const all = await DeploymentProvider.fetchDeploymentsFromLocalApi()
      setDeployments(Array.isArray(all) ? all : [])
    } catch (e) {
      setDeployments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDeployments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service])
console.log(service, "----")
  // Mostrar los 5 más recientes. Si el servicio es 'ecs', mostrar todos (el backend no envía 'service')
  let filtered = deployments
  if (service === "ecs") {
    filtered = deployments.slice(-5).reverse()
  } else {
    filtered = deployments.filter(d => d && d.status && d.service === '').slice(-5).reverse()
  }

  //prueba  ----------
  filtered = deployments.slice(-5).reverse()
  //-------------------
  console.log('deployments:', deployments)
  console.log('filtered:', filtered)

  const handleSelectDeployment = (deployment: any) => {
    setService(deployment.service)
    setRegions(deployment.regions)
    if (deployment.service === "ecs") {
      setECSConfig({
        ...deployment,
        ...deployment.ecsConfig,
        // fallback for legacy fields
        taskCpu: deployment.cpu_units || deployment.taskCpu,
        taskMemory: deployment.memory_mb || deployment.taskMemory,
        desiredCount: deployment.desired_count || deployment.desiredCount,
        networkMode: deployment.network_mode || deployment.networkMode,
        loadBalancer: deployment.load_balancer ?? deployment.loadBalancer,
        autoScaling: deployment.auto_scaling_enabled ?? deployment.autoScaling,
      })
      setDockerImages(deployment.docker_images || [])
    } else if (deployment.service === "ec2") {
      setEC2Config(deployment.ec2Config || {})
      setDockerImages(deployment.docker_images || [])
    } else if (deployment.service === "lambda") {
      setLambdaConfig(deployment.lambdaConfig || {})
    }
  }
  return (
    <Card className="animate-fade-in mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Deployments recientes de este servicio
            </CardTitle>
            <CardDescription>Haz click en uno para editarlo</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchDeployments} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No hay deployments para este servicio
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((deployment) => (
                <div
                  key={deployment.id || deployment.deploymentId}
                  className="border rounded-lg p-4 space-y-2 cursor-pointer hover:bg-blue-50 transition"
                  onClick={() => handleSelectDeployment(deployment)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-blue-500">{deployment.status}</Badge>
                      {
                        deployment.deploymet_url ? 
                        <a href={`${deployment.deploymet_url}`} target="_blank" rel="noopener noreferrer"><span className="text-blue-500 underline">{deployment.deploymet_url}</span></a> 
                        : 
                        <span className="text-sm font-medium">
                        {deployment.name || `${deployment.service?.toUpperCase?.()}-${(deployment.id || deployment.deploymentId)?.toString().slice(0, 8)}`}
                      </span> 
                      }   
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(deployment.created_at || deployment.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Regiones: {(deployment.regions.length > 0 ? deployment.regions : ['us-east-1']).join(", ")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
} 