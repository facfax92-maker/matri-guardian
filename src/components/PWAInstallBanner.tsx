import { usePWAInstall } from '@/hooks/use-pwa-install';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

export const PWAInstallBanner = () => {
  const { showBanner, install, dismissBanner } = usePWAInstall();

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 safe-area-bottom list-item-in">
      <div className="container max-w-lg mx-auto">
        <div className="bg-primary text-primary-foreground rounded-2xl p-4 shadow-lg flex items-center gap-3">
          <Download className="h-8 w-8 shrink-0 opacity-90" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">Install MatriCare</p>
            <p className="text-xs opacity-80">Add to your home screen for offline access</p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            className="shrink-0 rounded-xl btn-press"
            onClick={install}
          >
            Install
          </Button>
          <button onClick={dismissBanner} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
