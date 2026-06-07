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
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      checkSubscription();
    } else {
      setLoading(false);
    }
  }, []);

  async function checkSubscription() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error("Error checking subscription:", error);
    } finally {
      setLoading(false);
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
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
          await unsubscribeNotification();
          setIsSubscribed(false);
          toast.success("Notifikasi dinonaktifkan.");
        }
      } else {
        // Subscribe
        const registration = await navigator.serviceWorker.ready;
        
        // Request permission if not granted
        if (Notification.permission !== "granted") {
          const result = await Notification.requestPermission();
          if (result !== "granted") {
            toast.error("Izin notifikasi ditolak.");
            return;
          }
        }

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });

        const result = await subscribeNotification(subscription.toJSON() as PushSubscriptionJSON);
        if (result.success) {
          setIsSubscribed(true);
          toast.success("Notifikasi diaktifkan!");
        } else {
          toast.error(result.error || "Gagal mengaktifkan notifikasi.");
          await subscription.unsubscribe();
        }
      }
    } catch (error) {
      console.error("Error toggling notification:", error);
      toast.error("Terjadi kesalahan sistem saat mengatur notifikasi.");
    } finally {
      setLoading(false);
    }
  }

  if (!("serviceWorker" in navigator && "PushManager" in window)) {
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
