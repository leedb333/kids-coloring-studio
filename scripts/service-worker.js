const prefix = `kids-coloring-studio:${self.registration.scope}:`
const cacheName = prefix + VERSION
const scope = new URL(self.registration.scope)
const indexUrl = new URL('index.html', scope).href

self.addEventListener('install', event => {
  event.waitUntil(caches.open(cacheName).then(cache =>
    cache.addAll(FILES.map(file => new Request(new URL(file, scope), { cache: 'reload' }))),
  ))
})

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys()
    await Promise.all(names.filter(name => name.startsWith(prefix) && name !== cacheName).map(name => caches.delete(name)))
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url)
  if (event.request.method !== 'GET' || url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return

  event.respondWith((async () => {
    const cache = await caches.open(cacheName)
    // Vite may vary on Origin. Every entry here is a fixed, same-origin build file.
    const cached = await cache.match(event.request, { ignoreVary: true })
    if (cached) return cached
    try {
      return await fetch(event.request)
    } catch (error) {
      if (event.request.mode === 'navigate') {
        const index = await cache.match(indexUrl)
        if (index) return index
      }
      throw error
    }
  })())
})
