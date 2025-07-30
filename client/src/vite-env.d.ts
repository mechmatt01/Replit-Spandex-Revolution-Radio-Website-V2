/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_RADIO_STREAM_URL: string;
  readonly VITE_RADIO_STREAM_URL_BACKUP: string;
  readonly VITE_GOOGLE_MAPS_API_KEY: string;
  readonly VITE_WEATHER_API_KEY: string;
  readonly VITE_RECAPTCHA_SITE_KEY: string;
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string;
  readonly VITE_PAYPAL_CLIENT_ID: string;
  readonly VITE_SHOPIFY_STOREFRONT_TOKEN: string;
  readonly VITE_SHOPIFY_DOMAIN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Global notification function
declare global {
  interface Window {
    showNotification?: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  }
}

export {};

declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.jpg" {
  const src: string;
  export default src;
}

declare module "*.jpeg" {
  const src: string;
  export default src;
}

declare module "*.gif" {
  const src: string;
  export default src;
}

declare module "*.svg" {
  const src: string;
  export default src;
}

declare module "*.webp" {
  const src: string;
  export default src;
}