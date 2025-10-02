import { useState, useEffect, useCallback, useRef } from 'react';
import { notificationService } from '../services/api';
import { useAuth } from './useAuth';

export const useNotifications = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!user?.email) {
      setUnreadCount(0);
      return;
    }

    try {
      setLoading(true);
      const response = await notificationService.getUnreadCount(user.email);
      
      if (response.success) {
        const count = parseInt(response.metadata || '0', 10);
        // Only update state if the count actually changed
        setUnreadCount(prevCount => {
          if (prevCount !== count) {
            return count;
          }
          return prevCount;
        });
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
      // Don't show error to user, just log it
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  // Load unread count on mount and when user changes
  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Auto-refresh unread count every 30 seconds, but pause when tab is not visible
  useEffect(() => {
    if (!user?.email) return;

    const startPolling = () => {
      if (intervalRef.current) return; // Already polling
      
      intervalRef.current = setInterval(() => {
        // Only poll if the tab is visible
        if (document.visibilityState === 'visible') {
          notificationService.getUnreadCount(user.email)
            .then(response => {
              if (response.success) {
                const count = parseInt(response.metadata || '0', 10);
                // Only update state if the count actually changed
                setUnreadCount(prevCount => {
                  if (prevCount !== count) {
                    return count;
                  }
                  return prevCount;
                });
              }
            })
            .catch(error => {
              console.error('Background unread count refresh failed:', error);
            });
        }
      }, 30000);
    };

    const stopPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    // Start polling
    startPolling();

    // Pause polling when tab becomes hidden, resume when visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        startPolling();
      } else {
        stopPolling();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.email]);

  return {
    unreadCount,
    loading,
    refresh: fetchUnreadCount
  };
};

