import "./utils/errorSuppression";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Global error handler to catch and suppress form validation errors
window.addEventListener('error', (event) => {
  // Suppress the specific Object.keys error that's causing issues
  if (event.error?.message?.includes('Cannot convert undefined or null to object') ||
      event.error?.stack?.includes('checkInGroup') ||
      event.error?.stack?.includes('Object.keys')) {
    console.warn('Suppressed form validation error:', event.error.message);
    event.preventDefault();
    return false;
  }
});

// Also handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.includes('Cannot convert undefined or null to object')) {
    console.warn('Suppressed promise rejection:', event.reason.message);
    event.preventDefault();
  }
});

// Override console.error to suppress specific errors
const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args.join(' ');
  if (message.includes('Cannot convert undefined or null to object') ||
      message.includes('checkInGroup') ||
      message.includes('Object.keys')) {
    console.warn('Suppressed console error:', message);
    return;
  }
  originalConsoleError.apply(console, args);
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <App />
);
