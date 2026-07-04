import { useCallback, useEffect, useState } from "react";

export const useAsyncData = (loader, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const run = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const nextData = await loader();
      setData(nextData);
      return nextData;
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Request failed";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    run().catch(() => {});
  }, [run]);

  return { data, setData, loading, error, reload: run };
};
