const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1"]);

export function isLocalHostname(hostname: string): boolean {
  return LOCAL_HOSTNAMES.has(hostname.toLowerCase().replace(/^\[|\]$/g, ""));
}

export function isLocalDemoRequest(request: Request): boolean {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded !== null) {
    return isLocalHostname(forwarded.split(",")[0].trim());
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp !== null) {
    return isLocalHostname(realIp.trim());
  }
  const host = request.headers.get("host") ?? "";
  return isLocalHostname(host.replace(/:\d+$/, ""));
}
