import { fetchPendingBusinesses } from "@/app/actions/businesses";
import PendingBusinessesView from "./_components/PendingBusinessesView";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 8;

export default async function PendingBusinessesPage() {
  const initial = await fetchPendingBusinesses({ offset: 0, limit: PAGE_SIZE });

  return (
    <PendingBusinessesView
      initialItems={initial.items}
      initialTotal={initial.total}
      pageSize={PAGE_SIZE}
    />
  );
}
