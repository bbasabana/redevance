import { listGeographiesAdminAction } from "./actions";
import { ZonesCommunesClient } from "./ZonesCommunesClient";

export default async function ZonesCommunesPage() {
    const res = await listGeographiesAdminAction();
    const data = res.success ? res.data : [];

    return <ZonesCommunesClient initialData={data} />;
}
