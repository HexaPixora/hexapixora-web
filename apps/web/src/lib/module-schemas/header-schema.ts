import { z } from "zod";

export const headerSchema = z.object({
  navId: z.string().optional().describe("Navigation Menu to display"),
  logoUrl: z.string().optional().describe("Custom Logo URL Override"),
  layoutStyle: z.enum(["logo-left", "logo-center", "split"]).default("logo-left").describe("Header Layout Style"),
  ctaText: z.string().optional().default("Get in Touch").describe("CTA Button Text"),
  ctaUrl: z.string().optional().default("/contact").describe("CTA Button Link"),
  ctaStyle: z.enum(["default", "outline", "ghost", "primary"]).default("default").describe("CTA Button Style"),
  isSticky: z.boolean().default(true).describe("Sticky Header"),
  glassmorphism: z.boolean().default(true).describe("Glassmorphism Effect"),
});

export type HeaderConfig = z.infer<typeof headerSchema>;

export const DEFAULT_HEADER_CONFIG: HeaderConfig = {
  navId: "main-menu",
  layoutStyle: "logo-left",
  ctaText: "Get in Touch",
  ctaUrl: "/contact",
  ctaStyle: "default",
  isSticky: true,
  glassmorphism: true,
};
