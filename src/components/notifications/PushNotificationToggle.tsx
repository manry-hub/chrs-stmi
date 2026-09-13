"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { subscribeNotification } from "@/actions/notifications/subscribeNotification";
import { unsubscribeNotification } from "@/actions/notifications/unsubscribeNotification";
import { toast } from "react-hot-toast";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

interface PushSubscriptionJSON {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushNotificationToggle() {
  const [mounted, setMounted] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined" && "serviceWorker" in window.navigator && "PushManager" in window) {
      checkAndAutoSubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  async function checkAndAutoSubscribe() {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        setLoading(false);
        return;
      }
      
      const subscription = await registration.pushManager.getSubscription();
      const hasSubscribed = !!subscription;
      setIsSubscribed(hasSubscribed);
      
      // Auto-subscribe logic
      if (!hasSubscribed && Notification.permission !== "denied") {
        const hasPrompted = localStorage.getItem("has_prompted_push");
        
        // If granted, always try to subscribe in background.
        // If default (not asked), only prompt if we haven't asked before in this browser.
        if (Notification.permission === "granted" || !hasPrompted) {
          if (Notification.permission === "default") {
            localStorage.setItem("has_prompted_push", "true");
          }
          
          await handleSubscribe(registration);
        }
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubscribe(registration: ServiceWorkerRegistration) {
    if (!VAPID_PUBLIC_KEY) return;
    
    try {
      if (Notification.permission !== "granted") {
        const result = await Notification.requestPermission();
        if (result !== "granted") return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const result = await subscribeNotification(subscription.toJSON() as PushSubscriptionJSON);
      if (result.success) {
        setIsSubscribed(true);
        // Only show toast if it's not a silent background subscription
        if (Notification.permission !== "granted" || localStorage.getItem("manual_toggle_push")) {
          toast.success("Notifikasi diaktifkan!", { id: "push-subscribe-toast" });
        }
      }
    } catch (error) {
      console.error("Auto subscribe error:", error);
    }
  }

  async function handleToggle() {
    if (!VAPID_PUBLIC_KEY) {
      toast.error("VAPID Public Key belum dikonfigurasi.");
      return;
    }

    setLoading(true);
    try {
      if (isSubscribed) {
        // Unsubscribe
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          const subscription = await registration.pushManager.getSubscription();
          if (subscription) {
            await subscription.unsubscribe();
            await unsubscribeNotification();
            setIsSubscribed(false);
            toast.success("Notifikasi dinonaktifkan.", { id: "push-unsubscribe-toast" });
          }
        }
      } else {
        // Subscribe
        localStorage.setItem("manual_toggle_push", "true");
        let registration = await navigator.serviceWorker.getRegistration();
        if (!registration) {
           registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        }
        await handleSubscribe(registration);
      }
    } catch (error) {
      console.error("Error toggling notification:", error);
      toast.error("Terjadi kesalahan sistem saat mengatur notifikasi.");
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) {
    return (
      <button
        disabled
        className="relative p-2 rounded-xl transition-all duration-200 bg-slate-100 text-slate-500"
      >
        <BellOff className="w-5 h-5" />
      </button>
    );
  }

  if (typeof window === "undefined" || !("serviceWorker" in window.navigator && "PushManager" in window)) {
    return null;
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`relative p-2 rounded-xl transition-all duration-200 ${
        isSubscribed 
          ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" 
          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
      }`}
      title={isSubscribed ? "Notifikasi Aktif" : "Aktifkan Notifikasi"}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : isSubscribed ? (
        <Bell className="w-5 h-5 fill-current" />
      ) : (
        <BellOff className="w-5 h-5" />
      )}
      {isSubscribed && (
        <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white" />
      )}
    </button>
  );
}
