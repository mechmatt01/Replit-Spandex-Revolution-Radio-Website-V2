import { useState, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { apiRequest } from "../lib/queryClient";

export function useListeningStatus() {
  const [isActiveListening, setIsActiveListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const updateListeningStatus = useCallback(
    async (status: boolean) => {
      if (!isAuthenticated) return;

      setLoading(true);

      try {
        await apiRequest("POST", "/api/user/listening-status", {
          isActiveListening: status,
        });

        setIsActiveListening(status);
      } catch (error) {
        console.error("Failed to update listening status:", error);
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated],
  );

  const startListening = useCallback(() => {
    updateListeningStatus(true);
  }, [updateListeningStatus]);

  const stopListening = useCallback(() => {
    updateListeningStatus(false);
  }, [updateListeningStatus]);

  return {
    isActiveListening,
    loading,
    startListening,
    stopListening,
    updateListeningStatus,
  };
}
