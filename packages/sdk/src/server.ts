// Server-side access to the API: URL resolution plus fetch helpers that tell
// "missing" (404) apart from "API down" (throws).
export { API_BASE_URL, apiUrl } from "./api-url";
export { ApiUnavailableError, cmsFetch, readJson, readResource } from "./cms-fetch";
