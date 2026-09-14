/** Public origin for the live demo. Override with NEXT_PUBLIC_SITE_URL. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://kiungo.jabali.studio"
).replace(/\/$/, "");

export function isLoopbackHost(host: string): boolean {
  const hostname = host
    .replace(/^https?:\/\//, "")
    .split("/")[0]
    ?.split(":")[0]
    ?.replace(/^\[|\]$/g, "")
    .toLowerCase();
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0" || hostname === "::1";
}

/**
 * Render (and most PaaS hosts) serve Next as http://localhost:<internal-port>.
 * Using `new URL(request.url).origin` for redirects sends reviewers there.
 */
export function publicOrigin(request: Request): string {
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const host = request.headers.get("host")?.split(",")[0]?.trim();
  const url = new URL(request.url);

  if (forwardedHost && !isLoopbackHost(forwardedHost)) {
    const proto = forwardedProto === "http" ? "http" : "https";
    return `${proto}://${forwardedHost}`;
  }

  if (host && !isLoopbackHost(host)) {
    const proto =
      forwardedProto === "http" ? "http" : forwardedProto === "https" ? "https" : url.protocol.replace(":", "");
    return `${proto}://${host}`;
  }

  if (process.env.NODE_ENV === "production") {
    return SITE_URL;
  }

  return url.origin;
}
