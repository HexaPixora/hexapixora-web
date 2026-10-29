import { z } from "zod";

export const headerSchema = z.object({
  navId: z.string().optional().describe("Navigation Menu to display"),
  logoUrl: z.string().optional().describe("Custom Logo URL Override"),
  ctaText: z.string().optional().default("Get in Touch").describe("CTA Button Text"),
  ctaUrl: z.string().optional().default("/contact-us").describe("CTA Button Link"),
});

export type HeaderConfig = z.infer<typeof headerSchema>;

export const DEFAULT_HEADER_CONFIG: HeaderConfig = {
  navId: "main-menu",
  ctaText: "Get in Touch",
  ctaUrl: "/contact-us",
};
