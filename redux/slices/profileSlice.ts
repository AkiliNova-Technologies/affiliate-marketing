// redux/slices/profileSlice.ts
// Endpoints:
//   GET   /api/v1/me/profile
//   PATCH /api/v1/me/profile
//   PATCH /api/v1/me/password
//   GET   /api/v1/users/profile      (alias)
//   PATCH /api/v1/users/profile      (alias)

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/utils/api";
import { handleApiError } from "./authSlice";

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  bio?: string;
  [key: string]: any;
}

interface ProfileState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  updateLoading: boolean;
  passwordLoading: boolean;
}

const initialState: ProfileState = {
  profile: null,
  loading: false,
  error: null,
  updateLoading: false,
  passwordLoading: false,
};

/** GET /api/v1/me/profile */
export const fetchMyProfile = createAsyncThunk(
  "profile/fetchMine",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/api/v1/me/profile");
      return data as UserProfile;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

/** PATCH /api/v1/me/profile */
export const updateMyProfile = createAsyncThunk(
  "profile/updateMine",
  async (payload: Partial<UserProfile>, { rejectWithValue }) => {
    try {
      const { data } = await api.patch("/api/v1/me/profile", payload);
      return data as UserProfile;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

/** PATCH /api/v1/me/password */
export const changeMyPassword = createAsyncThunk(
  "profile/changePassword",
  async (
    { currentPassword, newPassword }: { currentPassword: string; newPassword: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.patch("/api/v1/me/password", {
        currentPassword,
        newPassword,
      });
      return { message: data.message || "Password changed successfully" };
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearError(state) { state.error = null; },
    clearProfile(state) { state.profile = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyProfile.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchMyProfile.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.profile = payload;
      })
      .addCase(fetchMyProfile.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      })
      .addCase(updateMyProfile.pending, (state) => { state.updateLoading = true; state.error = null; })
      .addCase(updateMyProfile.fulfilled, (state, { payload }) => {
        state.updateLoading = false;
        state.profile = payload;
      })
      .addCase(updateMyProfile.rejected, (state, { payload }) => {
        state.updateLoading = false;
        state.error = payload as string;
      })
      .addCase(changeMyPassword.pending, (state) => { state.passwordLoading = true; state.error = null; })
      .addCase(changeMyPassword.fulfilled, (state) => { state.passwordLoading = false; })
      .addCase(changeMyPassword.rejected, (state, { payload }) => {
        state.passwordLoading = false;
        state.error = payload as string;
      });
  },
});

export const { clearError, clearProfile } = profileSlice.actions;
export default profileSlice.reducer;

export const selectMyProfile = (s: { profile: ProfileState }) => s.profile.profile;
export const selectProfileLoading = (s: { profile: ProfileState }) => s.profile.loading;
export const selectProfileUpdateLoading = (s: { profile: ProfileState }) => s.profile.updateLoading;
export const selectProfilePasswordLoading = (s: { profile: ProfileState }) => s.profile.passwordLoading;
export const selectProfileError = (s: { profile: ProfileState }) => s.profile.error;