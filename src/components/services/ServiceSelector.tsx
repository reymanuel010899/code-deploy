"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings } from "lucide-react"
import { SERVICES } from "@/constants"
import { useDeploymentStore } from "@/store/useDeploymentStore"

export function ServiceSelector() {
  const { service, setService } = useDeploymentStore()

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Selecciona tu Servicio
        </CardTitle>
        <CardDescription>Elige el tipo de servicio que mejor se adapte a tu aplicación</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SERVICES.map((serviceOption) => {
            const Icon = serviceOption.icon
            return (
              <Card
                key={serviceOption.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 ${
                  service === serviceOption.id ? "ring-2 ring-primary bg-primary/5 shadow-md" : "hover:bg-muted/50"
                }`}
                onClick={() => setService(serviceOption.id as any)}
              >
                <CardContent className="p-4 text-center space-y-3">
                  <div
                    className={`w-12 h-12 ${serviceOption.color} rounded-lg flex items-center justify-center mx-auto transition-transform duration-200 hover:scale-110`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{serviceOption.name}</h3>
                    <p className="text-sm text-muted-foreground">{serviceOption.description}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
