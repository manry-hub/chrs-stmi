"use client";

import React, { useEffect, useState } from 'react';
import { Download, X, Share } from 'lucide-react';
import Image from 'next/image';

export function PWAInstallPrompt() {
  const [isReady, setIsReady] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if it's already installed or in standalone mode
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    setIsStandalone(isStandaloneMode);
    
    if (isStandaloneMode) {
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Show our custom UI
      
      const dismissed = localStorage.getItem('pwa-prompt-dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // For iOS, the beforeinstallprompt event is not fired.
    // So we manually check if we should show the prompt for iOS.
    if (isIosDevice && !isStandaloneMode) {
      const dismissed = localStorage.getItem('pwa-prompt-dismissed');
      if (!dismissed) {
        // Show after a short delay so it doesn't pop up instantly on first load
        const timer = setTimeout(() => {
          setShowPrompt(true);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }

    setIsReady(true);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Only render if ready, not in standalone, and prompt is visible
  if (!isReady || isStandalone || !showPrompt) {
    return null;
  }

  // If it's Android/Desktop but we haven't received the beforeinstallprompt event yet, wait.
  // Exception: iOS never receives this event, so we show it anyway.
  if (!isIOS && !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-[360px] z-50 animate-in slide-in-from-bottom-10 fade-in duration-500">
      <div className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-slate-200 p-3 sm:p-4 flex flex-col relative overflow-hidden">
        {/* close button */}
        <button onClick={handleDismiss} className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full p-1 transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-start gap-3">
          <div className="flex shrink-0 p-1 bg-slate-50 rounded-lg">
            <Image src="/icon-192x192.png" alt="HazardReport Logo" width={40} height={40} className="rounded-md shadow-sm" />
          </div>

          <div className="flex-1 pr-6">
            <h3 className="text-[13px] sm:text-sm font-bold text-slate-900 leading-tight">Install HazardReport</h3>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-1 leading-snug">
              {isIOS ? (
                <>
                  Tap <strong>Share</strong> <Share className="w-3 h-3 inline-block text-blue-500 mb-0.5 mx-0.5" /> di bawah layar, lalu pilih <strong className="text-slate-700">Add to Home Screen</strong> <span className="inline-block bg-slate-100 p-0.5 rounded text-[9px] leading-none border border-slate-200 ml-0.5">➕</span>
                </>
              ) : (
                "Untuk akses lebih cepat dan fleksibel."
              )}
            </p>
          </div>
        </div>

        {!isIOS && deferredPrompt && (
          <button 
            onClick={handleInstallClick}
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-xs px-4 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors mt-3 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" /> Install Sekarang
          </button>
        )}
      </div>
    </div>
  );
}
