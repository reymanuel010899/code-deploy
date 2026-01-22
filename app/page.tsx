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
// import Editor from "@monaco-editor/react";
import Editor, { useMonaco } from "@monaco-editor/react";
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
import { ServiceDeploymentHistory } from "../src/components/common/ServiceDeploymentHistory"
import { useAuth } from "@/providers/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { apiClient } from "../src/providers/api"

interface CheckDomainResponse {
  available: boolean;
  message: string;
  price?: string;
}

interface DockerImage {
  id: string
  name: string
  tag: string
  port: number
  cpu: number
  memory: number
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
  domainName: string
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
  const [dockerImages, setDockerImages] = useState<DockerImage[]>([{
    id: Date.now().toString(),
    name: "",
    tag: "latest",
    port: 80,
    cpu: 128,
    memory: 128,
  }])
  const [selectedService, setSelectedService] = useState<string>("pagedrop")
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
    domainName: "",
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
  const [isCheckingDomain, setIsCheckingDomain] = useState(false)
  const [domainAvailability, setDomainAvailability] = useState<{
    available: boolean;
    message: string;
    price?: string;
  } | null>(null)

  // Estado para las credenciales de base de datos
  const [databaseCredentials, setDatabaseCredentials] = useState({
    rootPassword: "",
    databaseName: "",
    databaseUser: "",
    databasePassword: "",
    mysqlPort: "3306",
  })

  const [isPrivateRegistry, setIsPrivateRegistry] = useState(false)
  const [privateRegistryCredentials, setPrivateRegistryCredentials] = useState({
    username: "",
    password: ""
  })

  // Helper functions for available CPU/Memory options for Docker images
  const ECS_CPU_OPTIONS = [128, 256, 512, 1024, 2048, 4096, 8192, 16384]
  const ECS_MEMORY_OPTIONS = [128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536]

  function getAvailableCpuOptions(imageId: string) {
    const totalOtherCpu = dockerImages.filter(img => img.id !== imageId).reduce((sum, img) => sum + (Number(img.cpu) || 0), 0)
    return ECS_CPU_OPTIONS.filter(opt => opt + totalOtherCpu <= ecsConfig.taskCpu)
  }
  function getAvailableMemoryOptions(imageId: string) {
    const totalOtherMemory = dockerImages.filter(img => img.id !== imageId).reduce((sum, img) => sum + (Number(img.memory) || 0), 0)
    return ECS_MEMORY_OPTIONS.filter(opt => opt + totalOtherMemory <= ecsConfig.taskMemory)
  }

  const addDockerImage = () => {
    if (dockerImages.length < 3) {
      dockerImages.forEach(async (img) => {
        if (img.name.trim()) {
          try {
            await createDockerImages({ "name": img.name, "tag": img.tag })
          } catch (error) {
            console.error("Error creating Docker image:", error)
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
          cpu: 128,
          memory: 128,
        },
      ])
    }
  }

  const removeDockerImage = (id: string) => {
    if (dockerImages.length > 1) {
      setDockerImages(dockerImages.filter((img) => img.id !== id))
    }
  }

  const updateDockerImage = (id: string, field: string, value: string | number) => {
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

  const checkDomainAvailability = async (domain: string) => {
    if (!domain || domain.trim() === '') {
      setDomainAvailability(null)
      return
    }

    setIsCheckingDomain(true)
    try {
      const response = await apiClient.post<CheckDomainResponse>('/check-domain/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domain: domain.trim(), tld: "com"  }) // You can change the TLD as needed,
      })
      console.log('Domain check response:', response)
      if (response) {
        setDomainAvailability({
          available: response.available,
          message: response.message,
          price: "price" in response ? response.price : undefined,
        })
      } else {
        setDomainAvailability({
          available: false,
          message: 'Error checking domain availability'
        })
      }
    } catch (error) {
      console.error('Error checking domain:', error)
      setDomainAvailability({
        available: false,
        message: 'Error checking domain availability'
      })
    } finally {
      setIsCheckingDomain(false)
    }
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
      id: "pagedrop",
      name: "PageDrop",
      description: "Deploy web pages and landings in seconds",
      icon: Server,
      color: "bg-pink-500",
    },
    {
      id: "ecs",
      name: "SkyBox",
      description: "Your app, ready to take off",
      icon: Container,
      color: "bg-blue-500",
    },
    {
      id: "lambda",
      name: "Zaplet",
      description: "Instant cloud execution",
      icon: Cloud,
      color: "bg-green-500",
    },
  ]

  const awsRegions = [
    {
      id: "us-east-1",
      name: "US East (N. Virginia)",
      flag: "🇺🇸",
      latency: "Low",
      color: "bg-blue-500",
    },
    {
      id: "us-west-2",
      name: "US West (Oregon)",
      flag: "🇺🇸",
      latency: "Low",
      color: "bg-blue-600",
    },
    {
      id: "eu-west-1",
      name: "Europe (Ireland)",
      flag: "🇮🇪",
      latency: "Medium",
      color: "bg-green-500",
    },
    {
      id: "eu-central-1",
      name: "Europe (Frankfurt)",
      flag: "🇩🇪",
      latency: "Medium",
      color: "bg-green-600",
    },
    {
      id: "ap-southeast-1",
      name: "Asia Pacific (Singapore)",
      flag: "🇸🇬",
      latency: "High",
      color: "bg-orange-500",
    },
    {
      id: "ap-northeast-1",
      name: "Asia Pacific (Tokyo)",
      flag: "🇯🇵",
      latency: "High",
      color: "bg-orange-600",
    },
    {
      id: "sa-east-1",
      name: "South America (São Paulo)",
      flag: "🇧🇷",
      latency: "High",
      color: "bg-purple-500",
    },
    {
      id: "ca-central-1",
      name: "Canada (Central)",
      flag: "🇨🇦",
      latency: "Low",
      color: "bg-red-500",
    },
  ]

  const operatingSystems = [
    { value: "amazon-linux-2", label: "Amazon Linux 2", icon: "🐳" },
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
      case "pagedrop":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                PageDrop Configuration
              </CardTitle>
              <CardDescription>
                Deploy your landing page or static website to the cloud easily. You only need your Docker image ready to serve your app (e.g., nginx, node, etc.).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {dockerImages.length === 0 ? (
                  <Button
                    variant="outline"
                    onClick={addDockerImage}
                    className="w-full border-dashed border-2 hover:bg-slate-50"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Docker Image
                  </Button>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>Docker Image</Label>
                      <Input
                        placeholder="nginx, your-app:latest, my-landing"
                        value={dockerImages[0]?.name || ""}
                        onChange={e => updateDockerImage(dockerImages[0].id, "name", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tag</Label>
                      <Input
                        placeholder="latest"
                        value={dockerImages[0]?.tag || ""}
                        onChange={e => updateDockerImage(dockerImages[0].id, "tag", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>App Port</Label>
                      <Input
                        placeholder="80"
                        type="number"
                        value={dockerImages[0]?.port || ""}
                        onChange={e => updateDockerImage(dockerImages[0].id, "port", Number(e.target.value))}
                      />
                      <p className="text-xs text-slate-500">The port exposed by your container (e.g., 80 for nginx or 3000 for Node.js apps)</p>
                    </div>
                  </>
                )}
                <div className="mt-6 p-4 bg-pink-50 rounded-lg border border-pink-200">
                  <h4 className="font-medium mb-2 text-pink-900 flex items-center gap-2">
                    <Server className="h-4 w-4" /> How it works?
                  </h4>
                  <ul className="list-disc pl-6 text-pink-800 text-sm space-y-1">
                    <li>You only need a Docker image that serves your web page or landing.</li>
                    <li>The system will deploy your container to the cloud and give you a public URL.</li>
                    <li>You don't need to configure resources, just focus on your content.</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      case "ecs":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Container className="h-5 w-5" />
                SkyBox Configuration
              </CardTitle>
              <CardDescription>Configure your managed container service</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="cluster" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="cluster">Cluster</TabsTrigger>
                  <TabsTrigger value="task">Task Definition</TabsTrigger>
                  <TabsTrigger value="service">Service</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>

                <TabsContent value="cluster" className="space-y-6 mt-6">
                  <div className="space-y-4">
                   

                    <div className="space-y-2">
                      <Label>Domain Name</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="myapp.com"
                          value={ecsConfig.domainName}
                          onChange={(e) => {
                            setECSConfig({ ...ecsConfig, domainName: e.target.value })
                            // Check domain availability when user stops typing
                            const timeoutId = setTimeout(() => {
                              checkDomainAvailability(e.target.value)
                            }, 1000)
                            return () => clearTimeout(timeoutId)
                          }}
                        />
                        {isCheckingDomain && (
                          <Button variant="outline" disabled>
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </Button>
                        )}
                      </div>
                      {domainAvailability && (
                        <div className={`mt-2 p-2 rounded-md text-sm ${
                          domainAvailability.available 
                            ? 'bg-green-50 text-green-800 border border-green-200' 
                            : 'bg-red-50 text-red-800 border border-red-200'
                        }`}>
                          <div className="flex items-center gap-2">
                            {domainAvailability.available ? (
                              <span className="text-green-600">✓</span>
                            ) : (
                              <span className="text-red-600">✗</span>
                            )}
                            <span>{domainAvailability.message}</span>
                          </div>
                          {/* {domainAvailability.available && domainAvailability.price && (
                            <div className="mt-1 text-xs">
                              Price: ${domainAvailability.price}/year
                            </div>
                          )} */}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Deployment Name</Label>
                      <Input
                        placeholder="my-application-cluster"
                        value={ecsConfig.clusterName}
                        onChange={(e) => setECSConfig({ ...ecsConfig, clusterName: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Network Mode</Label>
                      <RadioGroup
                        value={ecsConfig.networkMode}
                        onValueChange={(value) => setECSConfig({ ...ecsConfig, networkMode: value })}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="awsvpc" id="awsvpc" />
                          <Label htmlFor="awsvpc">awsvpc (Recommended)</Label>
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

                <TabsContent value="task" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">CPU (vCPU)</Label>
                      <Badge variant="secondary" className="text-xs px-2 py-1">{ecsConfig.taskCpu}</Badge>
                      <Select
                        value={ecsConfig.taskCpu.toString()}
                        onValueChange={(value) => setECSConfig({ ...ecsConfig, taskCpu: Number.parseInt(value) })}
                      >
                        <SelectTrigger className="h-9 text-sm font-normal border rounded-md">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="text-sm">
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
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Memoria (MB)</Label>
                      <Badge variant="secondary" className="text-xs px-2 py-1">{ecsConfig.taskMemory} MB</Badge>
                      <Select
                        value={ecsConfig.taskMemory.toString()}
                        onValueChange={(value) => setECSConfig({ ...ecsConfig, taskMemory: Number.parseInt(value) })}
                      >
                        <SelectTrigger className="h-9 text-sm font-normal border rounded-md">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="text-sm">
                          <SelectItem value="512">512 MB</SelectItem>
                          <SelectItem value="1024">1 GB (1024 MB)</SelectItem>
                          <SelectItem value="2048">2 GB (2048 MB)</SelectItem>
                          <SelectItem value="4096">4 GB (4096 MB)</SelectItem>
                          <SelectItem value="8192">8 GB (8192 MB)</SelectItem>
                          <SelectItem value="16384">16 GB (16384 MB)</SelectItem>
                          <SelectItem value="32768">32 GB (32768 MB)</SelectItem>
                          <SelectItem value="65536">64 GB (65536 MB)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Container className="h-5 w-5" />
                        Upload Your Images from Any Repository or Container Provider
                      </CardTitle>
                      <CardDescription>Configure up to 3 Docker images for your application. Assign CPU and Memory to each container.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Switch para contenedores privados/públicos */}
                      <div className="flex items-center gap-3 mb-2">
                        <Switch
                          checked={isPrivateRegistry}
                          onCheckedChange={setIsPrivateRegistry}
                          id="private-registry-switch"
                        />
                        <Label htmlFor="private-registry-switch" className="font-medium">
                          Are your containers private?
                        </Label>
                        <span className="text-xs text-slate-500">(Docker Hub, GitHub Packages, ECR, etc)</span>
                      </div>
                      {isPrivateRegistry && (
                        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="mb-2 text-blue-900 font-semibold text-sm">
                            Enter your private repository credentials. <br />
                            <span className="font-normal">These credentials will be <span className="font-bold">encrypted</span> and secure with temporary access tokens, they will only be used to authenticate the download of your images.</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="private-username">Username</Label>
                              <Input
                                id="private-username"
                                placeholder="username"
                                value={privateRegistryCredentials.username}
                                onChange={e => setPrivateRegistryCredentials({ ...privateRegistryCredentials, username: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label htmlFor="private-password">Password</Label>
                              <Input
                                id="private-password"
                                placeholder="password"
                                type="password"
                                value={privateRegistryCredentials.password}
                                onChange={e => setPrivateRegistryCredentials({ ...privateRegistryCredentials, password: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      {dockerImages.map((image, index) => (
                        <div key={image.id} className="flex gap-3 items-end flex-wrap">
                          <div className="flex-1 min-w-[120px] space-y-2">
                            <Label>Image {index + 1}</Label>
                            <Input
                              placeholder="nginx, node:18, postgres:15"
                              value={image.name}
                              onChange={(e) => updateDockerImage(image.id, "name", e.target.value)}
                            />
                          </div>
                          <div className="flex-1 min-w-[80px] space-y-2">
                            <Label>Port</Label>
                            <Input
                              placeholder="443, 80, 5432"
                              type="number"
                              value={image.port}
                              onChange={(e) => updateDockerImage(image.id, "port", Number(e.target.value))}
                            />
                          </div>
                          <div className="w-32 min-w-[80px] space-y-2">
                            <Label>Tag</Label>
                            <Input
                              placeholder="latest"
                              value={image.tag}
                              onChange={(e) => updateDockerImage(image.id, "tag", e.target.value)}
                            />
                          </div>
                          <div className="w-32 min-w-[80px] space-y-2">
                            <Label>CPU (units)</Label>
                            <Select
                              value={image.cpu.toString()}
                              onValueChange={value => updateDockerImage(image.id, "cpu", Number(value))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {ECS_CPU_OPTIONS.map(opt => (
                                  <SelectItem key={opt} value={opt.toString()}>
                                    {opt} {opt < 1024 ? `(0.${opt/1024} vCPU)` : `(${opt/1024} vCPU)`}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="w-32 min-w-[80px] space-y-2">
                            <Label>Memory (MB)</Label>
                            <Select
                              value={image.memory.toString()}
                              onValueChange={value => updateDockerImage(image.id, "memory", Number(value))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {ECS_MEMORY_OPTIONS.map(opt => (
                                  <SelectItem key={opt} value={opt.toString()}>
                                    {opt} MB
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
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
                          Add Docker Image
                        </Button>
                      )}

                      {/* Nueva sección: Credenciales de Base de Datos */}
                      <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <h4 className="font-medium mb-4 flex items-center gap-2">
                          <Database className="h-5 w-5" />
                          Database Credentials
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="mysql-root-password">ROOT_PASSWORD</Label>
                            <Input
                              id="mysql-root-password"
                              placeholder="your-secure-password"
                              type="password"
                              value={databaseCredentials.rootPassword}
                              onChange={(e) => setDatabaseCredentials({...databaseCredentials, rootPassword: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="mysql-database">DATABASE_NAME</Label>
                            <Input
                              id="mysql-database"
                              placeholder="database"
                              value={databaseCredentials.databaseName}
                              onChange={(e) => setDatabaseCredentials({...databaseCredentials, databaseName: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="mysql-user">DATABASE_USER</Label>
                            <Input
                              id="mysql-user"
                              placeholder="user"
                              value={databaseCredentials.databaseUser}
                              onChange={(e) => setDatabaseCredentials({...databaseCredentials, databaseUser: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="mysql-password">DATABASE_PASSWORD</Label>
                            <Input
                              id="mysql-password"
                              placeholder="user-password"
                              type="password"
                              value={databaseCredentials.databasePassword}
                              onChange={(e) => setDatabaseCredentials({...databaseCredentials, databasePassword: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="mysql-port">MYSQL_PORT</Label>
                            <Input
                              id="mysql-port"
                              placeholder="3306"
                              type="number"
                              value={databaseCredentials.mysqlPort}
                              onChange={(e) => setDatabaseCredentials({...databaseCredentials, mysqlPort: e.target.value})}
                            />
                          </div>
                        </div>
                        {/* Ejemplo de acceso a variables de entorno */}
                        <div className="mt-8 p-6 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl border border-blue-200 shadow-md">
                          <h5 className="font-bold mb-3 flex items-center gap-2 text-blue-900 text-xl">
                            <Code className="h-6 w-6" /> Example of accessing environment variables in Python
                          </h5>
                          <p className="text-base text-blue-800 mb-3">You can access your database credentials using environment variables as follows:</p>
                          <pre className="bg-blue-200 text-blue-900 rounded-lg p-4 text-base font-mono overflow-x-auto shadow-inner">
{`import os

DB_ENGINE_TYPE = os.environ.get('DATABASE_ENGINE', 'MYSQL').upper()
DB_HOST = os.environ.get(f'{DB_ENGINE_TYPE}_HOST', 'localhost')
DB_PORT = os.environ.get(f'{DB_ENGINE_TYPE}_PORT')
DB_NAME = os.environ.get(f'{DB_ENGINE_TYPE}_DATABASE')
DB_USER = os.environ.get(f'{DB_ENGINE_TYPE}_USER')
DB_PASSWORD = os.environ.get(f'{DB_ENGINE_TYPE}_PASSWORD')`}
                          </pre>
                        </div>
                      </div>

                      {(() => {
                        const totalCpu = dockerImages.reduce((sum, img) => sum + (Number(img.cpu) || 0), 0)
                        const totalMemory = dockerImages.reduce((sum, img) => sum + (Number(img.memory) || 0), 0)
                        if (totalCpu > ecsConfig.taskCpu || totalMemory > ecsConfig.taskMemory) {
                          return (
                            <div className="text-red-600 text-sm font-medium mt-2">
                              The sum of CPU or Memory of the containers exceeds the limit defined in Task Definition.<br />
                              Total CPU: {totalCpu} / {ecsConfig.taskCpu} | Total Memory: {totalMemory} / {ecsConfig.taskMemory}<br />
                              <span className="font-semibold">To add more resources, increase the CPU or Memory limit in the Task Definition section.</span>
                            </div>
                          )
                        }
                        return null
                      })()}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="service" className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <Label>Desired Number of Tasks</Label>
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
                        <Label>Minimum Capacity</Label>
                        <Input
                          type="number"
                          value={ecsConfig.minCapacity}
                          onChange={(e) => setECSConfig({ ...ecsConfig, minCapacity: Number.parseInt(e.target.value) })}
                          min="1"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Maximum Capacity</Label>
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
                      <Label>Service Name</Label>
                      <Input
                        placeholder="my-service"
                        value={ecsConfig.serviceName}
                        onChange={(e) => setECSConfig({ ...ecsConfig, serviceName: e.target.value })}
                      />
                      <p className="text-xs text-slate-500">If empty, it will be generated automatically</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Task Definition Family</Label>
                      <Input
                        placeholder="my-task-definition"
                        value={ecsConfig.taskDefinitionFamily}
                        onChange={(e) => setECSConfig({ ...ecsConfig, taskDefinitionFamily: e.target.value })}
                      />
                      <p className="text-xs text-slate-500">If empty, it will be generated automatically</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Container Port</Label>
                      <Input
                        type="number"
                        placeholder="80"
                        value={ecsConfig.containerPort}
                        onChange={(e) => setECSConfig({ ...ecsConfig, containerPort: Number.parseInt(e.target.value) })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Protocol</Label>
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
                      <p className="text-xs text-slate-500">Comma separated</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Security Groups</Label>
                      <Input
                        placeholder="sg-12345678,sg-87654321"
                        value={ecsConfig.securityGroups.join(',')}
                        onChange={(e) => setECSConfig({ ...ecsConfig, securityGroups: e.target.value.split(',').filter(s => s.trim()) })}
                      />
                      <p className="text-xs text-slate-500">Comma separated</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={ecsConfig.assignPublicIp}
                        onCheckedChange={(checked) => setECSConfig({ ...ecsConfig, assignPublicIp: checked })}
                      />
                      <Label>Assign Public IP</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={ecsConfig.essential}
                        onCheckedChange={(checked) => setECSConfig({ ...ecsConfig, essential: checked })}
                      />
                      <Label>Essential Container</Label>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">Logs Configuration</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Log Group</Label>
                        <Input
                          placeholder="/ecs/my-application"
                          value={ecsConfig.logGroup}
                          onChange={(e) => setECSConfig({ ...ecsConfig, logGroup: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Log Region</Label>
                        <Input
                          placeholder="us-east-1"
                          value={ecsConfig.logRegion}
                          onChange={(e) => setECSConfig({ ...ecsConfig, logRegion: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Log Stream Prefix</Label>
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
                      <Label>Enable Health Check</Label>
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
                          <Label>Interval (seconds)</Label>
                          <Input
                            type="number"
                            value={ecsConfig.healthCheckInterval}
                            onChange={(e) => setECSConfig({ ...ecsConfig, healthCheckInterval: Number.parseInt(e.target.value) })}
                            min="5"
                            max="300"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Timeout (seconds)</Label>
                          <Input
                            type="number"
                            value={ecsConfig.healthCheckTimeout}
                            onChange={(e) => setECSConfig({ ...ecsConfig, healthCheckTimeout: Number.parseInt(e.target.value) })}
                            min="2"
                            max="60"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Retries</Label>
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
            {/* Insert history session here for SkyBox only */}
            <ServiceDeploymentHistory />
          </Card>
        )

      case "lambda":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Lambda Configuration
              </CardTitle>
              <CardDescription>Configure your serverless function</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="runtime" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="runtime">Runtime</TabsTrigger>
                  <TabsTrigger value="config">Configuration</TabsTrigger>
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
                    <Label>Environment Variables</Label>
                    <Textarea
                      placeholder="NODE_ENV=production&#10;API_KEY=your-api-key&#10;DATABASE_URL=your-database-url"
                      value={lambdaConfig.environmentVars}
                      onChange={(e) => setLambdaConfig({ ...lambdaConfig, environmentVars: e.target.value })}
                      rows={4}
                    />
                    <Editor
                        height="500px"
                        defaultLanguage="python"
                        defaultValue="// Escribe tu código aquí"
                        theme="vs-dark"  
                      />
                    {/* <p className="text-xs text-slate-500">One variable per line in KEY=value format</p> */}
                  </div>
                </TabsContent>

                <TabsContent value="config" className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <Label className="flex items-center gap-2">
                          <Timer className="h-4 w-4" />
                          Timeout (seconds)
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
                    <h4 className="font-medium text-green-900 mb-2">Performance Estimation:</h4>
                    <div className="text-sm text-green-800">
                      <p>• Assigned CPU: ~{Math.round((lambdaConfig.memory / 1769) * 1000)} MHz</p>
                      <p>• Maximum execution time: {lambdaConfig.timeout} seconds</p>
                      <p>• Available memory: {lambdaConfig.memory} MB</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="triggers" className="space-y-6 mt-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Main Trigger
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
                      <h4 className="font-medium text-yellow-900 mb-2">Trigger Configuration:</h4>
                      {lambdaConfig.trigger === "api-gateway" && (
                        <div className="text-sm text-yellow-800">
                          <p>• A REST API Gateway will be created</p>
                          <p>• Endpoint: https://api-id.execute-api.region.amazonaws.com/prod/</p>
                          <p>• Methods: GET, POST, PUT, DELETE</p>
                        </div>
                      )}
                      {lambdaConfig.trigger === "s3" && (
                        <div className="text-sm text-yellow-800">
                          <p>• Will execute when files are uploaded to the bucket</p>
                          <p>• Events: s3:ObjectCreated:*</p>
                        </div>
                      )}
                      {lambdaConfig.trigger === "sqs" && (
                        <div className="text-sm text-yellow-800">
                          <p>• Will execute when messages arrive in the queue</p>
                          <p>• Batch size: 10 messages</p>
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

  // Función para ordenar las imágenes Docker
  function ordenarDockerImages(images: DockerImage[]) {
    // Solo devolver las imágenes que tengan nombre (las que el usuario ingresó)
    return images.filter(img => img.name && img.name.trim() !== "");
  }

  const handleDeploy = async () => {
    setIsDeploying(true)
    
    try {
      // Ordenar las imágenes antes de enviarlas
      const dockerImagesOrdenadas = ordenarDockerImages(dockerImages);
      // Preparar los datos del deployment según el formato que espera el backend
      let deploymentData: any = {
        service: selectedService as "pagedrop" | "ecs" | "lambda",
        regions: selectedRegions,
      }

      // Agregar configuración específica del servicio
      switch (selectedService) {
        case "ecs":
          deploymentData = {
            ecs_config: {
              ...ecsConfig,
              isRepoPrivate: isPrivateRegistry,
              privateRegistryCredentials: isPrivateRegistry ? privateRegistryCredentials : undefined,
              environmentVariables: [
                ...ecsConfig.environmentVariables,
                { name: "MYSQL_ROOT_PASSWORD", value: databaseCredentials.rootPassword },
                { name: "MYSQL_DATABASE", value: databaseCredentials.databaseName },
                { name: "MYSQL_USER", value: databaseCredentials.databaseUser },
                { name: "MYSQL_PASSWORD", value: databaseCredentials.databasePassword },
                { name: "MYSQL_PORT", value: databaseCredentials.mysqlPort },
              ].filter(env => env.value.trim() !== ""), // Solo incluir variables con valor
              regions: selectedRegions, // <-- Agrego las regiones seleccionadas
            },
            docker_images: dockerImagesOrdenadas,
            service: "ecs",
            domain_name: ecsConfig.domainName, // Add domain name to deployment data
          }
          break

        case "pagedrop":
          deploymentData = {
            ...deploymentData,
            name: `pagedrop-${Date.now()}`,
            docker_image: `${dockerImages[0].name}:${dockerImages[0].tag}`,
            port: dockerImages[0].port,
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

      // Detailed log of the data being sent
      console.log("🚀 Starting deployment with the following data:")
      console.log("📋 General data:", {
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
      
      console.log("📦 Complete data:", deploymentData)

      toast.loading("Starting deployment...", { id: "deployment" })

      const response = await DeploymentProvider.createDeployment(deploymentData)

      if (response.success) {
        toast.success(`Deployment started successfully! ID: ${response.deploymentId}`, { id: "deployment" })
        console.log("✅ Deployment created successfully:", response)
      } else {
        throw new Error(response.message || "Unknown error")
      }
    } catch (error) {
      console.error("❌ Error in deployment:", error)
      toast.error(`Error in deployment: ${error instanceof Error ? error.message : "Unknown error"}`, {
        id: "deployment",
      })
    } finally {
      setIsDeploying(false)
    }
  }

  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/sign-in");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
      <div className="h-[90vh] w-[90vw] mx-auto my-auto rounded-2xl shadow-2xl bg-white/80 p-10 space-y-8 overflow-auto" style={{fontSize: '1.15rem', fontFamily: 'Inter, sans-serif'}}>
        <div className="text-center space-y-3">
          <h1 className="text-6xl font-extrabold text-slate-800 flex items-center justify-center gap-4 tracking-tight drop-shadow-lg">
            <Cloud className="h-14 w-14 text-blue-600" />
            Cloud Deployer
          </h1>
          <p className="text-slate-700 text-2xl font-medium">Deploy your Docker applications to the cloud easily</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Select Your Service
                </CardTitle>
                <CardDescription>Choose the service type that best fits your application</CardDescription>
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
                  Regions
                </CardTitle>
                <CardDescription>Select the regions where to deploy</CardDescription>
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
                                      region.latency === "Low"
                                        ? "bg-green-100 text-green-800"
                                        : region.latency === "Medium"
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
                          Selected ({selectedRegions.length}):
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
                  Configuration Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Service:</span>
                    <Badge>{services.find((s) => s.id === selectedService)?.name}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Regions:</span>
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
                        <span className="text-sm text-slate-600">Instance:</span>
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
                        <span className="text-sm text-slate-600">Memory:</span>
                        <Badge variant="secondary">{ecsConfig.taskMemory} MB</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Tasks:</span>
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
                        <span className="text-sm text-slate-600">Memory:</span>
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
                      <span className="text-sm text-slate-600">Images:</span>
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
                  Cost Estimation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-green-600">${calculateCost()}</div>
                  <p className="text-sm text-slate-600">
                    {selectedService === "lambda" ? "per 1M invocations" : "per month (estimated)"}
                  </p>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2 text-xs text-slate-500">
                  <p>• Prices may vary by region</p>
                  {selectedService !== "lambda" && <p>• Does not include data transfer</p>}
                  {selectedService === "lambda" ? (
                    <p>• Includes 1M requests + compute time</p>
                  ) : (
                    <p>• Billed by hour of use</p>
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
                    ((selectedService === "ec2" || selectedService === "ecs") && !dockerImages.some((img) => img.name)) ||
                    (selectedService === "ecs" && (dockerImages.reduce((sum, img) => sum + (Number(img.cpu) || 0), 0) > ecsConfig.taskCpu || dockerImages.reduce((sum, img) => sum + (Number(img.memory) || 0), 0) > ecsConfig.taskMemory))
                  }
                  onClick={() => handleDeploy()}
                >
                  {isDeploying ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Deploying...
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5 mr-2" />
                      Deploy {services.find((s) => s.id === selectedService)?.name}
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-slate-500 mt-3">
                  Deployment will take approximately {selectedService === "lambda" ? "1-2" : "3-8"} minutes
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
