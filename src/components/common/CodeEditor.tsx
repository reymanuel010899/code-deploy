"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../../components/ui/alert-dialog";
import {
  Plus,
  Code,
  FileCode,
  Download,
  Upload,
  FolderOpen,
  X,
  Terminal,
  Play,
  Settings,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Editor from "@monaco-editor/react";
import { useDeploymentStore } from "@/store/useDeploymentStore";
import type { CodeFile } from "@/types";

const LANGUAGE_OPTIONS = [
  { value: "javascript", label: "JavaScript", extension: "js" },
  { value: "typescript", label: "TypeScript", extension: "ts" },
  { value: "python", label: "Python", extension: "py" },
  { value: "java", label: "Java", extension: "java" },
  { value: "json", label: "JSON", extension: "json" },
  { value: "plaintext", label: "Text", extension: "txt" },
];

const FUNCTION_TEMPLATES = {
  javascript: `// Función principal de Lambda
exports.handler = async (event, context) => {
    console.log('Event:', JSON.stringify(event, null, 2));
    console.log('Context:', JSON.stringify(context, null, 2));
    
    try {
        // Tu lógica de negocio aquí
        const response = {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                message: 'Hello from Lambda!',
                requestId: context.awsRequestId,
                timestamp: new Date().toISOString(),
                input: event
            })
        };
        
        return response;
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                error: 'Internal server error',
                message: error.message
            })
        };
    }
};`,

  python: `# Función principal de Lambda
import json
import logging
from datetime import datetime

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    logger.info('Event: %s', json.dumps(event, indent=2))
    logger.info('Context: %s', str(context))
    
    try:
        # Tu lógica de negocio aquí
        response = {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': 'Hello from Lambda!',
                'requestId': context.aws_request_id,
                'timestamp': datetime.now().isoformat(),
                'input': event
            })
        }
        
        return response
    except Exception as error:
        logger.error('Error: %s', str(error))
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'Internal server error',
                'message': str(error)
            })
        }`,

  java: `// Función principal de Lambda
package lambda;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.HashMap;
import java.util.Map;

public class Handler implements RequestHandler<Map<String, Object>, Map<String, Object>> {
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Override
    public Map<String, Object> handleRequest(Map<String, Object> event, Context context) {
        LambdaLogger logger = context.getLogger();
        logger.log("Event: " + event.toString());
        logger.log("Context: " + context.toString());
        
        try {
            // Tu lógica de negocio aquí
            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("message", "Hello from Lambda!");
            responseBody.put("requestId", context.getAwsRequestId());
            responseBody.put("timestamp", java.time.Instant.now().toString());
            responseBody.put("input", event);
            
            Map<String, Object> response = new HashMap<>();
            response.put("statusCode", 200);
            
            Map<String, String> headers = new HashMap<>();
            headers.put("Content-Type", "application/json");
            headers.put("Access-Control-Allow-Origin", "*");
            response.put("headers", headers);
            
            response.put("body", objectMapper.writeValueAsString(responseBody));
            
            return response;
        } catch (Exception error) {
            logger.log("Error: " + error.getMessage());
            
            Map<String, Object> errorBody = new HashMap<>();
            errorBody.put("error", "Internal server error");
            errorBody.put("message", error.getMessage());
            
            Map<String, Object> response = new HashMap<>();
            response.put("statusCode", 500);
            
            Map<String, String> headers = new HashMap<>();
            headers.put("Content-Type", "application/json");
            headers.put("Access-Control-Allow-Origin", "*");
            response.put("headers", headers);
            
            try {
                response.put("body", objectMapper.writeValueAsString(errorBody));
            } catch (Exception e) {
                response.put("body", "{\\"error\\": \\"Internal server error\\"}");
            }
            
            return response;
        }
    }
}`,
};

export function CodeEditor() {
  const {
    lambdaConfig,
    addCodeFile,
    removeCodeFile,
    updateCodeFile,
  } = useDeploymentStore();
  const [activeFileId, setActiveFileId] = useState<string>();
  const [isEditingFileName, setIsEditingFileName] = useState<string | null>(null);
  const [tempFileName, setTempFileName] = useState("");
  const [isAddFileDialogOpen, setIsAddFileDialogOpen] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newFileLanguage, setNewFileLanguage] = useState("javascript");
  const [isDragOver, setIsDragOver] = useState(false);
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    "💻 Terminal Lambda - Listo para comandos",
    "Comandos disponibles: test, status, clear, help",
    "",
  ]);
  const [isInitialized, setIsInitialized] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const codeFiles = lambdaConfig?.codeFiles || [];

  // Inicialización
  useEffect(() => {
    if (codeFiles.length === 0) {
      addCodeFile();
    } else {
      const mainFile = codeFiles.find((file) => file.isMain) || codeFiles[0];
      if (mainFile && !activeFileId) {
        setActiveFileId(mainFile.id);
      }
    }
    setIsInitialized(true);
  }, [lambdaConfig?.runtime, codeFiles.length, addCodeFile]);

  // Funciones de manejo de archivos
  const handleAddFile = () => {
    if (!newFileName.trim()) return;

    const extension =
      LANGUAGE_OPTIONS.find((lang) => lang.value === newFileLanguage)?.extension ||
      "txt";
    const fileName = newFileName.includes(".")
      ? newFileName
      : `${newFileName}.${extension}`;

    addCodeFile();

    setTimeout(() => {
      const updatedFiles = useDeploymentStore.getState().lambdaConfig?.codeFiles || [];
      const newFile = updatedFiles[updatedFiles.length - 1];
      if (newFile) {
        updateCodeFile(newFile.id, "name", fileName);
        updateCodeFile(newFile.id, "language", newFileLanguage);
        updateCodeFile(
          newFile.id,
          "content",
          `// Nuevo archivo: ${fileName}\n// Agrega tu código aquí`
        );
        setActiveFileId(newFile.id);
      }
    }, 100);

    setNewFileName("");
    setIsAddFileDialogOpen(false);
  };

  const handleDeleteFile = (fileId: string) => {
    if (codeFiles.length <= 1) return;

    removeCodeFile(fileId);

    if (activeFileId === fileId) {
      const remainingFiles = codeFiles.filter((f) => f.id !== fileId);
      if (remainingFiles.length > 0) {
        setActiveFileId(remainingFiles[0].id);
      }
    }
  };

  const handleFileNameEdit = (fileId: string, newName: string) => {
    updateCodeFile(fileId, "name", newName);
    setIsEditingFileName(null);
  };

  // Funciones de terminal
  const executeCommand = async (command: string) => {
    const activeFile = codeFiles.find((f) => f.id === activeFileId);

    const moduleCache: { [key: string]: any } = {};
    const processedModules: Set<string> = new Set();

    // Función para procesar y "bundlear" un módulo
    const processModule = (
      filePath: string,
      processedContent: string,
      dependencies: string[] = []
    ): string => {
      if (processedModules.has(filePath)) return "";
      processedModules.add(filePath);

      let bundledContent = processedContent;

      // Procesar imports
      bundledContent = bundledContent.replace(
        /import\s+(?:\{([^}]*)\}|(\w+)|(?:\* as (\w+)))\s+from\s+['"]([^'"]+)['"]/g,
        (match, namedImports, defaultImport, namespaceImport, modulePath) => {
          const targetFile = codeFiles.find((f) =>
            f.name === modulePath ||
            f.name === `${modulePath}.js` ||
            f.name === `${modulePath}.ts` ||
            f.name === `${modulePath}.tsx`
          );
          if (!targetFile) {
            setTerminalOutput((prev) => [
              ...prev,
              `⚠️ Módulo no encontrado: ${modulePath}`,
            ]);
            return "";
          }

          const depContent = processModule(targetFile.name, targetFile.content, [
            ...dependencies,
            filePath,
          ]);
          let result = `\n// === INLINE MODULE: ${targetFile.name} ===\n${depContent}\n`;

          if (namedImports) {
            const imports = namedImports
              .split(",")
              .map((s) => s.trim())
              .filter((s) => s);
            imports.forEach((name) => {
              const [original, alias] = name.includes(" as ")
                ? name.split(" as ").map((s) => s.trim())
                : [name, name];
              result += `const ${alias} = exports.${original};\n`;
            });
          } else if (defaultImport) {
            result += `const ${defaultImport} = module.exports || exports || {};\n`;
          } else if (namespaceImport) {
            result += `const ${namespaceImport} = { ...module.exports, ...exports } || {};\n`;
          }

          result += "// === END INLINE MODULE ===\n";
          return result;
        }
      );

      // Convertir exports a CommonJS
      bundledContent = bundledContent
        .replace(/export\s+default\s+function\s+(\w+)/g, "function $1; module.exports = $1")
        .replace(/export\s+default\s+class\s+(\w+)/g, "class $1; module.exports = $1")
        .replace(/export\s+default\s+const\s+(\w+)/g, "const $1")
        .replace(/export\s+default\s+let\s+(\w+)/g, "let $1")
        .replace(/export\s+default\s+var\s+(\w+)/g, "var $1")
        .replace(/export\s+default\s+/g, "module.exports = ")
        .replace(/export\s+const\s+(\w+)\s*=/g, "const $1 =")
        .replace(/export\s+let\s+(\w+)\s*=/g, "let $1 =")
        .replace(/export\s+var\s+(\w+)\s*=/g, "var $1 =")
        .replace(/export\s+function\s+(\w+)/g, "function $1")
        .replace(/export\s+class\s+(\w+)/g, "class $1")
        .replace(/export\s+(\w+)/g, "");

      // Añadir exports después de las declaraciones
      const exportMatches = processedContent.match(/export\s+(const|let|var|function|class)\s+(\w+)/g);
      if (exportMatches) {
        exportMatches.forEach((match) => {
          const nameMatch = match.match(/export\s+(?:const|let|var|function|class)\s+(\w+)/);
          if (nameMatch) {
            const name = nameMatch[1];
            bundledContent += `\nexports.${name} = ${name};`;
          }
        });
      }

      return bundledContent;
    };

    const resolveModule = (path: string): any => {
      const targetFile = codeFiles.find(
        (f) =>
          f.name === path ||
          f.name === `${path}.js` ||
          f.name === `${path}.ts` ||
          f.name === `${path}.tsx` ||
          f.name === `${path}.mjs`
      );

      if (!targetFile) {
        setTerminalOutput((prev) => [...prev, `⚠️ Módulo no encontrado: ${path}`]);
        return {};
      }

      if (moduleCache[targetFile.id]) {
        return moduleCache[targetFile.id];
      }

      const moduleExports = {};
      const moduleConsole = {
        log: (...args: any[]) =>
          setTerminalOutput((prev) => [
            ...prev,
            `📝 [${targetFile.name}] Log: ${args.join(" ")}`,
          ]),
        error: (...args: any[]) =>
          setTerminalOutput((prev) => [
            ...prev,
            `❌ [${targetFile.name}] Error: ${args.join(" ")}`,
          ]),
        warn: (...args: any[]) =>
          setTerminalOutput((prev) => [
            ...prev,
            `⚠️ [${targetFile.name}] Warning: ${args.join(" ")}`,
          ]),
      };

      try {
        setTerminalOutput((prev) => [
          ...prev,
          `🔧 Procesando módulo: ${targetFile.name}`,
        ]);

        const processedContent = processModule(targetFile.name, targetFile.content);
        const moduleSandbox = {
          exports: moduleExports,
          module: { exports: moduleExports },
          console: moduleConsole,
          Buffer: Buffer,
          process: { env: {} },
          global: {},
          __dirname: "/",
          __filename: targetFile.name,
        };

        const executeFunction = new Function(
          "exports",
          "module",
          "console",
          "Buffer",
          "process",
          "global",
          "__dirname",
          "__filename",
          processedContent
        );
        executeFunction(
          moduleSandbox.exports,
          moduleSandbox.module,
          moduleSandbox.console,
          moduleSandbox.Buffer,
          moduleSandbox.process,
          moduleSandbox.global,
          moduleSandbox.__dirname,
          moduleSandbox.__filename
        );

        const finalExports =
          moduleSandbox.module.exports || moduleSandbox.exports;
        const exportKeys = Object.keys(finalExports);
        if (exportKeys.length > 0) {
          setTerminalOutput((prev) => [
            ...prev,
            `📦 Exports de ${targetFile.name}: ${exportKeys.join(", ")}`,
          ]);
        }

        moduleCache[targetFile.id] = finalExports;
        return finalExports;
      } catch (error) {
        setTerminalOutput((prev) => [
          ...prev,
          `❌ Error en módulo ${targetFile.name}: ${error.message}`,
        ]);
        moduleCache[targetFile.id] = {};
        return {};
      }
    };

    const sandbox = {
      console: {
        log: (...args: any[]) =>
          setTerminalOutput((prev) => [...prev, `📝 Log: ${args.join(" ")}`]),
        error: (...args: any[]) =>
          setTerminalOutput((prev) => [...prev, `❌ Error: ${args.join(" ")}`]),
      },
      exports: {},
      module: { exports: {} },
      require: resolveModule,
      setTimeout: () => ({}),
      setInterval: () => ({}),
      clearTimeout: () => ({}),
      clearInterval: () => ({}),
      Buffer: Buffer,
      process: { env: {} },
    };

    switch (command.toLowerCase()) {
      case "help":
        setTerminalOutput((prev) => [
          ...prev,
          "📚 Comandos disponibles:",
          "  test       - Simular ejecución de Lambda",
          "  status     - Ver estado del proyecto",
          "  clear      - Limpiar terminal",
          "  create     - Crear archivo rápidamente",
          "  debug      - Inspeccionar módulos",
          "  help       - Mostrar esta ayuda",
          "",
        ]);
        break;

      case "import":
        setTerminalOutput((prev) => [
          ...prev,
          "📁 Importación de Proyecto",
          "💡 Instrucciones:",
          "1. Haz clic en 'Seleccionar Archivos'",
          "2. Navega a tu carpeta del proyecto",
          "3. Selecciona TODOS los archivos que quieres importar",
          "4. Usa Ctrl/Cmd + clic para selección múltiple",
          "5. El sistema organizará automáticamente la estructura",
          "",
          "📋 Archivos recomendados:",
          "• package.json, index.js, main.js",
          "• Archivos de configuración (.config.js, .json)",
          "• Código fuente (.js, .ts, .py, .java)",
          "• Documentación (README.md)",
          "",
        ]);
        break;

      case "export":
        downloadCode();
        break;

      case "debug":
        if (activeFile) {
          const processedContent = processModule(activeFile.name, activeFile.content);
          setTerminalOutput((prev) => [
            ...prev,
            "🔍 DEBUG: Mostrando código procesado",
            `📄 Archivo: ${activeFile.name}`,
            "📝 Contenido original:",
            activeFile.content,
            "",
            "🔧 Contenido procesado:",
            processedContent,
            "",
            "📦 Módulos disponibles:",
            ...codeFiles.map((f) => `  - ${f.name} (${f.language})`),
            "",
          ]);
        } else {
          setTerminalOutput((prev) => [
            ...prev,
            "❌ No hay archivo activo para debug",
            "",
          ]);
        }
        break;

      case "create":
        const createArgs = command.split(" ").slice(1);
        if (createArgs.length === 0) {
          setTerminalOutput((prev) => [
            ...prev,
            "📝 Uso: create <nombre-archivo> [lenguaje]",
            "📝 Ejemplos:",
            "  create otro.js javascript",
            "  create utils.js",
            "  create helper.py python",
            "",
          ]);
          break;
        }

        const fileName = createArgs[0];
        const fileLanguage = createArgs[1] || "javascript";

        addCodeFile();

        setTimeout(() => {
          const updatedFiles =
            useDeploymentStore.getState().lambdaConfig?.codeFiles || [];
          const newFile = updatedFiles[updatedFiles.length - 1];
          if (newFile) {
            updateCodeFile(newFile.id, "name", fileName);
            updateCodeFile(newFile.id, "language", fileLanguage);

            let defaultContent = "";
            if (fileLanguage === "javascript") {
              defaultContent = `// ${fileName}
// Archivo creado desde la terminal

export const miFuncion = () => {
  return "Hola desde ${fileName}"
}

export default {
  miFuncion
}`;
            } else if (fileLanguage === "python") {
              defaultContent = `# ${fileName}
# Archivo creado desde la terminal

def mi_funcion():
    return "Hola desde ${fileName}"

if __name__ == "__main__":
    print(mi_funcion())`;
            } else {
              defaultContent = `// ${fileName}
// Archivo creado desde la terminal

// Agrega tu código aquí`;
            }

            updateCodeFile(newFile.id, "content", defaultContent);
            setActiveFileId(newFile.id);

            setTerminalOutput((prev) => [
              ...prev,
              `✅ Archivo creado: ${fileName}`,
              `📄 Lenguaje: ${fileLanguage}`,
              `🎯 Archivo activo: ${fileName}`,
              "",
            ]);
          }
        }, 100);
        break;

      case "test":
        if (!activeFile) {
          setTerminalOutput((prev) => [
            ...prev,
            "❌ Error: No hay archivo activo",
            "",
          ]);
          break;
        }

        setTerminalOutput((prev) => [
          ...prev,
          "🚀 Ejecutando Lambda...",
          `📄 Archivo: ${activeFile.name}`,
          `⏰ Tiempo: ${new Date().toISOString()}`,
        ]);

        try {
          const mockEvent = {
            httpMethod: "GET",
            path: "/test",
            headers: {
              "Content-Type": "application/json",
            },
            queryStringParameters: null,
            body: null,
          };

          const mockContext = {
            awsRequestId: "test-request-" + Date.now(),
            functionName: "test-lambda",
            functionVersion: "$LATEST",
            invokedFunctionArn:
              "arn:aws:lambda:us-east-1:123456789012:function:test-lambda",
            memoryLimitInMB: "128",
            remainingTimeInMillis: 30000,
            logGroupName: "/aws/lambda/test-lambda",
            logStreamName: "2023/01/01/[$LATEST]test-stream",
          };

          if (activeFile.language === "javascript") {
            const processedContent = processModule(
              activeFile.name,
              activeFile.content
            );

            const codeToExecute = `
              let exports = {};
              let module = { exports: {} };
              ${processedContent}
              if (typeof exports.handler === 'function') {
                exports.handler(${JSON.stringify(mockEvent)}, ${JSON.stringify(
              mockContext
            )})
                  .then(result => console.log('✅ Resultado:', JSON.stringify(result, null, 2)))
                  .catch(error => console.error('❌ Error en ejecución:', error.message));
              } else if (typeof exports.handle_funcion === 'function') {
                exports.handle_funcion(${JSON.stringify(mockEvent)}, ${JSON.stringify(
              mockContext
            )})
                  .then(result => console.log('✅ Resultado:', JSON.stringify(result, null, 2)))
                  .catch(error => console.error('❌ Error en ejecución:', error.message));
              } else {
                console.error('❌ No se encontró función handler o handle_funcion');
              }
            `;

            const executeFunction = new Function(
              "console",
              "exports",
              "module",
              codeToExecute
            );
            executeFunction(sandbox.console, sandbox.exports, sandbox.module);
          } else if (activeFile.language === "python") {
            setTerminalOutput((prev) => [
              ...prev,
              "🐍 Simulación de Python (ejecución real no disponible)",
              "📊 Respuesta simulada: { statusCode: 200, message: 'Hello from Python Lambda!' }",
              "",
            ]);
          } else if (activeFile.language === "java") {
            setTerminalOutput((prev) => [
              ...prev,
              "☕ Simulación de Java (ejecución real no disponible)",
              "📊 Respuesta simulada: { statusCode: 200, message: 'Hello from Java Lambda!' }",
              "",
            ]);
          } else {
            setTerminalOutput((prev) => [
              ...prev,
              "❌ Lenguaje no soportado para ejecución",
              "",
            ]);
          }
        } catch (error) {
          setTerminalOutput((prev) => [
            ...prev,
            `❌ Error en ejecución: ${error.message}`,
            "",
          ]);
        }
        break;

      case "status":
        setTerminalOutput((prev) => [
          ...prev,
          "📋 Estado del proyecto:",
          `📁 Archivos: ${codeFiles.length}`,
          `📄 Activo: ${codeFiles.find((f) => f.id === activeFileId)?.name || "Ninguno"}`,
          `🔧 Runtime: ${lambdaConfig?.runtime || "No definido"}`,
          `⚡ Handler: ${lambdaConfig?.handler || "No definido"}`,
          "",
        ]);
        break;

      case "clear":
        setTerminalOutput([
          "💻 Terminal Lambda - Listo para comandos",
          "Comandos disponibles: test, status, clear, debug, help",
          "",
        ]);
        break;

      default:
        setTerminalOutput((prev) => [
          ...prev,
          `❌ Comando no reconocido: ${command}`,
          "💡 Usa 'help' para ver comandos disponibles",
          "",
        ]);
    }
  };

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (terminalInput.trim()) {
      executeCommand(terminalInput);
      setTerminalInput("");
    }
  };

  // Funciones de export/import
  const downloadCode = () => {
    const projectData = {
      name: "lambda-project",
      runtime: lambdaConfig?.runtime,
      handler: lambdaConfig?.handler,
      files: codeFiles.map((file) => ({
        name: file.name,
        content: file.content,
        language: file.language,
        isMain: file.isMain,
        path: file.name.includes("/") ? file.name : `./${file.name}`, // Incluir path relativo
      })),
      exportDate: new Date().toISOString(),
      version: "1.0.0",
      description: "Proyecto Lambda exportado desde el editor",
    };

    const blob = new Blob([JSON.stringify(projectData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lambda-project.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setTerminalOutput((prev) => [
      ...prev,
      "📦 Proyecto exportado exitosamente",
      `📄 Archivo: lambda-project.json`,
      `📁 Archivos: ${codeFiles.length}`,
      "",
    ]);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const projectData = JSON.parse(e.target?.result as string);

        if (projectData.files && Array.isArray(projectData.files)) {
          // Limpiar archivos existentes
          codeFiles.forEach((file) => removeCodeFile(file.id));

          // Importar archivos del proyecto
          projectData.files.forEach((fileData: any, index: number) => {
            addCodeFile();
            setTimeout(() => {
              const newFiles =
                useDeploymentStore.getState().lambdaConfig?.codeFiles || [];
              const newFile = newFiles[newFiles.length - 1];
              if (newFile) {
                updateCodeFile(newFile.id, "name", fileData.name);
                updateCodeFile(newFile.id, "content", fileData.content);
                updateCodeFile(newFile.id, "language", fileData.language);
                updateCodeFile(newFile.id, "isMain", fileData.isMain);

                if (index === 0 || fileData.isMain) {
                  setActiveFileId(newFile.id);
                }
              }
            }, index * 100);
          });

          // Actualizar configuración del proyecto si está disponible
          if (projectData.runtime) {
            useDeploymentStore.getState().lambdaConfig.runtime = projectData.runtime;
          }
          if (projectData.handler) {
            useDeploymentStore.getState().lambdaConfig.handler = projectData.handler;
          }

          setTerminalOutput((prev) => [
            ...prev,
            "📁 Proyecto importado exitosamente",
            `📄 Archivos: ${projectData.files.length}`,
            `🔧 Runtime: ${projectData.runtime || "No especificado"}`,
            `⚡ Handler: ${projectData.handler || "No especificado"}`,
            projectData.description ? `📝 Descripción: ${projectData.description}` : "",
            projectData.version ? `📦 Versión: ${projectData.version}` : "",
            "",
          ]);
        } else {
          setTerminalOutput((prev) => [
            ...prev,
            "❌ Error: Formato de proyecto inválido",
            "🔍 El archivo debe contener un array 'files'",
            "",
          ]);
        }
      } catch (error) {
        setTerminalOutput((prev) => [
          ...prev,
          "❌ Error al importar proyecto",
          `🔍 Detalles: ${error instanceof Error ? error.message : "Error desconocido"}`,
          "",
        ]);
      }
    };
    reader.readAsText(file);

    event.target.value = "";
  };

  const activeFile = codeFiles.find((file) => file.id === activeFileId);

  if (!isInitialized) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Inicializando editor...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (codeFiles.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-medium">No hay archivos</h3>
              <p className="text-muted-foreground">Crea tu primer archivo para comenzar</p>
            </div>
            <Button onClick={() => setIsAddFileDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primer Archivo
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Header con botones */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Code className="h-5 w-5" />
          <h3 className="text-lg font-medium">Editor de Código</h3>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={downloadCode}>
            <Download className="h-4 w-4 mr-2" />
            Exportar Proyecto
          </Button>
          <Button variant="outline" size="sm" onClick={handleImportClick}>
            <Upload className="h-4 w-4 mr-2" />
            Importar Proyecto
          </Button>
          <Button variant="outline" size="sm">
            <Terminal className="h-4 w-4 mr-2" />
            Terminal
          </Button>
          <Dialog
            open={isAddFileDialogOpen}
            onOpenChange={setIsAddFileDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Archivo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nuevo Archivo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fileName">Nombre del archivo</Label>
                  <Input
                    id="fileName"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    placeholder="mi-archivo"
                  />
                </div>
                <div>
                  <Label htmlFor="fileLanguage">Lenguaje</Label>
                  <Select
                    value={newFileLanguage}
                    onValueChange={setNewFileLanguage}
                  >
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
                <Button
                  variant="outline"
                  onClick={() => setIsAddFileDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleAddFile}>Crear Archivo</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.js,.ts,.py,.java,.txt"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Layout principal: sidebar izquierdo + editor derecho */}
      <div className="grid grid-cols-12 gap-4">
        {/* Sidebar de archivos - izquierda */}
        <div className="col-span-3 space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-muted-foreground">
              ARCHIVOS ({codeFiles.length})
            </h4>
            <Dialog
              open={isAddFileDialogOpen}
              onOpenChange={setIsAddFileDialogOpen}
            >
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>

          {/* Lista de archivos */}
          <div className="space-y-1">
            {codeFiles.map((file) => {
              const isInFolder = file.name.includes("/");
              const fileName = isInFolder ? file.name.split("/").pop() : file.name;
              const folderPath = isInFolder
                ? file.name.split("/").slice(0, -1).join("/")
                : null;

              return (
                <div
                  key={file.id}
                  className={`flex items-center justify-between p-2 rounded-md cursor-pointer border transition-colors ${
                    file.id === activeFileId
                      ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
                      : "hover:bg-gray-50 border-transparent dark:hover:bg-gray-800"
                  }`}
                  onClick={() => setActiveFileId(file.id)}
                >
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <FileCode className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    {isEditingFileName === file.id ? (
                      <Input
                        value={tempFileName}
                        onChange={(e) => setTempFileName(e.target.value)}
                        onBlur={() => handleFileNameEdit(file.id, tempFileName)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleFileNameEdit(file.id, tempFileName);
                          }
                          if (e.key === "Escape") {
                            setIsEditingFileName(null);
                          }
                        }}
                        className="h-6 text-xs"
                        autoFocus
                      />
                    ) : (
                      <div className="flex-1 min-w-0">
                        {folderPath && (
                          <div className="text-xs text-muted-foreground truncate">
                            📁 {folderPath}/
                          </div>
                        )}
                        <span
                          className="text-xs truncate block"
                          onDoubleClick={() => {
                            setIsEditingFileName(file.id);
                            setTempFileName(file.name);
                          }}
                        >
                          {fileName}
                        </span>
                        {file.isMain && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            Main
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {codeFiles.length > 1 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <X className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar archivo?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. El archivo "{file.name}" será
                            eliminado permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteFile(file.id)}
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Editor - derecha */}
        <div className="col-span-9">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">
                    {activeFile?.name || "Sin archivo"}
                  </span>
                  {activeFile?.isMain && (
                    <Badge variant="default" className="text-xs">
                      Principal
                    </Badge>
                  )}
                </div>

                {activeFile && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateCodeFile(activeFile.id, "isMain", true)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Marcar como Principal
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {activeFile ? (
                <div className="h-[600px] border rounded-md overflow-hidden">
                  <Editor
                    height="100%"
                    language={activeFile.language}
                    value={activeFile.content}
                    onChange={(value) => {
                      if (value !== undefined) {
                        updateCodeFile(activeFile.id, "content", value);
                      }
                    }}
                    options={{
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      fontSize: 14,
                      lineNumbers: "on",
                      roundedSelection: false,
                      automaticLayout: true,
                      wordWrap: "on",
                      folding: true,
                      lineDecorationsWidth: 10,
                      lineNumbersMinChars: 3,
                    }}
                    theme="vs-dark"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-[600px] border rounded-md">
                  <p className="text-muted-foreground">
                    Selecciona un archivo para editar
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Terminal - abajo de todo */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center space-x-2">
            <Terminal className="h-4 w-4" />
            <span className="text-sm font-medium">Terminal</span>
            <div className="flex space-x-1 ml-auto">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm h-48 overflow-y-auto">
            {terminalOutput.map((line, index) => (
              <div key={index}>{line}</div>
            ))}
          </div>
          <form onSubmit={handleTerminalSubmit} className="mt-2">
            <div className="flex">
              <span className="text-green-400 font-mono text-sm bg-gray-900 px-2 py-1 rounded-l-md">
                $
              </span>
              <Input
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                className="rounded-l-none font-mono text-sm"
                placeholder="Escribe un comando..."
              />
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Información del proyecto */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Información del Proyecto</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Runtime:</span>{" "}
              {lambdaConfig?.runtime || "No definido"}
            </div>
            <div>
              <span className="text-muted-foreground">Handler:</span>{" "}
              {lambdaConfig?.handler || "No definido"}
            </div>
            <div>
              <span className="text-muted-foreground">Archivos:</span>{" "}
              {codeFiles?.length || 0}
            </div>
            <div>
              <span className="text-muted-foreground">Tamaño total:</span>{" "}
              ~{Math.round((codeFiles?.reduce((acc, file) => acc + file.content.length, 0) || 0) / 1024)}
              KB
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}