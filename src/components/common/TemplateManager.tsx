"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, FolderOpen, Trash2 } from "lucide-react"
import { toast } from "react-hot-toast"
import { useDeploymentStore } from "@/store/useDeploymentStore"

export function TemplateManager() {
  const [isOpen, setIsOpen] = useState(false)
  const [templateName, setTemplateName] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const { saveTemplate, loadTemplate, getTemplates } = useDeploymentStore()

  const templates = getTemplates()

  const handleSave = () => {
    if (!templateName.trim()) {
      toast.error("Por favor ingresa un nombre para el template")
      return
    }

    saveTemplate(templateName)
    toast.success(`Template "${templateName}" guardado exitosamente`)
    setTemplateName("")
    setIsOpen(false)
  }

  const handleLoad = () => {
    if (!selectedTemplate) {
      toast.error("Por favor selecciona un template")
      return
    }

    loadTemplate(selectedTemplate)
    toast.success(`Template "${selectedTemplate}" cargado exitosamente`)
    setIsOpen(false)
  }

  const handleDelete = (templateName: string) => {
    const templates = JSON.parse(localStorage.getItem("deployment-templates") || "{}")
    delete templates[templateName]
    localStorage.setItem("deployment-templates", JSON.stringify(templates))
    toast.success(`Template "${templateName}" eliminado`)
  }

  if (!isOpen) {
    return (
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        <FolderOpen className="h-4 w-4 mr-2" />
        Templates
      </Button>
    )
  }

  return (
    <Card className="absolute top-12 right-0 w-80 z-50 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg">Gestión de Templates</CardTitle>
        <CardDescription>Guarda y carga configuraciones predefinidas</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Save Template */}
        <div className="space-y-2">
          <Label>Guardar configuración actual</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Nombre del template"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
            />
            <Button onClick={handleSave} size="sm">
              <Save className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Load Template */}
        {templates.length > 0 && (
          <div className="space-y-2">
            <Label>Cargar template existente</Label>
            <div className="flex gap-2">
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template} value={template}>
                      {template}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleLoad} size="sm">
                <FolderOpen className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Template List */}
        {templates.length > 0 && (
          <div className="space-y-2">
            <Label>Templates guardados</Label>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {templates.map((template) => (
                <div key={template} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">{template}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(template)}
                    className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cerrar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
