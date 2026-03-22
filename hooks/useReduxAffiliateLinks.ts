// redux/hooks/useReduxAffiliateLinks.ts
// Covers: POST/GET /api/v1/marketer/affiliate-links

import { useCallback } from "react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchAffiliateLinks,
  generateAffiliateLink,
  selectAffiliateLinks,
  selectAffiliateLinksTotal,
  selectAffiliateLinksLoading,
  selectAffiliateLinksError,
  selectAffiliateLinksActionLoading,
  type AffiliateLinksFilters,
} from "@/redux/slices/affiliateLinksSlice";

export function useReduxAffiliateLinks() {
  const dispatch = useAppDispatch();

  const links = useAppSelector(selectAffiliateLinks);
  const total = useAppSelector(selectAffiliateLinksTotal);
  const loading = useAppSelector(selectAffiliateLinksLoading);
  const error = useAppSelector(selectAffiliateLinksError);
  const actionLoading = useAppSelector(selectAffiliateLinksActionLoading);

  const loadLinks = useCallback(
    async (params?: AffiliateLinksFilters) => {
      try {
        return await dispatch(fetchAffiliateLinks(params ?? {})).unwrap();
      } catch (err: any) {
        toast.error(err || "Failed to load affiliate links");
      }
    },
    [dispatch]
  );

  const generateLink = useCallback(
    async (payload: { productId: string; [key: string]: any }) => {
      try {
        const result = await dispatch(generateAffiliateLink(payload)).unwrap();
        toast.success("Affiliate link generated!");
        return result;
      } catch (err: any) {
        toast.error(err || "Failed to generate affiliate link");
        throw err;
      }
    },
    [dispatch]
  );

  return {
    links,
    total,
    loading,
    error,
    actionLoading,
    loadLinks,
    generateLink,
  };
}