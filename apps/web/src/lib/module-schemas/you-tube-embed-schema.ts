import { z } from 'zod';
import { createModuleDefinition } from '../create-module';

export const youTubeEmbedSchema = z.object({
  videoUrl: z.string().default(""),
  autoplay: z.boolean().default(false),
  muted: z.boolean().default(false),
  controls: z.boolean().default(true),
  loop: z.boolean().default(false),
});

export type YouTubeEmbedProps = z.input<typeof youTubeEmbedSchema>;

export const YouTubeEmbedModuleDef = createModuleDefinition(
  'YouTubeEmbedModule',
  "YouTube Embed",
  "Embed a YouTube video seamlessly.",
  youTubeEmbedSchema,
  [
    {
        name: "videoUrl",
        label: "YouTube Video URL",
        type: "text",
        placeholder: "https://youtube.com/watch?v=..."
    },
    {
        name: "autoplay",
        label: "Autoplay",
        type: "boolean"
    },
    {
        name: "muted",
        label: "Muted",
        type: "boolean"
    },
    {
        name: "controls",
        label: "Show Controls",
        type: "boolean"
    },
    {
        name: "loop",
        label: "Loop Video",
        type: "boolean"
    }
]
);
