"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Cloud,
  Server,
  Database,
  Container,
  Plus,
  Trash2,
  Play,
  Settings,
  DollarSign,
  HardDrive,
  Network,
  Shield,
  Timer,
  Zap,
  Code,
  Globe,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react"
import { toast } from "react-hot-toast"
import { DeploymentProvider } from "@/providers/deploymentProvider"
import type { DeploymentRequest, DeploymentResponse } from "@/types/api"
import { useDeployment } from "@/hooks/useDeployment"
import { createDockerImages } from "../src/providers/images"

interface DockerImage {
  id: string
  name: string
  tag: string
  port: number
}

interface EC2Config {
  os: string
  instanceType: string
  keyPair: string
  securityGroup: string
  subnet: string
  storageType: string
  storageSize: number
  userData: string
  monitoring: boolean
}

interface ECSConfig {
  clusterName: string
  serviceName: string
  taskDefinitionFamily: string
  taskCpu: number
  taskMemory: number
  desiredCount: number
  loadBalancer: boolean
  autoScaling: boolean
  minCapacity: number
  maxCapacity: number
  networkMode: string
  platformVersion: string
  assignPublicIp: boolean
  subnets: string[]
  securityGroups: string[]
  containerPort: number
  hostPort?: number
  protocol: string
  essential: boolean
  logGroup: string
  logRegion: string
  logStreamPrefix: string
  environmentVariables: { name: string; value: string }[]
  secrets: { name: string; valueFrom: string }[]
  healthCheckEnabled: boolean
  healthCheckPath: string
  healthCheckInterval: number
  healthCheckTimeout: number
  healthCheckRetries: number
  cpuReservation?: number
  memoryReservation?: number
  memoryHardLimit?: number
}

interface LambdaConfig {
  runtime: string
  handler: string
  timeout: number
  memory: number
  environmentVars: string
  trigger: string
  deadLetterQueue: boolean
}

export default function CloudInterface() {
  const [dockerImages, setDockerImages] = useState<DockerImage[]>([{ id: "1", name: "", tag: "latest", port: 80 }])
  const [selectedService, setSelectedService] = useState<string>("ec2")
  const [selectedRegions, setSelectedRegions] = useState<string[]>(["us-east-1"])
  const [currentRegionIndex, setCurrentRegionIndex] = useState(0)

  const [ec2Config, setEC2Config] = useState<EC2Config>({
    os: "amazon-linux-2",
    instanceType: "t3.medium",
    keyPair: "",
    securityGroup: "default",
    subnet: "default",
    storageType: "gp3",
    storageSize: 20,
    userData: "",
    monitoring: false,
  })

  const [ecsConfig, setECSConfig] = useState<ECSConfig>({
    clusterName: "",
    serviceName: "",
    taskDefinitionFamily: "",
    taskCpu: 256,
    taskMemory: 512,
    desiredCount: 1,
    loadBalancer: false,
    autoScaling: false,
    minCapacity: 1,
    maxCapacity: 10,
    networkMode: "awsvpc",
    platformVersion: "LATEST",
    assignPublicIp: true,
    subnets: ["subnet-default"],
    securityGroups: ["sg-default"],
    containerPort: 80,
    hostPort: undefined,
    protocol: "tcp",
    essential: true,
    logGroup: "/ecs/default-cluster",
    logRegion: "us-east-1",
    logStreamPrefix: "ecs",
    environmentVariables: [],
    secrets: [],
    healthCheckEnabled: true,
    healthCheckPath: "/health",
    healthCheckInterval: 30,
    healthCheckTimeout: 5,
    healthCheckRetries: 3,
  })

  const [lambdaConfig, setLambdaConfig] = useState<LambdaConfig>({
    runtime: "nodejs18.x",
    handler: "index.handler",
    timeout: 30,
    memory: 128,
    environmentVars: "",
    trigger: "api-gateway",
    deadLetterQueue: false,
  })

  const [isDeploying, setIsDeploying] = useState(false)

  const addDockerImage = () => {
    if (dockerImages.length < 3) {
      dockerImages.forEach(async (img) => {
        if (img.name.trim()) {
          try {
        await createDockerImages({ "name": img.name, "tag": img.tag })
          } catch (error) {
        console.error("Error creando imagen Docker:", error)
          }
        }
      })
      setDockerImages([
        ...dockerImages,
        {
          id: Date.now().toString(),
          name: "",
          tag: "latest",
          port: 80,
        },
      ])
  
      // createDockerImages(dockerImages)
      

    }
  }

  const removeDockerImage = (id: string) => {
    if (dockerImages.length > 1) {
      setDockerImages(dockerImages.filter((img) => img.id !== id))
    }
  }

  const updateDockerImage = (id: string, field: string, value: string) => {
    setDockerImages(dockerImages.map((img) => (img.id === id ? { ...img, [field]: value } : img)))
  }

  const toggleRegion = (regionId: string) => {
    setSelectedRegions((prev) => (prev.includes(regionId) ? prev.filter((id) => id !== regionId) : [...prev, regionId]))
  }

  const nextRegions = () => {
    const maxIndex = Math.ceil(awsRegions.length / 2) - 1
    setCurrentRegionIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
  }

  const prevRegions = () => {
    const maxIndex = Math.ceil(awsRegions.length / 2) - 1
    setCurrentRegionIndex((prev) => (prev <= 0 ? maxIndex : prev - 1))
  }

  const calculateCost = () => {
    let baseCost = 0
    const regionMultiplier = selectedRegions.length

    switch (selectedService) {
      case "ec2":
        const instanceCosts = {
          "t3.micro": 0.0104,
          "t3.small": 0.0208,
          "t3.medium": 0.0416,
          "t3.large": 0.0832,
          "t3.xlarge": 0.1664,
        }
        baseCost = instanceCosts[ec2Config.instanceType as keyof typeof instanceCosts] || 0.0416
        return ((baseCost * 24 * 30 + ec2Config.storageSize * 0.1) * regionMultiplier).toFixed(2)
      case "ecs":
        baseCost = (ecsConfig.taskCpu / 1024) * 0.04048 + (ecsConfig.taskMemory / 1024) * 0.004445
        return (baseCost * 24 * 30 * ecsConfig.desiredCount * regionMultiplier).toFixed(2)
      case "lambda":
        const requestCost = 1000000 * 0.0000002
        const computeCost = (lambdaConfig.memory / 1024) * (lambdaConfig.timeout / 1000) * 0.0000166667 * 1000000
        return ((requestCost + computeCost) * regionMultiplier).toFixed(2)
      default:
        return "0.00"
    }
  }

  const services = [
    {
      id: "ec2",
      name: "EC2 Instance",
      description: "Servidor virtual escalable",
      icon: Server,
      color: "bg-orange-500",
    },
    {
      id: "ecs",
      name: "ECS Container",
      description: "Contenedores administrados",
      icon: Container,
      color: "bg-blue-500",
    },
    {
      id: "lambda",
      name: "Lambda Function",
      description: "Funciones sin servidor",
      icon: Cloud,
      color: "bg-green-500",
    },
  ]

  const awsRegions = [
    {
      id: "us-east-1",
      name: "US East (N. Virginia)",
      flag: "🇺🇸",
      latency: "Baja",
      color: "bg-blue-500",
    },
    {
      id: "us-west-2",
      name: "US West (Oregon)",
      flag: "🇺🇸",
      latency: "Baja",
      color: "bg-blue-600",
    },
    {
      id: "eu-west-1",
      name: "Europe (Ireland)",
      flag: "🇮🇪",
      latency: "Media",
      color: "bg-green-500",
    },
    {
      id: "eu-central-1",
      name: "Europe (Frankfurt)",
      flag: "🇩🇪",
      latency: "Media",
      color: "bg-green-600",
    },
    {
      id: "ap-southeast-1",
      name: "Asia Pacific (Singapore)",
      flag: "🇸🇬",
      latency: "Alta",
      color: "bg-orange-500",
    },
    {
      id: "ap-northeast-1",
      name: "Asia Pacific (Tokyo)",
      flag: "🇯🇵",
      latency: "Alta",
      color: "bg-orange-600",
    },
    {
      id: "sa-east-1",
      name: "South America (São Paulo)",
      flag: "🇧🇷",
      latency: "Alta",
      color: "bg-purple-500",
    },
    {
      id: "ca-central-1",
      name: "Canada (Central)",
      flag: "🇨🇦",
      latency: "Baja",
      color: "bg-red-500",
    },
  ]

  const operatingSystems = [
    { value: "amazon-linux-2", label: "Amazon Linux 2", icon: "🐧" },
    { value: "ubuntu-20.04", label: "Ubuntu 20.04 LTS", icon: "🟠" },
    { value: "ubuntu-22.04", label: "Ubuntu 22.04 LTS", icon: "🟠" },
    { value: "windows-2019", label: "Windows Server 2019", icon: "🪟" },
    { value: "windows-2022", label: "Windows Server 2022", icon: "🪟" },
    { value: "rhel-8", label: "Red Hat Enterprise Linux 8", icon: "🔴" },
    { value: "centos-7", label: "CentOS 7", icon: "💜" },
  ]

  const runtimes = [
    { value: "nodejs18.x", label: "Node.js 18.x" },
    { value: "nodejs16.x", label: "Node.js 16.x" },
    { value: "python3.9", label: "Python 3.9" },
    { value: "python3.8", label: "Python 3.8" },
    { value: "java11", label: "Java 11" },
    { value: "java8", label: "Java 8" },
    { value: "dotnet6", label: ".NET 6" },
    { value: "go1.x", label: "Go 1.x" },
    { value: "ruby2.7", label: "Ruby 2.7" },
  ]

  const renderServiceConfiguration = () => {
    switch (selectedService) {
      case "ec2":
        return (
          <Card>
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
                      <Select value={ec2Config.os} onValueChange={(value) => setEC2Config({ ...ec2Config, os: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {operatingSystems.map((os) => (
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
                      <Select
                        value={ec2Config.instanceType}
                        onValueChange={(value) => setEC2Config({ ...ec2Config, instanceType: value })}
                      >
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
                      onChange={(e) => setEC2Config({ ...ec2Config, keyPair: e.target.value })}
                    />
                    <p className="text-xs text-slate-500">Necesario para conectarte por SSH a tu instancia</p>
                  </div>

                  <div className="space-y-2">
                    <Label>User Data Script (Opcional)</Label>
                    <Textarea
                      placeholder="#!/bin/bash&#10;yum update -y&#10;yum install -y docker&#10;service docker start"
                      value={ec2Config.userData}
                      onChange={(e) => setEC2Config({ ...ec2Config, userData: e.target.value })}
                      rows={4}
                    />
                    <p className="text-xs text-slate-500">Script que se ejecutará al iniciar la instancia</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={ec2Config.monitoring}
                      onCheckedChange={(checked) => setEC2Config({ ...ec2Config, monitoring: checked })}
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
                      <Select
                        value={ec2Config.subnet}
                        onValueChange={(value) => setEC2Config({ ...ec2Config, subnet: value })}
                      >
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
                        onValueChange={(value) => setEC2Config({ ...ec2Config, securityGroup: value })}
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

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Puertos que se abrirán:</h4>
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
                      <Select
                        value={ec2Config.storageType}
                        onValueChange={(value) => setEC2Config({ ...ec2Config, storageType: value })}
                      >
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
                        onValueChange={(value) => setEC2Config({ ...ec2Config, storageSize: value[0] })}
                        max={1000}
                        min={8}
                        step={1}
                        className="w-full"
                      />
                      <p className="text-xs text-slate-500">
                        Costo adicional: ${(ec2Config.storageSize * 0.1).toFixed(2)}/mes
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )

      case "ecs":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Container className="h-5 w-5" />
                Configuración ECS
              </CardTitle>
              <CardDescription>Configura tu servicio de contenedores administrado</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="cluster" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="cluster">Cluster</TabsTrigger>
                  <TabsTrigger value="task">Task Definition</TabsTrigger>
                  <TabsTrigger value="service">Service</TabsTrigger>
                  <TabsTrigger value="advanced">Avanzado</TabsTrigger>
                </TabsList>

                <TabsContent value="cluster" className="space-y-6 mt-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Nombre del Cluster</Label>
                      <Input
                        placeholder="mi-aplicacion-cluster"
                        value={ecsConfig.clusterName}
                        onChange={(e) => setECSConfig({ ...ecsConfig, clusterName: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Modo de Red</Label>
                      <RadioGroup
                        value={ecsConfig.networkMode}
                        onValueChange={(value) => setECSConfig({ ...ecsConfig, networkMode: value })}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="awsvpc" id="awsvpc" />
                          <Label htmlFor="awsvpc">awsvpc (Recomendado)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="bridge" id="bridge" />
                          <Label htmlFor="bridge">bridge</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="host" id="host" />
                          <Label htmlFor="host">host</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="task" className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <Label>CPU (vCPU)</Label>
                        <Badge variant="secondary">{ecsConfig.taskCpu}</Badge>
                      </div>
                      <Select
                        value={ecsConfig.taskCpu.toString()}
                        onValueChange={(value) => setECSConfig({ ...ecsConfig, taskCpu: Number.parseInt(value) })}
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
                        onValueChange={(value) => setECSConfig({ ...ecsConfig, taskMemory: Number.parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="512">512 MB</SelectItem>
                          <SelectItem value="1024">1 GB (1024 MB)</SelectItem>
                          <SelectItem value="2048">2 GB (2048 MB)</SelectItem>
                          <SelectItem value="4096">4 GB (4096 MB)</SelectItem>
                          <SelectItem value="8192">8 GB (8192 MB)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="service" className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <Label>Número de Tareas Deseadas</Label>
                        <Badge variant="secondary">{ecsConfig.desiredCount}</Badge>
                      </div>
                      <Slider
                        value={[ecsConfig.desiredCount]}
                        onValueChange={(value) => setECSConfig({ ...ecsConfig, desiredCount: value[0] })}
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
                          onCheckedChange={(checked) => setECSConfig({ ...ecsConfig, loadBalancer: checked })}
                        />
                        <Label>Application Load Balancer</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={ecsConfig.autoScaling}
                          onCheckedChange={(checked) => setECSConfig({ ...ecsConfig, autoScaling: checked })}
                        />
                        <Label>Auto Scaling</Label>
                      </div>
                    </div>
                  </div>

                  {ecsConfig.autoScaling && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                      <div className="space-y-2">
                        <Label>Capacidad Mínima</Label>
                        <Input
                          type="number"
                          value={ecsConfig.minCapacity}
                          onChange={(e) => setECSConfig({ ...ecsConfig, minCapacity: Number.parseInt(e.target.value) })}
                          min="1"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Capacidad Máxima</Label>
                        <Input
                          type="number"
                          value={ecsConfig.maxCapacity}
                          onChange={(e) => setECSConfig({ ...ecsConfig, maxCapacity: Number.parseInt(e.target.value) })}
                          min="1"
                        />
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="advanced" className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nombre del Servicio</Label>
                      <Input
                        placeholder="mi-servicio"
                        value={ecsConfig.serviceName}
                        onChange={(e) => setECSConfig({ ...ecsConfig, serviceName: e.target.value })}
                      />
                      <p className="text-xs text-slate-500">Si está vacío, se generará automáticamente</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Familia de Task Definition</Label>
                      <Input
                        placeholder="mi-task-definition"
                        value={ecsConfig.taskDefinitionFamily}
                        onChange={(e) => setECSConfig({ ...ecsConfig, taskDefinitionFamily: e.target.value })}
                      />
                      <p className="text-xs text-slate-500">Si está vacío, se generará automáticamente</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Puerto del Contenedor</Label>
                      <Input
                        type="number"
                        placeholder="80"
                        value={ecsConfig.containerPort}
                        onChange={(e) => setECSConfig({ ...ecsConfig, containerPort: Number.parseInt(e.target.value) })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Protocolo</Label>
                      <Select
                        value={ecsConfig.protocol}
                        onValueChange={(value) => setECSConfig({ ...ecsConfig, protocol: value })}
                      >
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Subnets</Label>
                      <Input
                        placeholder="subnet-12345678,subnet-87654321"
                        value={ecsConfig.subnets.join(',')}
                        onChange={(e) => setECSConfig({ ...ecsConfig, subnets: e.target.value.split(',').filter(s => s.trim()) })}
                      />
                      <p className="text-xs text-slate-500">Separadas por comas</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Security Groups</Label>
                      <Input
                        placeholder="sg-12345678,sg-87654321"
                        value={ecsConfig.securityGroups.join(',')}
                        onChange={(e) => setECSConfig({ ...ecsConfig, securityGroups: e.target.value.split(',').filter(s => s.trim()) })}
                      />
                      <p className="text-xs text-slate-500">Separadas por comas</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={ecsConfig.assignPublicIp}
                        onCheckedChange={(checked) => setECSConfig({ ...ecsConfig, assignPublicIp: checked })}
                      />
                      <Label>Asignar IP Pública</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={ecsConfig.essential}
                        onCheckedChange={(checked) => setECSConfig({ ...ecsConfig, essential: checked })}
                      />
                      <Label>Contenedor Esencial</Label>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">Configuración de Logs</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Log Group</Label>
                        <Input
                          placeholder="/ecs/mi-aplicacion"
                          value={ecsConfig.logGroup}
                          onChange={(e) => setECSConfig({ ...ecsConfig, logGroup: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Región de Logs</Label>
                        <Input
                          placeholder="us-east-1"
                          value={ecsConfig.logRegion}
                          onChange={(e) => setECSConfig({ ...ecsConfig, logRegion: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Prefijo de Log Stream</Label>
                        <Input
                          placeholder="ecs"
                          value={ecsConfig.logStreamPrefix}
                          onChange={(e) => setECSConfig({ ...ecsConfig, logStreamPrefix: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">Health Check</h4>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={ecsConfig.healthCheckEnabled}
                        onCheckedChange={(checked) => setECSConfig({ ...ecsConfig, healthCheckEnabled: checked })}
                      />
                      <Label>Habilitar Health Check</Label>
                    </div>

                    {ecsConfig.healthCheckEnabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                        <div className="space-y-2">
                          <Label>Path</Label>
                          <Input
                            placeholder="/health"
                            value={ecsConfig.healthCheckPath}
                            onChange={(e) => setECSConfig({ ...ecsConfig, healthCheckPath: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Intervalo (segundos)</Label>
                          <Input
                            type="number"
                            value={ecsConfig.healthCheckInterval}
                            onChange={(e) => setECSConfig({ ...ecsConfig, healthCheckInterval: Number.parseInt(e.target.value) })}
                            min="5"
                            max="300"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Timeout (segundos)</Label>
                          <Input
                            type="number"
                            value={ecsConfig.healthCheckTimeout}
                            onChange={(e) => setECSConfig({ ...ecsConfig, healthCheckTimeout: Number.parseInt(e.target.value) })}
                            min="2"
                            max="60"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Reintentos</Label>
                          <Input
                            type="number"
                            value={ecsConfig.healthCheckRetries}
                            onChange={(e) => setECSConfig({ ...ecsConfig, healthCheckRetries: Number.parseInt(e.target.value) })}
                            min="1"
                            max="10"
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

      case "lambda":
        return (
          <Card>
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
                      <Select
                        value={lambdaConfig.runtime}
                        onValueChange={(value) => setLambdaConfig({ ...lambdaConfig, runtime: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {runtimes.map((runtime) => (
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
                        onChange={(e) => setLambdaConfig({ ...lambdaConfig, handler: e.target.value })}
                      />
                      <p className="text-xs text-slate-500">Formato: archivo.función</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Variables de Entorno</Label>
                    <Textarea
                      placeholder="NODE_ENV=production&#10;API_KEY=tu-api-key&#10;DATABASE_URL=tu-database-url"
                      value={lambdaConfig.environmentVars}
                      onChange={(e) => setLambdaConfig({ ...lambdaConfig, environmentVars: e.target.value })}
                      rows={4}
                    />
                    <p className="text-xs text-slate-500">Una variable por línea en formato CLAVE=valor</p>
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
                        onValueChange={(value) => setLambdaConfig({ ...lambdaConfig, timeout: value[0] })}
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
                        onValueChange={(value) => setLambdaConfig({ ...lambdaConfig, memory: value[0] })}
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
                      onCheckedChange={(checked) => setLambdaConfig({ ...lambdaConfig, deadLetterQueue: checked })}
                    />
                    <Label>Dead Letter Queue (DLQ)</Label>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Estimación de Rendimiento:</h4>
                    <div className="text-sm text-green-800">
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
                      <Select
                        value={lambdaConfig.trigger}
                        onValueChange={(value) => setLambdaConfig({ ...lambdaConfig, trigger: value })}
                      >
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

                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <h4 className="font-medium text-yellow-900 mb-2">Configuración del Trigger:</h4>
                      {lambdaConfig.trigger === "api-gateway" && (
                        <div className="text-sm text-yellow-800">
                          <p>• Se creará un API Gateway REST</p>
                          <p>• Endpoint: https://api-id.execute-api.region.amazonaws.com/prod/</p>
                          <p>• Métodos: GET, POST, PUT, DELETE</p>
                        </div>
                      )}
                      {lambdaConfig.trigger === "s3" && (
                        <div className="text-sm text-yellow-800">
                          <p>• Se ejecutará cuando se suban archivos al bucket</p>
                          <p>• Eventos: s3:ObjectCreated:*</p>
                        </div>
                      )}
                      {lambdaConfig.trigger === "sqs" && (
                        <div className="text-sm text-yellow-800">
                          <p>• Se ejecutará cuando lleguen mensajes a la cola</p>
                          <p>• Batch size: 10 mensajes</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  const getCurrentRegions = () => {
    const startIndex = currentRegionIndex * 2
    return awsRegions.slice(startIndex, startIndex + 2)
  }

  const handleDeploy = async () => {
    setIsDeploying(true)
    
    try {
      // Preparar los datos del deployment según el formato que espera el backend
      let deploymentData: any = {
        service: selectedService as "ec2" | "ecs" | "lambda",
        regions: selectedRegions,
      }

      // Agregar configuración específica del servicio
      switch (selectedService) {
        case "ecs":
          deploymentData = {
            ecs_config: ecsConfig,
            docker_images: dockerImages,
            service: "ecs",
          }
          break

        case "ec2":
          deploymentData = {
            ...deploymentData,
            name: `ec2-${Date.now()}`,
            docker_image: dockerImages.filter((img) => img.name.trim()).map(img => `${img.name}:${img.tag}`).join(','),
            os: ec2Config.os,
            instance_type: ec2Config.instanceType,
            key_pair: ec2Config.keyPair,
            security_group: ec2Config.securityGroup,
            subnet: ec2Config.subnet,
            storage_type: ec2Config.storageType,
            storage_size: ec2Config.storageSize,
            user_data: ec2Config.userData,
            monitoring: ec2Config.monitoring,
          }
          break

        case "lambda":
          deploymentData = {
            ...deploymentData,
            name: `lambda-${Date.now()}`,
            runtime: lambdaConfig.runtime,
            handler: lambdaConfig.handler,
            timeout: lambdaConfig.timeout,
            memory_mb: lambdaConfig.memory,
            environment_vars: lambdaConfig.environmentVars,
            trigger: lambdaConfig.trigger,
            dead_letter_queue: lambdaConfig.deadLetterQueue,
          }
          break
      }

      // Log detallado de los datos que se envían
      console.log("🚀 Iniciando deployment con los siguientes datos:")
      console.log("📋 Datos generales:", {
        service: deploymentData.service,
        regions: deploymentData.regions,
        name: deploymentData.name
      })
      
      if (deploymentData.docker_image) {
        console.log("🐳 Docker Images:", deploymentData.docker_image)
      }
      if (deploymentData.cpu_units) {
        console.log("⚡ CPU Units:", deploymentData.cpu_units)
      }
      if (deploymentData.memory_mb) {
        console.log("💾 Memory MB:", deploymentData.memory_mb)
      }
      
      console.log("📦 Datos completos:", deploymentData)

      toast.loading("Iniciando deployment...", { id: "deployment" })

      const response = await DeploymentProvider.createDeployment(deploymentData)

      if (response.success) {
        toast.success(`Deployment iniciado exitosamente! ID: ${response.deploymentId}`, { id: "deployment" })
        console.log("✅ Deployment creado exitosamente:", response)
      } else {
        throw new Error(response.message || "Error desconocido")
      }
    } catch (error) {
      console.error("❌ Error en el deployment:", error)
      toast.error(`Error en el deployment: ${error instanceof Error ? error.message : "Error desconocido"}`, {
        id: "deployment",
      })
    } finally {
      setIsDeploying(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-slate-800 flex items-center justify-center gap-3">
            <Cloud className="h-10 w-10 text-blue-600" />
            CloudDeploy
          </h1>
          <p className="text-slate-600 text-lg">Despliega tus aplicaciones Docker en la nube de forma sencilla</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Selecciona tu Servicio
                </CardTitle>
                <CardDescription>Elige el tipo de servicio que mejor se adapte a tu aplicación</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {services.map((service) => {
                    const Icon = service.icon
                    return (
                      <Card
                        key={service.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedService === service.id ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-slate-50"
                        }`}
                        onClick={() => setSelectedService(service.id)}
                      >
                        <CardContent className="p-4 text-center space-y-3">
                          <div
                            className={`w-12 h-12 ${service.color} rounded-lg flex items-center justify-center mx-auto`}
                          >
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{service.name}</h3>
                            <p className="text-sm text-slate-600">{service.description}</p>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Docker Images Configuration - Only show for EC2 and ECS */}
            {(selectedService === "ec2" || selectedService === "ecs") && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Container className="h-5 w-5" />
                    Imágenes Docker
                  </CardTitle>
                  <CardDescription>Configura hasta 3 imágenes Docker para tu aplicación</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dockerImages.map((image, index) => (
                    <div key={image.id} className="flex gap-3 items-end">
                      <div className="flex-1 space-y-2">
                        <Label>Imagen {index + 1}</Label>
                        <Input
                          placeholder="nginx, node:18, postgres:15"
                          value={image.name}
                          onChange={(e) => updateDockerImage(image.id, "name", e.target.value)}
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <Label>Imagen {index + 1}</Label>
                        <Input
                          placeholder="443, 80, 5432"
                          value={image.port}
                          onChange={(e) => updateDockerImage(image.id, "port", e.target.value)}
                        />
                      </div>
                      <div className="w-32 space-y-2">
                        <Label>Tag</Label>
                        <Input
                          placeholder="latest"
                          value={image.tag}
                          onChange={(e) => updateDockerImage(image.id, "tag", e.target.value)}
                        />
                      </div>
                      {dockerImages.length > 1 && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeDockerImage(image.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}

                  {dockerImages.length < 3 && (
                    <Button
                      variant="outline"
                      onClick={addDockerImage}
                      className="w-full border-dashed border-2 hover:bg-slate-50"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Imagen Docker
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Service-specific Configuration */}
            {renderServiceConfiguration()}
          </div>

          {/* Summary Panel */}
          <div className="space-y-6">
            {/* Region Selection Carousel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Regiones AWS
                </CardTitle>
                <CardDescription>Selecciona las regiones donde desplegar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {/* Carousel Navigation */}
                  <div className="flex items-center justify-between mb-4">
                    <Button variant="outline" size="icon" onClick={prevRegions} className="h-8 w-8">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex space-x-1">
                      {Array.from({ length: Math.ceil(awsRegions.length / 2) }).map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full ${
                            index === currentRegionIndex ? "bg-blue-500" : "bg-gray-300"
                          }`}
                        />
                      ))}
                    </div>

                    <Button variant="outline" size="icon" onClick={nextRegions} className="h-8 w-8">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Carousel Content */}
                  <div className="space-y-3">
                    {getCurrentRegions().map((region) => {
                      const isSelected = selectedRegions.includes(region.id)
                      return (
                        <Card
                          key={region.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            isSelected ? "ring-2 ring-blue-500 bg-blue-50 shadow-md" : "hover:bg-slate-50"
                          }`}
                          onClick={() => toggleRegion(region.id)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-xl">{region.flag}</span>
                                <div>
                                  <h4 className="font-medium text-sm">{region.name}</h4>
                                  <Badge
                                    variant="secondary"
                                    className={`text-xs mt-1 ${
                                      region.latency === "Baja"
                                        ? "bg-green-100 text-green-800"
                                        : region.latency === "Media"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {region.latency}
                                  </Badge>
                                </div>
                              </div>
                              {isSelected && (
                                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs">✓</span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>

                  {/* Selected Regions Summary */}
                  {selectedRegions.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-blue-900">
                          Seleccionadas ({selectedRegions.length}):
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {selectedRegions.map((regionId) => {
                          const region = awsRegions.find((r) => r.id === regionId)
                          return (
                            <Badge key={regionId} variant="default" className="bg-blue-500 text-xs">
                              {region?.flag} {region?.name.split(" ")[0]}
                            </Badge>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Configuration Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Resumen de Configuración
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Servicio:</span>
                    <Badge>{services.find((s) => s.id === selectedService)?.name}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Regiones:</span>
                    <Badge variant="outline">{selectedRegions.length}</Badge>
                  </div>

                  {selectedService === "ec2" && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">OS:</span>
                        <Badge variant="secondary">
                          {operatingSystems.find((os) => os.value === ec2Config.os)?.label}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Instancia:</span>
                        <Badge variant="secondary">{ec2Config.instanceType}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Storage:</span>
                        <Badge variant="secondary">
                          {ec2Config.storageSize} GB {ec2Config.storageType}
                        </Badge>
                      </div>
                    </>
                  )}

                  {selectedService === "ecs" && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">CPU:</span>
                        <Badge variant="secondary">{ecsConfig.taskCpu / 1024} vCPU</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Memoria:</span>
                        <Badge variant="secondary">{ecsConfig.taskMemory} MB</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Tareas:</span>
                        <Badge variant="secondary">{ecsConfig.desiredCount}</Badge>
                      </div>
                    </>
                  )}

                  {selectedService === "lambda" && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Runtime:</span>
                        <Badge variant="secondary">
                          {runtimes.find((r) => r.value === lambdaConfig.runtime)?.label}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Memoria:</span>
                        <Badge variant="secondary">{lambdaConfig.memory} MB</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Timeout:</span>
                        <Badge variant="secondary">{lambdaConfig.timeout}s</Badge>
                      </div>
                    </>
                  )}

                  {(selectedService === "ec2" || selectedService === "ecs") && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Imágenes:</span>
                      <Badge variant="secondary">{dockerImages.filter((img) => img.name).length}</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Cost Estimation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Estimación de Costos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-green-600">${calculateCost()}</div>
                  <p className="text-sm text-slate-600">
                    {selectedService === "lambda" ? "por 1M invocaciones" : "por mes (estimado)"}
                  </p>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2 text-xs text-slate-500">
                  <p>• Precios pueden variar según la región</p>
                  {selectedService !== "lambda" && <p>• No incluye transferencia de datos</p>}
                  {selectedService === "lambda" ? (
                    <p>• Incluye 1M requests + compute time</p>
                  ) : (
                    <p>• Facturación por hora de uso</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Deploy Button */}
            <Card>
              <CardContent className="pt-6">
                <Button
                  className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
                  disabled={
                    isDeploying ||
                    (selectedService === "ec2" && !ec2Config.keyPair) ||
                    (selectedService === "ecs" && !ecsConfig.clusterName) ||
                    (selectedService === "lambda" && !lambdaConfig.handler) ||
                    ((selectedService === "ec2" || selectedService === "ecs") && !dockerImages.some((img) => img.name))
                  }
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
                      Desplegar {services.find((s) => s.id === selectedService)?.name}
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-slate-500 mt-3">
                  El despliegue tomará aproximadamente {selectedService === "lambda" ? "1-2" : "3-8"} minutos
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
