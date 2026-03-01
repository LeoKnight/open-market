/**
 * Normalizes S3 image URLs to use the local API proxy.
 * Converts old absolute URLs (http://host:port/s/bucket/key)
 * to local proxy paths (/api/s3/bucket/key).
 */
export function normalizeImageUrl(url: string): string {
  if (!url || url.startsWith("/api/")) return url;
  if (url.startsWith("/")) return url;

  try {
    const urlObj = new URL(url);
    const cleaned = urlObj.pathname.replace(/^\/s\//, "/").replace(/^\//, "");
    if (cleaned) return `/api/s3/${cleaned}`;
  } catch {
    // Not a valid URL, return as-is
  }

  return url;
}
