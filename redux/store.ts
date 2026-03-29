// redux/store.ts

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

// ── Existing slices ────────────────────────────────────────────────────────────
import authReducer from "./slices/authSlice";
import adminStaffReducer from "./slices/adminStaffSlice";
import adminVendorsReducer from "./slices/adminVendorsSlice";
import adminMarketersReducer from "./slices/adminMarketersSlice";
import adminProductsReducer from "./slices/adminProductsSlice";
import adminSchedulerReducer from "./slices/adminSchedulerSlice";
import vendorProductsReducer from "./slices/vendorProductsSlice";
import marketplaceReducer from "./slices/marketplaceSlice";
import categoriesReducer from "./slices/categoriesSlice";
import profileReducer from "./slices/profileSlice";

// ── New slices ─────────────────────────────────────────────────────────────────
import affiliateLinksReducer from "./slices/affiliateLinksSlice";
import campaignsReducer from "./slices/campaignsSlice";
import adminCampaignsReducer from "./slices/adminCampaignsSlice";
import checkoutReducer from "./slices/checkoutSlice";
import vendorWebhooksReducer from "./slices/vendorWebhooksSlice";

// ─── Persist configs ───────────────────────────────────────────────────────────

const authPersistConfig = {
  key: "auth",
  storage,
  version: 1,
  whitelist: ["user", "isAuthenticated"],
  blacklist: [
    "loading",
    "error",
    "initialLoading",
    "sessions",
    "marketerRegistration",
  ],
};

// ─── Root reducer ──────────────────────────────────────────────────────────────

const rootReducer = combineReducers({
  // Auth
  auth: persistReducer(authPersistConfig, authReducer),

  // Admin
  adminStaff: adminStaffReducer,
  adminVendors: adminVendorsReducer,
  adminMarketers: adminMarketersReducer,
  adminProducts: adminProductsReducer,
  adminScheduler: adminSchedulerReducer,
  adminCampaigns: adminCampaignsReducer,

  // Vendor
  vendorProducts: vendorProductsReducer,
  vendorWebhooks: vendorWebhooksReducer,

  // Marketer
  affiliateLinks: affiliateLinksReducer,
  campaigns: campaignsReducer,

  // Shared / public
  marketplace: marketplaceReducer,
  categories: categoriesReducer,
  checkout: checkoutReducer,

  // User
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