// redux/hooks/useReduxAdminCampaigns.ts
// Covers: GET /api/v1/admin/campaigns
//         GET /api/v1/admin/marketers/{id}/campaigns

import { useCallback } from "react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchAdminCampaigns,
  fetchMarketerCampaigns,
  clearMarketerCampaigns,
  selectAdminCampaigns,
  selectAdminCampaignsTotal,
  selectAdminCampaignsLoading,
  selectMarketerCampaigns,
  selectMarketerCampaignsTotal,
  selectMarketerCampaignsLoading,
  selectAdminCampaignsError,
} from "@/redux/slices/adminCampaignsSlice";

export function useReduxAdminCampaigns() {
  const dispatch = useAppDispatch();

  const campaigns = useAppSelector(selectAdminCampaigns);
  const total = useAppSelector(selectAdminCampaignsTotal);
  const loading = useAppSelector(selectAdminCampaignsLoading);
  const marketerCampaigns = useAppSelector(selectMarketerCampaigns);
  const marketerTotal = useAppSelector(selectMarketerCampaignsTotal);
  const marketerLoading = useAppSelector(selectMarketerCampaignsLoading);
  const error = useAppSelector(selectAdminCampaignsError);

  const loadCampaigns = useCallback(
    async (params?: {
      page?: number;
      limit?: number;
      marketerId?: string;
      productId?: string;
      vendorId?: string;
    }) => {
      try {
        return await dispatch(fetchAdminCampaigns(params ?? {})).unwrap();
      } catch (err: any) {
        toast.error(err || "Failed to load campaigns");
      }
    },
    [dispatch]
  );

  const loadMarketerCampaigns = useCallback(
    async (id: string, params?: { page?: number; limit?: number }) => {
      try {
        return await dispatch(
          fetchMarketerCampaigns({ id, params: params ?? {} })
        ).unwrap();
      } catch (err: any) {
        toast.error(err || "Failed to load marketer campaigns");
      }
    },
    [dispatch]
  );

  const resetMarketerCampaigns = useCallback(() => {
    dispatch(clearMarketerCampaigns());
  }, [dispatch]);

  return {
    campaigns,
    total,
    loading,
    marketerCampaigns,
    marketerTotal,
    marketerLoading,
    error,
    loadCampaigns,
    loadMarketerCampaigns,
    resetMarketerCampaigns,
  };
}