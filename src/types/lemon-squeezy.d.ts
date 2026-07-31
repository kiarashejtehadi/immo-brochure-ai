export {};

declare global {
  interface LemonSqueezyGlobal {
    Setup?: (options: { eventHandler?: (event: { event: string }) => void }) => void;
    Url: {
      Open: (url: string) => void;
    };
    Refresh?: () => void;
  }

  interface Window {
    LemonSqueezy?: LemonSqueezyGlobal;
    createLemonSqueezy?: () => void;
  }
}
