import { eq, SQL, and } from "drizzle-orm";
import { PgColumn, PgTable } from "drizzle-orm/pg-core";

export function buildConditions<T extends PgTable>(
  params: Partial<Record<keyof typeof table.$inferSelect, unknown>>,
  table: T
): SQL | undefined {
  const conditions: SQL[] = Object.entries(params)
    .filter(([key, value]) => value !== undefined && key in table)
    .map(([key, value]) => {
      const column = table[key as keyof T] as PgColumn;
      return eq(column, value);
    });

  return conditions.length > 0 ? and(...conditions) : undefined;
}
