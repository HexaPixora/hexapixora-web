import { z } from 'zod';
import { createModuleDefinition } from '../create-module';

export const contactFormSchema = z.object({
  title: z.string().default('Get in Touch'),
  subtitle: z.string().default('Have a project in mind or want to discuss details? Fill out the form and our team will get back to you within 24 hours.'),
  emailAddress: z.string().default('hello@hexapixora.com'),
  phoneNumber: z.string().default('+1 (234) 567-890'),
  physicalAddress: z.string().default('123 Innovation Way, Tech Suite 100'),
});

export type ContactFormProps = z.input<typeof contactFormSchema>;

export const ContactFormModuleDef = createModuleDefinition(
  'ContactFormModule',
  'ContactForm',
  'A dynamic contact form with custom text and contact information.',
  contactFormSchema,
  [
    { name: 'title', label: 'Title', type: 'text' },
    { name: 'subtitle', label: 'Subtitle', type: 'textarea' },
    { name: 'emailAddress', label: 'Email Address', type: 'text' },
    { name: 'phoneNumber', label: 'Phone Number', type: 'text' },
    { name: 'physicalAddress', label: 'Physical Address', type: 'textarea' },
  ]
);
