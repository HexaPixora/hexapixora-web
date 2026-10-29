import { safeHref } from "@hexapixora/contracts/links";
import { mediaAlt } from "../../../lib/media-alt";
import type { StepsLayoutProps } from "../steps-block";
import { ScrollStory } from "./scroll-story";

/**
 * Steps that scroll past a pinned panel on wide screens: the panel shows the
 * active step's image and number. The copy is server-rendered; only the
 * "which step is active" tracking runs on the client.
 */
export function StorySteps({ items }: StepsLayoutProps) {
  const steps = items.map((item) => {
    const image = safeHref(item.image);
    return { title: item.title, text: item.text, image: image ?? "", alt: image ? mediaAlt(image, item.title) : "" };
  });
  return <ScrollStory steps={steps} />;
}
