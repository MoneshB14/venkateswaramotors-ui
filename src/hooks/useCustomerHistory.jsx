import { useState, useEffect, useRef, useCallback } from 'react';
import { customersAPI } from '../services/api';
import { useToast } from './useToast';

export const useCustomerHistory = (registration, options = {}) => {
  const {
    shouldFetch = true,
    prefetchedData = null,
    enableCache = true,
    autoRefresh = false,
    refreshInterval = 30000
  } = options;

  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(prefetchedData);
  const [lastFetched, setLastFetched] = useState(null);
  
  const fetchingKeyRef = useRef(null);
  const cacheRef = useRef(new Map());
  const refreshIntervalRef = useRef(null);

  // Clear refresh interval on unmount
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!registration || !shouldFetch) return;

    // Use cache if available and not forcing refresh
    if (!forceRefresh && enableCache && cacheRef.current.has(registration)) {
      const cachedData = cacheRef.current.get(registration);
      setData(cachedData.data);
      setLastFetched(cachedData.timestamp);
      setError(null);
      setLoading(false);
      return;
    }

    // Prevent concurrent fetches for the same registration
    if (fetchingKeyRef.current === registration) return;
    
    fetchingKeyRef.current = registration;
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await customersAPI.getCustomerHistory(registration);
      const timestamp = new Date();
      
      setData(result);
      setLastFetched(timestamp);
      
      // Cache the result
      if (enableCache) {
        cacheRef.current.set(registration, { data: result, timestamp });
      }
      
    } catch (err) {
      console.error('Failed to load customer history', err);
      const errorMessage = err?.userMessage || 'Failed to load customer history';
      setError(errorMessage);
      toast.error('Error', errorMessage);
    } finally {
      setLoading(false);
      fetchingKeyRef.current = null;
    }
  }, [registration, shouldFetch, enableCache, toast]);

  // Initial fetch
  useEffect(() => {
    if (prefetchedData) {
      setData(prefetchedData);
      setLastFetched(new Date());
      setError(null);
      setLoading(false);
    } else {
      fetchData();
    }
  }, [registration, prefetchedData, fetchData]);

  // Auto refresh
  useEffect(() => {
    if (autoRefresh && registration && data) {
      refreshIntervalRef.current = setInterval(() => {
        fetchData(true);
      }, refreshInterval);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [autoRefresh, registration, data, refreshInterval, fetchData]);

  const refresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  return {
    data,
    loading,
    error,
    lastFetched,
    refresh,
    clearCache
  };
};
