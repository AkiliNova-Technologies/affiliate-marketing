import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

import authReducer from "./slices/authSlice";
import adminVendorsReducer from "./slices/adminVendorsSlice";
import adminMarketersReducer from "./slices/adminMarketersSlice";
import adminProductsReducer from "./slices/adminProductsSlice";
import adminSchedulerReducer from "./slices/adminSchedulerSlice";
import vendorProductsReducer from "./slices/vendorProductsSlice";
import marketplaceReducer from "./slices/marketplaceSlice";
import categoriesReducer from "./slices/categoriesSlice";
import profileReducer from "./slices/profileSlice";

// ─── Persist configs ───────────────────────────────────────────────────────────

const authPersistConfig = {
  key: "auth",
  storage,
  version: 1,
  // Persist the user object and auth flag so the session survives a refresh
  whitelist: ["user", "isAuthenticated"],
  blacklist: ["loading", "error", "initialLoading", "sessions", "marketerRegistration"],
};

// ─── Root reducer ──────────────────────────────────────────────────────────────

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  adminVendors: adminVendorsReducer,
  adminMarketers: adminMarketersReducer,
  adminProducts: adminProductsReducer,
  adminScheduler: adminSchedulerReducer,
  vendorProducts: vendorProductsReducer,
  marketplace: marketplaceReducer,
  categories: categoriesReducer,
  profile: profileReducer,
});

// ─── Store ─────────────────────────────────────────────────────────────────────

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        ignoredActionPaths: ["meta.arg", "payload.timestamp"],
        ignoredPaths: [],
      },
    }),
  devTools: process.env.NODE_ENV !== "production",
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const purgePersist = async () => {
  await persistor.purge();
  console.log("✅ Persisted state purged");
};