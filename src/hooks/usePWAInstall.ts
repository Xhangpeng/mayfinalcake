import { useState, useEffect } from 'react';

export interface PWAInstallProps {
  canInstall: boolean;
  promptInstall: () => void;
}

export const usePWAInstall = (): PWAInstallProps => {
  const [canInstall, setCanInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setCanInstall(false);
      setDeferredPrompt(null);
    };

    // Custom event from index.html
    window.addEventListener(
      'pwaReadyToInstall' as any,
      (e: any) => {
        setDeferredPrompt(e.detail?.prompt);
        setCanInstall(true);
      }
    );

    window.addEventListener('pwaInstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('pwaInstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setCanInstall(false);
    }
    setDeferredPrompt(null);
  };

  return { canInstall, promptInstall };
};
