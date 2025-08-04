import logger from '@shared/utils/logger';
import * as fs from 'fs';
import { infer as ZodInfer, ZodTypeAny } from 'zod';

export async function loadJson<T extends ZodTypeAny>(
  jsonPath: string,
  zodSchema: T
): Promise<ZodInfer<T> | undefined> {
  try {
    const raw = await fs.promises.readFile(jsonPath, 'utf8');
    const parsed = JSON.parse(raw);
    return zodSchema.parse(parsed);
  } catch (err) {
    logger.error('Failed to load or parse JSON:', err);
    return undefined;
  }
}

export async function writeJson<T extends object>(
  jsonPath: string,
  json: T
): Promise<T> {
  try {
    const jsonString = JSON.stringify(json);
    await fs.promises.writeFile(jsonPath, jsonString);
    return json;
  } catch (err) {
    logger.error('Failed to write JSON:', err);
    throw new Error('Failed to parse json');
  }
}
