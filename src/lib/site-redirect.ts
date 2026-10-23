/** Redirect public pages on legacy hosts without forwarding API credentials. */
export function canonicalRedirect(
  requestUrl: string,
  appUrl: string
): string | null {
  const url = new URL(requestUrl);
  const target = new URL(appUrl);
  const aliases = ['www.genematicai.com', 'genematicai.bikai9289.workers.dev'];
  if (target.hostname !== 'genematicai.com' || !aliases.includes(url.hostname))
    return null;
  if (url.pathname.startsWith('/api/')) return null;
  return new URL(url.pathname + url.search, target.origin).href;
}
