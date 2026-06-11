import { z } from 'zod';

const schema = z.object({
  title: z.string().default("Get in Touch"),
  subtitle: z.string().default("Fill out the form"),
  emailAddress: z.string().default("hello@hexapixora.com"),
});

try {
  const defaults = schema.parse({});
  console.log("Defaults:", defaults);
} catch(e) {
  console.log("Error:", e);
}
