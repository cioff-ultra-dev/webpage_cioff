"use server";

import { InsertUser, SelectUser, subscriptions, users } from "@/db/schema";
import { db } from ".";
import { eq, sql } from "drizzle-orm";

// Placeholders
const selectUserByP1 = db
  .select()
  .from(users)
  .where(eq(users.email, sql.placeholder("email")))
  .prepare("selectUserByP1");

export async function getUserById(
  id: SelectUser["id"]
): Promise<Array<SelectUser>> {
  return db.select().from(users).where(eq(users.id, id));
}

export async function getUserByEmail(
  email: SelectUser["email"]
): Promise<Array<SelectUser>> {
  return selectUserByP1.execute({ email });
}

export async function getUserAuth(email: SelectUser["email"]) {
  return db.query.users.findFirst({
    where: eq(users.email, email),
    with: {
      role: true,
      subscription: true,
    },
  });
}

export async function getUserAuthById(userId: SelectUser["id"]) {
  return db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      role: true,
      subscription: true,
    },
  });
}

export async function getCurrentSubscriptionByUserId(userId: SelectUser["id"]) {
  return db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, userId),
    with: {
      user: true,
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
