import { useState, useEffect } from 'react';

export interface PWAInstallProps {
  canInstall: boolean;
  promptInstall: () => void;
}

export const usePWAInstall = (): PWAInstallProps => {
  const [canInstall, setCanInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if the app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setCanInstall(false);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      console.log('beforeinstallprompt triggered');
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      console.log('App installed successfully');
      setCanInstall(false);
      setDeferredPrompt(null);
    };

    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Also listen for custom event from index.html
    const handlePWAReady = (e: any) => {
      console.log('PWA ready to install from custom event');
      setDeferredPrompt(e.detail?.prompt);
      setCanInstall(true);
    };

    window.addEventListener('pwaReadyToInstall' as any, handlePWAReady);
    window.addEventListener('pwaInstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('pwaReadyToInstall' as any, handlePWAReady);
      window.removeEventListener('pwaInstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) {
      console.log('No deferred prompt available');
      return;
    }
    
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('Installation outcome:', outcome);
      if (outcome === 'accepted') {
        setCanInstall(false);
      }
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error during PWA install:', error);
    }
  };

  return { canInstall, promptInstall };
};
