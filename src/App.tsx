import { ThemeProvider } from "@/components/layout/ThemeProvider"
import { CloudInterface } from "@/components/layout/CloudInterface"

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="cloud-deploy-theme">
      <CloudInterface />
    </ThemeProvider>
  )
}

export default App
