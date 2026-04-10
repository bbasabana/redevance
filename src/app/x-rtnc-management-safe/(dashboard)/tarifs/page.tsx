import { listTarifRulesAction } from "./actions";
import { TarifsAdminClient } from "./TarifsAdminClient";

export default async function TarifsAdminPage() {
    const res = await listTarifRulesAction();
    const data = res.success ? res.data : [];

    return <TarifsAdminClient initialData={data} />;
}
