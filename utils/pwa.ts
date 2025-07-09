// PWA utility functions
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export class PWAManager {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private isInstalled = false;
  private installCallbacks: Array<(canInstall: boolean) => void> = [];
  private isInitialized = false;

  constructor() {
    // No inicializar inmediatamente para evitar problemas de SSR
  }

  private init() {
    // Verificar que estemos en el cliente
    if (typeof window === 'undefined') {
      console.log('PWA: Skipping initialization on server side');
      return;
    }

    if (this.isInitialized) {
      return;
    }

    this.isInitialized = true;

    // Check if app is already installed
    this.checkInstallStatus();

    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('PWA: beforeinstallprompt event fired');
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      this.notifyInstallCallbacks(true);
    });

    // Listen for appinstalled event
    window.addEventListener('appinstalled', () => {
      console.log('PWA: App was installed');
      this.isInstalled = true;
      this.deferredPrompt = null;
      this.notifyInstallCallbacks(false);
    });

    // Register service worker
    this.registerServiceWorker();
  }

  private checkInstallStatus() {
    // Verificar que estemos en el cliente
    if (typeof window === 'undefined') {
      return;
    }

    // Check if running in standalone mode (installed)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
      console.log('PWA: App is running in standalone mode');
    }

    // Check for iOS Safari standalone mode
    if ((window.navigator as any).standalone === true) {
      this.isInstalled = true;
      console.log('PWA: App is running in iOS standalone mode');
    }
  }

  private async registerServiceWorker() {
    if (typeof navigator === 'undefined') {
      return;
    }

    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        console.log('PWA: Service Worker registered successfully', registration);

        // Handle service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('PWA: New service worker available');
                // Optionally show update notification to user
                this.showUpdateNotification();
              }
            });
          }
        });
      } catch (error) {
        console.error('PWA: Service Worker registration failed', error);
      }
    } else {
      console.log('PWA: Service Worker not supported');
    }
  }

  private showUpdateNotification() {
    // You can implement a custom update notification here
    console.log('PWA: App update available');
  }

  private notifyInstallCallbacks(canInstall: boolean) {
    this.installCallbacks.forEach((callback) => callback(canInstall));
  }

  public async promptInstall(): Promise<boolean> {
    this.init();

    if (!this.deferredPrompt) {
      console.log('PWA: No install prompt available');
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const choiceResult = await this.deferredPrompt.userChoice;

      console.log('PWA: User choice:', choiceResult.outcome);

      if (choiceResult.outcome === 'accepted') {
        this.deferredPrompt = null;
        return true;
      }

      return false;
    } catch (error) {
      console.error('PWA: Error showing install prompt', error);
      return false;
    }
  }

  public canInstall(): boolean {
    this.init();
    return !this.isInstalled && this.deferredPrompt !== null;
  }

  public isAppInstalled(): boolean {
    this.init();
    return this.isInstalled;
  }

  public onInstallAvailable(callback: (canInstall: boolean) => void) {
    this.init();
    this.installCallbacks.push(callback);

    // Immediately call with current state
    callback(this.canInstall());
  }

  public removeInstallCallback(callback: (canInstall: boolean) => void) {
    const index = this.installCallbacks.indexOf(callback);
    if (index > -1) {
      this.installCallbacks.splice(index, 1);
    }
  }

  public async requestPersistentStorage(): Promise<boolean> {
    this.init();

    if (typeof navigator === 'undefined') {
      return false;
    }

    if ('storage' in navigator && 'persist' in navigator.storage) {
      try {
        const persistent = await navigator.storage.persist();
        console.log('PWA: Persistent storage:', persistent);
        return persistent;
      } catch (error) {
        console.error('PWA: Error requesting persistent storage', error);
        return false;
      }
    }
    return false;
  }

  public async getStorageEstimate() {
    this.init();

    if (typeof navigator === 'undefined') {
      return null;
    }

    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        console.log('PWA: Storage estimate:', estimate);
        return estimate;
      } catch (error) {
        console.error('PWA: Error getting storage estimate', error);
        return null;
      }
    }
    return null;
  }
}

// Create singleton instance
export const pwaManager = new PWAManager();
