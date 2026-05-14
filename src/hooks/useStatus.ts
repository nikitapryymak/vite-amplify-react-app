import { useEffect, useState } from "react";
import { APP_VERSION } from "../lib/version";

type StatusFile = {
  version: string;
  maintenance: boolean;
};

type Status = {
  maintenance: boolean;
  isOutdated: boolean;
};

const POLL_INTERVAL_MS = 30000;

export function useStatus(): Status {
  const [status, setStatus] = useState<Status>({
    maintenance: false,
    isOutdated: false,
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchStatus() {
      try {
        const res = await fetch("/status.json", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as StatusFile;
        if (cancelled) return;
        setStatus({
          maintenance: Boolean(data.maintenance),
          isOutdated: data.version !== APP_VERSION,
        });
      } catch {
        // Silent: network blip, dev mode without status.json, etc.
      }
    }

    fetchStatus();
    const id = setInterval(fetchStatus, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return status;
}
