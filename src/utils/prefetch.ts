/**
 * Route prefetching utility to load lazy components during idle time or hover
 * Prevents latency so users never wait when clicking links.
 */
const prefetched = new Set<string>();

export function prefetchRoute(routeName: string, importer: () => Promise<unknown>): void {
  if (typeof window === 'undefined' || prefetched.has(routeName)) return;
  prefetched.add(routeName);

  const runImport = () => {
    importer().catch(err => {
      console.warn(`Prefetch for ${routeName} skipped`, err);
    });
  };

  if ('requestIdleCallback' in window) {
    (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(runImport);
  } else {
    setTimeout(runImport, 300);
  }
}
