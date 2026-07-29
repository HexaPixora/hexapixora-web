import { z } from "zod";
import { createModuleDefinition } from "../create-module";

export const customCodeSchema = z.object({
  title: z.string().default(""),
  html: z.string().default('<div className="custom-box">\n  <h3>Custom Component</h3>\n  <p>Modify HTML, CSS, and JS in the module config.</p>\n  <button id="demo-btn">Click Me</button>\n</div>'),
  css: z.string().default('.custom-box {\n  padding: 2rem;\n  border-radius: 12px;\n  background: rgba(255, 255, 255, 0.03);\n  border: 1px solid rgba(255, 255, 255, 0.1);\n  text-align: center;\n}\n.custom-box h3 {\n  font-size: 1.5rem;\n  font-weight: 700;\n  margin-bottom: 0.5rem;\n}\n.custom-box button {\n  margin-top: 1rem;\n  padding: 0.5rem 1.25rem;\n  border-radius: 8px;\n  background: #1093fd;\n  color: #fff;\n  font-weight: 600;\n  border: none;\n  cursor: pointer;\n  transition: opacity 0.2s;\n}\n.custom-box button:hover {\n  opacity: 0.9;\n}'),
  js: z.string().default('// container is the DOM wrapper element for this module instance\nconst btn = container.querySelector("#demo-btn");\nif (btn) {\n  btn.addEventListener("click", () => {\n    alert("Hello from Custom Code Module!");\n  });\n}'),
  renderMode: z.enum(["inline", "iframe"]).default("inline"),
  containerWidth: z.enum(["container", "full", "max-w-4xl", "max-w-6xl"]).default("full"),
  paddingY: z.enum(["none", "small", "medium", "large"]).default("medium"),
  anchorId: z.string().default(""),
});

export type CustomCodeProps = z.input<typeof customCodeSchema>;

export const CustomCodeModuleDef = createModuleDefinition(
  "CustomCodeModule",
  "Custom HTML / CSS / JS",
  "Build custom widgets, components, canvas animations, or embedded scripts by directly providing HTML, CSS, and JavaScript code.",
  customCodeSchema,
  [
    { name: "title", label: "Section Title (Optional)", type: "text", placeholder: "e.g. Interactive Calculator" },
    {
      name: "renderMode",
      label: "Execution & Rendering Mode",
      type: "select",
      options: [
        { label: "Inline Mode (Direct DOM + Scoped CSS)", value: "inline" },
        { label: "Isolated iFrame Mode (Sandbox)", value: "iframe" },
      ],
      description: "Inline mode integrates seamlessly with page styling; iFrame mode sandboxes code completely.",
    },
    {
      name: "containerWidth",
      label: "Container Max Width",
      type: "select",
      options: [
        { label: "Standard Container", value: "container" },
        { label: "Narrow (Max 4XL)", value: "max-w-4xl" },
        { label: "Wide (Max 6XL)", value: "max-w-6xl" },
        { label: "Full Width (100%)", value: "full" },
      ],
    },
    {
      name: "paddingY",
      label: "Vertical Padding",
      type: "select",
      options: [
        { label: "None (0px)", value: "none" },
        { label: "Small (py-8)", value: "small" },
        { label: "Medium (py-16)", value: "medium" },
        { label: "Large (py-24)", value: "large" },
      ],
    },
    {
      name: "html",
      label: "HTML Code",
      type: "code",
      placeholder: "<div>Enter your HTML markup here</div>",
      description: "Raw HTML markup to render inside the module.",
    },
    {
      name: "css",
      label: "CSS Styles",
      type: "code",
      placeholder: ".my-class { color: red; }",
      description: "Custom CSS styles. Automatically scoped to this module.",
    },
    {
      name: "js",
      label: "JavaScript Code",
      type: "code",
      placeholder: "const el = container.querySelector('.my-class');",
      description: "JavaScript code executed when the module mounts. Accessible variables: `container` and `window`.",
    },
    { name: "anchorId", label: "Anchor ID (for #links)", type: "text", placeholder: "custom-widget" },
  ]
);
