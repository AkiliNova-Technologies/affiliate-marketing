// utils/sdkUtils.ts
// Covers endpoints that don't need Redux state:
//   GET /api/v1/public/sdk/bootstrap
//   GET /api/v1/public/sdk/checkout.js   (script tag injection)
//   GET /hop                              (redirect — navigate only)
//   POST /api/v1/public/vendor-webhook-consumer  (local dev HMAC test)

import api from "@/utils/api";
import { handleApiError } from "@/redux/slices/authSlice";

export interface SdkBootstrapConfig {
  productId: string;
  productName?: string;
  price?: number;
  currency?: string;
  vendorName?: string;
  checkoutOrigin?: string;
  stripePublicKey?: string;
  [key: string]: any;
}

/**
 * GET /api/v1/public/sdk/bootstrap
 * Resolve public SDK checkout configuration for a product and origin.
 */
export async function fetchSdkBootstrap(
  productId: string,
  origin?: string
): Promise<SdkBootstrapConfig> {
  try {
    const { data } = await api.get("/api/v1/public/sdk/bootstrap", {
      params: { productId, origin: origin ?? window?.location?.origin },
    });
    return data as SdkBootstrapConfig;
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

/**
 * GET /api/v1/public/sdk/checkout.js
 * Injects the official tek.affiliate checkout SDK script into the document.
 * Call once per page load — idempotent (checks for existing script tag).
 */
export function injectCheckoutSdk(
  baseUrl = "",
  onLoad?: () => void,
  onError?: (e: ErrorEvent) => void
): void {
  const scriptId = "tek-affiliate-checkout-sdk";
  if (document.getElementById(scriptId)) {
    onLoad?.();
    return;
  }
  const script = document.createElement("script");
  script.id = scriptId;
  script.src = `${baseUrl}/api/v1/public/sdk/checkout.js`;
  script.async = true;
  if (onLoad) script.onload = () => onLoad();
  if (onError) script.onerror = (e) => onError(e as ErrorEvent);
  document.head.appendChild(script);
}

/**
 * Build a /hop URL for a given affiliate token.
 * The browser should navigate to this URL — it will log the click,
 * set attribution, and redirect to the vendor sales page.
 */
export function buildHopUrl(hopToken: string, baseUrl = ""): string {
  return `${baseUrl}/hop?token=${encodeURIComponent(hopToken)}`;
}

/**
 * POST /api/v1/public/vendor-webhook-consumer
 * Local dev only — simulate a vendor webhook receiver and verify HMAC.
 */
export async function simulateVendorWebhook(
  payload: Record<string, any>,
  signature: string
): Promise<{ verified: boolean; [key: string]: any }> {
  try {
    const { data } = await api.post(
      "/api/v1/public/vendor-webhook-consumer",
      payload,
      { headers: { "x-webhook-signature": signature } }
    );
    return data;
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}