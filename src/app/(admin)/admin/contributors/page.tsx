import { getAdminContributors } from "@/lib/db/queries/contributors";
import { ContributorsManager } from "./ContributorsManager";

export const metadata = {
  title: "Contribuidores | Admin | VibeTuga",
};

export default async function AdminContributorsPage() {
  const { users, contributorBadgeId, monthlyStarBadgeId } = await getAdminContributors();

  return (
    <ContributorsManager
      initialUsers={users}
      contributorBadgeId={contributorBadgeId}
      monthlyStarBadgeId={monthlyStarBadgeId}
    />
  );
}
