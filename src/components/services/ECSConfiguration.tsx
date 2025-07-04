"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Container, Plus, Trash2, Network, Shield, Activity, Settings } from "lucide-react"
import { useDeploymentStore } from "@/store/useDeploymentStore"

export function ECSConfiguration() {
  const { ecsConfig, setECSConfig } = useDeploymentStore()

  const addEnvironmentVariable = () => {
    setECSConfig({
      environmentVariables: [...ecsConfig.environmentVariables, { name: "", value: "" }],
    })
  }

  const removeEnvironmentVariable = (index: number) => {
    setECSConfig({
      environmentVariables: ecsConfig.environmentVariables.filter((_, i) => i !== index),
    })
  }

  const updateEnvironmentVariable = (index: number, field: "name" | "value", value: string) => {
    const updated = [...ecsConfig.environmentVariables]
    updated[index][field] = value
    setECSConfig({ environmentVariables: updated })
  }

  const addSecret = () => {
    setECSConfig({
      secrets: [...ecsConfig.secrets, { name: "", valueFrom: "" }],
    })
  }

  const removeSecret = (index: number) => {
    setECSConfig({
      secrets: ecsConfig.secrets.filter((_, i) => i !== index),
    })
  }

  const updateSecret = (index: number, field: "name" | "valueFrom", value: string) => {
    const updated = [...ecsConfig.secrets]
    updated[index][field] = value
    setECSConfig({ secrets: updated })
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Container className="h-5 w-5" />
          Configuración SkyBox Fargate
        </CardTitle>
        <CardDescription>Configura tu servicio de contenedores serverless con Fargate</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="basic">Básico</TabsTrigger>
            <TabsTrigger value="taskdef">Task Definition</TabsTrigger>
            <TabsTrigger value="images">Imágenes</TabsTrigger>
            <TabsTrigger value="container">Contenedor</TabsTrigger>
            <TabsTrigger value="network">Red</TabsTrigger>
            <TabsTrigger value="environment">Variables</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoreo</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre del Cluster</Label>
                <Input
                  placeholder="mi-aplicacion-cluster"
                  value={ecsConfig.clusterName}
                  onChange={(e) => setECSConfig({ clusterName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Nombre del Servicio</Label>
                <Input
                  placeholder="mi-servicio-web"
                  value={ecsConfig.serviceName}
                  onChange={(e) => setECSConfig({ serviceName: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Task Definition Family</Label>
              <Input
                placeholder="mi-task-definition"
                value={ecsConfig.taskDefinitionFamily}
                onChange={(e) => setECSConfig({ taskDefinitionFamily: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Nombre de la familia de definición de tareas</p>
            </div>

            <div className="space-y-2">
              <Label>Versión de Plataforma Fargate</Label>
              <Select
                value={ecsConfig.platformVersion}
                onValueChange={(value) => setECSConfig({ platformVersion: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LATEST">LATEST (Recomendado)</SelectItem>
                  <SelectItem value="1.4.0">1.4.0</SelectItem>
                  <SelectItem value="1.3.0">1.3.0</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="taskdef" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>CPU (vCPU)</Label>
                  <Badge variant="secondary">{ecsConfig.taskCpu}</Badge>
                </div>
                <Select
                  value={ecsConfig.taskCpu.toString()}
                  onValueChange={(value) => setECSConfig({ taskCpu: Number.parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="256">0.25 vCPU (256)</SelectItem>
                    <SelectItem value="512">0.5 vCPU (512)</SelectItem>
                    <SelectItem value="1024">1 vCPU (1024)</SelectItem>
                    <SelectItem value="2048">2 vCPU (2048)</SelectItem>
                    <SelectItem value="4096">4 vCPU (4096)</SelectItem>
                    <SelectItem value="8192">8 vCPU (8192)</SelectItem>
                    <SelectItem value="16384">16 vCPU (16384)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Memoria (MB)</Label>
                  <Badge variant="secondary">{ecsConfig.taskMemory} MB</Badge>
                </div>
                <Select
                  value={ecsConfig.taskMemory.toString()}
                  onValueChange={(value) => setECSConfig({ taskMemory: Number.parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="512">512 MB</SelectItem>
                    <SelectItem value="1024">1 GB (1024 MB)</SelectItem>
                    <SelectItem value="2048">2 GB (2048 MB)</SelectItem>
                    <SelectItem value="3072">3 GB (3072 MB)</SelectItem>
                    <SelectItem value="4096">4 GB (4096 MB)</SelectItem>
                    <SelectItem value="5120">5 GB (5120 MB)</SelectItem>
                    <SelectItem value="6144">6 GB (6144 MB)</SelectItem>
                    <SelectItem value="7168">7 GB (7168 MB)</SelectItem>
                    <SelectItem value="8192">8 GB (8192 MB)</SelectItem>
                    <SelectItem value="16384">16 GB (16384 MB)</SelectItem>
                    <SelectItem value="30720">30 GB (30720 MB)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="images" className="space-y-6 mt-6">
            <div className="my-6">
              <h4 className="font-medium flex items-center gap-2">
                <Container className="h-5 w-5" />
                Imágenes Docker
              </h4>
              <p className="text-muted-foreground mb-2">Configura hasta 3 imágenes Docker para tu tarea ECS. Especifica el puerto, CPU y memoria de cada contenedor.</p>
              {useDeploymentStore.getState().dockerImages.map((image, index) => (
                <div key={image.id} className="flex gap-3 items-end mb-2">
                  <div className="flex-1 space-y-2">
                    <Label>Imagen {index + 1}</Label>
                    <Input
                      placeholder="nginx, node:18, postgres:15"
                      value={image.name}
                      onChange={(e) => useDeploymentStore.getState().updateDockerImage(image.id, "name", e.target.value)}
                    />
                  </div>
                  <div className="w-24 space-y-2">
                    <Label>Tag</Label>
                    <Input
                      placeholder="latest"
                      value={image.tag}
                      onChange={(e) => useDeploymentStore.getState().updateDockerImage(image.id, "tag", e.target.value)}
                    />
                  </div>
                  <div className="w-24 space-y-2">
                    <Label>Puerto</Label>
                    <Input
                      placeholder="80"
                      value={image.port || ""}
                      onChange={(e) => useDeploymentStore.getState().updateDockerImage(image.id, "port", e.target.value)}
                    />
                  </div>
                  <div className="w-24 space-y-2">
                    <Label>CPU</Label>
                    <Input
                      placeholder="256"
                      value={image.cpu || ""}
                      onChange={(e) => useDeploymentStore.getState().updateDockerImage(image.id, "cpu", e.target.value)}
                    />
                  </div>
                  <div className="w-24 space-y-2">
                    <Label>Memoria</Label>
                    <Input
                      placeholder="512"
                      value={image.memory || ""}
                      onChange={(e) => useDeploymentStore.getState().updateDockerImage(image.id, "memory", e.target.value)}
                    />
                  </div>
                  {useDeploymentStore.getState().dockerImages.length > 1 && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => useDeploymentStore.getState().removeDockerImage(image.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {useDeploymentStore.getState().dockerImages.length < 3 && (
                <Button
                  variant="outline"
                  onClick={() => useDeploymentStore.getState().addDockerImage()}
                  className="w-full border-dashed border-2 hover:bg-muted/50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Imagen Docker
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="container" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Puerto del Contenedor</Label>
                <Input
                  type="number"
                  value={ecsConfig.containerPort}
                  onChange={(e) => setECSConfig({ containerPort: Number.parseInt(e.target.value) })}
                  placeholder="80"
                />
              </div>

              <div className="space-y-2">
                <Label>Protocolo</Label>
                <Select value={ecsConfig.protocol} onValueChange={(value) => setECSConfig({ protocol: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tcp">TCP</SelectItem>
                    <SelectItem value="udp">UDP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={ecsConfig.essential}
                onCheckedChange={(checked) => setECSConfig({ essential: checked })}
              />
              <Label>Contenedor esencial</Label>
              <p className="text-xs text-muted-foreground ml-2">Si falla, toda la tarea se detiene</p>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Límites de Recursos (Opcional)</h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>CPU Reservada</Label>
                  <Input
                    type="number"
                    placeholder="128"
                    value={ecsConfig.cpuReservation || ""}
                    onChange={(e) =>
                      setECSConfig({ cpuReservation: e.target.value ? Number.parseInt(e.target.value) : undefined })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Memoria Reservada (MB)</Label>
                  <Input
                    type="number"
                    placeholder="256"
                    value={ecsConfig.memoryReservation || ""}
                    onChange={(e) =>
                      setECSConfig({ memoryReservation: e.target.value ? Number.parseInt(e.target.value) : undefined })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Límite Memoria (MB)</Label>
                  <Input
                    type="number"
                    placeholder="512"
                    value={ecsConfig.memoryHardLimit || ""}
                    onChange={(e) =>
                      setECSConfig({ memoryHardLimit: e.target.value ? Number.parseInt(e.target.value) : undefined })
                    }
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="network" className="space-y-6 mt-6">
            <div className="flex items-center space-x-2">
              <Switch
                checked={ecsConfig.assignPublicIp}
                onCheckedChange={(checked) => setECSConfig({ assignPublicIp: checked })}
              />
              <Label className="flex items-center gap-2">
                <Network className="h-4 w-4" />
                Asignar IP Pública
              </Label>
            </div>

            <div className="space-y-2">
              <Label>Subnets (separadas por comas)</Label>
              <Textarea
                placeholder="subnet-12345678,subnet-87654321"
                value={ecsConfig.subnets.join(",")}
                onChange={(e) =>
                  setECSConfig({
                    subnets: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                rows={2}
              />
              <p className="text-xs text-muted-foreground">IDs de las subnets donde desplegar las tareas</p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security Groups (separados por comas)
              </Label>
              <Textarea
                placeholder="sg-12345678,sg-87654321"
                value={ecsConfig.securityGroups.join(",")}
                onChange={(e) =>
                  setECSConfig({
                    securityGroups: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                rows={2}
              />
              <p className="text-xs text-muted-foreground">IDs de los security groups para las tareas</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Número de Tareas Deseadas</Label>
                  <Badge variant="secondary">{ecsConfig.desiredCount}</Badge>
                </div>
                <Slider
                  value={[ecsConfig.desiredCount]}
                  onValueChange={(value) => setECSConfig({ desiredCount: value[0] })}
                  max={20}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={ecsConfig.loadBalancer}
                    onCheckedChange={(checked) => setECSConfig({ loadBalancer: checked })}
                  />
                  <Label>Application Load Balancer</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={ecsConfig.autoScaling}
                    onCheckedChange={(checked) => setECSConfig({ autoScaling: checked })}
                  />
                  <Label>Auto Scaling</Label>
                </div>
              </div>
            </div>

            {ecsConfig.autoScaling && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="space-y-2">
                  <Label>Capacidad Mínima</Label>
                  <Input
                    type="number"
                    value={ecsConfig.minCapacity}
                    onChange={(e) => setECSConfig({ minCapacity: Number.parseInt(e.target.value) })}
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Capacidad Máxima</Label>
                  <Input
                    type="number"
                    value={ecsConfig.maxCapacity}
                    onChange={(e) => setECSConfig({ maxCapacity: Number.parseInt(e.target.value) })}
                    min="1"
                  />
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="environment" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Variables de Entorno</h4>
                <Button onClick={addEnvironmentVariable} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Variable
                </Button>
              </div>

              {ecsConfig.environmentVariables.map((env, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1 space-y-2">
                    <Label>Nombre</Label>
                    <Input
                      placeholder="NODE_ENV"
                      value={env.name}
                      onChange={(e) => updateEnvironmentVariable(index, "name", e.target.value)}
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label>Valor</Label>
                    <Input
                      placeholder="production"
                      value={env.value}
                      onChange={(e) => updateEnvironmentVariable(index, "value", e.target.value)}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeEnvironmentVariable(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Secrets (AWS Systems Manager)</h4>
                <Button onClick={addSecret} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Secret
                </Button>
              </div>

              {ecsConfig.secrets.map((secret, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1 space-y-2">
                    <Label>Nombre</Label>
                    <Input
                      placeholder="DATABASE_PASSWORD"
                      value={secret.name}
                      onChange={(e) => updateSecret(index, "name", e.target.value)}
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label>ARN del Secret</Label>
                    <Input
                      placeholder="arn:aws:ssm:region:account:parameter/myapp/db/password"
                      value={secret.valueFrom}
                      onChange={(e) => updateSecret(index, "valueFrom", e.target.value)}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeSecret(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6 mt-6">
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configuración de Logs
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Log Group</Label>
                  <Input
                    placeholder="/ecs/fargate-task"
                    value={ecsConfig.logGroup}
                    onChange={(e) => setECSConfig({ logGroup: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Log Region</Label>
                  <Input
                    placeholder="us-east-1"
                    value={ecsConfig.logRegion}
                    onChange={(e) => setECSConfig({ logRegion: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Log Stream Prefix</Label>
                <Input
                  placeholder="ecs"
                  value={ecsConfig.logStreamPrefix}
                  onChange={(e) => setECSConfig({ logStreamPrefix: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={ecsConfig.healthCheckEnabled}
                  onCheckedChange={(checked) => setECSConfig({ healthCheckEnabled: checked })}
                />
                <Label className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Health Check
                </Label>
              </div>

              {ecsConfig.healthCheckEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="space-y-2">
                    <Label>Health Check Path</Label>
                    <Input
                      placeholder="/health"
                      value={ecsConfig.healthCheckPath}
                      onChange={(e) => setECSConfig({ healthCheckPath: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Intervalo (segundos)</Label>
                    <Input
                      type="number"
                      value={ecsConfig.healthCheckInterval}
                      onChange={(e) => setECSConfig({ healthCheckInterval: Number.parseInt(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Timeout (segundos)</Label>
                    <Input
                      type="number"
                      value={ecsConfig.healthCheckTimeout}
                      onChange={(e) => setECSConfig({ healthCheckTimeout: Number.parseInt(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Reintentos</Label>
                    <Input
                      type="number"
                      value={ecsConfig.healthCheckRetries}
                      onChange={(e) => setECSConfig({ healthCheckRetries: Number.parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
