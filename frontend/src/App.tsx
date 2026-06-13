import { BrowserRouter } from "react-router-dom";
import { Suspense } from "react";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { Toaster } from "sonner";
import ErrorBoundary from "@/components/ErrorBoundary";
import LoadingSpinner from "@/components/LoadingSpinner";
import OfflineIndicator from "@/components/OfflineIndicator";
import ErrorNotice from "@/components/ErrorNotice";

export default function App() {

  return (
    <ErrorBoundary>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthProvider>
          <LanguageProvider>
            <Suspense fallback={<LoadingSpinner fullScreen text="Loading application..." />}>
              <AppRoutes />
            </Suspense>
            <OfflineIndicator />
            <ErrorNotice />
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
      
      {/* Toaster */}
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#ffffff',
            color: '#111827',
            border: '1px solid #e5e7eb',
            fontFamily: "'Inter', sans-serif",
          },
        }}
      />
    </ErrorBoundary>
  );
}
