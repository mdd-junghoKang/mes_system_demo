/** Extracts the raw NAS path from a `/aggregate/image/proxy?path=<encoded>` URL. */
export function extractProxyPath(proxyUrl: string | null | undefined) {
  if (!proxyUrl) return undefined
  const query = proxyUrl.split("?")[1]
  const params = new URLSearchParams(query)
  return params.get("path") ?? undefined
}
