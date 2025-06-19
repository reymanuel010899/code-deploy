"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Globe, ChevronLeft, ChevronRight } from "lucide-react"
import { AWS_REGIONS } from "@/constants"
import { useDeploymentStore } from "@/store/useDeploymentStore"

export function RegionCarousel() {
  const { regions, toggleRegion } = useDeploymentStore()
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextRegions = () => {
    const maxIndex = Math.ceil(AWS_REGIONS.length / 2) - 1
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
  }

  const prevRegions = () => {
    const maxIndex = Math.ceil(AWS_REGIONS.length / 2) - 1
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1))
  }

  const getCurrentRegions = () => {
    const startIndex = currentIndex * 2
    return AWS_REGIONS.slice(startIndex, startIndex + 2)
  }

  return (
    <Card className="animate-fade-in">
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
              {Array.from({ length: Math.ceil(AWS_REGIONS.length / 2) }).map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? "bg-primary" : "bg-muted"
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
              const isSelected = regions.includes(region.id)
              return (
                <Card
                  key={region.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    isSelected ? "ring-2 ring-primary bg-primary/5 shadow-md" : "hover:bg-muted/50"
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
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : region.latency === "Media"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {region.latency}
                          </Badge>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-primary-foreground text-xs">✓</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Selected Regions Summary */}
          {regions.length > 0 && (
            <div className="mt-4 p-3 bg-primary/10 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-primary">Seleccionadas ({regions.length}):</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {regions.map((regionId) => {
                  const region = AWS_REGIONS.find((r) => r.id === regionId)
                  return (
                    <Badge key={regionId} variant="default" className="text-xs">
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
  )
}
