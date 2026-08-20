/** Builds a URL to the shared NAS image proxy (`GET /aggregate/image/proxy`). */
export function imageProxyUrl(path: string | null | undefined) {
  if (!path) return undefined
  return `/aggregate/image/proxy?path=${encodeURIComponent(path)}`
}

export async function copyImagePath(path: string | null | undefined) {
  if (!path) return
  try {
    await navigator.clipboard.writeText(path)
    return true
  } catch {
    return false
  }
}
