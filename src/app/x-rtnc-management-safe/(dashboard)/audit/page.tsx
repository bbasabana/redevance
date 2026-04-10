import { listAdminAuditLogsAction } from "./actions";
import { AuditLogsClient } from "./AuditLogsClient";

export default async function AuditLogsPage() {
    const res = await listAdminAuditLogsAction();

    if (res.success) {
        return <AuditLogsClient initialRows={res.data} />;
    }

    return (
        <AuditLogsClient
            initialRows={[]}
            initialError={res.error}
            tableMissing={res.tableMissing}
        />
    );
}
