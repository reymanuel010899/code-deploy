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
import { Server, Network, Shield, HardDrive } from "lucide-react"
import { OPERATING_SYSTEMS } from "@/constants"
import { useDeploymentStore } from "@/store/useDeploymentStore"

export function EC2Configuration() {
  const { ec2Config, setEC2Config } = useDeploymentStore()

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          Configuración EC2
        </CardTitle>
        <CardDescription>Configura tu instancia EC2 con todos los detalles necesarios</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Básico</TabsTrigger>
            <TabsTrigger value="network">Red & Seguridad</TabsTrigger>
            <TabsTrigger value="storage">Almacenamiento</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sistema Operativo</Label>
                <Select value={ec2Config.os} onValueChange={(value) => setEC2Config({ os: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OPERATING_SYSTEMS.map((os) => (
                      <SelectItem key={os.value} value={os.value}>
                        <div className="flex items-center gap-2">
                          <span>{os.icon}</span>
                          {os.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tipo de Instancia</Label>
                <Select value={ec2Config.instanceType} onValueChange={(value) => setEC2Config({ instanceType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="t3.micro">t3.micro (1 vCPU, 1GB RAM) - $7.50/mes</SelectItem>
                    <SelectItem value="t3.small">t3.small (1 vCPU, 2GB RAM) - $15.00/mes</SelectItem>
                    <SelectItem value="t3.medium">t3.medium (2 vCPU, 4GB RAM) - $30.00/mes</SelectItem>
                    <SelectItem value="t3.large">t3.large (2 vCPU, 8GB RAM) - $60.00/mes</SelectItem>
                    <SelectItem value="t3.xlarge">t3.xlarge (4 vCPU, 16GB RAM) - $120.00/mes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Key Pair (SSH)</Label>
              <Input
                placeholder="mi-key-pair"
                value={ec2Config.keyPair}
                onChange={(e) => setEC2Config({ keyPair: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Necesario para conectarte por SSH a tu instancia</p>
            </div>

            <div className="space-y-2">
              <Label>User Data Script (Opcional)</Label>
              <Textarea
                placeholder="#!/bin/bash&#10;yum update -y&#10;yum install -y docker&#10;service docker start"
                value={ec2Config.userData}
                onChange={(e) => setEC2Config({ userData: e.target.value })}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">Script que se ejecutará al iniciar la instancia</p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={ec2Config.monitoring}
                onCheckedChange={(checked) => setEC2Config({ monitoring: checked })}
              />
              <Label>Habilitar monitoreo detallado (+$2.10/mes)</Label>
            </div>
          </TabsContent>

          <TabsContent value="network" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Network className="h-4 w-4" />
                  Subnet
                </Label>
                <Select value={ec2Config.subnet} onValueChange={(value) => setEC2Config({ subnet: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default Subnet</SelectItem>
                    <SelectItem value="public-1a">Public Subnet 1a</SelectItem>
                    <SelectItem value="private-1a">Private Subnet 1a</SelectItem>
                    <SelectItem value="public-1b">Public Subnet 1b</SelectItem>
                    <SelectItem value="private-1b">Private Subnet 1b</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Security Group
                </Label>
                <Select
                  value={ec2Config.securityGroup}
                  onValueChange={(value) => setEC2Config({ securityGroup: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default (SSH + HTTP + HTTPS)</SelectItem>
                    <SelectItem value="web-server">Web Server (80, 443)</SelectItem>
                    <SelectItem value="database">Database (3306, 5432)</SelectItem>
                    <SelectItem value="custom">Custom Security Group</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Puertos que se abrirán:</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">SSH (22)</Badge>
                <Badge variant="outline">HTTP (80)</Badge>
                <Badge variant="outline">HTTPS (443)</Badge>
                {ec2Config.securityGroup === "database" && (
                  <>
                    <Badge variant="outline">MySQL (3306)</Badge>
                    <Badge variant="outline">PostgreSQL (5432)</Badge>
                  </>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="storage" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4" />
                  Tipo de Almacenamiento
                </Label>
                <Select value={ec2Config.storageType} onValueChange={(value) => setEC2Config({ storageType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gp3">GP3 - General Purpose SSD (Recomendado)</SelectItem>
                    <SelectItem value="gp2">GP2 - General Purpose SSD</SelectItem>
                    <SelectItem value="io2">IO2 - Provisioned IOPS SSD</SelectItem>
                    <SelectItem value="st1">ST1 - Throughput Optimized HDD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Tamaño del Disco (GB)</Label>
                  <Badge variant="secondary">{ec2Config.storageSize} GB</Badge>
                </div>
                <Slider
                  value={[ec2Config.storageSize]}
                  onValueChange={(value) => setEC2Config({ storageSize: value[0] })}
                  max={1000}
                  min={8}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Costo adicional: ${(ec2Config.storageSize * 0.1).toFixed(2)}/mes
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
