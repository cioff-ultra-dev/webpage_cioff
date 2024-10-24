import { writeFile } from "fs/promises";
import { v4 } from "uuid";
import { tmpdir } from "os";
import path from "path";

type FileLocallyType = {
  id: string;
  path: string;
};

export async function storeFileLocally(
  file: File,
  fileName: string,
): Promise<FileLocallyType> {
  const buffer = await file.arrayBuffer();
  const data = Buffer.from(buffer);

  const uuid = v4();
  const indexPath = `${uuid}|${fileName}`;

  const nextPath = path.join(tmpdir(), indexPath);

  await writeFile(nextPath, data);

  return { id: uuid, path: indexPath };
}
