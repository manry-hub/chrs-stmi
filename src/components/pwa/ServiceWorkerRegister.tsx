"use client";

import { useEffect } from "react";

/**
 * ServiceWorkerRegister
 * Explicitly registers the service worker located at /sw.js.
 * This is required for PWA features like Push Notifications to function.
 *
 * Tidak aktif saat development. `next.config.ts` mematikan serwist di dev,
 * sehingga /sw.js di sana adalah artefak build produksi yang ikut ter-commit.
 * Service worker itu memakai strategi CacheFirst untuk /_next/static, dan
 * karena nama chunk di dev tidak ber-hash, chunk lama akan terus dilayani dari
 * cache. Gejalanya: "Failed to find Server Action ..." karena bundel klien dan
 * manifest server berasal dari kompilasi yang berbeda.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV === "development") {
      // Bersihkan registrasi dan cache yang tertinggal dari build produksi,
      // supaya sesi dev yang sedang berjalan tidak terus disuguhi aset basi.
      void (async () => {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrations.map((registration) => registration.unregister()));

          if ("caches" in window) {
            const names = await caches.keys();
            await Promise.all(names.map((name) => caches.delete(name)));
          }

          if (registrations.length > 0) {
            console.info("[dev] Service worker produksi dilepas dan cache-nya dibersihkan. Muat ulang halaman.");
          }
        } catch (error) {
          console.error("Failed to clean up development service worker:", error);
        }
      })();

      return;
    }

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        if (registration.installing) {
          console.log("Service worker installing");
        } else if (registration.waiting) {
          console.log("Service worker installed");
        } else if (registration.active) {
          console.log("Service worker active");
        }

        // Handle updates
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === "installed") {
                if (navigator.serviceWorker.controller) {
                  console.log("New content is available; please refresh.");
                } else {
                  console.log("Content is cached for offline use.");
                }
              }
            };
          }
        };
      } catch (error) {
        console.error("Service worker registration failed:", error);
      }
    };

    registerServiceWorker();
  }, []);

  return null;
}
