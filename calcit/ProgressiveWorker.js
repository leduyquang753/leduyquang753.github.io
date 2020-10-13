// Version: 11
self.addEventListener('install', function (event) {
	console.log("CalcIt: Updating files...");
	event.waitUntil(caches.delete("CalcIt"));
	event.waitUntil(caches.open("CalcIt").then(function(cache) { return cache.addAll([
		'Materialize/material-icons.css',
		'Materialize/material-icons.woff2',
		'Materialize/materialize.css',
		'Materialize/materialize.js',

		'AngleUnits.js',
		'CalcIt.js',
		'CalculatorEngine.js',
		'ExpressionInvalidException.js',
		'Functions.js',
		'GetVariableException.js',
		'Icon.svg',
		'index.html',
		'Operands.js',
		'styles.css',
		'Utils.js'
	]).catch((error) => { console.error(error); }) }));
	self.skipWaiting();
});

self.addEventListener('activate', function (event) {
	event.waitUntil(clients.claim());
	console.log("CalcIt: Update successful.");
});


self.addEventListener('fetch', function (event) {
	let params = new URL(event.request.url).searchParams;
	event.respondWith(
		caches.match(event.request).then(function (response) {
			return response || fetch(event.request);
		})
	);
});