import { useState, useEffect } from 'react';

const cache = new Map();

export function useDataFetch(url, cacheKey) {
  const key = cacheKey || url;
  
  // Initialize with cached data if available
  const [data, setData] = useState(() => cache.get(key) || null);
  // Only show loading if we don't have cached data
  const [loading, setLoading] = useState(!cache.has(key));
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const res = await fetch(url);
        const json = await res.json();
        if (isMounted) {
          setData(json);
          setLoading(false);
          cache.set(key, json); // Save to cache
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [url, key]);

  return { data, loading, error };
}
