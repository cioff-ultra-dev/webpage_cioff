import { db } from '@/db'; // Asegúrate de que '@/db' esté correctamente configurado.
import { Insertnewpages, new_pages } from '@/db/schema';

export async function saveNew(newSubpages: Insertnewpages) {
    return db.insert(new_pages).values(newSubpages).returning();
}

export async function getAllNews() {
  return db.select().from(new_pages).limit(10);
}
