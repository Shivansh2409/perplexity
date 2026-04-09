import { useCallback } from "react";
import { useDispatch } from "react-redux";
import {
  submitAccessRequest,
  fetchPendingRequests,
  approveAccessRequest,
  rejectAccessRequest,
} from "../access.slice";

/**
 * Custom hook for access management
 * Provides convenient methods to request/manage chat access
 */
export const useAccess = () => {
  const dispatch = useDispatch();

  const requestAccess = useCallback(
    async (chatId) => {
      try {
        const result = await dispatch(submitAccessRequest(chatId)).unwrap();
        return { success: true, data: result };
      } catch (error) {
        return { success: false, error };
      }
    },
    [dispatch],
  );

  const getPendingRequests = useCallback(async () => {
    try {
      const result = await dispatch(fetchPendingRequests()).unwrap();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error };
    }
  }, [dispatch]);

  const approveRequest = useCallback(
    async (requestId) => {
      try {
        const result = await dispatch(approveAccessRequest(requestId)).unwrap();
        return { success: true, data: result };
      } catch (error) {
        return { success: false, error };
      }
    },
    [dispatch],
  );

  const rejectRequest = useCallback(
    async (requestId) => {
      try {
        const result = await dispatch(rejectAccessRequest(requestId)).unwrap();
        return { success: true, data: result };
      } catch (error) {
        return { success: false, error };
      }
    },
    [dispatch],
  );

  return {
    requestAccess,
    getPendingRequests,
    approveRequest,
    rejectRequest,
  };
};

export default useAccess;
