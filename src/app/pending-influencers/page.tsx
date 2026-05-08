import { fetchPendingInfluencers } from "@/app/actions/influencers";
import PendingInfluencersView from "./_components/PendingInfluencersView";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 8;

export default async function PendingInfluencersPage() {
  const initial = await fetchPendingInfluencers({
    offset: 0,
    limit: PAGE_SIZE,
  });

  return (
    <PendingInfluencersView
      initialItems={initial.items}
      initialTotal={initial.total}
      pageSize={PAGE_SIZE}
    />
  );
}
