import { db } from "@/lib/db";
import { roleRequests, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { RoleRequestsManager } from "./RoleRequestsManager";

export const metadata = {
  title: "Pedidos de Role | Admin | VibeTuga",
};

async function getAllRoleRequests() {
  return db
    .select({
      id: roleRequests.id,
      requestedRole: roleRequests.requestedRole,
      reason: roleRequests.reason,
      status: roleRequests.status,
      reviewNote: roleRequests.reviewNote,
      createdAt: roleRequests.createdAt,
      userId: roleRequests.userId,
      userName: users.discordUsername,
      userDisplayName: users.displayName,
      userImage: users.image,
      userRole: users.role,
    })
    .from(roleRequests)
    .innerJoin(users, eq(roleRequests.userId, users.id))
    .orderBy(desc(roleRequests.createdAt));
}

export default async function RoleRequestsPage() {
  const requests = await getAllRoleRequests();

  return <RoleRequestsManager initialRequests={requests} />;
}
