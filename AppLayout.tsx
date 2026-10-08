import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
import OfflineBadge from "./OfflineBadge";

export default function AppLayout() {
  return (
    <div className="flex h-full flex-col bg-slate-50 text-slate-900">
      <header className="safe-top bg-teal-600 text-white shadow">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-semibold">Nukus Transport</h1>
          <OfflineBadge />
        </div>
      </header>

      <main className="relative flex-1 overflow-y-auto">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}
