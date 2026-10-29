import { z } from 'zod';
import type { ModuleDefinition, ModuleField } from './types';

/**
 * Creates a CMS module definition where the Zod schema acts as the single source of truth for Default Values.
 */
export function defineBlock<T extends z.ZodType<Record<string, any>>>(
  type: string,
  label: string,
  description: string,
  schema: T,
  fields: ModuleField[]
): ModuleDefinition {
  let defaultConfig: Record<string, any> = {};
  
  try {
    // We attempt to parse an empty object to extract the default values defined in the Zod schema.
    defaultConfig = schema.parse({});
  } catch (e) {
    console.warn(`[defineBlock] Could not parse default config for ${type}. Ensure your Zod schema uses .default() for all required fields.`, e);
  }

  // Automatically inject Zod defaults into the UI fields array to prevent redundancy.
  const mappedFields = fields.map(field => {
    if (field.defaultValue === undefined && defaultConfig[field.name] !== undefined) {
      return { ...field, defaultValue: defaultConfig[field.name] };
    }
    return field;
  });

  return {
    type,
    label,
    description,
    fields: mappedFields,
    defaultConfig,
  };
}

/**
 * Validates stored block config against its schema before rendering. Bad or
 * partial data falls back field by field to the schema defaults instead of
 * crashing the page, so a broken edit can never take a page down.
 */
export function parseBlockConfig<T extends z.ZodType>(schema: T, config: unknown): z.output<T> {
  const parsed = schema.safeParse(config ?? {});
  if (parsed.success) return parsed.data;
  const fallback = schema.parse({}) as Record<string, unknown>;
  if (config && typeof config === "object") {
    for (const [key, value] of Object.entries(config)) {
      if (!(key in fallback)) continue;
      const one = schema.safeParse({ ...fallback, [key]: value });
      if (one.success) fallback[key] = (one.data as Record<string, unknown>)[key];
    }
  }
  return fallback as z.output<T>;
}
