import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register plugins once for every block instead of in each component. Guarded
// so server rendering, where ScrollTrigger has no window, stays a no-op.
if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };
