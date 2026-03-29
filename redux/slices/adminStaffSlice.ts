// redux/slices/adminStaffSlice.ts
// Endpoints:
//   POST   /api/v1/admin/staff
//   GET    /api/v1/admin/staff
//   GET    /api/v1/admin/staff/{id}
//   PATCH  /api/v1/admin/staff/{id}
//   DELETE /api/v1/admin/staff/{id}
//   PATCH  /api/v1/admin/staff/{id}/suspend
//   PATCH  /api/v1/admin/staff/{id}/activate

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/utils/api";
import { handleApiError } from "./authSlice";

export interface StaffProfile {
  id: string;
  type: string;
  department?: string | null;
  jobTitle?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Staff {
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
  profile?: StaffProfile;
  [key: string]: any;
}

interface AdminStaffState {
  staff: Staff[];
  selectedStaff: Staff | null;
  total: number;
  page: number;
  loading: boolean;
  error: string | null;
  actionLoading: boolean;
}

const initialState: AdminStaffState = {
  staff: [],
  selectedStaff: null,
  total: 0,
  page: 1,
  loading: false,
  error: null,
  actionLoading: false,
};

/** POST /api/v1/admin/staff */
export const createStaff = createAsyncThunk(
  "adminStaff/create",
  async (
    payload: {
      email: string;
      firstName: string;
      lastName: string;
      phone?: string;
      department?: string;
      jobTitle?: string;
      [key: string]: any;
    },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await api.post("/api/v1/admin/staff", payload);
      return data as Staff;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  },
);

/** GET /api/v1/admin/staff */
export const fetchAdminStaff = createAsyncThunk(
  "adminStaff/fetchAll",
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
      const { data } = await api.get("/api/v1/admin/staff", { params });
      const staff = (data.staff || data.data || data) as Staff[];
      return {
        staff,
        total: data.total ?? data.count ?? staff.length,
        page: params.page || 1,
      };
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  },
);

/** GET /api/v1/admin/staff/{id} */
export const fetchAdminStaffById = createAsyncThunk(
  "adminStaff/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/api/v1/admin/staff/${id}`);
      return (data.staff ?? data) as Staff;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  },
);

/** PATCH /api/v1/admin/staff/{id} */
export const updateAdminStaff = createAsyncThunk(
  "adminStaff/update",
  async (
    {
      id,
      payload,
    }: {
      id: string;
      payload: {
        firstName?: string;
        lastName?: string;
        phone?: string;
        email?: string;
        department?: string;
        jobTitle?: string;
        [key: string]: any;
      };
    },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await api.patch(`/api/v1/admin/staff/${id}`, payload);
      return data as Staff;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  },
);

/** DELETE /api/v1/admin/staff/{id} */
export const deleteAdminStaff = createAsyncThunk(
  "adminStaff/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/api/v1/admin/staff/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  },
);

/** PATCH /api/v1/admin/staff/{id}/suspend */
export const suspendAdminStaff = createAsyncThunk(
  "adminStaff/suspend",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(
        `/api/v1/admin/staff/${id}/suspend`,
        {},
      );
      return data as Staff;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  },
);

/** PATCH /api/v1/admin/staff/{id}/activate
 *  Valid for both PENDING_ACTIVATION and SUSPENDED staff.
 */
export const activateAdminStaff = createAsyncThunk(
  "adminStaff/activate",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(
        `/api/v1/admin/staff/${id}/activate`,
        {},
      );
      return data as Staff;
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  },
);

// ─── Helper ───────────────────────────────────────────────────────────────────

const upsertStaff = (staff: Staff[], updated: Staff) => {
  const idx = staff.findIndex((s) => s.id === updated.id);
  if (idx !== -1) staff[idx] = updated;
  else staff.unshift(updated);
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const adminStaffSlice = createSlice({
  name: "adminStaff",
  initialState,
  reducers: {
    clearSelectedStaff(state) {
      state.selectedStaff = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // createStaff
      .addCase(createStaff.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createStaff.fulfilled, (state, { payload }) => {
        state.actionLoading = false;
        state.staff.unshift(payload);
        state.total += 1;
      })
      .addCase(createStaff.rejected, (state, { payload }) => {
        state.actionLoading = false;
        state.error = payload as string;
      })

      // fetchAdminStaff
      .addCase(fetchAdminStaff.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminStaff.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.staff = payload.staff;
        state.total = payload.total;
        state.page = payload.page;
      })
      .addCase(fetchAdminStaff.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      })

      // fetchAdminStaffById
      .addCase(fetchAdminStaffById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminStaffById.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.selectedStaff = payload;
      })
      .addCase(fetchAdminStaffById.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload as string;
      })

      // updateAdminStaff
      .addCase(updateAdminStaff.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateAdminStaff.fulfilled, (state, { payload }) => {
        state.actionLoading = false;
        upsertStaff(state.staff, payload);
        if (state.selectedStaff?.id === payload.id)
          state.selectedStaff = payload;
      })
      .addCase(updateAdminStaff.rejected, (state, { payload }) => {
        state.actionLoading = false;
        state.error = payload as string;
      })

      // deleteAdminStaff
      .addCase(deleteAdminStaff.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(deleteAdminStaff.fulfilled, (state, { payload: id }) => {
        state.actionLoading = false;
        state.staff = state.staff.filter((s) => s.id !== id);
        state.total = Math.max(0, state.total - 1);
        if (state.selectedStaff?.id === id) state.selectedStaff = null;
      })
      .addCase(deleteAdminStaff.rejected, (state, { payload }) => {
        state.actionLoading = false;
        state.error = payload as string;
      })

      // suspendAdminStaff
      .addCase(suspendAdminStaff.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(suspendAdminStaff.fulfilled, (state, { payload }) => {
        state.actionLoading = false;
        upsertStaff(state.staff, payload);
        if (state.selectedStaff?.id === payload.id)
          state.selectedStaff = payload;
      })
      .addCase(suspendAdminStaff.rejected, (state, { payload }) => {
        state.actionLoading = false;
        state.error = payload as string;
      })

      // activateAdminStaff
      .addCase(activateAdminStaff.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(activateAdminStaff.fulfilled, (state, { payload }) => {
        state.actionLoading = false;
        upsertStaff(state.staff, payload);
        if (state.selectedStaff?.id === payload.id)
          state.selectedStaff = payload;
      })
      .addCase(activateAdminStaff.rejected, (state, { payload }) => {
        state.actionLoading = false;
        state.error = payload as string;
      });
  },
});

export const { clearSelectedStaff, clearError } = adminStaffSlice.actions;
export default adminStaffSlice.reducer;

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectAdminStaff = (s: { adminStaff: AdminStaffState }) =>
  s.adminStaff.staff;
export const selectSelectedStaff = (s: { adminStaff: AdminStaffState }) =>
  s.adminStaff.selectedStaff;
export const selectAdminStaffLoading = (s: { adminStaff: AdminStaffState }) =>
  s.adminStaff.loading;
export const selectAdminStaffError = (s: { adminStaff: AdminStaffState }) =>
  s.adminStaff.error;
export const selectAdminStaffTotal = (s: { adminStaff: AdminStaffState }) =>
  s.adminStaff.total;
export const selectAdminStaffActionLoading = (s: {
  adminStaff: AdminStaffState;
}) => s.adminStaff.actionLoading;