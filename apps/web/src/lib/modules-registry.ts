
import { ContactFormModuleDef } from "./module-schemas/contact-form-schema";
import { HeroModuleDef } from "./module-schemas/hero-schema";
import { ctasectionSchema, CTASectionDef } from "./module-schemas/ctasection-schema";
import { servicesSchema, ServicesSectionDef } from "./module-schemas/services-schema";
import { portfolioSchema, PortfolioSectionDef } from "./module-schemas/portfolio-schema";
import { blogSchema, BlogSectionDef } from "./module-schemas/blog-schema";
import { testimonialsSchema, TestimonialsSectionDef } from "./module-schemas/testimonials-schema";
import { teamSchema, TeamSectionDef } from "./module-schemas/team-schema";
import { faqsectionSchema, FAQSectionDef } from "./module-schemas/faqsection-schema";
import { statsSchema, StatsSectionDef } from "./module-schemas/stats-schema";
import { aboutSchema, AboutSectionDef } from "./module-schemas/about-schema";
import { gallerySchema, GalleryModuleDef } from "./module-schemas/gallery-schema";
import { videoPlayerSchema, VideoPlayerModuleDef } from "./module-schemas/video-player-schema";
import { splideSliderSchema, SplideSliderModuleDef } from "./module-schemas/splide-slider-schema";
import { splideLogoTickerSchema, SplideLogoTickerModuleDef } from "./module-schemas/splide-logo-ticker-schema";
import { splideTestimonialsSchema, SplideTestimonialsModuleDef } from "./module-schemas/splide-testimonials-schema";
import { splideGallerySyncSchema, SplideGallerySyncModuleDef } from "./module-schemas/splide-gallery-sync-schema";

export type ModuleFieldType = 'text' | 'textarea' | 'image' | 'video' | 'color' | 'boolean' | 'select' | 'richtext' | 'list';

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

export const MODULES: Record<string, ModuleDefinition> = {
  HeroSection: HeroModuleDef,
  CTASection: CTASectionDef,
  ServicesSection: ServicesSectionDef,
  PortfolioSection: PortfolioSectionDef,
  BlogSection: BlogSectionDef,
  TestimonialsSection: TestimonialsSectionDef,
  TeamSection: TeamSectionDef,
  FAQSection: FAQSectionDef,
  StatsSection: StatsSectionDef,
  AboutSection: AboutSectionDef,
  GalleryModule: GalleryModuleDef,
  VideoPlayerModule: VideoPlayerModuleDef,
  SplideSliderModule: SplideSliderModuleDef,
  SplideLogoTickerModule: SplideLogoTickerModuleDef,
  SplideTestimonialsModule: SplideTestimonialsModuleDef,
  SplideGallerySyncModule: SplideGallerySyncModuleDef,
  ContactFormModule: ContactFormModuleDef
};
