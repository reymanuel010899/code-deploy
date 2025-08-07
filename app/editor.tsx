import React, { useEffect, useRef, useState } from "react";
import Editor, { useMonaco, OnMount } from "monaco-editor/react";
import * as monacoEditor from "monaco-editor";

type FileName = "main.py" | "app.js";

type File = {
  name: FileName;
  language: string;
  value: string;
};

const files: Record<FileName, File> = {
  "main.py": {
    name: "main.py",
    language: "python",
    value: `class Persona:\n    def hollow(self):\n        pass`,
  },
  "app.js": {
    name: "app.js",
    language: "javascript",
    value: `function hello() {\n  console.log("Hello World");\n}`,
  },
};

const MultiFileEditor: React.FC = () => {
  const monaco = useMonaco();
  const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(
    null
  );
  const [fileName, setFileName] = useState<FileName>("main.py");

  const handleEditorDidMount: OnMount = (editor, monacoInstance) => {
    editorRef.current = editor;
  };

  useEffect(() => {
    if (monaco && editorRef.current) {
      const model = monaco.editor
        .getModels()
        .find((m) => m.uri.path === `/${fileName}`);

      if (model) {
        editorRef.current.setModel(model);
      } else {
        const { language, value } = files[fileName];
        const newModel = monaco.editor.createModel(
          value,
          language,
          monaco.Uri.parse(`file:///${fileName}`)
        );
        editorRef.current.setModel(newModel);
      }
    }
  }, [fileName, monaco]);

  return (
    <div>
      <select
        onChange={(e) => setFileName(e.target.value as FileName)}
        value={fileName}
        style={{ marginBottom: "10px", padding: "5px" }}
      >
        {Object.keys(files).map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>

      <Editor
        height="500px"
        theme="vs-dark"
        defaultLanguage={files[fileName].language}
        defaultValue={files[fileName].value}
        onMount={handleEditorDidMount}
      />
    </div>
  );
};

export default MultiFileEditor;
