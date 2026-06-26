
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
import { bookingSchema, BookingModuleDef } from "./module-schemas/booking-schema";
import { pricingSchema, PricingModuleDef } from "./module-schemas/pricing-schema";
import { leadMagnetSchema, LeadMagnetModuleDef } from "./module-schemas/lead-magnet-schema";
import { HorizontalScrollModuleDef } from "./module-schemas/horizontal-scroll-schema";
import { ParallaxBannerModuleDef } from "./module-schemas/parallax-banner-schema";
import { ScrollytellingModuleDef } from "./module-schemas/scrollytelling-schema";
import { TimelineModuleDef } from "./module-schemas/timeline-schema";
import { AnimatedTextHeroModuleDef } from "./module-schemas/animated-text-hero-schema";
import { MarqueeModuleDef } from "./module-schemas/marquee-schema";
import { CounterStatsModuleDef } from "./module-schemas/counter-stats-schema";
import { StaggeredGridModuleDef } from "./module-schemas/staggered-grid-schema";

export type ModuleFieldType = 'text' | 'textarea' | 'image' | 'video' | 'color' | 'boolean' | 'select' | 'richtext' | 'list' | 'categories';

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
  ContactFormModule: ContactFormModuleDef,
  BookingModule: BookingModuleDef,
  PricingModule: PricingModuleDef,
  LeadMagnetModule: LeadMagnetModuleDef,
  HorizontalScrollModule: HorizontalScrollModuleDef,
  ParallaxBannerModule: ParallaxBannerModuleDef,
  ScrollytellingModule: ScrollytellingModuleDef,
  TimelineModule: TimelineModuleDef,
  AnimatedTextHeroModule: AnimatedTextHeroModuleDef,
  MarqueeModule: MarqueeModuleDef,
  CounterStatsModule: CounterStatsModuleDef,
  StaggeredGridModule: StaggeredGridModuleDef
};
