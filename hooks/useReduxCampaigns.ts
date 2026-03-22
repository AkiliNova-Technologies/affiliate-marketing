// redux/hooks/useReduxCampaigns.ts
// Covers: POST/GET/DELETE/PATCH /api/v1/marketer/campaigns

import { useCallback } from "react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchCampaigns,
  fetchCampaignById,
  createCampaign,
  deleteCampaign,
  updateCampaignStatus,
  clearSelectedCampaign,
  selectCampaigns,
  selectSelectedCampaign,
  selectCampaignsTotal,
  selectCampaignsLoading,
  selectCampaignsError,
  selectCampaignsActionLoading,
  type CreateCampaignPayload,
} from "@/redux/slices/campaignsSlice";

export function useReduxCampaigns() {
  const dispatch = useAppDispatch();

  const campaigns = useAppSelector(selectCampaigns);
  const selectedCampaign = useAppSelector(selectSelectedCampaign);
  const total = useAppSelector(selectCampaignsTotal);
  const loading = useAppSelector(selectCampaignsLoading);
  const error = useAppSelector(selectCampaignsError);
  const actionLoading = useAppSelector(selectCampaignsActionLoading);

  const loadCampaigns = useCallback(
    async (params?: { page?: number; limit?: number; status?: string }) => {
      try {
        return await dispatch(fetchCampaigns(params ?? {})).unwrap();
      } catch (err: any) {
        toast.error(err || "Failed to load campaigns");
      }
    },
    [dispatch]
  );

  const loadCampaignById = useCallback(
    async (id: string) => {
      try {
        return await dispatch(fetchCampaignById(id)).unwrap();
      } catch (err: any) {
        toast.error(err || "Failed to load campaign");
      }
    },
    [dispatch]
  );

  const addCampaign = useCallback(
    async (payload: CreateCampaignPayload) => {
      try {
        const result = await dispatch(createCampaign(payload)).unwrap();
        toast.success("Campaign created!");
        return result;
      } catch (err: any) {
        toast.error(err || "Failed to create campaign");
        throw err;
      }
    },
    [dispatch]
  );

  const removeCampaign = useCallback(
    async (id: string) => {
      try {
        await dispatch(deleteCampaign(id)).unwrap();
        toast.success("Campaign deleted");
      } catch (err: any) {
        toast.error(err || "Failed to delete campaign");
        throw err;
      }
    },
    [dispatch]
  );

  const changeCampaignStatus = useCallback(
    async (id: string, status: string) => {
      try {
        const result = await dispatch(updateCampaignStatus({ id, status })).unwrap();
        toast.success("Campaign status updated");
        return result;
      } catch (err: any) {
        toast.error(err || "Failed to update campaign status");
        throw err;
      }
    },
    [dispatch]
  );

  const deselectCampaign = useCallback(() => {
    dispatch(clearSelectedCampaign());
  }, [dispatch]);

  return {
    campaigns,
    selectedCampaign,
    total,
    loading,
    error,
    actionLoading,
    loadCampaigns,
    loadCampaignById,
    addCampaign,
    removeCampaign,
    changeCampaignStatus,
    deselectCampaign,
  };
}