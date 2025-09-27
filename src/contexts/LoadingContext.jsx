import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import ThreeBodyLoader from '../components/ui/ThreeBodyLoader';
import { setLoadingCallbacks } from '../services/api';

export const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [loadingStates, setLoadingStates] = useState({});
  const [globalLoading, setGlobalLoading] = useState(false);
  const [globalMessage, setGlobalMessage] = useState('Loading...');

  // Show global loading overlay
  const showGlobalLoading = useCallback((message = 'Loading...') => {
    setGlobalMessage(message);
    setGlobalLoading(true);
  }, []);

  // Hide global loading overlay
  const hideGlobalLoading = useCallback(() => {
    setGlobalLoading(false);
    setGlobalMessage('Loading...');
  }, []);

  // Connect API loading callbacks
  useEffect(() => {
    setLoadingCallbacks(showGlobalLoading, hideGlobalLoading);
  }, [showGlobalLoading, hideGlobalLoading]);

    // Show loading for a specific key
    const showLoading = useCallback((key, message = 'Loading...') => {
        setLoadingStates(prev => ({
            ...prev,
            [key]: { isLoading: true, message }
        }));
    }, []);

    // Hide loading for a specific key
    const hideLoading = useCallback((key) => {
        setLoadingStates(prev => {
            const newStates = { ...prev };
            delete newStates[key];
            return newStates;
        });
    }, []);

    // Check if a specific key is loading
    const isLoading = useCallback((key) => {
        return loadingStates[key]?.isLoading || false;
    }, [loadingStates]);

    // Get loading message for a specific key
    const getLoadingMessage = useCallback((key) => {
        return loadingStates[key]?.message || 'Loading...';
    }, [loadingStates]);

    // Show loading with promise handling
    const withLoading = useCallback(async (key, promise, message = 'Loading...') => {
        try {
            showLoading(key, message);
            const result = await promise;
            return result;
        } finally {
            hideLoading(key);
        }
    }, [showLoading, hideLoading]);

    // Show global loading with promise handling
    const withGlobalLoading = useCallback(async (promise, message = 'Loading...') => {
        try {
            showGlobalLoading(message);
            const result = await promise;
            return result;
        } finally {
            hideGlobalLoading();
        }
    }, [showGlobalLoading, hideGlobalLoading]);

    // Clear all loading states
    const clearAllLoading = useCallback(() => {
        setLoadingStates({});
        setGlobalLoading(false);
        setGlobalMessage('Loading...');
    }, []);

    const value = {
        // Global loading
        globalLoading,
        globalMessage,
        showGlobalLoading,
        hideGlobalLoading,
        withGlobalLoading,

        // Specific loading
        loadingStates,
        showLoading,
        hideLoading,
        isLoading,
        getLoadingMessage,
        withLoading,

        // Utility
        clearAllLoading,
    };

    return (
        <LoadingContext.Provider value={value}>
            {children}
            {/* Global Loading Overlay */}
            {globalLoading && (
                <ThreeBodyLoader
                    overlay={true}
                    message={globalMessage}
                    size="40px"
                    color="#3b82f6"
                />
            )}
        </LoadingContext.Provider>
    );
};
