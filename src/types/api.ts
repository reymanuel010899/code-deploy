export interface DeploymentRequest {
  service: "ec2" | "ecs" | "lambda"
  regions: string[]
  dockerImages: DockerImage[]
  ecsConfig?: ECSDeploymentConfig
  ec2Config?: EC2DeploymentConfig
  lambdaConfig?: LambdaDeploymentConfig
}
export interface ImagesRequest {
  tag: string
  name:string
}

export interface ECSDeploymentConfig {
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

export interface EC2DeploymentConfig {
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

export interface LambdaDeploymentConfig {
  runtime: string
  handler: string
  timeout: number
  memory: number
  environmentVars: string
  trigger: string
  deadLetterQueue: boolean
}

export interface DockerImage {
  id: string
  name: string
  tag: string
}

export interface DeploymentResponse {
  success: boolean
  deploymentId: string
  message: string
  status: "pending" | "in_progress" | "completed" | "failed" | "stopped"
  resources?: {
    clusterArn?: string
    serviceArn?: string
    taskDefinitionArn?: string
    loadBalancerArn?: string
  }
  estimatedTime?: number
  logs?: string[]
}

export interface DeploymentStatus {
  deploymentId: string
  status: "pending" | "in_progress" | "completed" | "failed" | "stopped"
  progress: number
  currentStep: string
  logs: string[]
  resources: {
    clusterArn?: string
    serviceArn?: string
    taskDefinitionArn?: string
    loadBalancerArn?: string
  }
  createdAt: string
  updatedAt: string
  estimatedTimeRemaining?: number
  service: "ec2" | "ecs" | "lambda"
  regions: string[]
  // Campos adicionales para el listado
  name?: string
  description?: string
  tags?: { [key: string]: string }
}

export interface DeploymentMetrics {
  deploymentId: string
  cpuUtilization: number
  memoryUtilization: number
  networkIn: number
  networkOut: number
  taskCount: number
  runningTasks: number
  pendingTasks: number
  timestamp: string
  // Métricas adicionales
  diskUtilization?: number
  requestCount?: number
  errorRate?: number
  responseTime?: number
}

export interface DeploymentListResponse {
  deployments: DeploymentStatus[]
  total: number
  page: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface ScaleDeploymentRequest {
  desiredCount: number
  minCapacity?: number
  maxCapacity?: number
  autoScaling?: boolean
}

export interface UpdateDeploymentRequest {
  serviceName?: string
  taskCpu?: number
  taskMemory?: number
  environmentVariables?: { name: string; value: string }[]
  secrets?: { name: string; valueFrom: string }[]
  healthCheckEnabled?: boolean
  healthCheckPath?: string
  healthCheckInterval?: number
  healthCheckTimeout?: number
  healthCheckRetries?: number
  autoScaling?: boolean
  loadBalancer?: boolean
  minCapacity?: number
  maxCapacity?: number
}

export interface ApiError {
  error: string
  message: string
  code: number
  details?: any
  timestamp?: string
}
