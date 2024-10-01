import path from "path";
import { fileURLToPath } from "url";
import { promises as fsPromises } from "fs";
import joinCategoriesFile from "./join_categories.json" assert { type: "json" };
import categoriesFile from "./categories.json" assert { type: "json" };

const { writeFile } = fsPromises;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @description Save a file locally
 * @example
 * const filePath = "/tmp/data.json";
 * const data = "text/json";
 * await writeFileAsync(filePath, data)
 */
async function writeFileAsync(filePath, data) {
  try {
    await writeFile(filePath, data, "utf-8");
  } catch (error) {
    console.error(error);
  }
}

const turn = 3;
const size = 204;
const p5 = joinCategoriesFile.slice((turn - 1) * size, turn * size);
const baseFile = path.join(__dirname, `festivals_to_categories_${turn}.sql`);

console.log("Start\n");

const orderToIdMap = {};
categoriesFile.forEach((category) => {
  orderToIdMap[category.order] = category.id;
});

const result = p5.map((position) => {
  const categoriesArray = position.categories.split(",");
  const mappedCategories = categoriesArray
    .map((value, index) => {
      return value === "1" ? orderToIdMap[index + 1] : null;
    })
    .filter(Boolean);
  return { id: position.id, categories: mappedCategories };
});

let resultSql = "";

result.forEach((r, i) => {
  console.log(i + " sql...\n");
  const festival_id = r.id;
  const values = r.categories
    .map((category_id) => `(${festival_id}, ${category_id})`)
    .join(", ");

  if (values?.length)
    resultSql = `${resultSql}INSERT INTO festivals_to_categories (festival_id, category_id) VALUES ${values};\n`;
});

writeFileAsync(baseFile, resultSql);
console.log("Success\n");
