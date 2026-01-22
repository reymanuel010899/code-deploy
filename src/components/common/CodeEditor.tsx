"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../../../components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../../../components/ui/alert-dialog"
import { 
  Plus, 
  Trash2, 
  Code, 
  FileCode, 
  Download, 
  Upload,
  Edit,
  Save,
  X
} from "lucide-react"
import Editor from "@monaco-editor/react"
import { useDeploymentStore } from "@/store/useDeploymentStore"
import type { CodeFile } from "@/types"
import { useEffect } from "react"

const LANGUAGE_OPTIONS = [
  { value: "javascript", label: "JavaScript", extension: "js" },
  { value: "typescript", label: "TypeScript", extension: "ts" },
  { value: "python", label: "Python", extension: "py" },
  { value: "java", label: "Java", extension: "java" },
  { value: "csharp", label: "C#", extension: "cs" },
  { value: "go", label: "Go", extension: "go" },
  { value: "ruby", label: "Ruby", extension: "rb" },
  { value: "json", label: "JSON", extension: "json" },
  { value: "yaml", label: "YAML", extension: "yaml" },
  { value: "plaintext", label: "Text", extension: "txt" },
]

const TEMPLATES = {
  javascript: {
    handler: `// Función principal de Lambda
const utils = require('./utils');

exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));
    
    try {
        // Validar entrada
        if (!utils.validateInput(event)) {
            return utils.formatResponse(400, { error: 'Invalid input' });
        }
        
        // Tu lógica de negocio aquí
        const result = {
            message: 'Hello from Lambda!',
            input: event,
            timestamp: new Date().toISOString()
        };
        
        return utils.formatResponse(200, result);
    } catch (error) {
        console.error('Error:', error);
        return utils.formatResponse(500, { error: 'Internal server error' });
    }
};`,
    util: `// Módulo de utilidades
exports.formatResponse = (statusCode, body) => {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        },
        body: JSON.stringify(body)
    };
};

exports.validateInput = (event) => {
    if (!event) return false;
    
    // Validar según el tipo de trigger
    if (event.httpMethod) {
        // API Gateway
        return true;
    } else if (event.Records) {
        // S3, SQS, etc.
        return event.Records.length > 0;
    }
    
    return true;
};

exports.parseBody = (event) => {
    if (!event.body) return null;
    
    try {
        return JSON.parse(event.body);
    } catch (error) {
        console.error('Error parsing body:', error);
        return null;
    }
};

exports.getRequestId = (context) => {
    return context ? context.awsRequestId : 'unknown';
};`
  },
  python: {
    handler: `import json
import logging
from datetime import datetime
import utils

# Configurar logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    """
    Función principal de Lambda
    """
    request_id = utils.get_request_id(context)
    logger.info(f"Request ID: {request_id}, Event: {json.dumps(event)}")
    
    try:
        # Validar entrada
        if not utils.validate_input(event):
            return utils.format_response(400, {'error': 'Invalid input'})
        
        # Tu lógica de negocio aquí
        response_body = {
            'message': 'Hello from Lambda!',
            'input': event,
            'timestamp': datetime.utcnow().isoformat(),
            'requestId': request_id
        }
        
        return utils.format_response(200, response_body)
        
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return utils.format_response(500, {'error': 'Internal server error'})`,
    util: `import json
import logging

logger = logging.getLogger()

def format_response(status_code, body):
    """Formatear respuesta HTTP"""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        },
        'body': json.dumps(body)
    }

def validate_input(event):
    """Validar entrada según el tipo de trigger"""
    if not event:
        return False
    
    # API Gateway
    if 'httpMethod' in event:
        return True
    # S3, SQS, etc.
    elif 'Records' in event:
        return len(event['Records']) > 0
    
    return True

def parse_body(event):
    """Parsear el body del request"""
    if 'body' not in event or not event['body']:
        return None
    
    try:
        return json.loads(event['body'])
    except json.JSONDecodeError as e:
        logger.error(f"Error parsing body: {e}")
        return None

def get_request_id(context):
    """Obtener el request ID"""
    return context.aws_request_id if context else 'unknown'

def extract_path_parameters(event):
    """Extraer parámetros de la URL"""
    return event.get('pathParameters', {}) or {}

def extract_query_parameters(event):
    """Extraer query parameters"""
    return event.get('queryStringParameters', {}) or {}`
  },
  java: {
    handler: `package com.example;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import java.util.Map;

public class LambdaHandler implements RequestHandler<Map<String, Object>, ApiGatewayResponse> {
    
    private static final Gson gson = new GsonBuilder().setPrettyPrinting().create();
    
    @Override
    public ApiGatewayResponse handleRequest(Map<String, Object> input, Context context) {
        LambdaLogger logger = context.getLogger();
        logger.log("Input: " + gson.toJson(input));
        
        try {
            // Tu lógica de negocio aquí
            Map<String, Object> responseBody = Map.of(
                "message", "Hello from Lambda!",
                "input", input,
                "requestId", context.getAwsRequestId()
            );
            
            return ApiGatewayResponse.builder()
                .setStatusCode(200)
                .setObjectBody(responseBody)
                .build();
                
        } catch (Exception e) {
            logger.log("Error: " + e.getMessage());
            
            return ApiGatewayResponse.builder()
                .setStatusCode(500)
                .setObjectBody(Map.of("error", "Internal server error"))
                .build();
        }
    }
}`,
    util: `package com.example;

import com.google.gson.Gson;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

public class ApiGatewayResponse {

    private final int statusCode;
    private final String body;
    private final Map<String, String> headers;
    private final boolean isBase64Encoded;

    private ApiGatewayResponse(Builder builder) {
        this.statusCode = builder.statusCode;
        this.body = builder.body;
        this.headers = builder.headers;
        this.isBase64Encoded = builder.isBase64Encoded;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private int statusCode = 200;
        private Map<String, String> headers = Collections.emptyMap();
        private String body;
        private boolean isBase64Encoded = false;

        public Builder setStatusCode(int statusCode) {
            this.statusCode = statusCode;
            return this;
        }

        public Builder setHeaders(Map<String, String> headers) {
            this.headers = headers;
            return this;
        }

        public Builder setObjectBody(Object body) {
            Gson gson = new Gson();
            this.body = gson.toJson(body);
            return this;
        }

        public Builder setRawBody(String rawBody) {
            this.body = rawBody;
            return this;
        }

        public Builder setBase64Encoded(boolean isBase64Encoded) {
            this.isBase64Encoded = isBase64Encoded;
            return this;
        }

        public ApiGatewayResponse build() {
            return new ApiGatewayResponse(this);
        }
    }

    // Getters
    public int getStatusCode() { return statusCode; }
    public String getBody() { return body; }
    public Map<String, String> getHeaders() { return headers; }
    public boolean getIsBase64Encoded() { return isBase64Encoded; }
}`
  }
}

export function CodeEditor() {
  const { lambdaConfig, addCodeFile, removeCodeFile, updateCodeFile } = useDeploymentStore()
  
  // Verificación defensiva para evitar errores durante la hidratación
  const codeFiles = lambdaConfig?.codeFiles || []
  const [activeFileId, setActiveFileId] = useState(codeFiles[0]?.id || "main")
  const [isEditingFileName, setIsEditingFileName] = useState<string | null>(null)
  const [tempFileName, setTempFileName] = useState("")
  const [isAddFileDialogOpen, setIsAddFileDialogOpen] = useState(false)
  const [newFileName, setNewFileName] = useState("")
  const [newFileLanguage, setNewFileLanguage] = useState("javascript")

  const activeFile = codeFiles.find(file => file.id === activeFileId) || codeFiles[0]
  
  // Si no hay archivos de código disponibles, mostrar loading
  if (!lambdaConfig || !codeFiles.length) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Cargando editor...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Actualizar el lenguaje del archivo principal cuando cambie el runtime
  useEffect(() => {
    if (!lambdaConfig?.runtime || !codeFiles.length) return
    
    const mainFile = codeFiles.find(file => file.isMain)
    if (mainFile) {
      const newLanguage = lambdaConfig.runtime.includes('nodejs') ? 'javascript' :
                          lambdaConfig.runtime.includes('python') ? 'python' :
                          lambdaConfig.runtime.includes('java') ? 'java' :
                          lambdaConfig.runtime.includes('dotnet') ? 'csharp' :
                          lambdaConfig.runtime.includes('go') ? 'go' :
                          lambdaConfig.runtime.includes('ruby') ? 'ruby' : 'javascript'
      
      if (mainFile.language !== newLanguage) {
        updateCodeFile(mainFile.id, "language", newLanguage)
        
        // Actualizar el contenido con el template apropiado
        const template = TEMPLATES[newLanguage as keyof typeof TEMPLATES]
        if (template && template.handler) {
          updateCodeFile(mainFile.id, "content", template.handler)
        }
      }
    }
  }, [lambdaConfig?.runtime, codeFiles.length])

  const handleAddFile = () => {
    if (!newFileName.trim()) return
    
    const language = LANGUAGE_OPTIONS.find(lang => lang.value === newFileLanguage)
    const extension = language?.extension || "txt"
    const fileName = newFileName.includes('.') ? newFileName : `${newFileName}.${extension}`
    
    // Crear archivo usando la acción del store
    addCodeFile()
    
    // Usar setTimeout para esperar a que el store se actualice
    setTimeout(() => {
      // Obtener los archivos actualizados del store
      const currentStore = useDeploymentStore.getState()
      const currentFiles = currentStore.lambdaConfig?.codeFiles || []
      
      // Obtener el archivo recién creado (debería ser el último)
      const newFile = currentFiles[currentFiles.length - 1]
      if (newFile) {
        updateCodeFile(newFile.id, "name", fileName)
        updateCodeFile(newFile.id, "language", newFileLanguage)
        
        // Agregar template básico según el lenguaje
        const template = TEMPLATES[newFileLanguage as keyof typeof TEMPLATES]
        if (template && template.util) {
          updateCodeFile(newFile.id, "content", template.util)
        } else {
          updateCodeFile(newFile.id, "content", `// Nuevo módulo ${fileName}\n// Agrega tu código aquí`)
        }
        
        setActiveFileId(newFile.id)
      }
    }, 100)
    
    setIsAddFileDialogOpen(false)
    setNewFileName("")
    setNewFileLanguage("javascript")
  }

  const handleDeleteFile = (fileId: string) => {
    const fileToDelete = codeFiles.find(f => f.id === fileId)
    if (fileToDelete?.isMain) return // No permitir eliminar archivo principal
    
    removeCodeFile(fileId)
    
    // Si era el archivo activo, cambiar al primero disponible
    if (activeFileId === fileId) {
      setActiveFileId(codeFiles[0]?.id || "main")
    }
  }

  const handleFileNameEdit = (fileId: string, newName: string) => {
    updateCodeFile(fileId, "name", newName)
    setIsEditingFileName(null)
  }

  const downloadCode = () => {
    const codeData = {
      runtime: lambdaConfig?.runtime || "nodejs18.x",
      handler: lambdaConfig?.handler || "index.handler",
      files: codeFiles.map(file => ({
        name: file.name,
        content: file.content,
        language: file.language,
        isMain: file.isMain
      }))
    }
    
    const blob = new Blob([JSON.stringify(codeData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'lambda-code.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const generateCommonFiles = () => {
    if (!lambdaConfig?.runtime) return
    
    const currentLanguage = lambdaConfig.runtime.includes('nodejs') ? 'javascript' :
                           lambdaConfig.runtime.includes('python') ? 'python' :
                           lambdaConfig.runtime.includes('java') ? 'java' : 'javascript'
    
    const template = TEMPLATES[currentLanguage as keyof typeof TEMPLATES]
    if (!template) return

    // Verificar si ya existe un archivo de utilidades
    const hasUtilFile = codeFiles.some(file => 
      file.name.toLowerCase().includes('util') || 
      file.name.toLowerCase().includes('helper')
    )

    if (!hasUtilFile && template.util) {
      // Crear archivo de utilidades
      addCodeFile()
              setTimeout(() => {
          const currentStore = useDeploymentStore.getState()
          const currentFiles = currentStore.lambdaConfig?.codeFiles || []
          const newFile = currentFiles[currentFiles.length - 1]
          if (newFile) {
            const utilName = currentLanguage === 'javascript' ? 'utils.js' :
                            currentLanguage === 'python' ? 'utils.py' :
                            currentLanguage === 'java' ? 'ApiGatewayResponse.java' : 'utils.js'
            
            updateCodeFile(newFile.id, "name", utilName)
            updateCodeFile(newFile.id, "language", currentLanguage)
            updateCodeFile(newFile.id, "content", template.util)
          }
        }, 100)
    }

    // Si es Java, crear también un archivo package-info
    if (currentLanguage === 'java') {
      setTimeout(() => {
        addCodeFile()
        setTimeout(() => {
          const currentStore = useDeploymentStore.getState()
          const currentFiles = currentStore.lambdaConfig?.codeFiles || []
          const newFile = currentFiles[currentFiles.length - 1]
          if (newFile) {
            updateCodeFile(newFile.id, "name", "package-info.java")
            updateCodeFile(newFile.id, "language", "java")
            updateCodeFile(newFile.id, "content", `/**
 * Paquete principal de la función Lambda
 */
package com.example;`)
          }
        }, 200)
      }, 300)
    }

    // Si es Python, crear un archivo requirements.txt
    if (currentLanguage === 'python') {
      setTimeout(() => {
        addCodeFile()
        setTimeout(() => {
          const currentStore = useDeploymentStore.getState()
          const currentFiles = currentStore.lambdaConfig?.codeFiles || []
          const newFile = currentFiles[currentFiles.length - 1]
          if (newFile) {
            updateCodeFile(newFile.id, "name", "requirements.txt")
            updateCodeFile(newFile.id, "language", "plaintext")
            updateCodeFile(newFile.id, "content", `# Dependencias de Python
# Ejemplo:
# requests==2.28.1
# boto3==1.26.1
# pandas==1.5.2`)
          }
        }, 200)
      }, 300)
    }

    // Si es JavaScript/Node.js, crear un package.json
    if (currentLanguage === 'javascript') {
      setTimeout(() => {
        addCodeFile()
        setTimeout(() => {
          const currentStore = useDeploymentStore.getState()
          const currentFiles = currentStore.lambdaConfig?.codeFiles || []
          const newFile = currentFiles[currentFiles.length - 1]
          if (newFile) {
            updateCodeFile(newFile.id, "name", "package.json")
            updateCodeFile(newFile.id, "language", "json")
            updateCodeFile(newFile.id, "content", `{
  "name": "lambda-function",
  "version": "1.0.0",
  "description": "AWS Lambda function",
  "main": "index.js",
  "dependencies": {
    
  },
  "devDependencies": {
    
  }
}`)
          }
        }, 200)
      }, 300)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Editor de Código
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadCode}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={generateCommonFiles}
              className="flex items-center gap-2"
            >
              <FileCode className="h-4 w-4" />
              Generar Archivos Comunes
            </Button>
            
            <Dialog open={isAddFileDialogOpen} onOpenChange={setIsAddFileDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Nuevo Archivo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Archivo</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fileName">Nombre del archivo</Label>
                    <Input
                      id="fileName"
                      placeholder="utils, helpers, config..."
                      value={newFileName}
                      onChange={(e) => setNewFileName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fileLanguage">Lenguaje</Label>
                    <Select value={newFileLanguage} onValueChange={setNewFileLanguage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGE_OPTIONS.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddFileDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddFile}>
                    Crear Archivo
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeFileId} onValueChange={setActiveFileId} className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList className="grid grid-cols-auto w-auto">
              {codeFiles.map((file) => (
                <TabsTrigger 
                  key={file.id} 
                  value={file.id}
                  className="relative group flex items-center gap-2 max-w-[200px]"
                >
                  <FileCode className="h-3 w-3" />
                  {isEditingFileName === file.id ? (
                    <Input
                      value={tempFileName}
                      onChange={(e) => setTempFileName(e.target.value)}
                      onBlur={() => {
                        handleFileNameEdit(file.id, tempFileName)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleFileNameEdit(file.id, tempFileName)
                        } else if (e.key === 'Escape') {
                          setIsEditingFileName(null)
                        }
                      }}
                      className="h-6 px-1 text-xs"
                      autoFocus
                    />
                  ) : (
                    <span 
                      className="truncate text-xs"
                      onDoubleClick={() => {
                        if (!file.isMain) {
                          setIsEditingFileName(file.id)
                          setTempFileName(file.name)
                        }
                      }}
                    >
                      {file.name}
                    </span>
                  )}
                  
                  {file.isMain && (
                    <Badge variant="secondary" className="text-xs px-1 py-0">
                      Main
                    </Badge>
                  )}
                  
                  {!file.isMain && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar archivo?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. El archivo "{file.name}" será eliminado permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteFile(file.id)}>
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="max-h-[70vh] overflow-y-auto">
            {codeFiles.map((file) => (
              <TabsContent key={file.id} value={file.id} className="space-y-4 mt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {LANGUAGE_OPTIONS.find(lang => lang.value === file.language)?.label || file.language}
                    </Badge>
                    {file.isMain && (
                      <Badge variant="default" className="text-xs">
                        Archivo Principal
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Select
                      value={file.language}
                      onValueChange={(value) => updateCodeFile(file.id, "language", value)}
                    >
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGE_OPTIONS.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <Editor
                    height="400px"
                    language={file.language}
                    value={file.content}
                    onChange={(value) => updateCodeFile(file.id, "content", value || "")}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: "on",
                      roundedSelection: false,
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                      insertSpaces: true,
                      wordWrap: "on",
                      folding: true,
                      foldingHighlight: true,
                      lineNumbersMinChars: 3,
                      renderWhitespace: "boundary",
                      bracketPairColorization: { enabled: true }
                    }}
                  />
                </div>

                {file.isMain && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                      <FileCode className="h-4 w-4" />
                      Archivo Principal
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Este es el archivo principal de tu función Lambda. Debe contener la función exportada 
                      que especificaste en el handler: <code className="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded">{lambdaConfig?.handler || "index.handler"}</code>
                    </p>
                  </div>
                )}
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </CardContent>
      
      {/* Sección de información del proyecto fuera del área de tabs */}
      <CardContent>
        <div className="space-y-4 border-t pt-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Code className="h-4 w-4" />
              Información del Proyecto
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Runtime:</span> {lambdaConfig?.runtime || "N/A"}
              </div>
              <div>
                <span className="text-muted-foreground">Handler:</span> {lambdaConfig?.handler || "N/A"}
              </div>
              <div>
                <span className="text-muted-foreground">Archivos:</span> {codeFiles.length}
              </div>
              <div>
                <span className="text-muted-foreground">Tamaño total:</span> ~{Math.round(codeFiles.reduce((acc, file) => acc + file.content.length, 0) / 1024)}KB
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
              <FileCode className="h-4 w-4" />
              Consejos para el Desarrollo
            </h4>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <p>• Usa el botón "Generar Archivos Comunes" para crear automáticamente archivos de utilidades y configuración</p>
              <p>• El archivo principal debe contener la función especificada en el handler</p>
              <p>• Puedes crear módulos separados para organizar mejor tu código</p>
              <p>• Usa el botón "Exportar" para descargar todo tu código en formato JSON</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 