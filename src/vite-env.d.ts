
/// <reference types="vite/client" />

// Add PaystackPop typing for Paystack JS integration
interface Window {
  PaystackPop?: {
    setup: (options: any) => { openIframe: () => void } | undefined;
  };
}
