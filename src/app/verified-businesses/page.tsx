import { fetchApprovedBusinesses } from "@/app/actions/businesses";
import ApprovedBusinessesView from "./_components/ApprovedBusinessesView";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 8;

export default async function ApprovedBusinessesPage() {
  const initial = await fetchApprovedBusinesses({ offset: 0, limit: PAGE_SIZE });

  return (
    <ApprovedBusinessesView
      initialItems={initial.items}
      initialTotal={initial.total}
      pageSize={PAGE_SIZE}
    />
  );
}
