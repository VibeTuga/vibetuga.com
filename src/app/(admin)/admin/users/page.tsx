import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { AdminUsersManager } from "./AdminUsersManager";

export const metadata = {
  title: "Utilizadores | Admin | VibeTuga",
};

export default async function UsersPage() {
  const allUsers = await db
    .select({
      id: users.id,
      discordUsername: users.discordUsername,
      displayName: users.displayName,
      email: users.email,
      image: users.image,
      role: users.role,
      xpPoints: users.xpPoints,
      level: users.level,
      isBanned: users.isBanned,
      isVerified: users.isVerified,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt));

  return <AdminUsersManager users={allUsers} />;
}
