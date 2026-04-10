import { listPeriodesAction } from "./actions";
import { PeriodesAdminClient } from "./PeriodesAdminClient";

export default async function PeriodesPage() {
    const res = await listPeriodesAction();
    const data = res.success ? res.data : [];

    return <PeriodesAdminClient initialData={data} />;
}
