import { z } from 'zod';
import { createModuleDefinition } from '../create-module';

export const bookingSchema = z.object({
  heading: z.string().default("Book a free strategy call"),
  subheading: z.string().default("Pick a time that works for you — no commitment, just a conversation about your goals."),
  buttonText: z.string().default("Book a call"),
  backgroundColor: z.string().default("#0f172a"),
  // "all" uses every meeting type from Settings; otherwise filter to this label.
  meetingFilter: z.string().default("all"),
  anchorId: z.string().default("book-a-call"),
});

export type BookingProps = z.input<typeof bookingSchema>;

export const BookingModuleDef = createModuleDefinition(
  'BookingModule',
  "Booking / Schedule a Call",
  "A call-to-action that opens your Calendly scheduling popup. Meeting types are managed in Settings → Scheduling.",
  bookingSchema,
  [
    { name: "heading", label: "Heading", type: "text" },
    { name: "subheading", label: "Subheading", type: "textarea" },
    { name: "buttonText", label: "Button Text (single meeting type)", type: "text" },
    { name: "backgroundColor", label: "Background Color (Hex)", type: "color" },
    {
      name: "meetingFilter",
      label: "Meeting type",
      type: "text",
      description: "Use 'all' to show every meeting type from Settings, or a specific label to show just that one.",
      defaultValue: "all",
    },
    { name: "anchorId", label: "Anchor ID", type: "text", description: "For in-page links, e.g. link a button to #book-a-call." },
  ],
);
