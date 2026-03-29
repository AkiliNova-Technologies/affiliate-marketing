
"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/redux/store";
import { useEffect } from "react";
import { restoreAccessToken } from "@/utils/api";
import { cn } from "@/lib/utils";

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("size-4 animate-spin", className)}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

function PersistLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Spinner className="size-8 text-[#F97316]" />
    </div>
  );
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
    restoreAccessToken();
  }, []);
  return (
    <Provider store={store}>
      <PersistGate loading={<PersistLoadingScreen />} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}