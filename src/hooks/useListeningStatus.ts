import { useState, useCallback, useEffect } from "react";
import { useFirebaseAuth } from "../contexts/FirebaseAuthContext";
import { apiRequest } from "../lib/queryClient";
import { updateUserOnlineStatus, setUserOffline } from "../lib/chat";

export function useListeningStatus() {
  const [isActiveListening, setIsActiveListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, user } = useFirebaseAuth();

  const updateListeningStatus = useCallback(
    async (status: boolean) => {
      if (!isAuthenticated) return;

      setLoading(true);

      try {
        // Update listening status on server
        await apiRequest("POST", "/api/user/listening-status", {
          isActiveListening: status,
        });

        // Also update online status in chat system
        if (user) {
          try {
            if (status) {
              await updateUserOnlineStatus(
                user.uid,
                user.displayName?.split(' ')[0] || 'User',
                user.photoURL || undefined,
                true
              );
            } else {
              await setUserOffline(user.uid);
            }
          } catch (error) {
            console.error('Error updating chat online status:', error);
          }
        }

        setIsActiveListening(status);
      } catch (error) {
        console.error("Failed to update listening status:", error);
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, user],
  );

  const startListening = useCallback(() => {
    updateListeningStatus(true);
  }, [updateListeningStatus]);

  const stopListening = useCallback(() => {
    updateListeningStatus(false);
  }, [updateListeningStatus]);

  // Handle user leaving the site
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const handleBeforeUnload = async () => {
      try {
        await setUserOffline(user.uid);
      } catch (error) {
        console.error('Error setting user offline:', error);
      }
    };

    const handleVisibilityChange = async () => {
      if (document.hidden) {
        try {
          await setUserOffline(user.uid);
        } catch (error) {
          console.error('Error setting user offline:', error);
        }
      } else if (isActiveListening) {
        try {
          await updateUserOnlineStatus(
            user.uid,
            user.displayName?.split(' ')[0] || 'User',
            user.photoURL || undefined,
            true
          );
        } catch (error) {
          console.error('Error setting user online:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Set user offline when component unmounts
      handleBeforeUnload();
    };
  }, [isAuthenticated, user, isActiveListening]);

  return {
    isActiveListening,
    loading,
    startListening,
    stopListening,
    updateListeningStatus,
  };
}
