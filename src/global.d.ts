// src/global.d.ts
declare global {
  interface Window {
    recaptchaVerifier: any; // You can specify a more precise type if needed
  }
}

// This line is necessary to make the file a module
export {};
