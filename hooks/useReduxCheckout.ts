// redux/hooks/useReduxCheckout.ts
// Covers:
//   POST /api/v1/checkout/intent
//   POST /api/v1/checkout/confirm
//   GET  /api/v1/checkout/intents/{intentId}/status

import { useCallback } from "react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  createCheckoutIntent,
  confirmCheckout,
  fetchCheckoutIntentStatus,
  clearCheckout,
  selectCheckoutIntent,
  selectCheckoutIntentStatus,
  selectCheckoutLoading,
  selectCheckoutConfirmLoading,
  selectCheckoutStatusLoading,
  selectCheckoutError,
  type CreateIntentPayload,
  type ConfirmCheckoutPayload,
} from "@/redux/slices/checkoutSlice";

export function useReduxCheckout() {
  const dispatch = useAppDispatch();

  const intent = useAppSelector(selectCheckoutIntent);
  const intentStatus = useAppSelector(selectCheckoutIntentStatus);
  const loading = useAppSelector(selectCheckoutLoading);
  const confirmLoading = useAppSelector(selectCheckoutConfirmLoading);
  const statusLoading = useAppSelector(selectCheckoutStatusLoading);
  const error = useAppSelector(selectCheckoutError);

  const initCheckout = useCallback(
    async (payload: CreateIntentPayload) => {
      try {
        return await dispatch(createCheckoutIntent(payload)).unwrap();
      } catch (err: any) {
        toast.error(err || "Failed to create checkout session");
        throw err;
      }
    },
    [dispatch]
  );

  const confirmPayment = useCallback(
    async (payload: ConfirmCheckoutPayload) => {
      try {
        const result = await dispatch(confirmCheckout(payload)).unwrap();
        return result;
      } catch (err: any) {
        toast.error(err || "Payment confirmation failed");
        throw err;
      }
    },
    [dispatch]
  );

  const pollIntentStatus = useCallback(
    async (intentId: string) => {
      try {
        return await dispatch(fetchCheckoutIntentStatus(intentId)).unwrap();
      } catch (err: any) {
        toast.error(err || "Failed to fetch checkout status");
        throw err;
      }
    },
    [dispatch]
  );

  const resetCheckout = useCallback(() => {
    dispatch(clearCheckout());
  }, [dispatch]);

  return {
    intent,
    intentStatus,
    loading,
    confirmLoading,
    statusLoading,
    error,
    initCheckout,
    confirmPayment,
    pollIntentStatus,
    resetCheckout,
  };
}