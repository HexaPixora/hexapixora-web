import { z } from 'zod';
import { createModuleDefinition } from '../create-module';

export const heroSchema = z.object({
  heading: z.string().default('Beautifully designed experiences'),
  subheading: z.string().default('Built with modern tools. We deliver high performance scalable solutions.'),
  buttonText: z.string().default('View Services'),
  buttonUrl: z.string().default('/services'),
  secondaryButtonText: z.string().default('Contact Us'),
  secondaryButtonUrl: z.string().default('/contact'),
  backgroundImage: z.string().default(''),
});

export type HeroProps = z.input<typeof heroSchema>;

export const HeroModuleDef = createModuleDefinition(
  'HeroSection',
  'Hero Section',
  'A full-screen hero section with a heading and call-to-action.',
  heroSchema,
  [
    { name: 'heading', label: 'Heading', type: 'text' },
    { name: 'subheading', label: 'Subheading', type: 'textarea' },
    { name: 'buttonText', label: 'Primary Button Text', type: 'text' },
    { name: 'buttonUrl', label: 'Primary Button URL', type: 'text' },
    { name: 'secondaryButtonText', label: 'Secondary Button Text', type: 'text' },
    { name: 'secondaryButtonUrl', label: 'Secondary Button URL', type: 'text' },
    { name: 'backgroundImage', label: 'Background Image URL', type: 'image' },
  ]
);
