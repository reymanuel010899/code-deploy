import { Server, Container, Cloud } from "lucide-react"
import type { Service, AWSRegion } from "@/types"

export const SERVICES: Service[] = [
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

export const AWS_REGIONS: AWSRegion[] = [
  {
    id: "us-east-1",
    name: "US East (N. Virginia)",
    flag: "🇺🇸",
    latency: "Baja",
    color: "bg-blue-500",
    priceMultiplier: 1.0,
  },
  {
    id: "us-west-2",
    name: "US West (Oregon)",
    flag: "🇺🇸",
    latency: "Baja",
    color: "bg-blue-600",
    priceMultiplier: 1.05,
  },
  {
    id: "eu-west-1",
    name: "Europe (Ireland)",
    flag: "🇮🇪",
    latency: "Media",
    color: "bg-green-500",
    priceMultiplier: 1.1,
  },
  {
    id: "eu-central-1",
    name: "Europe (Frankfurt)",
    flag: "🇩🇪",
    latency: "Media",
    color: "bg-green-600",
    priceMultiplier: 1.15,
  },
  {
    id: "ap-southeast-1",
    name: "Asia Pacific (Singapore)",
    flag: "🇸🇬",
    latency: "Alta",
    color: "bg-orange-500",
    priceMultiplier: 1.2,
  },
  {
    id: "ap-northeast-1",
    name: "Asia Pacific (Tokyo)",
    flag: "🇯🇵",
    latency: "Alta",
    color: "bg-orange-600",
    priceMultiplier: 1.25,
  },
  {
    id: "sa-east-1",
    name: "South America (São Paulo)",
    flag: "🇧🇷",
    latency: "Alta",
    color: "bg-purple-500",
    priceMultiplier: 1.3,
  },
  {
    id: "ca-central-1",
    name: "Canada (Central)",
    flag: "🇨🇦",
    latency: "Baja",
    color: "bg-red-500",
    priceMultiplier: 1.08,
  },
]

export const OPERATING_SYSTEMS = [
  { value: "amazon-linux-2", label: "Amazon Linux 2", icon: "🐧" },
  { value: "ubuntu-20.04", label: "Ubuntu 20.04 LTS", icon: "🟠" },
  { value: "ubuntu-22.04", label: "Ubuntu 22.04 LTS", icon: "🟠" },
  { value: "windows-2019", label: "Windows Server 2019", icon: "🪟" },
  { value: "windows-2022", label: "Windows Server 2022", icon: "🪟" },
  { value: "rhel-8", label: "Red Hat Enterprise Linux 8", icon: "🔴" },
  { value: "centos-7", label: "CentOS 7", icon: "💜" },
]

export const RUNTIMES = [
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

export const INSTANCE_COSTS = {
  "t3.micro": 0.0104,
  "t3.small": 0.0208,
  "t3.medium": 0.0416,
  "t3.large": 0.0832,
  "t3.xlarge": 0.1664,
}
