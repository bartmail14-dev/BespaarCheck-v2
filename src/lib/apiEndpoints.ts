const PRODUCTION_ORIGIN = 'https://www.bespaarcheck.net';

function isLocalDevelopmentHost() {
  if (typeof window === 'undefined') return false;
  return ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
}

function resolveApiEndpoint(path: string, configured?: string) {
  const trimmed = configured?.trim();
  if (trimmed) return trimmed;

  if (isLocalDevelopmentHost()) {
    return `${PRODUCTION_ORIGIN}${path}`;
  }

  return path;
}

export function resolveChatEndpoint() {
  return resolveApiEndpoint('/api/chat', import.meta.env.VITE_BESPAARCHECK_CHAT_ENDPOINT);
}

export function resolveContactEndpoint() {
  return resolveApiEndpoint('/api/contact', import.meta.env.VITE_BESPAARCHECK_CONTACT_ENDPOINT);
}
