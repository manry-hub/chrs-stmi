"use client";

import { useEffect } from "react";

/**
 * ServiceWorkerRegister
 * Explicitly registers the service worker located at /sw.js.
 * This is required for PWA features like Push Notifications to function.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
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
    }
  }, []);

  return null;
}
