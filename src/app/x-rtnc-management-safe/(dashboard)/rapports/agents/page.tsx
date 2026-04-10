import { getAgentPerformanceListAction, getDeploymentDataAction, type DeploymentData } from "./actions";
import { AgentPerformanceClient } from "./AgentPerformanceClient";

export default async function AgentReportsPage() {
    const [perfRes, deployRes] = await Promise.all([
        getAgentPerformanceListAction(),
        getDeploymentDataAction()
    ]);
    
    const initialData = perfRes.success ? perfRes.data : [];
    const deploymentData = deployRes.success ? (deployRes.data as DeploymentData) : null;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Rapports & Gestion des Agents</h1>
                <p className="text-slate-500">Suivi des performances et déploiement des agents sur le terrain.</p>
            </div>

            <AgentPerformanceClient 
                initialData={initialData} 
                deploymentData={deploymentData} 
            />
        </div>
    );
}
