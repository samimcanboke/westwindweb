self.addEventListener('install', function(event) {
    console.log('Service Worker installing.');
    // Perform install steps
    event.waitUntil(
        caches.open('my-cache').then(function(cache) {
            console.log('Opened cache');
            return cache.addAll([
                '/',
                '/index.html',
                '/css/app.css',
                '/js/app.js',
                '/images/logo.png'
            ]);
        })
    );
});

self.addEventListener('fetch', function(event) {
    console.log('Service Worker fetching.', event.request.url);
    event.respondWith(
        caches.match(event.request).then(function(response) {
            // Cache hit - return response
            if (response) {
                return response;
            }
            return fetch(event.request).then(
                function(response) {
                    // Check if we received a valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // IMPORTANT: Clone the response. A response is a stream
                    // and because we want the browser to consume the response
                    // as well as the cache consuming the response, we need
                    // to clone it so we have two streams.
                    var responseToCache = response.clone();

                    caches.open('my-cache').then(function(cache) {
                        cache.put(event.request, responseToCache);
                    });

                    return response;
                }
            );
        })
    );
});

self.addEventListener('activate', function(event) {
    console.log('Service Worker activating.');
    var cacheWhitelist = ['my-cache'];
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('sync', function(event) {
    if (event.tag === 'sync-location') {
        event.waitUntil(trackLocation());
    }
});

function trackLocation() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(
                (position) => {
                    const locationData = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        timestamp: position.timestamp
                    };

                    fetch('/api/save-location', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(locationData)
                    })
                    .then(response => response.json())
                    .then(data => {
                        console.log('Konum başarıyla kaydedildi:', data);
                        resolve();
                    })
                    .catch(error => {
                        console.error('Konum kaydedilirken hata oluştu:', error);
                        reject();
                    });
                },
                (error) => {
                    console.error('Konum alınırken hata oluştu:', error);
                    reject();
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );
        } else {
            console.error('Geolocation bu tarayıcı tarafından desteklenmiyor.');
            reject();
        }
    });
}

self.addEventListener('push', function(event) {
    if (event.data) {
        const data = event.data.json();
        if (data.type === 'start-location-tracking') {
            self.registration.sync.register('sync-location');
        }
    }
});
