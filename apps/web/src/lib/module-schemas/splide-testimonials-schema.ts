import { z } from 'zod';
import { createModuleDefinition } from '../create-module';

export const splideTestimonialsSchema = z.object({
  heading: z.string().default("Client Success Stories"),
  subheading: z.string().default("Read what our clients say about our bespoke digital engineering services."),
  perPage: z.string().default("3"),
  autoplay: z.boolean().default(true),
  interval: z.string().default("4000"),
  items: z.array(z.object({
      name: z.string().default(""),
      company: z.string().default(""),
      content: z.string().default(""),
      avatar: z.string().default(""),
      rating: z.string().default("")
    })).default([{"name":"Alex Johnson","company":"Global Solutions","content":"Antigravity CMS has completely transformed our publishing speeds. Highly recommend this team!","avatar":"","rating":"5"},{"name":"Sarah Miller","company":"Alpha Design Agency","content":"The dynamic visual builder and the video performance is state-of-the-art. Amazing UX.","avatar":"","rating":"5"},{"name":"David Lee","company":"Nova Tech","content":"Reliable, lightning-fast rendering and extremely high visual polish. Superb CMS modules.","avatar":"","rating":"5"}]),
});

export type SplideTestimonialsProps = z.input<typeof splideTestimonialsSchema>;

export const SplideTestimonialsModuleDef = createModuleDefinition(
  'SplideTestimonialsModule',
  "Splide Testimonial Slider",
  "A swipable multi-card carousel showcasing client reviews and testimonials.",
  splideTestimonialsSchema,
  [
    {
        name: "heading",
        label: "Section Heading",
        type: "text"
    },
    {
        name: "subheading",
        label: "Section Subheading",
        type: "textarea"
    },
    {
        name: "perPage",
        label: "Cards visible at once",
        type: "select",
        options: [
            {
                label: "1 Card",
                value: "1"
            },
            {
                label: "2 Cards",
                value: "2"
            },
            {
                label: "3 Cards",
                value: "3"
            },
            {
                label: "4 Cards",
                value: "4"
            }
        ]
    },
    {
        name: "autoplay",
        label: "Autoplay Enabled",
        type: "boolean"
    },
    {
        name: "interval",
        label: "Autoplay Speed (ms)",
        type: "text"
    },
    {
        name: "items",
        label: "Testimonials",
        type: "list",
        itemFields: [
            {
                name: "name",
                label: "Client Name",
                type: "text"
            },
            {
                name: "company",
                label: "Client Company",
                type: "text"
            },
            {
                name: "content",
                label: "Review / Message",
                type: "textarea"
            },
            {
                name: "avatar",
                label: "Avatar Image",
                type: "image"
            },
            {
                name: "rating",
                label: "Rating (Stars)",
                type: "select",
                defaultValue: "5",
                options: [
                    {
                        label: "5 Stars",
                        value: "5"
                    },
                    {
                        label: "4 Stars",
                        value: "4"
                    },
                    {
                        label: "3 Stars",
                        value: "3"
                    }
                ]
            }
        ]
    }
]
);
