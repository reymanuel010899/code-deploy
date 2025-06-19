"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { DollarSign } from "lucide-react"
import { useCostCalculator } from "@/hooks/useCostCalculator"
import { useDeploymentStore } from "@/store/useDeploymentStore"

export function CostEstimation() {
  const { service } = useDeploymentStore()
  const { totalCost, costBreakdown } = useCostCalculator()

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Estimación de Costos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-2">
          <div className="text-3xl font-bold text-green-600">${totalCost}</div>
          <p className="text-sm text-muted-foreground">
            {service === "lambda" ? "por 1M invocaciones" : "por mes (estimado)"}
          </p>
        </div>

        {costBreakdown && costBreakdown.length > 1 && (
          <>
            <Separator className="my-4" />
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Desglose por región:</h4>
              {costBreakdown.map((item, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">
                    {item?.flag} {item?.region}
                  </span>
                  <span className="font-medium">${item?.cost}</span>
                </div>
              ))}
            </div>
          </>
        )}

        <Separator className="my-4" />

        <div className="space-y-2 text-xs text-muted-foreground">
          <p>• Precios pueden variar según la región</p>
          {service !== "lambda" && <p>• No incluye transferencia de datos</p>}
          {service === "lambda" ? <p>• Incluye 1M requests + compute time</p> : <p>• Facturación por hora de uso</p>}
        </div>
      </CardContent>
    </Card>
  )
}
