import { useEffect, useState } from "react";

export default function OfflineBadge() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  if (online) return null;
  return (
    <span className="rounded-full bg-amber-400 px-2 py-0.5 text-xs font-medium text-amber-950">
      Offline
    </span>
  );
}
