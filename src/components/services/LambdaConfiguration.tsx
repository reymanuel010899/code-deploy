"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Zap, Code, Timer, Globe } from "lucide-react"
import { RUNTIMES } from "@/constants"
import { useDeploymentStore } from "@/store/useDeploymentStore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "components/ui/dialog"
import { useState } from "react"
import { ServiceDeploymentHistory } from "../common/ServiceDeploymentHistory"

export function LambdaConfiguration() {
  const { lambdaConfig, setLambdaConfig } = useDeploymentStore()
  const [modalImageId, setModalImageId] = useState<string | null>(null)
  const [modalType, setModalType] = useState<"update" | "replace" | null>(null)

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Configuración Lambda
        </CardTitle>
        <CardDescription>Configura tu función serverless</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="runtime" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="runtime">Runtime</TabsTrigger>
            <TabsTrigger value="config">Configuración</TabsTrigger>
            <TabsTrigger value="triggers">Triggers</TabsTrigger>
          </TabsList>

          <TabsContent value="runtime" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Runtime
                </Label>
                <Select value={lambdaConfig.runtime} onValueChange={(value) => setLambdaConfig({ runtime: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RUNTIMES.map((runtime) => (
                      <SelectItem key={runtime.value} value={runtime.value}>
                        {runtime.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Handler</Label>
                <Input
                  placeholder="index.handler"
                  value={lambdaConfig.handler}
                  onChange={(e) => setLambdaConfig({ handler: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">Formato: archivo.función</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Variables de Entorno</Label>
              <Textarea
                placeholder="NODE_ENV=production&#10;API_KEY=tu-api-key&#10;DATABASE_URL=tu-database-url"
                value={lambdaConfig.environmentVars}
                onChange={(e) => setLambdaConfig({ environmentVars: e.target.value })}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">Una variable por línea en formato CLAVE=valor</p>
            </div>
          </TabsContent>

          <TabsContent value="config" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label className="flex items-center gap-2">
                    <Timer className="h-4 w-4" />
                    Timeout (segundos)
                  </Label>
                  <Badge variant="secondary">{lambdaConfig.timeout}s</Badge>
                </div>
                <Slider
                  value={[lambdaConfig.timeout]}
                  onValueChange={(value) => setLambdaConfig({ timeout: value[0] })}
                  max={900}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Memoria (MB)</Label>
                  <Badge variant="secondary">{lambdaConfig.memory} MB</Badge>
                </div>
                <Slider
                  value={[lambdaConfig.memory]}
                  onValueChange={(value) => setLambdaConfig({ memory: value[0] })}
                  max={10240}
                  min={128}
                  step={64}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={lambdaConfig.deadLetterQueue}
                onCheckedChange={(checked) => setLambdaConfig({ deadLetterQueue: checked })}
              />
              <Label>Dead Letter Queue (DLQ)</Label>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">Estimación de Rendimiento:</h4>
              <div className="text-sm text-green-800 dark:text-green-200">
                <p>• CPU asignada: ~{Math.round((lambdaConfig.memory / 1769) * 1000)} MHz</p>
                <p>• Tiempo máximo de ejecución: {lambdaConfig.timeout} segundos</p>
                <p>• Memoria disponible: {lambdaConfig.memory} MB</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="triggers" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Trigger Principal
                </Label>
                <Select value={lambdaConfig.trigger} onValueChange={(value) => setLambdaConfig({ trigger: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="api-gateway">API Gateway (HTTP/REST)</SelectItem>
                    <SelectItem value="s3">S3 Bucket Events</SelectItem>
                    <SelectItem value="dynamodb">DynamoDB Streams</SelectItem>
                    <SelectItem value="sqs">SQS Queue</SelectItem>
                    <SelectItem value="sns">SNS Topic</SelectItem>
                    <SelectItem value="cloudwatch">CloudWatch Events</SelectItem>
                    <SelectItem value="eventbridge">EventBridge</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">Configuración del Trigger:</h4>
                {lambdaConfig.trigger === "api-gateway" && (
                  <div className="text-sm text-yellow-800 dark:text-yellow-200">
                    <p>• Se creará un API Gateway REST</p>
                    <p>• Endpoint: https://api-id.execute-api.region.amazonaws.com/prod/</p>
                    <p>• Métodos: GET, POST, PUT, DELETE</p>
                  </div>
                )}
                {lambdaConfig.trigger === "s3" && (
                  <div className="text-sm text-yellow-800 dark:text-yellow-200">
                    <p>• Se ejecutará cuando se suban archivos al bucket</p>
                    <p>• Eventos: s3:ObjectCreated:*</p>
                  </div>
                )}
                {lambdaConfig.trigger === "sqs" && (
                  <div className="text-sm text-yellow-800 dark:text-yellow-200">
                    <p>• Se ejecutará cuando lleguen mensajes a la cola</p>
                    <p>• Batch size: 10 mensajes</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        {/* Historial de deployments por servicio */}
        <ServiceDeploymentHistory />
      </CardContent>
    </Card>
  )
}
