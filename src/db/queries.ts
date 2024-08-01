import { InsertUser, SelectUser, usersTable } from "@/db/schema";
import { db } from ".";
import { eq } from "drizzle-orm";

export async function getUserById(id: SelectUser["id"]): Promise<
  Array<{
    id: number;
    name: string;
    age: number;
    email: string;
  }>
> {
  return db.select().from(usersTable).where(eq(usersTable.id, id));
}

export async function createUser(user: InsertUser) {
  return db.insert(usersTable).values(user).returning();
}

export async function updateUser(id: SelectUser["id"], user: InsertUser) {
  return db
    .update(usersTable)
    .set(user)
    .where(eq(usersTable.id, id))
    .returning({
      updatedId: usersTable.id,
    });
}

export async function updateContainerUser(
  id: SelectUser["id"],
  user: InsertUser,
) {}

export async function deleteUser(id: SelectUser["id"]) {
  return db.delete(usersTable).where(eq(usersTable.id, id)).returning({
    deletedName: usersTable.name,
  });
}
