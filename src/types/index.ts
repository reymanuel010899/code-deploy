export interface DockerImage {
  id: string
  name: string
  tag: string
  port?: string
  cpu?: string
  memory?: string
}

export interface EC2Config {
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

export interface ECSConfig {
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
  // Fargate specific properties
  platformVersion: string
  assignPublicIp: boolean
  subnets: string[]
  securityGroups: string[]
  // Container definition properties
  containerPort: number
  hostPort?: number
  protocol: string
  essential: boolean
  logGroup: string
  logRegion: string
  logStreamPrefix: string
  // Environment and secrets
  environmentVariables: { name: string; value: string }[]
  secrets: { name: string; valueFrom: string }[]
  // Health check
  healthCheckEnabled: boolean
  healthCheckPath: string
  healthCheckInterval: number
  healthCheckTimeout: number
  healthCheckRetries: number
  // Resource limits
  cpuReservation?: number
  memoryReservation?: number
  memoryHardLimit?: number
}

export interface LambdaConfig {
  runtime: string
  handler: string
  timeout: number
  memory: number
  environmentVars: string
  trigger: string
  deadLetterQueue: boolean
}

export interface AWSRegion {
  id: string
  name: string
  flag: string
  latency: "Baja" | "Media" | "Alta"
  color: string
  priceMultiplier: number
}

export interface Service {
  id: string
  name: string
  description: string
  icon: any
  color: string
}

export type ServiceType = "ec2" | "ecs" | "lambda"

export interface DeploymentConfig {
  service: ServiceType
  regions: string[]
  dockerImages: DockerImage[]
  ec2Config: EC2Config
  ecsConfig: ECSConfig
  lambdaConfig: LambdaConfig
}
