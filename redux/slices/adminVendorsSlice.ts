// redux/slices/adminVendorsSlice.ts
// Endpoints:
//   GET   /api/v1/admin/vendors
//   GET   /api/v1/admin/vendors/{id}
//   POST  /api/v1/admin/vendors/registration
//   POST  /api/v1/admin/vendors/{id}/resend-invite
//   PATCH /api/v1/admin/vendors/{id}
//   PATCH /api/v1/admin/vendors/{id}/status

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/utils/api";
import { handleApiError } from "./authSlice";

export interface VendorProfile {
  id: string;
  type: string;
  businessName: string | null;
  businessDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Vendor {
  id: string;
  role?: string;
  email: string;
  status:
    | "PENDING_ACTIVATION"
    | "ACTIVE"
    | "SUSPENDED"
    | "DEACTIVATED"
    | string;
  firstName: string;
  lastName: string;
  phone?: string;
  phoneNumber?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  createdAt: string;
  updatedAt?: string;
  profile?: VendorProfile;
  businessName?: string;
  productsCount?: number;
  revenue?: number;
  [key: string]: any;
}

interface AdminVendorsState {
  vendors: Vendor[];
  selectedVendor: Vendor | null;
  total: number;
  page: number;
  loading: boolean;
  error: string | null;
  actionLoading: boolean;
}

const initialState: AdminVendorsState = {
  vendors: [],
  selectedVendor: null,
  total: 0,
  page: 1,
  loading: false,
  error: null,
  actionLoading: false,
};

/** GET /api/v1/admin/vendors */
export const fetchAdminVendors = createAsyncThunk(
  "adminVendors/fetchAll",
  async (
    params: {
      page?: number;
      limit?: number;
      status?: string;
      search?: string;
    } = {},
    { rejectWithValue },
  ) => {
    try {
      const { data } = await api.get("/api/v1/admin/vendors", { params });
      // API returns { vendors: [...], total?, count? } or array directly
      const vendors = (data.vendors || data.data || data) as Vendor[];
      return {
        vendors,
        total: data.total ?? data.count ?? vendors.length,
        page: params.page || 1,
      };
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  },
);

/** GET /api/v1/admin/vendors/{id} */
export const fetchAdminVendorById = createAsyncThunk(
  "adminVendors/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/api/v1/admin/vendors/${id}`);
      return data as Vendor;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  },
);

/** POST /api/v1/admin/vendors/registration
 *  Body: { email, contactFirstName, contactLastName, businessName, contactPhone? }
 */
export const registerVendor = createAsyncThunk(
  "adminVendors/register",
  async (
    payload: {
      email: string;
      contactFirstName: string;
      contactLastName: string;
      businessName?: string;
      contactPhone?: string;
      [key: string]: any;
    },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await api.post(
        "/api/v1/admin/vendors/registration",
        payload,
      );
      return data as Vendor;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  },
);

/** POST /api/v1/admin/vendors/{id}/resend-invite */
export const resendVendorInvite = createAsyncThunk(
  "adminVendors/resendInvite",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await api.post(
        `/api/v1/admin/vendors/${id}/resend-invite`,
        {},
      );
      return { id, message: data.message };
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  },
);

/** PATCH /api/v1/admin/vendors/{id}
 *  Body uses contactFirstName / contactLastName / contactPhone to match registration API
 */
export const updateAdminVendor = createAsyncThunk(
  "adminVendors/update",
  async (
    {
      id,
      payload,
    }: {
      id: string;
      payload: {
        businessName?: string;
        contactFirstName?: string;
        contactLastName?: string;
        contactPhone?: string;
        email?: string;
        [key: string]: any;
      };
    },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await api.patch(`/api/v1/admin/vendors/${id}`, payload);
      return data as Vendor;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  },
);

/** PATCH /api/v1/admin/vendors/{id}/activate
 *  Activates a vendor that is currently in PENDING_ACTIVATION state.
 */
export const activatePendingVendor = createAsyncThunk(
  "adminVendors/activate",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(
        `/api/v1/admin/vendors/${id}/activate`,
        {},
      );
      return data as Vendor;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  },
);

/** PATCH /api/v1/admin/vendors/{id}/status */
export const updateVendorStatus = createAsyncThunk(
  "adminVendors/updateStatus",
  async (
    { id, status }: { id: string; status: "SUSPENDED" | "ACTIVE" },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await api.patch(`/api/v1/admin/vendors/${id}/status`, {
        status,
      });
      return data as Vendor;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  },
);

// ─── Helper ───────────────────────────────────────────────────────────────────

const upsertVendor = (vendors: Vendor[], updated: Vendor) => {
  const idx = vendors.findIndex((v) => v.id === updated.id);
  if (idx !== -1) vendors[idx] = updated;
  else vendors.unshift(updated);
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const adminVendorsSlice = createSlice({
  name: "adminVendors",
  initialState,
  reducers: {
    clearSelectedVendor(state) {
      state.selectedVendor = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminVendors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminVendors.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.vendors = payload.vendors;
        state.total = payload.total;
        state.page = payload.page;
      })
      .addCase(fetchAdminVendors.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      })

      .addCase(fetchAdminVendorById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminVendorById.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.selectedVendor = payload;
      })
      .addCase(fetchAdminVendorById.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      })

      .addCase(registerVendor.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(registerVendor.fulfilled, (state, { payload }) => {
        state.actionLoading = false;
        state.vendors.unshift(payload);
        state.total += 1;
      })
      .addCase(registerVendor.rejected, (state, { payload }) => {
        state.actionLoading = false;
        state.error = payload as string;
      })

      .addCase(resendVendorInvite.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(resendVendorInvite.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(resendVendorInvite.rejected, (state, { payload }) => {
        state.actionLoading = false;
        state.error = payload as string;
      })

      .addCase(activatePendingVendor.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(activatePendingVendor.fulfilled, (state, { payload }) => {
        state.actionLoading = false;
        upsertVendor(state.vendors, payload);
        if (state.selectedVendor?.id === payload.id)
          state.selectedVendor = payload;
      })
      .addCase(activatePendingVendor.rejected, (state, { payload }) => {
        state.actionLoading = false;
        state.error = payload as string;
      })

      .addCase(updateAdminVendor.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateAdminVendor.fulfilled, (state, { payload }) => {
        state.actionLoading = false;
        upsertVendor(state.vendors, payload);
        if (state.selectedVendor?.id === payload.id)
          state.selectedVendor = payload;
      })
      .addCase(updateAdminVendor.rejected, (state, { payload }) => {
        state.actionLoading = false;
        state.error = payload as string;
      })

      .addCase(updateVendorStatus.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateVendorStatus.fulfilled, (state, { payload }) => {
        state.actionLoading = false;
        upsertVendor(state.vendors, payload);
        if (state.selectedVendor?.id === payload.id)
          state.selectedVendor = payload;
      })
      .addCase(updateVendorStatus.rejected, (state, { payload }) => {
        state.actionLoading = false;
        state.error = payload as string;
      });
  },
});

export const { clearSelectedVendor, clearError } = adminVendorsSlice.actions;
export default adminVendorsSlice.reducer;

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectAdminVendors = (s: { adminVendors: AdminVendorsState }) =>
  s.adminVendors.vendors;
export const selectSelectedVendor = (s: { adminVendors: AdminVendorsState }) =>
  s.adminVendors.selectedVendor;
export const selectAdminVendorsLoading = (s: {
  adminVendors: AdminVendorsState;
}) => s.adminVendors.loading;
export const selectAdminVendorsError = (s: {
  adminVendors: AdminVendorsState;
}) => s.adminVendors.error;
export const selectAdminVendorsTotal = (s: {
  adminVendors: AdminVendorsState;
}) => s.adminVendors.total;
export const selectAdminVendorsActionLoading = (s: {
  adminVendors: AdminVendorsState;
}) => s.adminVendors.actionLoading;
