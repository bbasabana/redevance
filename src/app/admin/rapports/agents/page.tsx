import { getAgentPerformanceListAction } from "./actions";
import { AgentPerformanceClient } from "@/app/admin/rapports/agents/AgentPerformanceClient";

export default async function AgentReportsPage() {
    const res = await getAgentPerformanceListAction();
    const initialData = res.success ? res.data : [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Rapports de Performance Agents</h1>
                <p className="text-slate-500">Suivi des contrôles terrain et de la collecte par agent.</p>
            </div>

            <AgentPerformanceClient initialData={initialData} />
        </div>
    );
}
