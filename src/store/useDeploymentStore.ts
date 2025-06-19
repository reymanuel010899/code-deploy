import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { DeploymentConfig, DockerImage, EC2Config, ECSConfig, LambdaConfig, ServiceType } from "@/types"

interface DeploymentStore extends DeploymentConfig {
  // Actions
  setService: (service: ServiceType) => void
  setRegions: (regions: string[]) => void
  toggleRegion: (regionId: string) => void
  setDockerImages: (images: DockerImage[]) => void
  addDockerImage: () => void
  removeDockerImage: (id: string) => void
  updateDockerImage: (id: string, field: string, value: string) => void
  setEC2Config: (config: Partial<EC2Config>) => void
  setECSConfig: (config: Partial<ECSConfig>) => void
  setLambdaConfig: (config: Partial<LambdaConfig>) => void
  resetConfig: () => void
  saveTemplate: (name: string) => void
  loadTemplate: (name: string) => void
  getTemplates: () => string[]
}

const initialState: DeploymentConfig = {
  service: "ec2",
  regions: ["us-east-1"],
  dockerImages: [{ id: "1", name: "", tag: "latest" }],
  ec2Config: {
    os: "amazon-linux-2",
    instanceType: "t3.medium",
    keyPair: "",
    securityGroup: "default",
    subnet: "default",
    storageType: "gp3",
    storageSize: 20,
    userData: "",
    monitoring: false,
  },
  ecsConfig: {
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
    // Fargate specific
    platformVersion: "LATEST",
    assignPublicIp: true,
    subnets: [],
    securityGroups: [],
    // Container definition
    containerPort: 80,
    hostPort: undefined,
    protocol: "tcp",
    essential: true,
    logGroup: "/ecs/fargate-task",
    logRegion: "us-east-1",
    logStreamPrefix: "ecs",
    // Environment and secrets
    environmentVariables: [],
    secrets: [],
    // Health check
    healthCheckEnabled: true,
    healthCheckPath: "/health",
    healthCheckInterval: 30,
    healthCheckTimeout: 5,
    healthCheckRetries: 3,
    // Resource limits
    cpuReservation: undefined,
    memoryReservation: undefined,
    memoryHardLimit: undefined,
  },
  lambdaConfig: {
    runtime: "nodejs18.x",
    handler: "index.handler",
    timeout: 30,
    memory: 128,
    environmentVars: "",
    trigger: "api-gateway",
    deadLetterQueue: false,
  },
}

export const useDeploymentStore = create<DeploymentStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setService: (service) => set({ service }),

      setRegions: (regions) => set({ regions }),

      toggleRegion: (regionId) =>
        set((state) => ({
          regions: state.regions.includes(regionId)
            ? state.regions.filter((id) => id !== regionId)
            : [...state.regions, regionId],
        })),

      setDockerImages: (dockerImages) => set({ dockerImages }),

      addDockerImage: () =>
        set((state) => {
          if (state.dockerImages.length < 3) {
            return {
              dockerImages: [
                ...state.dockerImages,
                {
                  id: Date.now().toString(),
                  name: "",
                  tag: "latest",
                },
              ],
            }
          }
          return state
        }),

      removeDockerImage: (id) =>
        set((state) => ({
          dockerImages:
            state.dockerImages.length > 1 ? state.dockerImages.filter((img) => img.id !== id) : state.dockerImages,
        })),

      updateDockerImage: (id, field, value) =>
        set((state) => ({
          dockerImages: state.dockerImages.map((img) => (img.id === id ? { ...img, [field]: value } : img)),
        })),

      setEC2Config: (config) =>
        set((state) => ({
          ec2Config: { ...state.ec2Config, ...config },
        })),

      setECSConfig: (config) =>
        set((state) => ({
          ecsConfig: { ...state.ecsConfig, ...config },
        })),

      setLambdaConfig: (config) =>
        set((state) => ({
          lambdaConfig: { ...state.lambdaConfig, ...config },
        })),

      resetConfig: () => set(initialState),

      saveTemplate: (name) => {
        const state = get()
        const templates = JSON.parse(localStorage.getItem("deployment-templates") || "{}")
        templates[name] = {
          service: state.service,
          regions: state.regions,
          dockerImages: state.dockerImages,
          ec2Config: state.ec2Config,
          ecsConfig: state.ecsConfig,
          lambdaConfig: state.lambdaConfig,
        }
        localStorage.setItem("deployment-templates", JSON.stringify(templates))
      },

      loadTemplate: (name) => {
        const templates = JSON.parse(localStorage.getItem("deployment-templates") || "{}")
        if (templates[name]) {
          set(templates[name])
        }
      },

      getTemplates: () => {
        const templates = JSON.parse(localStorage.getItem("deployment-templates") || "{}")
        return Object.keys(templates)
      },
    }),
    {
      name: "deployment-config",
      partialize: (state) => ({
        service: state.service,
        regions: state.regions,
        dockerImages: state.dockerImages,
        ec2Config: state.ec2Config,
        ecsConfig: state.ecsConfig,
        lambdaConfig: state.lambdaConfig,
      }),
    },
  ),
)
