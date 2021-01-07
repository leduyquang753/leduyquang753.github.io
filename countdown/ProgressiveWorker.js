// Version: 3
self.addEventListener('install', function (event) {
	console.log("Countdown: Updating files...");
	event.waitUntil(caches.delete("Countdown"));
	event.waitUntil(caches.open("Countdown").then(function(cache) { return cache.addAll([
		"fonts/font.css",
		"fonts/Segoe MDL2 assets.woff2",
		"fonts/Segoe UI.woff2",
		"datetime.js",
		"icon.svg",
		"index.html",
		"script.js",
		"styles.css"
	]).catch((error) => { console.error(error); }) }));
	self.skipWaiting();
});

self.addEventListener('activate', function (event) {
	event.waitUntil(clients.claim());
	console.log("Countdown: Update successful.");
});


self.addEventListener('fetch', function (event) {
	let params = new URL(event.request.url).searchParams;
	event.respondWith(
		caches.match(event.request).then(function (response) {
			return response || fetch(event.request);
		})
	);
});