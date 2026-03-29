// redux/hooks/useReduxAdmin.ts
// Covers: Admin Staff, Admin Vendors, Admin Marketers, Admin Products, Admin Scheduler, Categories

import { useCallback } from "react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";

// ── Admin Staff
import {
  createStaff,
  fetchAdminStaff,
  fetchAdminStaffById,
  updateAdminStaff,
  deleteAdminStaff,
  suspendAdminStaff,
  activateAdminStaff,
  clearSelectedStaff,
  selectAdminStaff,
  selectSelectedStaff,
  selectAdminStaffLoading,
  selectAdminStaffError,
  selectAdminStaffTotal,
  selectAdminStaffActionLoading,
  type Staff,
} from "@/redux/slices/adminStaffSlice";

// ── Admin Vendors
import {
  fetchAdminVendors,
  fetchAdminVendorById,
  registerVendor,
  resendVendorInvite,
  updateAdminVendor,
  updateVendorStatus,
  activatePendingVendor,
  clearSelectedVendor,
  selectAdminVendors,
  selectSelectedVendor,
  selectAdminVendorsLoading,
  selectAdminVendorsError,
  selectAdminVendorsTotal,
  selectAdminVendorsActionLoading,
  type Vendor,
} from "@/redux/slices/adminVendorsSlice";

// ── Admin Marketers
import {
  fetchMarketers,
  fetchMarketerById,
  selectMarketers,
  selectSelectedMarketer,
  selectMarketersLoading,
  selectMarketersError,
  selectMarketersTotal,
  type Marketer,
} from "@/redux/slices/adminMarketersSlice";

// ── Admin Products
import {
  fetchAdminProductQueue,
  fetchAdminProductById,
  approveProduct,
  rejectProduct,
  suspendProduct,
  reactivateProduct,
  clearSelectedProduct,
  selectAdminProductQueue,
  selectSelectedAdminProduct,
  selectAdminProductsLoading,
  selectAdminProductsError,
  selectAdminProductsTotal,
  selectAdminProductsActionLoading,
} from "@/redux/slices/adminProductsSlice";

// ── Admin Scheduler
import {
  fetchSchedulerStatus,
  runScheduler,
  selectSchedulerStatus,
  selectSchedulerLoading,
  selectSchedulerRunLoading,
  selectSchedulerError,
} from "@/redux/slices/adminSchedulerSlice";

// ── Categories
import {
  fetchCategories,
  fetchCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  selectCategories,
  selectSelectedCategory,
  selectCategoriesLoading,
  selectCategoriesError,
  selectCategoriesActionLoading,
} from "@/redux/slices/categoriesSlice";

export function useReduxAdmin() {
  const dispatch = useAppDispatch();

  // ─── Selectors ─────────────────────────────────────────────────────────────
  const staff = useAppSelector(selectAdminStaff);
  const selectedStaff = useAppSelector(selectSelectedStaff);
  const staffLoading = useAppSelector(selectAdminStaffLoading);
  const staffError = useAppSelector(selectAdminStaffError);
  const staffTotal = useAppSelector(selectAdminStaffTotal);
  const staffActionLoading = useAppSelector(selectAdminStaffActionLoading);

  const vendors = useAppSelector(selectAdminVendors);
  const selectedVendor = useAppSelector(selectSelectedVendor);
  const vendorsLoading = useAppSelector(selectAdminVendorsLoading);
  const vendorsError = useAppSelector(selectAdminVendorsError);
  const vendorsTotal = useAppSelector(selectAdminVendorsTotal);
  const vendorsActionLoading = useAppSelector(selectAdminVendorsActionLoading);

  const marketers = useAppSelector(selectMarketers);
  const selectedMarketer = useAppSelector(selectSelectedMarketer);
  const marketersLoading = useAppSelector(selectMarketersLoading);
  const marketersError = useAppSelector(selectMarketersError);
  const marketersTotal = useAppSelector(selectMarketersTotal);

  const productQueue = useAppSelector(selectAdminProductQueue);
  const selectedProduct = useAppSelector(selectSelectedAdminProduct);
  const productsLoading = useAppSelector(selectAdminProductsLoading);
  const productsError = useAppSelector(selectAdminProductsError);
  const productsTotal = useAppSelector(selectAdminProductsTotal);
  const productsActionLoading = useAppSelector(
    selectAdminProductsActionLoading,
  );

  const schedulerStatus = useAppSelector(selectSchedulerStatus);
  const schedulerLoading = useAppSelector(selectSchedulerLoading);
  const schedulerRunLoading = useAppSelector(selectSchedulerRunLoading);
  const schedulerError = useAppSelector(selectSchedulerError);

  const categories = useAppSelector(selectCategories);
  const selectedCategory = useAppSelector(selectSelectedCategory);
  const categoriesLoading = useAppSelector(selectCategoriesLoading);
  const categoriesError = useAppSelector(selectCategoriesError);
  const categoriesActionLoading = useAppSelector(selectCategoriesActionLoading);

  // ─── Staff actions ─────────────────────────────────────────────────────────

  const addStaff = useCallback(
    async (payload: Parameters<typeof createStaff>[0]) => {
      try {
        const result = await dispatch(createStaff(payload)).unwrap();
        toast.success(
          "Staff account created! They will activate on first login.",
        );
        return result;
      } catch (err: any) {
        toast.error(err || "Staff creation failed");
        throw err;
      }
    },
    [dispatch],
  );

  const loadStaff = useCallback(
    async (params?: Parameters<typeof fetchAdminStaff>[0]) => {
      try {
        return await dispatch(fetchAdminStaff(params ?? {})).unwrap();
      } catch (err: any) {
        toast.error(err || "Failed to load staff");
      }
    },
    [dispatch],
  );

  const loadStaffById = useCallback(
    async (id: string) => {
      try {
        return await dispatch(fetchAdminStaffById(id)).unwrap();
      } catch (err: any) {
        toast.error(err || "Failed to load staff member");
      }
    },
    [dispatch],
  );

  const editStaff = useCallback(
    async (id: string, payload: Partial<Staff>) => {
      try {
        const result = await dispatch(
          updateAdminStaff({ id, payload }),
        ).unwrap();
        toast.success("Staff member updated");
        return result;
      } catch (err: any) {
        toast.error(err || "Update failed");
        throw err;
      }
    },
    [dispatch],
  );

  const removeStaff = useCallback(
    async (id: string) => {
      try {
        await dispatch(deleteAdminStaff(id)).unwrap();
        toast.success("Staff account deleted");
      } catch (err: any) {
        toast.error(err || "Delete failed");
        throw err;
      }
    },
    [dispatch],
  );

  const suspendStaff = useCallback(
    async (id: string) => {
      try {
        const result = await dispatch(suspendAdminStaff(id)).unwrap();
        toast.success("Staff member suspended");
        return result;
      } catch (err: any) {
        toast.error(err || "Suspend failed");
        throw err;
      }
    },
    [dispatch],
  );

  const activateStaff = useCallback(
    async (id: string) => {
      try {
        const result = await dispatch(activateAdminStaff(id)).unwrap();
        toast.success("Staff member activated");
        return result;
      } catch (err: any) {
        toast.error(err || "Activation failed");
        throw err;
      }
    },
    [dispatch],
  );

  const deselectStaff = useCallback(() => {
    dispatch(clearSelectedStaff());
  }, [dispatch]);

  // ─── Vendor actions ─────────────────────────────────────────────────────────

  const loadVendors = useCallback(
    async (params?: Parameters<typeof fetchAdminVendors>[0]) => {
      try {
        return await dispatch(fetchAdminVendors(params ?? {})).unwrap();
      } catch (err: any) {
        toast.error(err || "Failed to load vendors");
      }
    },
    [dispatch],
  );

  const loadVendorById = useCallback(
    async (id: string) => {
      try {
        return await dispatch(fetchAdminVendorById(id)).unwrap();
      } catch (err: any) {
        toast.error(err || "Failed to load vendor");
      }
    },
    [dispatch],
  );

  const addVendor = useCallback(
    async (payload: Parameters<typeof registerVendor>[0]) => {
      try {
        const result = await dispatch(registerVendor(payload)).unwrap();
        toast.success("Vendor registered! Activation invite sent.");
        return result;
      } catch (err: any) {
        toast.error(err || "Vendor registration failed");
        throw err;
      }
    },
    [dispatch],
  );

  const resendInvite = useCallback(
    async (id: string) => {
      try {
        await dispatch(resendVendorInvite(id)).unwrap();
        toast.success("Invite resent!");
      } catch (err: any) {
        toast.error(err || "Failed to resend invite");
      }
    },
    [dispatch],
  );

  const editVendor = useCallback(
    async (id: string, payload: Partial<Vendor>) => {
      try {
        const result = await dispatch(
          updateAdminVendor({ id, payload }),
        ).unwrap();
        toast.success("Vendor updated");
        return result;
      } catch (err: any) {
        toast.error(err || "Update failed");
        throw err;
      }
    },
    [dispatch],
  );

  const changeVendorStatus = useCallback(
    async (id: string, status: "SUSPENDED" | "ACTIVE") => {
      try {
        const result = await dispatch(
          updateVendorStatus({ id, status }),
        ).unwrap();
        toast.success(
          status === "SUSPENDED" ? "Vendor suspended" : "Vendor reactivated",
        );
        return result;
      } catch (err: any) {
        toast.error(err || "Status update failed");
        throw err;
      }
    },
    [dispatch],
  );

  const activateVendor = useCallback(
    async (id: string) => {
      try {
        const result = await dispatch(activatePendingVendor(id)).unwrap();
        toast.success("Vendor activated successfully");
        return result;
      } catch (err: any) {
        toast.error(err || "Vendor activation failed");
        throw err;
      }
    },
    [dispatch],
  );

  const deselectVendor = useCallback(() => {
    dispatch(clearSelectedVendor());
  }, [dispatch]);

  // ─── Marketer actions ───────────────────────────────────────────────────────

  const loadMarketers = useCallback(
    async (params?: Parameters<typeof fetchMarketers>[0]) => {
      try {
        return await dispatch(fetchMarketers(params ?? {})).unwrap();
      } catch (err: any) {
        toast.error(err || "Failed to load marketers");
      }
    },
    [dispatch],
  );

  const loadMarketerById = useCallback(
    async (id: string) => {
      try {
        return await dispatch(fetchMarketerById(id)).unwrap();
      } catch (err: any) {
        toast.error(err || "Failed to load marketer");
      }
    },
    [dispatch],
  );

  // ─── Product queue actions ──────────────────────────────────────────────────

  const loadProductQueue = useCallback(
    async (params?: Parameters<typeof fetchAdminProductQueue>[0]) => {
      try {
        return await dispatch(fetchAdminProductQueue(params ?? {})).unwrap();
      } catch (err: any) {
        toast.error(err || "Failed to load product queue");
      }
    },
    [dispatch],
  );

  const loadProductById = useCallback(
    async (id: string) => {
      try {
        return await dispatch(fetchAdminProductById(id)).unwrap();
      } catch (err: any) {
        toast.error(err || "Failed to load product");
      }
    },
    [dispatch],
  );

  const approveProductById = useCallback(
    async (id: string) => {
      try {
        const result = await dispatch(approveProduct(id)).unwrap();
        toast.success("Product approved!");
        return result;
      } catch (err: any) {
        toast.error(err || "Approval failed");
        throw err;
      }
    },
    [dispatch],
  );

  const rejectProductById = useCallback(
    async (id: string, reason: string) => {
      try {
        const result = await dispatch(rejectProduct({ id, reason })).unwrap();
        toast.success("Product rejected");
        return result;
      } catch (err: any) {
        toast.error(err || "Rejection failed");
        throw err;
      }
    },
    [dispatch],
  );

  const suspendProductById = useCallback(
    async (id: string, reason?: string) => {
      try {
        const result = await dispatch(suspendProduct({ id, reason })).unwrap();
        toast.success("Product suspended");
        return result;
      } catch (err: any) {
        toast.error(err || "Suspend failed");
        throw err;
      }
    },
    [dispatch],
  );

  const reactivateProductById = useCallback(
    async (id: string) => {
      try {
        const result = await dispatch(reactivateProduct(id)).unwrap();
        toast.success("Product reactivated");
        return result;
      } catch (err: any) {
        toast.error(err || "Reactivation failed");
        throw err;
      }
    },
    [dispatch],
  );

  const deselectProduct = useCallback(() => {
    dispatch(clearSelectedProduct());
  }, [dispatch]);

  // ─── Scheduler actions ──────────────────────────────────────────────────────

  const loadSchedulerStatus = useCallback(async () => {
    try {
      return await dispatch(fetchSchedulerStatus()).unwrap();
    } catch (err: any) {
      toast.error(err || "Failed to load scheduler status");
    }
  }, [dispatch]);

  const triggerScheduler = useCallback(async () => {
    try {
      await dispatch(runScheduler()).unwrap();
      toast.success("Scheduler job triggered");
    } catch (err: any) {
      toast.error(err || "Failed to run scheduler");
    }
  }, [dispatch]);

  // ─── Category actions ───────────────────────────────────────────────────────

  const loadCategories = useCallback(async () => {
    try {
      return await dispatch(fetchCategories()).unwrap();
    } catch (err: any) {
      toast.error(err || "Failed to load categories");
    }
  }, [dispatch]);

  const loadCategoryById = useCallback(
    async (id: string) => {
      try {
        return await dispatch(fetchCategoryById(id)).unwrap();
      } catch (err: any) {
        toast.error(err || "Failed to load category");
      }
    },
    [dispatch],
  );

  const addCategory = useCallback(
    async (payload: Parameters<typeof createCategory>[0]) => {
      try {
        const result = await dispatch(createCategory(payload)).unwrap();
        toast.success("Category created");
        return result;
      } catch (err: any) {
        toast.error(err || "Failed to create category");
        throw err;
      }
    },
    [dispatch],
  );

  const editCategory = useCallback(
    async (
      id: string,
      payload: Parameters<typeof updateCategory>[0]["payload"],
    ) => {
      try {
        const result = await dispatch(updateCategory({ id, payload })).unwrap();
        toast.success("Category updated");
        return result;
      } catch (err: any) {
        toast.error(err || "Update failed");
        throw err;
      }
    },
    [dispatch],
  );

  const removeCategory = useCallback(
    async (id: string) => {
      try {
        await dispatch(deleteCategory(id)).unwrap();
        toast.success("Category deleted");
      } catch (err: any) {
        toast.error(err || "Delete failed");
        throw err;
      }
    },
    [dispatch],
  );

  return {
    // ── Staff ──
    staff,
    selectedStaff,
    staffLoading,
    staffError,
    staffTotal,
    staffActionLoading,
    addStaff,
    loadStaff,
    loadStaffById,
    editStaff,
    removeStaff,
    suspendStaff,
    activateStaff,
    deselectStaff,

    // ── Vendors ──
    vendors,
    selectedVendor,
    vendorsLoading,
    vendorsError,
    vendorsTotal,
    vendorsActionLoading,
    loadVendors,
    loadVendorById,
    addVendor,
    resendInvite,
    editVendor,
    changeVendorStatus, // ACTIVE ↔ SUSPENDED  →  PATCH /{id}/status
    activateVendor, // PENDING_ACTIVATION   →  PATCH /{id}/activate
    deselectVendor,

    // ── Marketers ──
    marketers,
    selectedMarketer,
    marketersLoading,
    marketersError,
    marketersTotal,
    loadMarketers,
    loadMarketerById,

    // ── Product Queue ──
    productQueue,
    selectedProduct,
    productsLoading,
    productsError,
    productsTotal,
    productsActionLoading,
    loadProductQueue,
    loadProductById,
    approveProductById,
    rejectProductById,
    suspendProductById,
    reactivateProductById,
    deselectProduct,

    // ── Scheduler ──
    schedulerStatus,
    schedulerLoading,
    schedulerRunLoading,
    schedulerError,
    loadSchedulerStatus,
    triggerScheduler,

    // ── Categories ──
    categories,
    selectedCategory,
    categoriesLoading,
    categoriesError,
    categoriesActionLoading,
    loadCategories,
    loadCategoryById,
    addCategory,
    editCategory,
    removeCategory,
  };
}
