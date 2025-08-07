"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Container, Plus, Trash2 } from "lucide-react"
import { useDeploymentStore } from "@/store/useDeploymentStore"

export function DockerImagesConfig() {
  const { dockerImages, addDockerImage, removeDockerImage, updateDockerImage } = useDeploymentStore()

  return (
    <Card className="animate-fade-in">
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
            <div className="w-32 space-y-2">
              <Label>Tag</Label>
              <Input
                placeholder="latest"
                value={image.tag}
                onChange={(e) => updateDockerImage(image.id, "tag", e.target.value)}
              />
            </div>
            <div className="w-24 space-y-2">
              <Label>Puerto</Label>
              <Input
                placeholder="80"
                value={image.port || ""}
                onChange={(e) => updateDockerImage(image.id, "port", e.target.value)}
              />
            </div>
            <div className="w-24 space-y-2">
              <Label>CPU</Label>
              <Input
                placeholder="256"
                value={image.cpu || ""}
                onChange={(e) => updateDockerImage(image.id, "cpu", e.target.value)}
              />
            </div>
            <div className="w-24 space-y-2">
              <Label>Memoria</Label>
              <Input
                placeholder="512"
                value={image.memory || ""}
                onChange={(e) => updateDockerImage(image.id, "memory", e.target.value)}
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
            className="w-full border-dashed border-2 hover:bg-muted/50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Imagen Docker
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
