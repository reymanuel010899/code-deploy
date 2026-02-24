import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDeploymentStore } from "@/store/useDeploymentStore";
import { DeploymentProvider } from "@/providers/deploymentProvider";
import { History, RefreshCw } from "lucide-react";

export function ServiceDeploymentHistory() {
  const { service, setService, setRegions, setDockerImages, setEC2Config, setECSConfig, setLambdaConfig } = useDeploymentStore();
  const [deployments, setDeployments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDeployment, setSelectedDeployment] = useState<any>(null);

  const fetchDeployments = async () => {
    setLoading(true);
    try {
      const all = await DeploymentProvider.fetchDeploymentsFromLocalApi();
      setDeployments(Array.isArray(all) ? all : []);
    } catch (e) {
      setDeployments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeployments();
  }, [service]);

  const handleSelectDeployment = (deployment: any) => {
    setService(deployment.service);
    setRegions(deployment.regions);
    if (deployment.service === "ecs") {
      setECSConfig({
        ...deployment,
        ...deployment.ecsConfig,
        taskCpu: deployment.cpu_units || deployment.taskCpu,
        taskMemory: deployment.memory_mb || deployment.taskMemory,
        desiredCount: deployment.desired_count || deployment.desiredCount,
        networkMode: deployment.network_mode || deployment.networkMode,
        loadBalancer: deployment.load_balancer ?? deployment.loadBalancer,
        autoScaling: deployment.auto_scaling_enabled ?? deployment.autoScaling,
      });
      setDockerImages(deployment.docker_images || []);
    } else if (deployment.service === "ec2") {
      setEC2Config(deployment.ec2Config || {});
      setDockerImages(deployment.docker_images || []);
    } else if (deployment.service === "lambda") {
      setLambdaConfig(deployment.lambdaConfig || {});
    }
  };

  const handleDeleteDeployment = async () => {
    if (!selectedDeployment) return;
    try {
      await DeploymentProvider.deleteDeployment(selectedDeployment.id || selectedDeployment.deploymentId);
      alert("Deployment deleted successfully.");
      fetchDeployments();
    } catch (error) {
      console.error("Error deleting deployment:", error);
      alert("Failed to delete deployment.");
    } finally {
      setShowDeleteModal(false);
      setSelectedDeployment(null);
    }
  };

  const filtered = deployments.filter(d => d && d.status && d.service === service).slice(-5).reverse();

  return (
    <>
      <Card className="animate-fade-in mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Recent deployments of this service
              </CardTitle>
              <CardDescription>Click on one to edit it</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchDeployments} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                There are no deployments for this service.
              </div>
            ) : (
              <div className="w-full">
                <div className="grid grid-cols-4 gap-4 font-medium text-sm border-b pb-2 text-center">
                  <span>Deployment</span>
                  <span>Status</span>
                  <span>Created At</span>
                  <span>Actions</span>
                </div>
                <div className="space-y-2">
                  {filtered.map((deployment) => (
                    <div
                      key={deployment.id || deployment.deploymentId}
                      className="grid grid-cols-4 gap-4 items-center border-b py-2 cursor-pointer hover:bg-blue-50 transition text-center"
                      onClick={() => handleSelectDeployment(deployment)}
                    >
                      <div>
                        {deployment.deploymet_url ? (
                          <a
                            href={`${deployment.deploymet_url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 underline text-sm"
                          >
                            {deployment.deploymet_url}
                          </a>
                        ) : (
                          <span className="text-sm font-medium">
                            {deployment.name ||
                              `${deployment.service?.toUpperCase?.()}-${(deployment.id || deployment.deploymentId)
                                ?.toString()
                                .slice(0, 8)}`}
                          </span>
                        )}
                      </div>
                      <div>
                        <Badge
                          className={`text-xs ${
                            deployment.status === "running"
                              ? "bg-green-500"
                              : deployment.status === "stopped" || deployment.status === "failed"
                              ? "bg-red-500"
                              : "bg-blue-500"
                          }`}
                        >
                          {deployment.status}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(deployment.created_at || deployment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-center gap-4">
                        <Button
                          variant="ghost"
                          className="flex items-center gap-2 text-red-600 hover:text-red-800 text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDeployment(deployment);
                            setShowDeleteModal(true);
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-lg font-semibold text-gray-800">Are you sure?</h2>
            <p className="text-sm text-gray-600 mt-2">
              Do you really want to delete this deployment? This action cannot be undone.
            </p>
            <div className="mt-4 flex justify-end gap-4">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteDeployment}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
