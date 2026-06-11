import { z } from 'zod';
import { ModuleDefinition, ModuleField } from './modules-registry';

/**
 * Creates a CMS module definition where the Zod schema acts as the single source of truth for Default Values.
 */
export function createModuleDefinition<T extends z.ZodTypeAny>(
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
    console.warn(`[createModuleDefinition] Could not parse default config for ${type}. Ensure your Zod schema uses .default() for all required fields.`, e);
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
