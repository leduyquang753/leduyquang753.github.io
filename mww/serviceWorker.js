self.addEventListener('install', (event) => {
	event.waitUntil(caches.open('mww-cache').then(cache => {
		return cache.add('New_change.wav');
	}));
});

self.addEventListener('activate', (event) => {
	return self.clients.claim();
});

self.addEventListener('fetch', event => {
	event.respondWith(caches.match(event.request).then(response => {
		if (response) return response;
		return fetch(event.request);
	}));
});