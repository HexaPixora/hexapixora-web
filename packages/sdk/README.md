# @hexapixora/sdk

How apps talk to the API.

| Import | Use from | Contents |
|---|---|---|
| `@hexapixora/sdk/server` | Server components, route handlers, the proxy | `apiUrl`, `cmsFetch`, `readJson`, `readResource`, `ApiUnavailableError` |
| `@hexapixora/sdk/browser` | Client components | `apiClient` (axios with cookie auth and 401 → refresh) |

Page-critical fetches use `readResource`: a 404 returns null (→ `notFound()`),
an unreachable API throws so an outage is never cached as a 404. Optional
sub-fetches use `readJson`, which never throws.
