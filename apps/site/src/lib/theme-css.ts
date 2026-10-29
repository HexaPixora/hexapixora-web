/** Compiled theme CSS never contains markup; refuse it if it somehow does. */
export const isSafeThemeCss = (css: unknown): css is string => typeof css === "string" && !/<\//.test(css);
