
"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/redux/store";
import { useEffect } from "react";
import { restoreAccessToken } from "@/utils/api";

function PersistLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="size-10 animate-spin rounded-full border-4 border-[#F97316] border-t-transparent" />
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