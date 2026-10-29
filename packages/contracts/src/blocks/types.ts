// Shapes shared by block definitions, the registry and the admin field editor.

export type ModuleFieldType = 'text' | 'textarea' | 'image' | 'video' | 'boolean' | 'select' | 'richtext' | 'list' | 'categories';

export type ModuleField = {
  name: string;
  label: string;
  type: ModuleFieldType;
  defaultValue?: any;
  placeholder?: string;
  description?: string;
  options?: { label: string, value: string }[];
  itemFields?: Omit<ModuleField, 'itemFields'>[];
};

export type ModuleDefinition = {
  type: string;
  label: string;
  description: string;
  fields: ModuleField[];
  defaultConfig: Record<string, any>;
};
