import { z } from "zod";

export const footerSchema = z.object({
  logoUrl: z.string().optional().describe("Custom Logo URL Override"),
  tagline: z.string().optional().default("Building modern digital experiences.").describe("Footer Tagline"),
  
  col1NavId: z.string().optional().describe("Navigation for Column 1"),
  col1Title: z.string().optional().default("Quick Links").describe("Column 1 Title"),
  
  col2NavId: z.string().optional().describe("Navigation for Column 2"),
  col2Title: z.string().optional().default("Legal").describe("Column 2 Title"),

  socials: z.array(z.object({
    platform: z.string(),
    url: z.string().optional().default(""),
    icon: z.string().optional(),       // key into the social icon registry
    color: z.string().optional()       // hex color; empty = inherit theme color
  })).optional().default([
    { platform: "X (Twitter)", url: "https://twitter.com", icon: "x", color: "" },
    { platform: "LinkedIn", url: "https://linkedin.com", icon: "linkedin", color: "" }
  ]),

  backgroundColor: z.enum(["default", "muted", "dark"]).default("muted").describe("Background Color Style"),
  showNewsletter: z.boolean().default(true).describe("Show Newsletter Subscription Box"),
});

export type FooterConfig = z.infer<typeof footerSchema>;

export const DEFAULT_FOOTER_CONFIG: FooterConfig = {
  tagline: "Building modern digital experiences.",
  col1Title: "Quick Links",
  col2Title: "Legal",
  backgroundColor: "muted",
  showNewsletter: true,
  socials: [
    { platform: "X (Twitter)", url: "https://twitter.com", icon: "x", color: "" },
    { platform: "LinkedIn", url: "https://linkedin.com", icon: "linkedin", color: "" }
  ]
};
