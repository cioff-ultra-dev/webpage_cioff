import { InsertUser, SelectUser, users } from "@/db/schema";
import { db } from ".";
import { eq, sql } from "drizzle-orm";

// Placeholders
const selectUserByP1 = db
  .select()
  .from(users)
  .where(eq(users.email, sql.placeholder("email")))
  .prepare("selectUserByP1");

export async function getUserById(
  id: SelectUser["id"],
): Promise<Array<SelectUser>> {
  return db.select().from(users).where(eq(users.id, id));
}

export async function getUserByEmail(
  email: SelectUser["email"],
): Promise<Array<SelectUser>> {
  return selectUserByP1.execute({ email });
}

export async function getUserAuth(email: SelectUser["email"]) {
  return db.query.users.findFirst({
    where: eq(users.email, email),
    with: {
      role: true,
    },
  });
}

export type UserDataAuthType = NonNullable<
  Awaited<ReturnType<typeof getUserAuth>>
>;

export async function createUser(user: InsertUser) {
  return db.insert(users).values(user).returning();
}

export async function updateUser(id: SelectUser["id"], user: InsertUser) {
  return db.update(users).set(user).where(eq(users.id, id)).returning({
    updatedId: users.id,
  });
}

export async function deleteUser(id: SelectUser["id"]) {
  return db.delete(users).where(eq(users.id, id)).returning({
    deletedName: users.name,
  });
}

export async function bulkInsertUsers(users: InsertUser[]) {}
