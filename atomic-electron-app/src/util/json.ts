import logger from '@shared/utils/logger';
import * as fs from 'fs';
import * as p from 'path';
import { ZodArray, infer as ZodInfer, ZodTypeAny } from 'zod';

export async function loadJson<T extends ZodTypeAny>(
  jsonPath: string,
  zodSchema: T
): Promise<ZodInfer<T>> {
  try {
    if (!fs.existsSync(jsonPath)) {
      return await writeEmpty(jsonPath, zodSchema);
    }
    const raw = await fs.promises.readFile(jsonPath, 'utf8');
    const parsed = JSON.parse(raw);
    return zodSchema.parse(parsed);
  } catch (err) {
    logger.error('Failed to load or parse JSON:', err);
    throw err;
  }
}

export async function writeJson<T extends object>(
  jsonPath: string,
  json: T
): Promise<T> {
  try {
    const dir = p.dirname(jsonPath);
    await fs.promises.mkdir(dir, { recursive: true });

    const jsonString = JSON.stringify(json, null, 2);
    await fs.promises.writeFile(jsonPath, jsonString, 'utf8');

    return json;
  } catch (err) {
    logger.error('Failed to write JSON:', err);
    throw new Error('Failed to write JSON.');
  }
}

async function writeEmpty<T extends ZodTypeAny>(
  jsonPath: string,
  zodSchema: T
): Promise<ZodInfer<T>> {
  if (zodSchema instanceof ZodArray) {
    await writeJson(jsonPath, []);
    return [];
  } else {
    await writeJson(jsonPath, {});
    return {};
  }
}
