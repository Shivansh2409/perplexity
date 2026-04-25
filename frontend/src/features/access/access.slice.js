import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { chatAPI } from "../chat/service/chat.api";
import socketManager from "../config/socket";

// Async Thunks
export const fetchPendingRequests = createAsyncThunk(
  "access/fetchPendingRequests",
  async (_, { rejectWithValue }) => {
    try {
      const response = await chatAPI.getPendingRequests();
      return response.data?.requests || [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const submitAccessRequest = createAsyncThunk(
  "access/submitAccessRequest",
  async (chatId, { rejectWithValue }) => {
    try {
      const response = await socketManager.requestChatAccess(chatId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || error);
    }
  },
);

export const approveAccessRequest = createAsyncThunk(
  "access/approveAccessRequest",
  async ({ requestId, permission = "view-only" }, { rejectWithValue }) => {
    try {
      const response = await socketManager.updateRequestStatus(requestId, "approved", permission);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || error);
    }
  },
);

export const rejectAccessRequest = createAsyncThunk(
  "access/rejectAccessRequest",
  async (requestId, { rejectWithValue }) => {
    try {
      const response = await socketManager.updateRequestStatus(requestId, "rejected");
      return response;
    } catch (error) {
      return rejectWithValue(error.message || error);
    }
  },
);

const accessSlice = createSlice({
  name: "access",
  initialState: {
    pendingRequests: [],
    loading: false,
    error: null,
    requestSent: false,
    notifications: [],
  },
  reducers: {
    addNotification(state, action) {
      state.notifications.push(action.payload);
    },
    removeNotification(state, action) {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload,
      );
    },
    clearError(state) {
      state.error = null;
    },
    addPendingRequest(state, action) {
      state.pendingRequests.push(action.payload);
    },
    removePendingRequest(state, action) {
      state.pendingRequests = state.pendingRequests.filter(
        (r) => r._id !== action.payload,
      );
    },
  },
  extraReducers: (builder) => {
    // Fetch Pending Requests
    builder
      .addCase(fetchPendingRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingRequests = action.payload;
      })
      .addCase(fetchPendingRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Submit Access Request
    builder
      .addCase(submitAccessRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitAccessRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.requestSent = true;
        state.notifications.push({
          id: Date.now(),
          message: "Access request sent successfully",
          type: "success",
        });
      })
      .addCase(submitAccessRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.notifications.push({
          id: Date.now(),
          message: action.payload || "Failed to send access request",
          type: "error",
        });
      });

    // Approve Request
    builder
      .addCase(approveAccessRequest.pending, (state) => {
        state.loading = true;
      })
      .addCase(approveAccessRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications.push({
          id: Date.now(),
          message: "Access request approved",
          type: "success",
        });
      })
      .addCase(approveAccessRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Reject Request
    builder
      .addCase(rejectAccessRequest.pending, (state) => {
        state.loading = true;
      })
      .addCase(rejectAccessRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications.push({
          id: Date.now(),
          message: "Access request rejected",
          type: "success",
        });
      })
      .addCase(rejectAccessRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  addNotification,
  removeNotification,
  clearError,
  addPendingRequest,
  removePendingRequest,
} = accessSlice.actions;
export default accessSlice.reducer;
