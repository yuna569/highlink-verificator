import { fetchVerifiedInfluencers } from "@/app/actions/influencers";
import VerifiedInfluencersView from "./_components/VerifiedInfluencersView";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 8;

export default async function VerifiedInfluencersPage() {
  const initial = await fetchVerifiedInfluencers({
    offset: 0,
    limit: PAGE_SIZE,
  });

  return (
    <VerifiedInfluencersView
      initialItems={initial.items}
      initialTotal={initial.total}
      pageSize={PAGE_SIZE}
    />
  );
}
