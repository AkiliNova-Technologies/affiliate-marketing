// redux/hooks/useReduxProfile.ts
// Covers: GET/PATCH /api/v1/me/profile, PATCH /api/v1/me/password

import { useCallback } from "react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchMyProfile,
  updateMyProfile,
  changeMyPassword,
  selectMyProfile,
  selectProfileLoading,
  selectProfileUpdateLoading,
  selectProfilePasswordLoading,
  selectProfileError,
  type UserProfile,
} from "@/redux/slices/profileSlice";

export function useReduxProfile() {
  const dispatch = useAppDispatch();

  const profile = useAppSelector(selectMyProfile);
  const loading = useAppSelector(selectProfileLoading);
  const updateLoading = useAppSelector(selectProfileUpdateLoading);
  const passwordLoading = useAppSelector(selectProfilePasswordLoading);
  const error = useAppSelector(selectProfileError);

  const loadProfile = useCallback(async () => {
    try {
      return await dispatch(fetchMyProfile()).unwrap();
    } catch (err: any) {
      toast.error(err || "Failed to load profile");
    }
  }, [dispatch]);

  const saveProfile = useCallback(
    async (payload: Partial<UserProfile>) => {
      try {
        const result = await dispatch(updateMyProfile(payload)).unwrap();
        toast.success("Profile updated!");
        return result;
      } catch (err: any) {
        toast.error(err || "Profile update failed");
        throw err;
      }
    },
    [dispatch]
  );

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      try {
        const result = await dispatch(
          changeMyPassword({ currentPassword, newPassword })
        ).unwrap();
        toast.success(result.message || "Password changed!");
        return result;
      } catch (err: any) {
        toast.error(err || "Password change failed");
        throw err;
      }
    },
    [dispatch]
  );

  return {
    profile,
    loading,
    updateLoading,
    passwordLoading,
    error,
    loadProfile,
    saveProfile,
    changePassword,
  };
}