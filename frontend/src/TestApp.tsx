import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";

// Simple test component
function SimpleTest() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Simple Test Page</h1>
      <p className="text-green-600">✅ If you can see this without errors, the basic app is working!</p>
      <div className="mt-4 space-y-2">
        <a href="/login" className="block text-blue-600 hover:underline">Go to Login</a>
        <a href="/register" className="block text-blue-600 hover:underline">Go to Register</a>
        <a href="/assessment" className="block text-blue-600 hover:underline">Go to Assessment (might cause error)</a>
      </div>
    </div>
  );
}

export default function TestApp() {
  return (
    <ErrorBoundary>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route path="*" element={<SimpleTest />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}