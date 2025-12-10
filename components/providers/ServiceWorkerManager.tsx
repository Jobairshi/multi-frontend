'use client';

import { useEffect, useState } from 'react';

export default function ServiceWorkerManager() {
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
    const [updateAvailable, setUpdateAvailable] = useState(false);

    useEffect(() => {
        if ('serviceWorker' in navigator) {
            // Register service worker
            navigator.serviceWorker
                .register('/sw.js')
                .then((reg) => {
                    console.log('[SW] Service worker registered:', reg);
                    setRegistration(reg);

                    // Check for updates periodically
                    setInterval(() => {
                        reg.update();
                    }, 60000); // Check every minute

                    // Listen for updates
                    reg.addEventListener('updatefound', () => {
                        const newWorker = reg.installing;
                        if (newWorker) {
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    console.log('[SW] New service worker available');
                                    setUpdateAvailable(true);
                                }
                            });
                        }
                    });
                })
                .catch((err) => {
                    console.error('[SW] Service worker registration failed:', err);
                });

            // Listen for controller change (new SW activated)
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                console.log('[SW] Controller changed, reloading page');
                window.location.reload();
            });
        }
    }, []);

    const handleUpdate = () => {
        if (registration?.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
    };

    const handleClearCache = async () => {
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map((name) => caches.delete(name)));
            console.log('[SW] All caches cleared');
            window.location.reload();
        }
    };

    if (!updateAvailable) {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-4 rounded-lg shadow-lg max-w-sm">
            <p className="mb-2 font-semibold">Update Available!</p>
            <p className="text-sm mb-3">A new version of the app is available.</p>
            <div className="flex gap-2">
                <button
                    onClick={handleUpdate}
                    className="px-4 py-2 bg-white text-blue-600 rounded font-medium hover:bg-blue-50 transition-colors"
                >
                    Update Now
                </button>
                <button
                    onClick={handleClearCache}
                    className="px-4 py-2 bg-blue-700 text-white rounded font-medium hover:bg-blue-800 transition-colors"
                >
                    Clear Cache
                </button>
            </div>
        </div>
    );
}
