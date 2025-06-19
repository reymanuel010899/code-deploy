# Ejemplos de Datos de Deployment

Este documento muestra exactamente qué datos se envían al endpoint `/deployments/create/` cuando se hace clic en el botón "Desplegar" para cada tipo de servicio.

## ✅ **IMPORTANTE: Todos los datos vienen del usuario**

**Ya no hay datos hardcodeados.** Todos los valores se obtienen de lo que el usuario ingresa en la interfaz.

## Estructura General

Todos los deployments incluyen estos datos básicos:

```typescript
{
  service: "ec2" | "ecs" | "lambda",
  regions: string[], // Regiones seleccionadas por el usuario
  name: string // Nombre del deployment
}
```

## 1. Deployment ECS (Elastic Container Service)

### Datos Enviados (TODOS del usuario):
```json
{
  "service": "ecs",
  "regions": ["us-east-1", "eu-west-1"],
  "name": "mi-servicio",
  "docker_image": "nginx:latest,node:18-alpine",
  "cpu_units": 1024,
  "memory_mb": 2048,
  "cluster_name": "mi-aplicacion-cluster",
  "service_name": "mi-servicio",
  "task_definition_family": "mi-task-definition",
  "desired_count": 2,
  "load_balancer": true,
  "auto_scaling": true,
  "min_capacity": 1,
  "max_capacity": 10,
  "network_mode": "awsvpc",
  "platform_version": "LATEST",
  "assign_public_ip": true,
  "subnets": ["subnet-12345678", "subnet-87654321"],
  "security_groups": ["sg-12345678", "sg-87654321"],
  "container_port": 80,
  "host_port": null,
  "protocol": "tcp",
  "essential": true,
  "log_group": "/ecs/mi-aplicacion",
  "log_region": "us-east-1",
  "log_stream_prefix": "ecs",
  "environment_variables": [],
  "secrets": [],
  "health_check_enabled": true,
  "health_check_path": "/health",
  "health_check_interval": 30,
  "health_check_timeout": 5,
  "health_check_retries": 3,
  "cpu_reservation": null,
  "memory_reservation": null,
  "memory_hard_limit": null
}
```

### Campos Configurables por el Usuario:

#### **Pestaña "Cluster":**
- ✅ **cluster_name**: Nombre del cluster ECS
- ✅ **network_mode**: Modo de red (awsvpc, bridge, host)

#### **Pestaña "Task Definition":**
- ✅ **cpu_units**: CPU asignada en unidades (256 = 0.25 vCPU)
- ✅ **memory_mb**: Memoria en MB

#### **Pestaña "Service":**
- ✅ **desired_count**: Número de tareas deseadas
- ✅ **load_balancer**: Si usar Application Load Balancer
- ✅ **auto_scaling**: Si habilitar auto-scaling
- ✅ **min_capacity/max_capacity**: Límites de auto-scaling

#### **Pestaña "Avanzado":**
- ✅ **name**: Nombre del deployment
- ✅ **service_name**: Nombre del servicio (opcional, se genera automáticamente)
- ✅ **task_definition_family**: Familia de la definición de tarea (opcional, se genera automáticamente)
- ✅ **container_port**: Puerto del contenedor
- ✅ **protocol**: Protocolo (TCP/UDP)
- ✅ **subnets**: Lista de subnets (separadas por comas)
- ✅ **security_groups**: Lista de security groups (separadas por comas)
- ✅ **assign_public_ip**: Si asignar IP pública
- ✅ **essential**: Si el contenedor es esencial
- ✅ **log_group**: Grupo de logs
- ✅ **log_region**: Región de logs
- ✅ **log_stream_prefix**: Prefijo del log stream
- ✅ **health_check_enabled**: Si habilitar health checks
- ✅ **health_check_path**: Path del health check
- ✅ **health_check_interval**: Intervalo del health check
- ✅ **health_check_timeout**: Timeout del health check
- ✅ **health_check_retries**: Número de reintentos

## 2. Deployment EC2 (Elastic Compute Cloud)

### Datos Enviados (TODOS del usuario):
```json
{
  "service": "ec2",
  "regions": ["us-east-1"],
  "name": "ec2-1703123456789",
  "docker_image": "nginx:latest",
  "os": "amazon-linux-2",
  "instance_type": "t3.medium",
  "key_pair": "mi-key-pair",
  "security_group": "default",
  "subnet": "default",
  "storage_type": "gp3",
  "storage_size": 20,
  "user_data": "#!/bin/bash\nyum update -y\nyum install -y docker\nservice docker start",
  "monitoring": false
}
```

### Campos Configurables por el Usuario:
- ✅ **name**: Nombre del deployment (generado automáticamente)
- ✅ **docker_image**: Imágenes Docker (formato: "imagen:tag,imagen2:tag2")
- ✅ **os**: Sistema operativo (amazon-linux-2, ubuntu-20.04, etc.)
- ✅ **instance_type**: Tipo de instancia (t3.medium, t3.large, etc.)
- ✅ **key_pair**: Par de claves SSH para conexión
- ✅ **security_group**: Grupo de seguridad
- ✅ **subnet**: Subnet donde desplegar
- ✅ **storage_type**: Tipo de almacenamiento (gp3, gp2, io2, st1)
- ✅ **storage_size**: Tamaño del disco en GB
- ✅ **user_data**: Script que se ejecuta al iniciar la instancia
- ✅ **monitoring**: Si habilitar monitoreo detallado

## 3. Deployment Lambda

### Datos Enviados (TODOS del usuario):
```json
{
  "service": "lambda",
  "regions": ["us-east-1"],
  "name": "lambda-1703123456789",
  "runtime": "nodejs18.x",
  "handler": "index.handler",
  "timeout": 30,
  "memory_mb": 128,
  "environment_vars": "NODE_ENV=production\nAPI_KEY=tu-api-key",
  "trigger": "api-gateway",
  "dead_letter_queue": false
}
```

### Campos Configurables por el Usuario:
- ✅ **name**: Nombre del deployment (generado automáticamente)
- ✅ **runtime**: Runtime de la función (nodejs18.x, python3.9, etc.)
- ✅ **handler**: Punto de entrada de la función
- ✅ **timeout**: Tiempo máximo de ejecución en segundos
- ✅ **memory_mb**: Memoria asignada en MB
- ✅ **environment_vars**: Variables de entorno (formato texto)
- ✅ **trigger**: Tipo de trigger (api-gateway, s3, sqs, etc.)
- ✅ **dead_letter_queue**: Si usar Dead Letter Queue

## Endpoint de Destino

Todos los datos se envían al endpoint:
```
POST /deployments/create/
```

## Respuesta Esperada

```json
{
  "success": true,
  "deploymentId": "12345",
  "message": "Deployment iniciado exitosamente",
  "status": "pending",
  "resources": {
    "clusterArn": "arn:aws:ecs:us-east-1:123456789012:cluster/mi-cluster",
    "serviceArn": "arn:aws:ecs:us-east-1:123456789012:service/mi-service"
  },
  "estimatedTime": 300
}
```

## Logs en Consola

Cuando se hace clic en "Desplegar", verás en la consola del navegador:

```
🚀 Iniciando deployment con los siguientes datos:
📋 Datos generales: { service: "ecs", regions: [...], name: "mi-servicio" }
🐳 Docker Images: nginx:latest,node:18-alpine
⚡ CPU Units: 1024
💾 Memory MB: 2048
📦 Datos completos: { service: "ecs", name: "mi-servicio", docker_image: "nginx:latest", ... }
✅ Deployment creado exitosamente: { success: true, deploymentId: "12345", ... }
```

## Validaciones

El botón se deshabilita si:
- **EC2**: No hay keyPair configurado
- **ECS**: No hay clusterName configurado  
- **Lambda**: No hay handler configurado
- **EC2/ECS**: No hay imágenes Docker configuradas
- Se está ejecutando un deployment (isDeploying = true)

## 🎯 **Resumen**

**Todos los datos que se envían al endpoint provienen exclusivamente de lo que el usuario ingresa en la interfaz.** Los datos se mapean al formato que espera el backend usando snake_case para los nombres de campos.

### **Campos requeridos por el backend:**
- ✅ **name**: Nombre del deployment
- ✅ **docker_image**: Imágenes Docker (para EC2 y ECS)
- ✅ **cpu_units**: Unidades de CPU (para ECS)
- ✅ **memory_mb**: Memoria en MB (para ECS y Lambda) 