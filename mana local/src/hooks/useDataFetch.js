import { useState, useEffect } from 'react';

export function useDataFetch(initialData, delay = 1500) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    // Simulate network request
    const timer = setTimeout(() => {
      if (isMounted) {
        setData(initialData);
        setLoading(false);
      }
    }, delay);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [initialData, delay]);

  return { data, loading };
}
