// redux/hooks/useReduxVendorWebhooks.ts
// Covers:
//   POST /api/v1/vendor/webhooks/test
//   GET  /api/v1/vendor/webhooks/deliveries
//   GET  /api/v1/public/vendor-webhook-consumer/events  (local dev only)

import { useCallback } from "react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  triggerTestWebhook,
  fetchWebhookDeliveries,
  fetchConsumerEvents,
  clearConsumerEvents,
  selectWebhookDeliveries,
  selectWebhookDeliveriesTotal,
  selectWebhookDeliveriesLoading,
  selectWebhookTestLoading,
  selectConsumerEvents,
  selectConsumerEventsLoading,
  selectVendorWebhooksError,
} from "@/redux/slices/vendorWebhooksSlice";

export function useReduxVendorWebhooks() {
  const dispatch = useAppDispatch();

  const deliveries = useAppSelector(selectWebhookDeliveries);
  const deliveriesTotal = useAppSelector(selectWebhookDeliveriesTotal);
  const deliveriesLoading = useAppSelector(selectWebhookDeliveriesLoading);
  const testLoading = useAppSelector(selectWebhookTestLoading);
  const consumerEvents = useAppSelector(selectConsumerEvents);
  const consumerLoading = useAppSelector(selectConsumerEventsLoading);
  const error = useAppSelector(selectVendorWebhooksError);

  const testWebhook = useCallback(
    async (payload: { productId?: string; [key: string]: any } = {}) => {
      try {
        const result = await dispatch(triggerTestWebhook(payload)).unwrap();
        toast.success(result.message || "Test webhook sent!");
        return result;
      } catch (err: any) {
        toast.error(err || "Failed to send test webhook");
        throw err;
      }
    },
    [dispatch]
  );

  const loadDeliveries = useCallback(
    async (params?: { page?: number; limit?: number; status?: string }) => {
      try {
        return await dispatch(fetchWebhookDeliveries(params ?? {})).unwrap();
      } catch (err: any) {
        toast.error(err || "Failed to load webhook deliveries");
      }
    },
    [dispatch]
  );

  const loadConsumerEvents = useCallback(async () => {
    try {
      return await dispatch(fetchConsumerEvents()).unwrap();
    } catch (err: any) {
      toast.error(err || "Failed to load consumer events");
    }
  }, [dispatch]);

  const resetConsumerEvents = useCallback(() => {
    dispatch(clearConsumerEvents());
  }, [dispatch]);

  return {
    deliveries,
    deliveriesTotal,
    deliveriesLoading,
    testLoading,
    consumerEvents,
    consumerLoading,
    error,
    testWebhook,
    loadDeliveries,
    loadConsumerEvents,
    resetConsumerEvents,
  };
}