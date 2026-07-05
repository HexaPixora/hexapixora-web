import { z } from 'zod';
import { createModuleDefinition } from '../create-module';

export const videoPlayerSchema = z.object({
  heading: z.string().default("Featured Videos"),
  layout: z.string().default("single"),
  autoplay: z.boolean().default(false),
  loop: z.boolean().default(true),
  controls: z.boolean().default(true),
  videos: z.array(z.object({
      videoUrl: z.string().default(""),
      title: z.string().default("")
    })).default([]),
});

export type VideoPlayerProps = z.input<typeof videoPlayerSchema>;

export const VideoPlayerModuleDef = createModuleDefinition(
  'VideoPlayerModule',
  "Embedded Video",
  "Glass-framed embedded video player (YouTube & Vimeo).",
  videoPlayerSchema,
  [
    {
        name: "heading",
        label: "Heading",
        type: "text"
    },
    {
        name: "layout",
        label: "Layout Strategy",
        type: "select",
        options: [
            {
                label: "Single Large Video",
                value: "single"
            },
            {
                label: "Multiple (Grid)",
                value: "grid"
            }
        ]
    },
    {
        name: "autoplay",
        label: "Autoplay (Mutes video)",
        type: "boolean"
    },
    {
        name: "loop",
        label: "Loop Video",
        type: "boolean"
    },
    {
        name: "controls",
        label: "Show Controls",
        type: "boolean"
    },
    {
        name: "videos",
        label: "Videos",
        type: "list",
        itemFields: [
            {
                name: "videoUrl",
                label: "YouTube or Vimeo URL",
                type: "text"
            },
            {
                name: "title",
                label: "Video Title (Optional)",
                type: "text"
            }
        ]
    }
]
);
